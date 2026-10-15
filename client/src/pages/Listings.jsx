
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

      console.log(res);
      return res.data;
    },
  });
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  return (
    <div>
      {listings.map((listing) => (
        <li key={listing.id}>
          <h1>{listing.title}</h1>
          <h2>{listing.seller_name}</h2>
          <span>{listing.price}</span>
          <span>{listing.status}</span>
        </li>
      ))}
    </div>
  );
}
