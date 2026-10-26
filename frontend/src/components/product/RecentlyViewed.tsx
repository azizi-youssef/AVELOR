"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { History, Trash2 } from "lucide-react";

const STORAGE_KEY = "avelor_recently_viewed";

export function trackRecentlyViewed(product: Product) {
  if (typeof window === "undefined" || !product || !product.id) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items: Product[] = raw ? JSON.parse(raw) : [];
    // Remove if already in list
    items = items.filter((p) => p.id !== product.id);
    // Add to beginning
    items.unshift(product);
    // Keep max 8 items
    items = items.slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to track recently viewed product", e);
  }
}

interface RecentlyViewedProps {
  currentProductId?: number;
  className?: string;
}

export function RecentlyViewed({ currentProductId, className = "" }: RecentlyViewedProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        let parsed: Product[] = JSON.parse(raw);
        if (currentProductId) {
          parsed = parsed.filter((p) => p.id !== currentProductId);
        }
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, [currentProductId]);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  if (items.length === 0) return null;

  return (
    <section className={`py-12 sm:py-16 border-t border-neutral-200/70 ${className}`} dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200/70 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 stroke-[1.5]" />
              {isArabic ? "سجل التصفح" : "Votre historique"}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-neutral-900 tracking-tight">
              {isArabic ? "قطع شاهدتموها مؤخراً" : "Récemment consultés"}
            </h2>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-neutral-400 hover:text-neutral-700 transition-colors"
            title="Effacer l'historique"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isArabic ? "مسح السجل" : "Effacer"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
