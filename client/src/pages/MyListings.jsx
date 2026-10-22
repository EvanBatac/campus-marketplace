import { useToast } from "../hooks/useToast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRef, useState } from "react";

export default function MyListings() {
  const toast = useToast();
  const deleteDialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const [listingToDelete, setListingToDelete] = useState(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listings", "mine", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await api("/api/listings/mine");
      return res;
    },
  });

  const {
    mutate,
    isPending,
    variables,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: async (id) => {
      const res = await api(`/api/listings/${id}`, {
        method: "DELETE",
      });
      return res;
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
    onSuccess: () => {
      toast.success("Listing deleted.");
      queryClient.invalidateQueries({
        queryKey: ["listings"],
      });
    },
  });
  function handleDelete(listing) {
    setListingToDelete(listing);
    deleteDialogRef.current.showModal();
    cancelButtonRef.current.focus();
  }
  function confirmDelete() {
    if (!listingToDelete || isPending) return;
    mutate(listingToDelete.id);
    deleteDialogRef.current.close();
  }
  const listings = data?.data ?? [];

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-12">
      <section
        aria-labelledby="my-listings-heading"
        className="mx-auto max-w-6xl"
      >
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Your seller space
            </p>
            <h1
              id="my-listings-heading"
              className="text-3xl font-bold tracking-tight text-slate-900"
            >
              My listings
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Manage your items and keep your campus up to date.
            </p>
          </div>
          <Link
            to="/listings/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            <span aria-hidden="true">+</span> Create listing
          </Link>
        </header>
        {isLoading && (
          <p
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500"
          >
            Loading your listings...
          </p>
        )}
        {isError && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error.message}
          </p>
        )}
        {isDeleteError && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {deleteError.message}
          </p>
        )}
        {!isLoading && !isError && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Your next sale starts here
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You haven't created any listings yet. Give something a new home on
              campus.
            </p>
            <Link
              to="/listings/new"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              Create your first listing
            </Link>
          </div>
        )}
        {!isLoading && !isError && listings.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </p>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <li
                  key={listing.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <Link
                    to={`/listings/${listing.id}`}
                    aria-label={`View ${listing.title}`}
                    className="block bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600"
                  >
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        loading="lazy"
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center text-sm text-slate-400">
                        No image added
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium capitalize text-slate-500">
                        {listing.category || "Uncategorized"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${listing.status === "available" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-slate-100 text-slate-600 ring-slate-200"}`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <h2 className="wrap-break-word text-lg font-semibold tracking-tight text-slate-900">
                      <Link
                        to={`/listings/${listing.id}`}
                        className="rounded-sm hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                      >
                        {listing.title}
                      </Link>
                    </h2>
                    {listing.description && (
                      <p className="mt-2 line-clamp-2 wrap-break-word text-sm leading-6 text-slate-500">
                        {listing.description}
                      </p>
                    )}
                    <p className="mt-5 break-all text-2xl font-bold tracking-tight text-blue-600">
                      ₱
                      {Number(listing.price).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="mt-auto flex gap-3 pt-6">
                      <Link
                        to={`/listings/${listing.id}/edit`}
                        aria-label={`Edit ${listing.title}`}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Edit listing
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(listing)}
                        aria-label={`Delete ${listing.title}`}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPending && variables === listing.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-listing-heading"
        aria-describedby="delete-listing-description"
        onClose={() => setListingToDelete(null)}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-900/50 sm:p-8"
      >
        <h2 id="delete-listing-heading" className="text-xl font-bold tracking-tight text-slate-900">
          Delete this listing?
        </h2>
        <p id="delete-listing-description" className="mt-3 wrap-anywhere text-sm leading-6 text-slate-500">
          “{listingToDelete?.title}” will be permanently deleted. This action cannot be undone.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={() => deleteDialogRef.current.close()}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={confirmDelete}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete listing
          </button>
        </div>
      </dialog>
    </main>
  );
}
