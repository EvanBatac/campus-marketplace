import { useState } from "react";
import { api } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
export default function Listings() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  function handleChange(e) {
    setSearch(e.target.value);
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listings", debouncedSearch],
    queryFn: async () => {
      const res = await api(
        `/api/listings?search=${encodeURIComponent(debouncedSearch)}`,
      );
      return res;
    },
  });

  const listings = data?.data;
  const totalPages = data?.totalPages;

  console.log(`Page ${data?.page} of ${totalPages}`);
  return (
    <>
      <div>
        <input
          type="text"
          value={search}
          placeholder="Search listing"
          className="w-64 border border-gray-300 rounded-md px-3 py-2"
          onChange={handleChange}
        />
      </div>
      {isLoading && <p>Loading...</p>}

      {isError && <p>{error.message}</p>}

      {!isLoading && !isError && listings.length === 0 && (
        <p>No listings found</p>
      )}
      {!isLoading && !isError && (
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
      )}
    </>
  );
}
