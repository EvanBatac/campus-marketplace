/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { socket } from "../socket";

const PresenceContext = createContext(undefined);

export function PresenceProvider({ children }) {
  const { user } = useAuth();

  // Remount presence state when the authenticated account changes or logs out.
  return <PresenceSession key={user?.id ?? "anonymous"} user={user}>{children}</PresenceSession>;
}

function PresenceSession({ user, children }) {
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());

  useEffect(() => {
    if (!user) return;

    function onOnlineUsers(userIds) {
      setOnlineUsers(() => new Set(userIds.map(String)));
    }
    function onUserOnline(userId) {
      setOnlineUsers((previous) => new Set(previous).add(String(userId)));
    }
    function onUserOffline(userId) {
      setOnlineUsers((previous) => {
        const next = new Set(previous);
        next.delete(String(userId));
        return next;
      });
    }
    function onDisconnect() {
      setOnlineUsers(() => new Set());
    }

    socket.on("online_users", onOnlineUsers);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("online_users", onOnlineUsers);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.off("disconnect", onDisconnect);
    };
  }, [user]);

  function isOnline(userId) {
    return Boolean(user) && onlineUsers.has(String(userId));
  }

  return (
    <PresenceContext.Provider value={{ isOnline }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used inside a PresenceProvider");
  }
  return context;
}
