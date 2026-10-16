import { useState } from "react";
import { api } from "../api/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
export default function Listings() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  function handleChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }
  function nextPage() {
    setPage(page + 1);
  }
  function previousPage() {
    setPage(page - 1);
  }

  const { data, isLoading, isError, error, isFetching } = useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["listings", debouncedSearch, page],
    queryFn: async () => {
      const res = await api(
        `/api/listings?search=${encodeURIComponent(debouncedSearch)}&page=${page}`,
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
      {isFetching && !isLoading && <p>Updating...</p>}
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

      <button disabled={page === 1} onClick={previousPage}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={nextPage}>
        Next
      </button>
    </>
  );
}
