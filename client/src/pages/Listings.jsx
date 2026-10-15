import { api } from "../api/client";
import { useQuery } from "@tanstack/react-query";

export default function Listings() {
  const {
    data: listings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await api("/api/listings");
      return res.data;
    },
  });
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  if (listings.length === 0) return <p>No listing</p>;
  return (
    <ul>
      {listings.map((listing) => (
        <li key={listing.id}>
          <h3>{listing.title}</h3>
          <span>{listing.seller_name}</span>
          <span>{listing.price}</span>
          <span>{listing.status}</span>
        </li>
      ))}
    </ul>
  );
}
