"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { api } from "@/lib/api";
import { initialProducts } from "@/lib/mock-data";

export default function WomenUniversePage() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter((p) => p.universe === "WOMEN")
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [onlyPromos, setOnlyPromos] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getCategories("WOMEN")
      .then((cats) => setCategories(cats || []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = {
      universe: "WOMEN",
      sort: selectedSort,
    };
    if (selectedCategory) {
      params.category_slug = selectedCategory;
    }

    api.getProducts(params)
      .then((res) => {
        let items = res.items || [];
        if (onlyPromos) {
          items = items.filter((p: Product) => p.discount_price !== null && p.discount_price !== undefined);
        }
        setProducts(items);
      })
      .catch((err) => console.error("Erreur chargement produits femme:", err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSort, onlyPromos]);

  return (
    <div className="space-y-12">
      {/* Bannière Univers Femme */}
      <section className="relative h-[45vh] sm:h-[55vh] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop"
          alt="Collection Femme AVELOR"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-4">
          <span className="text-xs uppercase tracking-[0.35em] text-neutral-300 font-light block">
            {language === "fr" ? "Univers Femme" : "تشكيلة النساء الراقية"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif tracking-[0.15em] font-light uppercase">
            {language === "fr" ? "La Grâce & La Haute Couture" : "الأناقة والأنوثة الخالدة"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto font-light leading-relaxed">
            {language === "fr"
              ? "Soie pure, robes du soir sculptées à la main, blazers d'exception et maroquinerie d'art pour la femme marocaine contemporaine."
              : "حرير طبيعي، فساتين سهرة ساحرة وبدلات راقية صممت لتلائم ذوق المرأة المغربية الرفيع."}
          </p>
        </div>
      </section>

      {/* Barre de Filtres et Catégories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          {/* Filtres par Catégorie */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                selectedCategory === ""
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {language === "fr" ? "Tout" : "الكل"}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {language === "ar" ? cat.name_ar : cat.name_fr}
              </button>
            ))}
          </div>

          {/* Tri et Filtre Promo */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-neutral-700">
              <input
                type="checkbox"
                checked={onlyPromos}
                onChange={(e) => setOnlyPromos(e.target.checked)}
                className="rounded border-neutral-300 text-black focus:ring-black"
              />
              <span>{language === "fr" ? "Promotions uniquement" : "تخفيضات فقط"}</span>
            </label>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-300 px-3 py-1.5 font-medium focus:outline-none focus:border-black"
            >
              <option value="newest">{language === "fr" ? "Nouveautés" : "الأحدث أولاً"}</option>
              <option value="price_asc">{language === "fr" ? "Prix : Croissant" : "السعر : من الأقل للأعلى"}</option>
              <option value="price_desc">{language === "fr" ? "Prix : Décroissant" : "السعر : من الأعلى للأقل"}</option>
            </select>
          </div>
        </div>

        {/* Grille de Produits */}
        <div className="pt-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-neutral-100 w-full" />
                  <div className="h-3 bg-neutral-100 w-3/4" />
                  <div className="h-3 bg-neutral-100 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 space-y-3">
              <p className="text-sm">
                {language === "fr"
                  ? "Aucun produit ne correspond à ces critères."
                  : "لا توجد منتجات تطابق هذه المعايير حالياً."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setOnlyPromos(false);
                }}
                className="text-xs uppercase tracking-wider font-semibold underline text-black"
              >
                {language === "fr" ? "Réinitialiser les filtres" : "إعادة ضبط الفلاتر"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
