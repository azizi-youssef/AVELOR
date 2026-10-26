"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function LuxuryCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth trailing spring for the outer ring
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop devices with a mouse
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    setEnabled(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest("a, button, input, [role='button'], .cursor-pointer");
      setHovered(Boolean(isInteractive));
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      {/* Precision center dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#C5A059] rounded-full pointer-events-none z-9999 -translate-x-1/2 -translate-y-1/2"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      />

      {/* Trailing luxury ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-9998 -translate-x-1/2 -translate-y-1/2 border border-[#C5A059]/50"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          width: hovered ? 38 : 22,
          height: hovered ? 38 : 22,
          backgroundColor: hovered ? "rgba(197, 160, 89, 0.12)" : "transparent",
          borderColor: hovered ? "rgba(197, 160, 89, 0.9)" : "rgba(197, 160, 89, 0.4)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
}
