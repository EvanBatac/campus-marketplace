import { Link, Outlet, useParams } from "react-router-dom";
import ConversationList from "../components/ConversationList";

export default function MessagesLayout() {
  const { conversationId } = useParams();
  return (
    <main className="h-[calc(100svh-73px)] min-h-0 bg-slate-50 p-2 sm:p-6">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <aside
          aria-label="Conversations"
          className={`${conversationId ? "hidden md:block" : "block"} h-full w-full shrink-0 overflow-y-auto overscroll-contain border-r border-slate-200 bg-slate-50/50 md:w-72 lg:w-80`}
        >
          <ConversationList />
        </aside>
        <div
          className={`${conversationId ? "flex" : "hidden md:flex"} h-full min-w-0 flex-1 flex-col overflow-hidden`}
        >
          {conversationId && (
            <Link
              to="/messages"
              className="shrink-0 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 md:hidden"
            >
              ← All conversations
            </Link>
          )}
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
