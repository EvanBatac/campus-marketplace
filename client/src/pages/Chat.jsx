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
    socket.auth = { token: localStorage.getItem("token") };

    function onConnect() {
      console.log("socket connected:", socket.id);
    }

    function onConnectError(err) {
      console.log("socket error:", err.message);
    }

    function onNewMessage(message) {
      if (message.conversation_id !== Number(conversationId)) return;
      queryClient.setQueryData(["messages", conversationId], (old) => ({
        ...old,
        data: [...old.data, message],
      }));
    }
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("new_message", onNewMessage);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("new_message", onNewMessage);
      socket.disconnect();
    };
  }, [conversationId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;

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
    <>
      {messages.length === 0 && <p>No messages yet</p>}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.sender_id === user.id ? "Me: " : "Them: "}
            {message.body}
          </li>
        ))}
      </ul>
      <div ref={bottomRef}></div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          placeholder="Type your message"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
