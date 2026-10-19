"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Category } from "@/types";
import { api } from "@/lib/api";
import { initialProducts, mockCategoriesMen, mockCategoriesWomen } from "@/lib/mock-data";
import {
  SlidersHorizontal,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Alias de mapping pour URLs simplifiées
const SLUG_ALIASES: Record<string, string> = {
  costumes: "homme-costumes",
  chemises: "homme-chemises",
  chaussures: "homme-chaussures",
  "chaussures-homme": "homme-chaussures",
  "chaussures-femme": "femme-chaussures",
  escarpins: "femme-chaussures",
  sacs: "femme-sacs",
  robes: "femme-robes",
  blazers: "femme-blazers",
  tailleurs: "femme-blazers",
  accessoires: "homme-accessoires",
};

// Métadonnées éditoriales par catégorie
const CATEGORY_EDITORIALS: Record<
  string,
  {
    image: string;
    desc_fr: string;
    desc_ar: string;
    universe: "MEN" | "WOMEN";
    universe_label_fr: string;
    universe_label_ar: string;
    universe_href: string;
  }
> = {
  "homme-costumes": {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Laine royale 130s, coupes italiennes et vestes croisées façonnées avec un savoir-faire sartorial absolu.",
    desc_ar: "صوف ملكي 130s، قصات إيطالية وسترات بصدر مزدوج صممت بأعلى معايير الخياطة الإيطالية.",
    universe: "MEN",
    universe_label_fr: "Univers Homme",
    universe_label_ar: "تشكيلة الرجال",
    universe_href: "/homme",
  },
  "homme-chemises": {
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Popeline de coton égyptien 120/2, cols français et italiens raffinés pour une silhouette impeccable.",
    desc_ar: "قطن مصري ناعم 120/2، ياقات كلاسيكية وإيطالية أنيقة لإطلالة لا تشوبها شائبة.",
    universe: "MEN",
    universe_label_fr: "Univers Homme",
    universe_label_ar: "تشكيلة الرجال",
    universe_href: "/homme",
  },
  "homme-chaussures": {
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Mocassins péniche, derbies et souliers d'art patinés à la main dans les plus beaux cuirs de veau.",
    desc_ar: "أحذية موكاسان وأكسفورد جلدية أصلية مصقولة يدوياً من أفخر جلود العجل الطبيعية.",
    universe: "MEN",
    universe_label_fr: "Univers Homme",
    universe_label_ar: "تشكيلة الرجال",
    universe_href: "/homme",
  },
  "homme-accessoires": {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Sacs de voyage 48H en cuir pleine fleur, ceintures sellier et pièces de maroquinerie d'exception.",
    desc_ar: "حقائب سفر 48 ساعة من الجلد الطبيعي الأصيل وإكسسوارات راقية صُممت لترافق رحلاتك.",
    universe: "MEN",
    universe_label_fr: "Univers Homme",
    universe_label_ar: "تشكيلة الرجال",
    universe_href: "/homme",
  },
  "femme-robes": {
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Robes sculpturales en satin de pure soie mulberry, tombés magistraux et élégance intemporelle pour les grands soirs.",
    desc_ar: "فساتين سهرة ساحرة من حرير الساتان الخالص، قصات انسيابية راقية تمنحك إطلالة ملكية في أرقى المناسبات.",
    universe: "WOMEN",
    universe_label_fr: "Univers Femme",
    universe_label_ar: "تشكيلة النساء",
    universe_href: "/femme",
  },
  "femme-blazers": {
    image: "https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Tailleurs d'architecte, blazers ceinturés en crêpe ivoire et boutons gravés pour une allure puissante.",
    desc_ar: "بدلات كوتور عصرية، سترات من الكريب الفاخر وأزرار منقوشة تمنحك حضوراً واثقاً وأناقة بالغة.",
    universe: "WOMEN",
    universe_label_fr: "Univers Femme",
    universe_label_ar: "تشكيلة النساء",
    universe_href: "/femme",
  },
  "femme-sacs": {
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Sacs trapèze en cuir grainé, fermoirs dorés à l'or fin 24K et finitions artisanales de haute maroquinerie.",
    desc_ar: "حقائب يد راقية من الجلد المحبب بقفل مطلي بالذهب 24 قيراط ولمسات حرفية متقنة تليق بذوقك الرفيع.",
    universe: "WOMEN",
    universe_label_fr: "Univers Femme",
    universe_label_ar: "تشكيلة النساء",
    universe_href: "/femme",
  },
  "femme-chaussures": {
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Escarpins stiletto en cuir verni 85mm et sandales d'art alliant cambrure parfaite et confort noble.",
    desc_ar: "أحذية كعب عالي كلاسيكية من الجلد اللماع 85 مم تبرز جمال الإطلالة وتوفر راحة استثنائية.",
    universe: "WOMEN",
    universe_label_fr: "Univers Femme",
    universe_label_ar: "تشكيلة النساء",
    universe_href: "/femme",
  },
};

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

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const canonicalSlug = SLUG_ALIASES[rawSlug] || rawSlug;

  const { language, direction } = useLanguage();
  const isArabic = language === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtres
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [onlyPromos, setOnlyPromos] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const editorial = CATEGORY_EDITORIALS[canonicalSlug] || {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
    desc_fr: "Une sélection rigoureuse de pièces d'exception façonnées dans les plus belles étoffes.",
    desc_ar: "تشكيلة مختارة بعناية من القطع الفاخرة المصنوعة من أنبل الخامات العالمية.",
    universe: canonicalSlug.startsWith("femme") ? ("WOMEN" as const) : ("MEN" as const),
    universe_label_fr: canonicalSlug.startsWith("femme") ? "Univers Femme" : "Univers Homme",
    universe_label_ar: canonicalSlug.startsWith("femme") ? "تشكيلة النساء" : "تشكيلة الرجال",
    universe_href: canonicalSlug.startsWith("femme") ? "/femme" : "/homme",
  };

  // Chargement de la catégorie
  useEffect(() => {
    let active = true;
    api
      .getCategory(canonicalSlug)
      .then((cat) => {
        if (active && cat) setCategory(cat);
      })
      .catch(() => {
        if (!active) return;
        // Recherche dans le mock
        const allMocks = [...mockCategoriesMen, ...mockCategoriesWomen];
        const found = allMocks.find((c) => c.slug === canonicalSlug);
        if (found) setCategory(found);
        else {
          setCategory({
            id: 0,
            slug: canonicalSlug,
            name_fr: canonicalSlug.replace(/^(homme-|femme-)/, "").replace(/-/g, " ").toUpperCase(),
            name_ar: canonicalSlug,
            universe: editorial.universe,
            sort_order: 1,
            is_active: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [canonicalSlug, editorial.universe]);

  // Chargement des produits
  useEffect(() => {
    setLoading(true);
    const queryParams: Record<string, string | number | boolean | undefined> = {
      category_slug: canonicalSlug,
      sort: selectedSort,
    };
    if (selectedSize) queryParams.size = selectedSize;
    if (minPrice) queryParams.min_price = Number(minPrice);
    if (maxPrice) queryParams.max_price = Number(maxPrice);

    api
      .getProducts(queryParams)
      .then((res) => {
        let items: Product[] = res.items || [];
        if (onlyPromos) {
          items = items.filter((p) => p.discount_price !== null && p.discount_price !== undefined);
        }
        setProducts(items);
      })
      .catch(() => {
        // Fallback local
        let items = initialProducts.filter((p) => {
          const matchCat = category ? p.category_id === category.id : true;
          return matchCat && (p.universe === editorial.universe || p.universe === "UNISEX");
        });
        if (onlyPromos) {
          items = items.filter((p) => p.discount_price !== null && p.discount_price !== undefined);
        }
        if (selectedSize) {
          items = items.filter((p) => p.variants?.some((v) => v.size === selectedSize));
        }
        setProducts(items);
      })
      .finally(() => setLoading(false));
  }, [canonicalSlug, category, selectedSort, selectedSize, minPrice, maxPrice, onlyPromos, editorial.universe]);

  const categoryName = category
    ? isArabic
      ? category.name_ar
      : category.name_fr
    : canonicalSlug;

  const resetFilters = () => {
    setSelectedSize("");
    setMinPrice("");
    setMaxPrice("");
    setOnlyPromos(false);
    setSelectedSort("newest");
  };

  const activeFiltersCount = [
    selectedSize,
    onlyPromos ? "promo" : "",
    minPrice || maxPrice ? "price" : "",
  ].filter(Boolean).length;

  return (
    <div dir={direction} className="min-h-screen bg-[#faf9f6] text-[#171714]">
      {/* ─────────────────────────────────────────────────────────────
          1. BREADCRUMB ÉLÉGANT
      ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500">
            <Link href="/" className="hover:text-black transition-colors">
              {isArabic ? "الرئيسية" : "Accueil"}
            </Link>
            <ChevronIcon className="h-3 w-3 text-neutral-300" />
            <Link href={editorial.universe_href} className="hover:text-black transition-colors">
              {isArabic ? editorial.universe_label_ar : editorial.universe_label_fr}
            </Link>
            <ChevronIcon className="h-3 w-3 text-neutral-300" />
            <span className="font-semibold text-black">{categoryName}</span>
          </nav>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BANNIÈRE ÉDITORIALE DE LA CATÉGORIE
      ───────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[42vh] sm:min-h-[50vh] items-center justify-center overflow-hidden bg-black text-white">
        <Image
          src={editorial.image}
          alt={categoryName}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/30" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"
        >
          <span className="mb-3 inline-flex items-center gap-2 border border-white/30 bg-black/30 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-neutral-200 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-[#d8c5a0]" />
            <span>{isArabic ? editorial.universe_label_ar : editorial.universe_label_fr}</span>
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light uppercase tracking-[0.12em] text-white">
            {categoryName}
          </h1>

          <div className="mx-auto my-5 h-px w-16 bg-[#d8c5a0]" />

          <p className="mx-auto max-w-xl text-xs sm:text-sm font-light leading-relaxed text-neutral-200">
            {isArabic ? editorial.desc_ar : editorial.desc_fr}
          </p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. BARRE DE FILTRES & CATALOGUE
      ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Barre de contrôle */}
        <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md border border-neutral-200 shadow-sm p-3 sm:p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                {isArabic
                  ? `${products.length} قطعة متوفرة`
                  : `${products.length} pièce${products.length > 1 ? "s" : ""} disponible${products.length > 1 ? "s" : ""}`}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowFilters((f) => !f)}
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
                onChange={(e) => setSelectedSort(e.target.value)}
                aria-label={isArabic ? "ترتيب المنتجات" : "Trier les produits"}
                className="bg-white border border-neutral-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider focus:outline-none focus:border-black text-neutral-800"
              >
                <option value="newest">{isArabic ? "الأحدث أولاً" : "Nouveautés"}</option>
                <option value="price_asc">{isArabic ? "السعر: تصاعدي" : "Prix croissant"}</option>
                <option value="price_desc">{isArabic ? "السعر: تنازلي" : "Prix décroissant"}</option>
              </select>
            </div>
          </div>

          {/* Panneau dépliant de filtres */}
          {showFilters && (
            <div className="border-t border-neutral-100 pt-4 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                  {isArabic ? "المقاس" : "Taille"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(editorial.universe === "MEN"
                    ? ["XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "46", "48", "50"]
                    : ["XS", "S", "M", "L", "XL", "34", "36", "38", "40", "42", "44", "TU"]
                  ).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
                      className={`min-w-8 px-2.5 py-1 text-[10px] font-semibold border uppercase tracking-wide transition-all ${
                        selectedSize === sz
                          ? "bg-black text-white border-black"
                          : "border-neutral-200 text-neutral-700 hover:border-black bg-white"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                  {isArabic ? "السعر (درهم)" : "Prix (MAD)"}
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

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                  {isArabic ? "خيارات" : "Options"}
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={onlyPromos}
                    onChange={(e) => setOnlyPromos(e.target.checked)}
                    className="h-3.5 w-3.5 accent-black rounded-none cursor-pointer"
                  />
                  <span>{isArabic ? "العروض والتخفيضات فقط" : "Promotions uniquement"}</span>
                </label>
              </div>
            </div>
          )}

          {/* Chips filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-2.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                {isArabic ? "الفلاتر النشطة:" : "Filtres actifs :"}
              </span>
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
                onClick={resetFilters}
                className="ms-auto text-[9px] uppercase tracking-wider text-neutral-500 underline underline-offset-2 hover:text-black transition-colors"
              >
                {isArabic ? "مسح الكل" : "Tout effacer"}
              </button>
            </div>
          )}
        </div>

        {/* Grille de produits */}
        {loading ? (
          <SkeletonGrid />
        ) : products.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-300 bg-white p-8">
            <p className="font-serif text-lg text-neutral-700">
              {isArabic
                ? "لا توجد قطع مطابقة حالياً لهذه المعايير."
                : "Aucune pièce ne correspond actuellement à vos critères dans cette catégorie."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 bg-black px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
              >
                <span>{isArabic ? "إعادة ضبط الفلاتر" : "Réinitialiser les filtres"}</span>
              </button>
              <Link
                href={editorial.universe_href}
                className="inline-flex items-center gap-2 border border-black px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
              >
                <span>{isArabic ? "مشاهدة التشكيلة الكاملة" : "Voir tout le vestiaire"}</span>
              </Link>
            </div>
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
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SERVICES LUXE AVELOR
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
