"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types";
import { api } from "@/lib/api";
import { Search, Sparkles } from "lucide-react";

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4 animate-pulse">
          <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/50 to-transparent" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-100 w-3/4 rounded-sm" />
            <div className="h-2.5 bg-neutral-100 w-1/3 rounded-sm" />
            <div className="h-3.5 bg-neutral-100 w-1/4 rounded-sm pt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t, language } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getProducts({ search: query, page_size: 24 })
      .then((res) => setProducts(res.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="border-b border-neutral-200/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-2">
            {t.search.title}
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-light text-neutral-900 tracking-tight">
            {query
              ? `${t.search.results_for} "${query}"`
              : t.search.search_piece}
          </h1>
        </div>
        {query && !loading && (
          <span className="text-xs uppercase tracking-widest text-neutral-400">
            {products.length} {products.length > 1 ? "pièces trouvées" : "pièce trouvée"}
          </span>
        )}
      </div>

      {loading ? (
        <SearchSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-4 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 mx-auto rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400">
            <Search className="w-6 h-6 stroke-[1.2]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-800">
              {t.search.no_results} &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {t.search.suggestions}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16">
          <SearchSkeleton />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
