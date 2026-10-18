/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../api/client.js";
import { socket } from "../socket.js";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }
      setIsLoading(true);
      try {
        const data = await api("/api/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
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
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }
  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
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
