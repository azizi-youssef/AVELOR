"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { api } from "@/lib/api";
import { initialProducts, mockCategoriesMen } from "@/lib/mock-data";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

// Toutes les tailles disponibles dans l'univers Homme
const MEN_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "46", "48", "50"];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-[3/4] bg-neutral-100 w-full" />
          <div className="h-3 bg-neutral-100 w-3/4" />
          <div className="h-3 bg-neutral-100 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ActiveFiltersBar({
  selectedCategory,
  selectedSize,
  minPrice,
  maxPrice,
  onlyPromos,
  onClearCategory,
  onClearSize,
  onClearPrice,
  onClearPromo,
  onClearAll,
  isArabic,
  t,
}: any) {
  const hasFilters = selectedCategory || selectedSize || minPrice || maxPrice || onlyPromos;
  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-neutral-100">
      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold me-1">
        {isArabic ? "Ø§Ù„ÙÙ„Ø§ØªØ± Ø§Ù„ÙØ¹Ù‘Ø§Ù„Ø©:" : "Filtres actifs :"}
      </span>
      {selectedCategory && (
        <button
          onClick={onClearCategory}
          className="flex items-center gap-1 border border-neutral-800 bg-neutral-900 text-white text-[10px] px-2.5 py-1 uppercase tracking-wider hover:bg-black transition-colors"
        >
          {selectedCategory}
          <X className="h-2.5 w-2.5" />
        </button>
      )}
      {selectedSize && (
        <button
          onClick={onClearSize}
          className="flex items-center gap-1 border border-neutral-800 bg-neutral-900 text-white text-[10px] px-2.5 py-1 uppercase tracking-wider hover:bg-black transition-colors"
        >
          {isArabic ? "Ø§Ù„Ù…Ù‚Ø§Ø³" : "Taille"} {selectedSize}
          <X className="h-2.5 w-2.5" />
        </button>
      )}
      {(minPrice || maxPrice) && (
        <button
          onClick={onClearPrice}
          className="flex items-center gap-1 border border-neutral-800 bg-neutral-900 text-white text-[10px] px-2.5 py-1 uppercase tracking-wider hover:bg-black transition-colors"
        >
          {minPrice || "0"} â€“ {maxPrice || "âˆž"} MAD
          <X className="h-2.5 w-2.5" />
        </button>
      )}
      {onlyPromos && (
        <button
          onClick={onClearPromo}
          className="flex items-center gap-1 border border-neutral-800 bg-neutral-900 text-white text-[10px] px-2.5 py-1 uppercase tracking-wider hover:bg-black transition-colors"
        >
          {isArabic ? "ØªØ®ÙÙŠØ¶Ø§Øª" : "Promotions"}
          <X className="h-2.5 w-2.5" />
        </button>
      )}
      <button
        onClick={onClearAll}
        className="ms-auto text-[10px] uppercase tracking-wider text-neutral-500 underline underline-offset-2 hover:text-black transition-colors"
      >
        {isArabic ? "Ù…Ø³Ø­ Ø§Ù„ÙƒÙ„" : "Tout effacer"}
      </button>
    </div>
  );
}

function MenUniverseContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isArabic = language === "ar";

  const categoryParam = searchParams.get("category") || searchParams.get("cat") || "";
  const sizeParam = searchParams.get("size") || "";

  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter((p) => p.universe === "MEN")
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSize, setSelectedSize] = useState<string>(sizeParam);
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [onlyPromos, setOnlyPromos] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Sync depuis l'URL
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (sizeParam) setSelectedSize(sizeParam);
  }, [categoryParam, sizeParam]);

  // Charger catÃ©gories
  useEffect(() => {
    api.getCategories("MEN")
      .then((cats) => setCategories(cats && cats.length > 0 ? cats : mockCategoriesMen))
      .catch(() => setCategories(mockCategoriesMen));
  }, []);

  // Charger produits
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean | undefined> = {
      universe: "MEN",
      sort: selectedSort,
    };
    if (selectedCategory) params.category_slug = selectedCategory;
    if (selectedSize) params.size = selectedSize;
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);

    api.getProducts(params)
      .then((res) => {
        let items = res.items || [];
        if (onlyPromos) {
          items = items.filter((p: Product) => p.discount_price !== null && p.discount_price !== undefined);
        }
        setProducts(items.length > 0 ? items : []);
      })
      .catch(() => {
        let items = initialProducts.filter((p) => p.universe === "MEN");
        if (selectedCategory) items = items.filter((p) => p.category_id !== undefined);
        if (onlyPromos) items = items.filter((p) => p.discount_price !== null && p.discount_price !== undefined);
        setProducts(items);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSize, selectedSort, onlyPromos, minPrice, maxPrice]);

  const resetAllFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedSize("");
    setOnlyPromos(false);
    setMinPrice("");
    setMaxPrice("");
    router.replace("/homme");
  }, [router]);

  const totalFiltersActive = [selectedCategory, selectedSize, minPrice || maxPrice, onlyPromos ? "promo" : ""].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      {/* BanniÃ¨re Univers Homme */}
      <section className="relative h-[45vh] sm:h-[55vh] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920&auto=format&fit=crop"
          alt="Collection Homme AVELOR"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-4">
          <span className="text-xs uppercase tracking-[0.35em] text-neutral-300 font-light block">
            {isArabic ? "ØªØ´ÙƒÙŠÙ„Ø© Ø§Ù„Ø±Ø¬Ø§Ù„ Ø§Ù„ÙØ§Ø®Ø±Ø©" : "Univers Homme"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif tracking-[0.15em] font-light uppercase">
            {isArabic ? "Ø§Ù„Ø£Ù†Ø§Ù‚Ø© Ø§Ù„Ø³Ø§Ø±ØªÙˆØ±ÙŠØ§Ù„ Ø§Ù„Ø±Ø§Ù‚ÙŠØ©" : "L'Allure & Le Sartorial"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto font-light leading-relaxed">
            {isArabic
              ? "ØµÙˆÙ Ø¨ÙƒØ± Ø¥ÙŠØ·Ø§Ù„ÙŠØŒ Ø¨Ø¯Ù„Ø§Øª Ù…ØªÙ‚Ù†Ø© ÙˆØ£Ø­Ø°ÙŠØ© ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠØ© ÙØ§Ø®Ø±Ø©."
              : "Laine vierge italienne, coupes cintrÃ©es magistrales et souliers patinÃ©s."}
          </p>
        </div>
      </section>

      {/* Barre de filtres STICKY */}
      <div className="sticky top-[125px] z-20 bg-white border-b border-neutral-200 shadow-sm" dir={isArabic ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ligne principale des filtres */}
          <div className="flex flex-wrap items-center gap-3 py-3">
            {/* CatÃ©gories scrollables */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
              <button
                onClick={() => setSelectedCategory("")}
                className={`flex-shrink-0 px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                  selectedCategory === "" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {isArabic ? "Ø§Ù„ÙƒÙ„" : "Tout"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex-shrink-0 px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                    selectedCategory === cat.slug ? "bg-black text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {isArabic ? cat.name_ar : cat.name_fr}
                </button>
              ))}
            </div>

            {/* Filtre avancÃ© + tri */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFilters((f) => !f)}
                className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                  showFilters || totalFiltersActive > 0 ? "border-black bg-black text-white" : "border-neutral-200 text-neutral-700 hover:border-black"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" strokeWidth={2} />
                {isArabic ? "ÙÙ„Ø§ØªØ±" : "Filtres"}
                {totalFiltersActive > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-bold">
                    {totalFiltersActive}
                  </span>
                )}
              </button>

              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                aria-label={isArabic ? "ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª" : "Trier les produits"}
                className="text-[10px] bg-neutral-50 border border-neutral-200 px-3 py-1.5 font-semibold uppercase tracking-wider focus:outline-none focus:border-black"
              >
                <option value="newest">{isArabic ? "Ø§Ù„Ø£Ø­Ø¯Ø« Ø£ÙˆÙ„Ø§Ù‹" : "NouveautÃ©s"}</option>
                <option value="price_asc">{isArabic ? "Ø§Ù„Ø³Ø¹Ø±: ØªØµØ§Ø¹Ø¯ÙŠ" : "Prix croissant"}</option>
                <option value="price_desc">{isArabic ? "Ø§Ù„Ø³Ø¹Ø±: ØªÙ†Ø§Ø²Ù„ÙŠ" : "Prix dÃ©croissant"}</option>
              </select>
            </div>
          </div>

          {/* Panneau filtres avancÃ©s */}
          {showFilters && (
            <div className="border-t border-neutral-100 py-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Filtre Taille */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                  {isArabic ? "Ø§Ù„Ù…Ù‚Ø§Ø³" : "Taille"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MEN_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                      className={`px-2.5 py-1 text-[10px] font-semibold border uppercase tracking-wide transition-colors ${
                        selectedSize === s ? "bg-black text-white border-black" : "border-neutral-200 text-neutral-700 hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre Prix */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                  {isArabic ? "Ø§Ù„Ø³Ø¹Ø± (Ø¯Ø±Ù‡Ù…)" : "Prix (MAD)"}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={isArabic ? "Ø§Ù„Ø£Ø¯Ù†Ù‰" : "Min"}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min={0}
                    className="w-full border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black bg-neutral-50"
                    aria-label={isArabic ? "Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø£Ø¯Ù†Ù‰" : "Prix minimum"}
                  />
                  <span className="text-neutral-400 text-xs">â€”</span>
                  <input
                    type="number"
                    placeholder={isArabic ? "Ø§Ù„Ø£Ù‚ØµÙ‰" : "Max"}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={0}
                    className="w-full border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black bg-neutral-50"
                    aria-label={isArabic ? "Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø£Ù‚ØµÙ‰" : "Prix maximum"}
                  />
                </div>
              </div>

              {/* Filtre Promotions */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                  {isArabic ? "Ø®ÙŠØ§Ø±Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©" : "Options"}
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setOnlyPromos((p) => !p)}
                    className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${onlyPromos ? "bg-black" : "bg-neutral-200"}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${onlyPromos ? "left-4.5" : "left-0.5"}`} />
                  </div>
                  <span className="text-xs text-neutral-700 font-medium">
                    {isArabic ? "Ø§Ù„ØªØ®ÙÙŠØ¶Ø§Øª ÙÙ‚Ø·" : "Promotions uniquement"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Filtres actifs */}
          <ActiveFiltersBar
            selectedCategory={selectedCategory}
            selectedSize={selectedSize}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onlyPromos={onlyPromos}
            onClearCategory={() => setSelectedCategory("")}
            onClearSize={() => setSelectedSize("")}
            onClearPrice={() => { setMinPrice(""); setMaxPrice(""); }}
            onClearPromo={() => setOnlyPromos(false)}
            onClearAll={resetAllFilters}
            isArabic={isArabic}
            t={t}
          />
        </div>
      </div>

      {/* Catalogue */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16" dir={isArabic ? "rtl" : "ltr"}>
        {/* Compteur de rÃ©sultats */}
        {!loading && (
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-6">
            {isArabic ? `${products.length} Ù…Ù†ØªØ¬` : `${products.length} produit${products.length > 1 ? "s" : ""}`}
          </p>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : products.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-sm text-neutral-500">
              {isArabic ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª ØªØ·Ø§Ø¨Ù‚ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¹Ø§ÙŠÙŠØ±." : "Aucun produit ne correspond Ã  ces critÃ¨res."}
            </p>
            <button
              onClick={resetAllFilters}
              className="text-xs uppercase tracking-wider font-semibold underline text-black hover:text-neutral-600 transition-colors"
            >
              {isArabic ? "Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø· Ø§Ù„ÙÙ„Ø§ØªØ±" : "RÃ©initialiser les filtres"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function MenUniversePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-xs tracking-widest uppercase text-neutral-400">
          Chargement de la collection...
        </div>
      }
    >
      <MenUniverseContent />
    </Suspense>
  );
}

