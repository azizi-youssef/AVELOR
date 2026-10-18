"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types";
import { api } from "@/lib/api";
import { Search } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { language } = useLanguage();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block mb-1">
          Résultats de recherche
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-black">
          {query ? `Résultats pour "${query}" (${products.length})` : "Rechercher une pièce"}
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-[3/4] bg-neutral-100 w-full" />
              <div className="h-3 bg-neutral-100 w-3/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 space-y-3 text-neutral-500">
          <Search className="w-8 h-8 mx-auto text-neutral-300 stroke-[1.2]" />
          <p className="text-xs">
            {language === "fr"
              ? `Aucun résultat trouvé pour "${query}". Essayez avec "costume", "robe", "sac", "chemise"...`
              : `لم يتم العثور على نتائج تطابق "${query}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
    <Suspense fallback={<div className="p-8 text-center text-xs">Recherche en cours...</div>}>
      <SearchContent />
    </Suspense>
  );
}
