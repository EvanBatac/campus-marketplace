import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PresenceProvider } from "./context/PresenceContext.jsx";
import { UnreadProvider } from "./context/UnreadContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { ToastProvider } from "./context/ToastContext.jsx";
import App from "./App.jsx";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PresenceProvider>
            <UnreadProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </UnreadProvider>
          </PresenceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
