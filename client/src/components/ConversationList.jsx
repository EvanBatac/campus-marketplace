import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { NavLink } from "react-router-dom";
export default function ConversationList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api("/api/conversations");
      return res;
    },
  });
  const conversations = data?.data;

  return (
    <div className="p-4 sm:p-6">
      <section aria-labelledby="messages-heading">
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
                <NavLink
                  to={`/messages/${conversation.id}`}
                  className={({ isActive }) =>
                    `group block rounded-2xl border p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${isActive ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 bg-white"}`
                  }
                >
                  <h3 className="wrap-anywhere text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-blue-600">
                    {conversation.listing_title}
                  </h3>
                  <span className="mt-2 block wrap-anywhere text-sm text-slate-500">
                    {conversation.other_user_name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
