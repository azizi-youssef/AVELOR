"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { api } from "@/lib/api";
import {
  SlidersHorizontal,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronDown,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface UniverseCategoryItem {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  tagline_fr: string;
  tagline_ar: string;
  image: string;
}

export interface UniverseConfig {
  universe: "MEN" | "WOMEN";
  hero: {
    tagline_fr: string;
    tagline_ar: string;
    title_fr: string;
    title_ar: string;
    subtitle_fr: string;
    subtitle_ar: string;
    image: string;
    badge_fr: string;
    badge_ar: string;
  };
  categories: UniverseCategoryItem[];
  sizes: string[];
  otherUniverse: {
    universe: "MEN" | "WOMEN";
    href: string;
    name_fr: string;
    name_ar: string;
    title_fr: string;
    title_ar: string;
    subtitle_fr: string;
    subtitle_ar: string;
    cta_fr: string;
    cta_ar: string;
    image: string;
  };
}

interface UniverseViewProps {
  config: UniverseConfig;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-3/4 bg-neutral-100 w-full" />
          <div className="h-3.5 bg-neutral-100 w-3/4" />
          <div className="h-3 bg-neutral-100 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function UniverseView({ config }: UniverseViewProps) {
  const { language, direction, t } = useLanguage();
  const isArabic = language === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const urlCategory = searchParams.get("category") || searchParams.get("cat") || "";
  const urlSize = searchParams.get("size") || "";
  const urlNew = searchParams.get("is_new") === "true";
  const urlSort = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedSize, setSelectedSize] = useState<string>(urlSize);
  const [selectedSort, setSelectedSort] = useState<string>(urlSort);
  const [onlyPromos, setOnlyPromos] = useState<boolean>(false);
  const [onlyNew, setOnlyNew] = useState<boolean>(urlNew);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Synchronisation depuis les paramètres d'URL
  useEffect(() => {
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSize !== selectedSize) setSelectedSize(urlSize);
    if (urlNew !== onlyNew) setOnlyNew(urlNew);
    if (urlSort !== selectedSort) setSelectedSort(urlSort);
  }, [urlCategory, urlSize, urlNew, urlSort]);

  // Chargement des catégories depuis l'API
  useEffect(() => {
    api
      .getCategories(config.universe)
      .then((res) => {
        if (res && res.length > 0) setCategories(res);
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, [config.universe]);

  // Chargement et filtrage des produits
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean | undefined> = {
      universe: config.universe,
      sort: selectedSort,
    };
    if (selectedCategory) params.category_slug = selectedCategory;
    if (selectedSize) params.size = selectedSize;
    if (onlyNew) params.is_new = true;
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);

    api
      .getProducts(params)
      .then((res) => {
        let items: Product[] = res.items || [];
        if (onlyPromos) {
          items = items.filter(
            (p) => p.discount_price !== null && p.discount_price !== undefined
          );
        }
        setProducts(items);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des produits de l'univers:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [
    config.universe,
    selectedCategory,
    selectedSize,
    selectedSort,
    onlyPromos,
    onlyNew,
    minPrice,
    maxPrice,
    categories,
  ]);

  // Navigation / mise à jour URL avec smooth scroll
  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    const nextParams = new URLSearchParams(window.location.search);
    if (slug) {
      nextParams.set("category", slug);
    } else {
      nextParams.delete("category");
      nextParams.delete("cat");
    }
    const nextUrl = `${window.location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`;
    router.replace(nextUrl, { scroll: false });

    // Scroll doux vers le catalogue
    const collectionElem = document.getElementById("collection");
    if (collectionElem) {
      collectionElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleToggleNew = () => {
    const nextVal = !onlyNew;
    setOnlyNew(nextVal);
    const nextParams = new URLSearchParams(window.location.search);
    if (nextVal) nextParams.set("is_new", "true");
    else nextParams.delete("is_new");
    router.replace(`${window.location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`, { scroll: false });
  };

  const resetAllFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedSize("");
    setOnlyPromos(false);
    setOnlyNew(false);
    setMinPrice("");
    setMaxPrice("");
    setSelectedSort("newest");
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // Nouveautés et sélection pour sections éditoriales
  const newArrivals = useMemo(
    () => products.filter((p) => p.is_new).slice(0, 4),
    [products]
  );
  const featuredItems = useMemo(
    () => products.filter((p) => p.is_featured).slice(0, 4),
    [products]
  );

  const activeFiltersCount = [
    selectedCategory,
    selectedSize,
    onlyPromos ? "promo" : "",
    onlyNew ? "new" : "",
    minPrice || maxPrice ? "price" : "",
  ].filter(Boolean).length;

  return (
    <div dir={direction} className="min-h-screen bg-[#faf9f6] text-[#171714]">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION ÉDITORIALE HAUTE COUTURE
      ───────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[70vh] sm:min-h-[82vh] items-center justify-center overflow-hidden bg-black text-white">
        <Image
          src={config.hero.image}
          alt={isArabic ? config.hero.title_ar : config.hero.title_fr}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-65 transition-transform duration-1000 scale-102 hover:scale-100"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-black/50" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 border border-white/30 bg-black/25 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-200 backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3 text-[#d8c5a0]" />
            <span>{isArabic ? config.hero.badge_ar : config.hero.badge_fr}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-serif text-3xl font-light uppercase tracking-[0.14em] sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
          >
            {isArabic ? config.hero.title_ar : config.hero.title_fr}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto my-6 h-px w-20 bg-[#d8c5a0]"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mx-auto max-w-2xl text-xs sm:text-sm font-light leading-relaxed text-neutral-200 sm:leading-7"
          >
            {isArabic ? config.hero.subtitle_ar : config.hero.subtitle_fr}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <a
              href="#collection"
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-3 bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#d8c5a0] hover:text-black shadow-lg"
            >
              <span>{isArabic ? "اكتشف التشكيلة" : "Découvrir la collection"}</span>
              <ArrowIcon className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={() => {
                handleToggleNew();
                const elem = document.getElementById("collection");
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-3 border border-white/60 bg-black/20 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
            >
              <span>{isArabic ? "وصل حديثاً" : "Nos nouveautés"}</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. GRILLE VISUELLE DES CATÉGORIES
      ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c8053]">
            {isArabic ? "التصنيفات الراقية" : "Lignes de Création"}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-light uppercase tracking-widest sm:text-3xl text-neutral-900">
            {isArabic ? "استكشف حسب الصنف" : "Explorer par Catégorie"}
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-neutral-300" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {config.categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleSelectCategory(cat.slug)}
                className={`group relative aspect-3/4 w-full overflow-hidden text-left cursor-pointer transition-shadow duration-300 hover:shadow-xl ${
                  isSelected ? "ring-2 ring-black ring-offset-2" : ""
                }`}
              >
                <Image
                  src={cat.image}
                  alt={isArabic ? cat.name_ar : cat.name_fr}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#d8c5a0] block font-medium">
                    {isArabic ? cat.tagline_ar : cat.tagline_fr}
                  </span>
                  <h3 className="mt-1 font-serif text-sm sm:text-base font-semibold tracking-wide uppercase">
                    {isArabic ? cat.name_ar : cat.name_fr}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors">
                    <span>{isArabic ? "عرض التشكيلة" : "Explorer"}</span>
                    <ArrowIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </div>
                </div>

                {isSelected && (
                  <span className="absolute top-3 right-3 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-sm">
                    {isArabic ? "محدد" : "Actif"}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SÉLECTION AVELOR (PIÈCES MAÎTRESSES)
      ───────────────────────────────────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="border-t border-neutral-200/70 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left rtl:sm:text-right">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9c8053]">
                  {isArabic ? "قطع استثنائية" : "Créations Emblématiques"}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-light uppercase tracking-[0.08em] sm:text-3xl">
                  {isArabic ? "مختارات أفيولور" : "La Sélection AVELOR"}
                </h2>
              </div>
              <a
                href="#collection"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-800 hover:text-black transition-colors"
              >
                <span>{isArabic ? "مشاهدة جميع القطع" : "Voir tout le vestiaire"}</span>
                <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {featuredItems.map((prod) => (
                <ProductCard key={prod.id} product={prod} priority />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. CATALOGUE COMPLET & BARRE DE FILTRES EN DIRECT
      ───────────────────────────────────────────────────────────── */}
      <section id="collection" className="scroll-mt-24 border-t border-neutral-200 bg-[#faf9f6] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left rtl:sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9c8053]">
              {isArabic ? "كتالوج الملابس والإكسسوارات" : "Catalogue & Vestiaire"}
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-light uppercase tracking-wide">
              {config.universe === "MEN"
                ? isArabic
                  ? "المجموعة الكاملة للرجال"
                  : "Le Vestiaire Homme Complet"
                : isArabic
                ? "المجموعة الكاملة للنساء"
                : "Le Vestiaire Femme Complet"}
            </h2>
          </div>

          {/* Barre de navigation des filtres */}
          <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-sm p-3 sm:p-4 mb-6 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Catégories scrollables avec curseur glissant */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => handleSelectCategory("")}
                  className={`relative shrink-0 px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                    selectedCategory === ""
                      ? "text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {selectedCategory === "" && (
                    <motion.span
                      layoutId="universeCategoryPill"
                      className="absolute inset-0 bg-black shadow-xs z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{isArabic ? "الكل" : "Tout voir"}</span>
                </button>
                {config.categories.map((cat) => {
                  const active = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.slug)}
                      className={`relative shrink-0 px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                        active
                          ? "text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="universeCategoryPill"
                          className="absolute inset-0 bg-black shadow-xs z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{isArabic ? cat.name_ar : cat.name_fr}</span>
                    </button>
                  );
                })}
              </div>

              {/* Boutons Filtres avancés & Tri */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-all ${
                    showFilters || activeFiltersCount > 0
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-black bg-white"
                  }`}
                >
                  <SlidersHorizontal className="h-3 w-3" strokeWidth={2} />
                  <span>{isArabic ? "تصفية" : "Filtres"}</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <select
                  value={selectedSort}
                  onChange={(e) => {
                    const sortVal = e.target.value;
                    setSelectedSort(sortVal);
                    const nextParams = new URLSearchParams(window.location.search);
                    nextParams.set("sort", sortVal);
                    router.replace(`${window.location.pathname}?${nextParams.toString()}`, { scroll: false });
                  }}
                  aria-label={isArabic ? "ترتيب المنتجات" : "Trier les produits"}
                  className="bg-white border border-neutral-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider focus:outline-none focus:border-black text-neutral-800"
                >
                  <option value="newest">{isArabic ? "الأحدث أولاً" : "Nouveautés"}</option>
                  <option value="price_asc">{isArabic ? "السعر: تصاعدي" : "Prix croissant"}</option>
                  <option value="price_desc">{isArabic ? "السعر: تنازلي" : "Prix décroissant"}</option>
                </select>
              </div>
            </div>

            {/* Volet Filtres Avancés déroulant */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-neutral-100 pt-4 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                  {/* Tailles */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                      {isArabic ? "المقاس" : "Taille disponible"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {config.sizes.map((sz) => {
                        const active = selectedSize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(active ? "" : sz)}
                            className={`min-w-8 px-2.5 py-1 text-[10px] font-semibold border uppercase tracking-wide transition-all ${
                              active
                                ? "bg-black text-white border-black"
                                : "border-neutral-200 text-neutral-700 hover:border-black bg-white"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                      {isArabic ? "السعر (درهم مغربي)" : "Fourchette de prix (MAD)"}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min={0}
                        className="w-full border border-neutral-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-black bg-neutral-50"
                      />
                      <span className="text-neutral-400 text-xs">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min={0}
                        className="w-full border border-neutral-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-black bg-neutral-50"
                      />
                    </div>
                  </div>

                  {/* Options spéciales */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                      {isArabic ? "خيارات التصفية" : "Sélections spéciales"}
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={onlyNew}
                          onChange={handleToggleNew}
                          className="h-3.5 w-3.5 accent-black rounded-none cursor-pointer"
                        />
                        <span>{isArabic ? "القطع الجديدة فقط" : "Nouveautés uniquement"}</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={onlyPromos}
                          onChange={(e) => setOnlyPromos(e.target.checked)}
                          className="h-3.5 w-3.5 accent-black rounded-none cursor-pointer"
                        />
                        <span>{isArabic ? "العروض والتخفيضات فقط" : "Pièces en promotion"}</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chips des filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-2.5">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                  {isArabic ? "الفلاتر النشطة:" : "Filtres actifs :"}
                </span>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("")}
                    className="flex items-center gap-1 bg-black text-white text-[9px] px-2.5 py-0.5 uppercase tracking-wider font-medium hover:bg-neutral-800"
                  >
                    <span>{selectedCategory}</span>
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {selectedSize && (
                  <button
                    type="button"
                    onClick={() => setSelectedSize("")}
                    className="flex items-center gap-1 bg-black text-white text-[9px] px-2.5 py-0.5 uppercase tracking-wider font-medium hover:bg-neutral-800"
                  >
                    <span>Taille {selectedSize}</span>
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {onlyNew && (
                  <button
                    type="button"
                    onClick={handleToggleNew}
                    className="flex items-center gap-1 bg-black text-white text-[9px] px-2.5 py-0.5 uppercase tracking-wider font-medium hover:bg-neutral-800"
                  >
                    <span>{isArabic ? "جديد" : "Nouveautés"}</span>
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {onlyPromos && (
                  <button
                    type="button"
                    onClick={() => setOnlyPromos(false)}
                    className="flex items-center gap-1 bg-black text-white text-[9px] px-2.5 py-0.5 uppercase tracking-wider font-medium hover:bg-neutral-800"
                  >
                    <span>{isArabic ? "تخفيضات" : "Promotions"}</span>
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="flex items-center gap-1 bg-black text-white text-[9px] px-2.5 py-0.5 uppercase tracking-wider font-medium hover:bg-neutral-800"
                  >
                    <span>
                      {minPrice || "0"} - {maxPrice || "∞"} MAD
                    </span>
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="ms-auto text-[9px] uppercase tracking-wider text-neutral-500 underline underline-offset-2 hover:text-black transition-colors"
                >
                  {isArabic ? "مسح الكل" : "Tout réinitialiser"}
                </button>
              </div>
            )}
          </div>

          {/* Compteur de résultats */}
          {!loading && (
            <p className="mb-6 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              {isArabic
                ? `${products.length} قطعة متوفرة في التشكيلة`
                : `${products.length} création${products.length > 1 ? "s" : ""} disponible${products.length > 1 ? "s" : ""}`}
            </p>
          )}

          {/* Affichage des produits */}
          {loading ? (
            <SkeletonGrid />
          ) : products.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-neutral-300 bg-white p-8">
              <p className="font-serif text-lg text-neutral-700">
                {isArabic
                  ? "لا توجد قطع مطابقة لمعايير البحث الحالية."
                  : "Aucune pièce ne correspond actuellement à ces critères."}
              </p>
              <p className="mt-2 text-xs text-neutral-500 max-w-md mx-auto">
                {isArabic
                  ? "جرّب إزالة بعض الفلاتر لاستكشاف كامل التشكيلة."
                  : "Essayez de modifier vos filtres ou explorez l'ensemble du vestiaire."}
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-6 inline-flex items-center gap-2 bg-black px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
              >
                <span>{isArabic ? "إعادة ضبط الفلاتر" : "Réinitialiser les filtres"}</span>
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {products.map((prod, idx) => (
                  <motion.div
                    key={prod.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard product={prod} priority={idx < 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. PASSERELLE VERS L'AUTRE UNIVERS (CROSS-UNIVERSE EXPLORATION)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black text-white py-24">
        <Image
          src={config.otherUniverse.image}
          alt={isArabic ? config.otherUniverse.title_ar : config.otherUniverse.title_fr}
          fill
          sizes="100vw"
          className="object-cover object-center opacity-45 transition-transform duration-1000 scale-102 hover:scale-100"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/80" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d8c5a0] block mb-3">
            {isArabic ? config.otherUniverse.name_ar : config.otherUniverse.name_fr}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light uppercase tracking-widest text-white">
            {isArabic ? config.otherUniverse.title_ar : config.otherUniverse.title_fr}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-xs sm:text-sm font-light text-neutral-300 leading-relaxed">
            {isArabic ? config.otherUniverse.subtitle_ar : config.otherUniverse.subtitle_fr}
          </p>
          <div className="mt-8">
            <Link
              href={config.otherUniverse.href}
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#d8c5a0] hover:text-black shadow-xl"
            >
              <span>{isArabic ? config.otherUniverse.cta_ar : config.otherUniverse.cta_fr}</span>
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SERVICES DE CONCIERGERIE & ENGAGEMENTS DE PRESTIGE
      ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2 p-3">
              <Truck className="h-5 w-5 text-[#9c8053]" strokeWidth={1.5} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                {isArabic ? "توصيل مجاني" : "Livraison Offerte"}
              </h4>
              <p className="text-[11px] text-neutral-500">
                {isArabic ? "ابتداءً من 500 درهم في جميع مدن المغرب" : "Dès 500 MAD partout au Maroc"}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-3">
              <ShieldCheck className="h-5 w-5 text-[#9c8053]" strokeWidth={1.5} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                {isArabic ? "الدفع عند الاستلام" : "Cash on Delivery"}
              </h4>
              <p className="text-[11px] text-neutral-500">
                {isArabic ? "ادفع نقداً بكل أمان عند استلام طلبيتك" : "Paiement en espèces à la livraison"}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-3">
              <RotateCcw className="h-5 w-5 text-[#9c8053]" strokeWidth={1.5} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                {isArabic ? "إرجاع واستبدال مجاني" : "Retours & Échanges"}
              </h4>
              <p className="text-[11px] text-neutral-500">
                {isArabic ? "خلال 14 يوماً مع خدمة الاستلام من المنزل" : "Sous 14 jours sans tracas"}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-3">
              <Headphones className="h-5 w-5 text-[#9c8053]" strokeWidth={1.5} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                {isArabic ? "خدمة العملاء 7/7" : "Conciergerie Privée"}
              </h4>
              <p className="text-[11px] text-neutral-500">
                {isArabic ? "استشارات الأناقة ومتابعة الطلبات" : "Conseillers dédiés 7j/7"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
