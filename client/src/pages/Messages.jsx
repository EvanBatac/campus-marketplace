import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Link } from "react-router-dom";
export default function Messages() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api("/api/conversations");
      return res;
    },
  });
  const conversations = data?.data;

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-12 sm:px-6">
      <section aria-labelledby="messages-heading" className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1
            id="messages-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Messages
          </h1>
        </header>
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
        ) : conversations.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-xl shadow-slate-200/50">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-4">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to={`/messages/${conversation.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 transition hover:border-blue-200 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  <h3 className="wrap-anywhere text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-blue-600">
                    {conversation.listing_title}
                  </h3>
                  <span className="mt-2 block wrap-anywhere text-sm text-slate-500">
                    {conversation.other_user_name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
