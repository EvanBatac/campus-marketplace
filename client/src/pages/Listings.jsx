import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { useState } from "react";
import { api } from "../api/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
import { Link } from "react-router-dom";
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

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-12 sm:px-6">
      <section aria-labelledby="listings-heading" className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Your campus, connected
          </p>
          <h1
            id="listings-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Campus listings
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Find something for your next semester.
          </p>
        </header>
        <div className="mb-6">
          <label
            htmlFor="listing-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search listings
          </label>
          <input
            id="listing-search"
            type="text"
            value={search}
            placeholder="Search listing"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:max-w-md"
            onChange={handleChange}
          />
        </div>
        {isFetching && !isLoading && (
          <p role="status" className="mb-4 text-xs text-slate-500">
            Updating...
          </p>
        )}
        {isLoading && <LoadingSkeleton label="Loading listings" />}
        {isError && (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
          >
            {error.message}
          </p>
        )}
        {!isLoading && !isError && listings.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            No listings found
          </p>
        )}
        {!isLoading && !isError && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 transition hover:border-blue-200"
              >
                <Link
                  to={`/listings/${listing.id}`}
                  aria-label={`View ${listing.title}`}
                  className="mb-5 block overflow-hidden rounded-xl bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      loading="lazy"
                      className="h-52 w-full object-cover transition duration-300 motion-safe:hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center text-sm text-slate-400">
                      No image added
                    </div>
                  )}
                </Link>
                <Link
                  to={`/listings/${listing.id}`}
                  className="rounded-sm text-slate-900 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  <h3 className="wrap-break-word text-lg font-semibold tracking-tight">
                    {listing.title}
                  </h3>
                </Link>
                <p className="mt-2 wrap-break-word text-sm text-slate-500">
                  Sold by{" "}
                  <span className="font-medium text-slate-700">
                    {listing.seller_name}
                  </span>
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
                  <span className="break-all text-2xl font-bold tracking-tight text-blue-600">
                    ₱
                    {Number(listing.price).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${listing.status === "available" ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"}`}
                  >
                    {listing.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <nav
          aria-label="Listings pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            disabled={page === 1 || isFetching}
            onClick={previousPage}
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {page} of {Math.max(1, totalPages ?? 1)}
          </span>
          <button
            disabled={isFetching || !totalPages || page >= totalPages}
            onClick={nextPage}
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            Next
          </button>
        </nav>
      </section>
    </main>
  );
}
