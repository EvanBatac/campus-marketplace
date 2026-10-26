import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../context/PresenceContext";

const EMPTY_MESSAGES = [];

function mergeMessages(...groups) {
  const byId = new Map();
  for (const message of groups.flat()) {
    byId.set(String(message.id), message);
  }
  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      Number(a.id) - Number(b.id),
  );
}

export default function Chat() {
  const { conversationId } = useParams();
  return <ChatSession key={conversationId} />;
}

function ChatSession() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { isOnline } = usePresence();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const sending = useRef(false);
  const active = useRef(false);
  const bottomRef = useRef(null);
  const incomingMessages = useRef(new Map());

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  const { data: conversationsData } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await api("/api/conversations");
      return res;
    },
    refetchOnMount: false,
  });
  const conversation = conversationsData?.data?.find(
    (conversation) => conversation.id === Number(conversationId),
  );
  const online = isOnline(conversation?.other_user_id);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["messages", user?.id, conversationId],
    enabled: Boolean(user),
    queryFn: async () => {
      const key = JSON.stringify([user.id, conversationId]);
      const res = await api(`/api/conversations/${conversationId}/messages`);
      return {
        ...res,
        data: mergeMessages(
          incomingMessages.current.get(key) ?? [],
          res.data,
        ),
      };
    },
  });
  const messages = data?.data ?? EMPTY_MESSAGES;
  useEffect(() => {
    if (!user) return;
    const key = JSON.stringify([user.id, conversationId]);
    function onNewMessage(message) {
      if (Number(message.conversation_id) !== Number(conversationId)) return;
      incomingMessages.current.set(
        key,
        mergeMessages(incomingMessages.current.get(key) ?? [], [message]),
      );
      queryClient.setQueryData(
        ["messages", user?.id, conversationId],
        (old) => {
          if (!old) return old;
          return { ...old, data: mergeMessages(old.data ?? [], [message]) };
        },
      );
    }

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [conversationId, queryClient, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (isLoading)
    return (
      <div className="h-full min-h-0 p-4 sm:p-6">
        <LoadingSkeleton
          variant="conversations"
          count={3}
          label="Loading messages"
        />
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
    if (!text.trim() || sending.current) return;
    if (!socket.connected) {
      setSendError("You’re disconnected. Your draft is saved here. Reconnect and try again.");
      return;
    }
    sending.current = true;
    setIsSending(true);
    setSendError("");
    socket.timeout(10000).emit("send_message", {
      conversationId: Number(conversationId),
      content: text.trim(),
    }, (error, response) => {
      if (!active.current) return;
      sending.current = false;
      setIsSending(false);
      if (error || !response?.success) {
        setSendError(error
          ? "Delivery wasn’t confirmed. Check the conversation before retrying; your message may have arrived."
          : response?.message || "Unable to send message. Please try again.");
        return;
      }
      const message = response.message;
      const key = JSON.stringify([user.id, conversationId]);
      incomingMessages.current.set(key,
        mergeMessages(incomingMessages.current.get(key) ?? [], [message]));
      queryClient.setQueryData(["messages", user.id, conversationId], (old) => ({
        ...old,
        data: mergeMessages(old?.data ?? [], [message]),
      }));
      queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
      setText("");
    });
  }

  return (
    <div className="h-full min-h-0">
      <section
        aria-labelledby="chat-heading"
        className="flex h-full min-h-0 flex-col"
      >
        <header className="shrink-0 border-b border-slate-100 px-4 py-5 sm:px-6">
          <h1
            id="chat-heading"
            className="wrap-anywhere text-xl font-bold tracking-tight text-slate-900"
          >
            {conversation?.other_user_name ?? "Chat"}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${online ? "bg-green-500" : "bg-slate-300"}`}
            />
            {online ? "Online" : "Offline"}
          </p>
        </header>
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
          {sendError && <p role="alert" className="px-4 pt-3 text-sm text-red-600 sm:px-6">{sendError}</p>}
          <form
            onSubmit={handleSend}
            className="flex shrink-0 items-center gap-3 border-t border-slate-100 bg-white p-4 sm:p-6"
          >
            <input
              type="text"
              value={text}
              disabled={isSending}
              placeholder="Type your message"
              aria-label="Message"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSending || !text.trim()}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              {isSending ? "Sending..." : sendError ? "Retry" : "Send"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
