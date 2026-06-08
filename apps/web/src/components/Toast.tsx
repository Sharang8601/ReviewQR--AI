"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { cn } from "../lib/utils";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  function dismiss(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-glass backdrop-blur-glass",
              toast.type === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-900",
              toast.type === "error" && "border-red-200 bg-red-50/95 text-red-900",
              toast.type === "info" && "border-slate-200 bg-white/95 text-slate-900"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            ) : null}
            <p className="flex-1 text-sm font-medium leading-6">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-lg p-1 opacity-70 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
