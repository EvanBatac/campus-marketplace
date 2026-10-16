import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
export default function ListingDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await api(`/api/listings/${id}`);
      return res;
    },
  });

  const listing = data?.data;
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  if (!listing) return <p>Listing not found.</p>;
  return (
    <>
      <ul>
        <li>
          <h2>{listing.title}</h2>
          <h3>{listing.seller_name}</h3>
          <span>{listing.price}</span>
          <span>{listing.category}</span>
          <span>{listing.status}</span>
          <p>{listing.description}</p>
        </li>
      </ul>
    </>
  );
}
