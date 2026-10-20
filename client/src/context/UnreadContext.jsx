/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";
import { socket } from "../socket";

const UnreadContext = createContext(undefined);

export function UnreadProvider({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api("/api/conversations");
      return res;
    },
    enabled: !!user,
  });
  const match = matchPath("/messages/:conversationId", pathname);
  const openConversationId = match ? Number(match.params.conversationId) : null;

  const unreadByConversation = {};
  if (user) {
    for (const conversation of data?.data ?? []) {
      const count = Number(conversation.unread_count);
      if (count > 0) unreadByConversation[conversation.id] = count;
    }
  }

  useEffect(() => {
    if (!openConversationId || !user) return;

    async function markRead() {
      try {
        await api(`/api/conversations/${openConversationId}/read`, {
          method: "PATCH",
        });
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } catch (error) {
        console.error(error);
      }
    }

    markRead();
  }, [openConversationId, user, queryClient]);

  useEffect(() => {
    if (!user) return;

    async function onNewMessage(message) {
      try {
        if (
          message.sender_id !== user.id &&
          Number(message.conversation_id) === openConversationId
        ) {
          await api(`/api/conversations/${openConversationId}/read`, {
            method: "PATCH",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    }

    socket.on("new_message", onNewMessage);
    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [user, openConversationId, queryClient]);

  const totalUnread = Object.values(unreadByConversation).reduce(
    (total, count) => total + count,
    0,
  );

  return (
    <UnreadContext.Provider value={{ unreadByConversation, totalUnread }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const context = useContext(UnreadContext);
  if (context === undefined) {
    throw new Error("useUnread must be used inside an UnreadProvider");
  }
  return context;
}
