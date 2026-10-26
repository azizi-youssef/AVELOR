"use client";

import React, { useEffect, useRef, useState } from "react";
import { useToast, Toast, ToastType } from "@/context/ToastContext";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <path d="M4.5 8l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 0 1 8 3.09 3.5 3.5 0 0 1 14 5.5C14 9.5 8 13.5 8 13.5z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function IconError() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <rect x="7.25" y="7" width="1.5" height="4.5" rx="0.75" fill="currentColor" />
      <circle cx="8" cy="5" r="0.875" fill="currentColor" />
    </svg>
  );
}

// ─── Config par type ─────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { icon: React.ReactNode; color: string; border: string }> = {
  success: {
    icon: <IconCheck />,
    color: "#4ade80",   // vert doux
    border: "rgba(74,222,128,0.25)",
  },
  wishlist: {
    icon: <IconHeart />,
    color: "#f9a8d4",   // rose
    border: "rgba(249,168,212,0.25)",
  },
  error: {
    icon: <IconError />,
    color: "#f87171",   // rouge doux
    border: "rgba(248,113,113,0.25)",
  },
  info: {
    icon: <IconInfo />,
    color: "#d8c5a0",   // gold AVELOR
    border: "rgba(216,197,160,0.25)",
  },
};

// ─── Composant individuel ────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const cfg = CONFIG[toast.type];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrée — micro-delay pour trigger la transition
    const t = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={handleDismiss}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "rgba(25, 25, 22, 0.92)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${cfg.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        cursor: "pointer",
        minWidth: "260px",
        maxWidth: "360px",
        transform: visible ? "translateX(0) scale(1)" : "translateX(40px) scale(0.96)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
        willChange: "transform, opacity",
      }}
    >
      {/* Icône */}
      <span style={{ color: cfg.color, flexShrink: 0, marginTop: "1px" }}>
        {cfg.icon}
      </span>

      {/* Texte */}
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: "13px",
          fontWeight: 600,
          color: "#faf9f6",
          fontFamily: "var(--font-avelor-sans, sans-serif)",
          letterSpacing: "0.01em",
          lineHeight: 1.4,
        }}>
          {toast.message}
        </p>
        {toast.subMessage && (
          <p style={{
            margin: "3px 0 0",
            fontSize: "11.5px",
            color: "rgba(250,249,246,0.55)",
            fontFamily: "var(--font-avelor-sans, sans-serif)",
            lineHeight: 1.4,
          }}>
            {toast.subMessage}
          </p>
        )}
      </div>

      {/* Barre de progression */}
      <ProgressBar color={cfg.color} duration={3500} />
    </div>
  );
}

function ProgressBar({ color, duration }: { color: string; duration: number }) {
  const [width, setWidth] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "2px",
        width: `${width}%`,
        background: `linear-gradient(90deg, ${color}66, ${color})`,
        borderRadius: "0 0 12px 12px",
        transition: "width 0.1s linear",
      }}
    />
  );
}

// ─── Container principal ──────────────────────────────────────────────────────

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
          <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
