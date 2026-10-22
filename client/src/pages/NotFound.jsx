import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <section
        aria-labelledby="not-found-heading"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/50 sm:p-10"
      >
        <p className="text-7xl font-bold tracking-tight text-blue-600 sm:text-8xl">
          <span className="sr-only">Error </span>404
        </p>
        <h1
          id="not-found-heading"
          className="mt-6 text-3xl font-bold tracking-tight text-slate-900"
        >
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The page you’re looking for may have moved or no longer exists. Head
          back to the marketplace to see what’s available on campus.
        </p>
        <Link
          to="/listings"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800"
        >
          Browse listings
        </Link>
      </section>
    </main>
  );
}
