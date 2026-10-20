import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
export default function ListingDetail() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await api(`/api/listings/${id}`);
      return res;
    },
  });

  const {
    mutate,
    isPending: isStarting,
    isError: isStartError,
    error: startError,
  } = useMutation({
    mutationFn: async (listingId) => {
      const res = await api(`/api/conversations`, {
        method: "POST",
        body: { listing_id: listingId },
      });
      return res;
    },
    onSuccess: (res) => {
      navigate(`/messages/${res.data.id}`);
    },
  });

  const listing = data?.data;
  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/listings"
          className="mb-6 inline-flex rounded-sm text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          ← Back to listings
        </Link>
        {isLoading ? (
          <p
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-xl shadow-slate-200/50"
          >
            Loading...
          </p>
        ) : isError ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
          >
            {error.message}
          </p>
        ) : !listing ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-xl shadow-slate-200/50">
            Listing not found.
          </p>
        ) : (
          <article
            aria-labelledby="listing-title"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10"
          >
            {listing.images?.length > 0 && (
              <div className="mb-6">
                <img
                  src={listing.images[selectedIndex].url}
                  alt={listing.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  {listing.images.map((img, index) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={`${listing.title} image ${index + 1}`}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-20 h-20 object-cover rounded cursor-pointer ${selectedIndex === index ? "ring-2 ring-blue-500" : ""}`}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="max-w-full wrap-break-word rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {listing.category}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${listing.status === "available" ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"}`}
              >
                {listing.status}
              </span>
            </div>
            <h1
              id="listing-title"
              className="wrap-break-word text-3xl font-bold tracking-tight text-slate-900"
            >
              {listing.title}
            </h1>
            <p className="mt-4 break-all text-3xl font-bold tracking-tight text-blue-600">
              ₱
              {Number(listing.price).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-4 wrap-break-word text-sm text-slate-500">
              Sold by{" "}
              <span className="font-semibold text-slate-700">
                {listing.seller_name}
              </span>
            </p>
            <section
              aria-labelledby="description-heading"
              className="mt-8 border-t border-slate-100 pt-6"
            >
              <h2
                id="description-heading"
                className="text-sm font-semibold text-slate-900"
              >
                Description
              </h2>
              <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-600">
                {listing.description}
              </p>
            </section>
          </article>
        )}
        <button
          disabled={isStarting}
          onClick={() => mutate(listing.id)}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          Message Seller
        </button>
        {isStartError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {startError.message}
          </p>
        )}
      </div>
    </main>
  );
}
