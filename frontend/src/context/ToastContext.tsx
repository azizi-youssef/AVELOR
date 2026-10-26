"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "wishlist";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  subMessage?: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, options?: { type?: ToastType; subMessage?: string }) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DURATION = 3500; // ms

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, options: { type?: ToastType; subMessage?: string } = {}) => {
      const id = Math.random().toString(36).slice(2);
      const newToast: Toast = {
        id,
        type: options.type ?? "success",
        message,
        subMessage: options.subMessage,
      };
      setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts
      const timer = setTimeout(() => dismiss(id), DURATION);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
