import { useEffect } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();

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

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  if (messages?.length === 0) {
    return <p>No messages yet</p>;
  }
  return (
    <>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.sender_id === user.id ? "Me: " : "Them: "}
            {message.body}
          </li>
        ))}
      </ul>
    </>
  );
}
