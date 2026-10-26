/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { socket } from "../socket.js";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const sessionVersion = useRef(0);

  useEffect(() => {
    const version = sessionVersion.current;
    let active = true;
    const isCurrentSession = () =>
      active && version === sessionVersion.current;

    async function loadUser() {
      setAuthError(null);
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }
      setIsLoading(true);
      try {
        const data = await api("/api/auth/me");
        if (!isCurrentSession()) return;
        setUser(data.user);
      } catch (error) {
        if (!isCurrentSession()) return;
        if (error.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        } else {
          setAuthError(error.message);
        }
      } finally {
        if (isCurrentSession()) setIsLoading(false);
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!user) return;

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  function login(newToken) {
    sessionVersion.current += 1;
    setUser(null);
    setAuthError(null);
    setIsLoading(true);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    queryClient.clear();
  }
  function logout() {
    sessionVersion.current += 1;
    setUser(null);
    setAuthError(null);
    setIsLoading(false);
    socket.disconnect();
    queryClient.clear();
    localStorage.removeItem("token");
    setToken(null);
  }
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        authError,
        login,
        logout,
        updateUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
