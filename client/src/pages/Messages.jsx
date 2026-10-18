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

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  if (conversations.length === 0) return <p>No conversations yet</p>;
  return (
    <>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <Link to={`/messages/${conversation.id}`}>
              <h3>{conversation.listing_title}</h3>
              <span>{conversation.other_user_name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
