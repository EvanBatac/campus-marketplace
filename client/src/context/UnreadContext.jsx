/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { socket } from "../socket";

const UnreadContext = createContext(undefined);

export function UnreadProvider({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [unreadByConversation, setUnreadByConversation] = useState({});
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevUserId, setPrevUserId] = useState(user?.id ?? null);
  const userId = user?.id ?? null;
  const match = matchPath("/messages/:conversationId", pathname);
  const openConversationId = match ? Number(match.params.conversationId) : null;

  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setUnreadByConversation({});
  }

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (openConversationId !== null) {
      setUnreadByConversation((previous) => {
        const next = { ...previous };
        delete next[openConversationId];
        return next;
      });
    }
  }

  useEffect(() => {
    if (!user) return;

    function onNewMessage(message) {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (message.sender_id === user.id) return;

      const conversationId = Number(message.conversation_id);
      if (conversationId === openConversationId) return;

      setUnreadByConversation((previous) => ({
        ...previous,
        [conversationId]: (previous[conversationId] ?? 0) + 1,
      }));
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
