import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext } from "../hooks/useToast";

function Toast({ toast, dismiss }) {
  const timer = useRef(null);
  const remaining = useRef(toast.type === "error" ? 8000 : 5000);
  const started = useRef(0);

  const pause = useCallback(() => {
    clearTimeout(timer.current);
    if (started.current) remaining.current -= Date.now() - started.current;
    started.current = 0;
  }, []);

  const resume = useCallback(() => {
    if (started.current) return;
    started.current = Date.now();
    timer.current = setTimeout(() => dismiss(toast.id), remaining.current);
  }, [dismiss, toast.id]);

  useEffect(() => {
    resume();
    return pause;
  }, [pause, resume]);

  const isError = toast.type === "error";
  return (
    <li
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${isError ? "border-red-200" : "border-green-200"}`}
      onMouseEnter={pause}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) resume();
      }}
      onFocus={pause}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          !event.currentTarget.matches(":hover")
        )
          resume();
      }}
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
      >
        {isError ? "!" : "✓"}
      </span>
      <p
        role={isError ? "alert" : "status"}
        aria-atomic="true"
        className="min-w-0 flex-1 wrap-anywhere text-sm leading-6 text-slate-700"
      >
        <span className="sr-only">{isError ? "Error: " : "Success: "}</span>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded px-1 text-lg leading-6 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const show = useCallback((message, type) => {
    const id = ++nextId.current;
    setToasts((current) => [...current.slice(-3), { id, message, type }]);
  }, []);
  const value = useMemo(
    () => ({
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ol
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-3 sm:left-auto sm:w-96"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}
