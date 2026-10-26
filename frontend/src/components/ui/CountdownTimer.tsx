"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  targetDate?: Date | string;
  className?: string;
  title?: string;
}

export function CountdownTimer({
  targetDate,
  className = "",
  title,
}: CountdownTimerProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Calculate default target: end of Sunday this week or next 48h
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 2, hours: 14, minutes: 35, seconds: 48 });

  useEffect(() => {
    // Determine end time
    let endTime: number;
    if (targetDate) {
      endTime = new Date(targetDate).getTime();
    } else {
      // Default to 48 hours rolling
      const saved = localStorage.getItem("avelor_promo_timer");
      if (saved && Number(saved) > Date.now()) {
        endTime = Number(saved);
      } else {
        endTime = Date.now() + (2 * 24 * 3600 + 14 * 3600 + 35 * 60) * 1000;
        localStorage.setItem("avelor_promo_timer", String(endTime));
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      if (diff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = isArabic
    ? [
        { label: "يوم", val: timeLeft.days },
        { label: "ساعة", val: timeLeft.hours },
        { label: "دقيقة", val: timeLeft.minutes },
        { label: "ثانية", val: timeLeft.seconds },
      ]
    : [
        { label: "Jours", val: timeLeft.days },
        { label: "Heures", val: timeLeft.hours },
        { label: "Minutes", val: timeLeft.minutes },
        { label: "Secondes", val: timeLeft.seconds },
      ];

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
          </span>
          <Timer className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>{title}</span>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        {units.map((u, i) => (
          <React.Fragment key={u.label}>
            <div className="flex flex-col items-center justify-center bg-black/40 border border-[#C5A059]/30 backdrop-blur-md px-2.5 py-2 sm:px-4 sm:py-3 min-w-12.5 sm:min-w-16 shadow-sm">
              <span className="font-serif text-lg sm:text-2xl font-light text-white tracking-widest tabular-nums">
                {pad(u.val)}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.16em] text-neutral-400 mt-0.5">
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="font-serif text-[#C5A059] text-base sm:text-xl font-light select-none">
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
