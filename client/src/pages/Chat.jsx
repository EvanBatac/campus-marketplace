import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await api(`/api/conversations/${conversationId}/messages`);
      return res;
    },
  });
  const messages = data?.data;
  useEffect(() => {
    function onNewMessage(message) {
      if (message.conversation_id !== Number(conversationId)) return;
      queryClient.setQueryData(["messages", conversationId], (old) => ({
        ...old,
        data: [...old.data, message],
      }));
    }

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [conversationId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (isLoading)
    return (
      <div className="h-full min-h-0 p-4 sm:p-6">
        <p
          role="status"
          className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-xl shadow-slate-200/50"
        >
          Loading...
        </p>
      </div>
    );
  if (isError)
    return (
      <div className="h-full min-h-0 p-4 sm:p-6">
        <p
          role="alert"
          className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
        >
          {error.message}
        </p>
      </div>
    );

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("send_message", {
      conversationId: Number(conversationId),
      content: text.trim(),
    });
    setText("");
  }

  return (
    <div className="h-full min-h-0">
      <section aria-labelledby="chat-heading" className="flex h-full min-h-0 flex-col">
        <h1
          id="chat-heading"
          className="shrink-0 border-b border-slate-100 px-4 py-5 text-xl font-bold tracking-tight text-slate-900 sm:px-6"
        >
          Chat
        </h1>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">
                No messages yet
              </p>
            )}
            <ul className="space-y-4">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`w-fit max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-6 ${message.sender_id === user.id ? "rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800"}`}
                  >
                    <p className="whitespace-pre-wrap wrap-anywhere">
                      {message.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div ref={bottomRef}></div>
          </div>
          <form
            onSubmit={handleSend}
            className="flex shrink-0 items-center gap-3 border-t border-slate-100 bg-white p-4 sm:p-6"
          >
            <input
              type="text"
              value={text}
              placeholder="Type your message"
              aria-label="Message"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
