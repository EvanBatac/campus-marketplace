import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MyListings() {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listings", "mine", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await api("/api/listings/mine");
      return res;
    },
  });

  const listings = data?.data ?? [];

  return (
    <>
      <h1>My listings</h1>
      {isLoading && <p role="status">Loading...</p>}
      {isError && <p role="alert">{error.message}</p>}
      {!isLoading && !isError && listings.length === 0 && (
        <p>You haven't created any listings yet.</p>
      )}
      {!isLoading && !isError && listings.length > 0 && (
        <ul>
          {listings.map((listing) => (
            <li key={listing.id}>
              {listing.image_url && (
                <img src={listing.image_url} alt={listing.title} />
              )}
              <h2>
                <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
              </h2>
              {listing.description && <p>{listing.description}</p>}
              {listing.category && <p>Category: {listing.category}</p>}
              <p>
                ₱
                {Number(listing.price).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p>Status: {listing.status}</p>
            </li>
          ))}
          <button></button>
        </ul>
      )}
    </>
  );
}
