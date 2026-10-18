import { Outlet } from "react-router-dom";
import ConversationList from "../components/ConversationList";

export default function MessagesLayout() {
  return (
    <main className="h-[calc(100svh-73px)] min-h-0 bg-slate-50 p-2 sm:p-6">
      <div className="mx-auto flex h-full max-w-6xl overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <aside aria-label="Conversations" className="h-full w-72 shrink-0 overflow-y-auto overscroll-contain border-r border-slate-200 bg-slate-50/50 sm:w-80">
          <ConversationList />
        </aside>
        <div className="h-full min-w-72 flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
