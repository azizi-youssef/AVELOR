"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { MiniCart } from "@/components/layout/MiniCart";
import {
  ShoppingBag,
  UserRound,
  Search,
  Globe,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Shirt,
  Briefcase,
  Footprints,
  Watch,
  Sparkles,
  Crown,
  ArrowRight,
  ArrowLeft,
  Truck,
  RotateCcw,
  Headphones,
  Heart,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Universe = "MEN" | "WOMEN";
type IconName = "Shirt" | "Briefcase" | "Footprints" | "Watch" | "Sparkles" | "ShoppingBag" | "Crown";

interface CatalogueItem {
  name_fr: string;
  name_ar: string;
  href: string;
  badge?: string;
}

interface CatalogueCategory {
  title_fr: string;
  title_ar: string;
  iconName: IconName;
  items: CatalogueItem[];
}

interface CatalogueData {
  universe: Universe;
  title_fr: string;
  title_ar: string;
  tagline_fr: string;
  tagline_ar: string;
  viewAllHref: string;
  featured: {
    title_fr: string;
    title_ar: string;
    subtitle_fr: string;
    subtitle_ar: string;
    image: string;
    href: string;
    badge_fr: string;
    badge_ar: string;
  };
  categories: CatalogueCategory[];
}

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const CATALOGUES: Record<Universe, CatalogueData> = {
  MEN: {
    universe: "MEN",
    title_fr: "Catalogue Homme",
    title_ar: "كتالوج الرجال",
    tagline_fr: "L'élégance sartoriale italienne & matières d'exception",
    tagline_ar: "أرقى الخياطة السارتوريال الإيطالية والخامات النبيلة",
    viewAllHref: "/homme",
    featured: {
      title_fr: "L'Allure Homme AVELOR",
      title_ar: "أناقة الرجل الملكي",
      subtitle_fr: "Costumes sur-mesure, laine 130s & maroquinerie d'art.",
      subtitle_ar: "بدلات فاخرة من صوف 130s وجلديات راقية متقنة الصنع.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      href: "/homme",
      badge_fr: "Édition Limitée",
      badge_ar: "إصدار محدود",
    },
    categories: [
      {
        title_fr: "Vêtements & Costumes",
        title_ar: "الملابس والبدلات",
        iconName: "Shirt",
        items: [
          { name_fr: "Costumes & Blazers", name_ar: "بدلات وسترات رسمية", href: "/homme?category=homme-costumes", badge: "Signature" },
          { name_fr: "Chemises de Luxe", name_ar: "قمصان كلاسيكية فاخرة", href: "/homme?category=homme-chemises" },
          { name_fr: "Pantalons Habillés", name_ar: "سراويل قماشية أنيقة", href: "/homme?category=homme-costumes" },
          { name_fr: "Manteaux & Pardessus", name_ar: "معاطف شتوية فاخرة", href: "/homme?category=homme-costumes" },
          { name_fr: "Polos en Maille & Tricots", name_ar: "كنزات وبولو ناعم", href: "/homme?category=homme-chemises" },
        ],
      },
      {
        title_fr: "Sacs & Maroquinerie",
        title_ar: "الحقائب والجلديات",
        iconName: "Briefcase",
        items: [
          { name_fr: "Sacs de Voyage & 48h", name_ar: "حقائب سفر عطلة الأسبوع", href: "/homme?category=homme-accessoires", badge: "Nouveau" },
          { name_fr: "Porte-documents & Mallettes", name_ar: "حقائب عمل واجتماعات", href: "/homme?category=homme-accessoires" },
          { name_fr: "Sacoches & Bandoulières", name_ar: "حقائب كتف جلدية", href: "/homme?category=homme-accessoires" },
          { name_fr: "Pochettes & Trousses de Toilette", name_ar: "حقائب يد ومستلزمات", href: "/homme?category=homme-accessoires" },
          { name_fr: "Sacs à Dos en Cuir Pleine Fleur", name_ar: "حقائب ظهر راقية", href: "/homme?category=homme-accessoires" },
        ],
      },
      {
        title_fr: "Chaussures de Prestige",
        title_ar: "الأحذية الفاخرة",
        iconName: "Footprints",
        items: [
          { name_fr: "Chaussures & Derbies", name_ar: "أحذية ديربي كلاسيكية", href: "/homme?category=homme-chaussures", badge: "Artisan" },
          { name_fr: "Mocassins & Loafers en Cuir", name_ar: "موكاسان فاخر مريح", href: "/homme?category=homme-chaussures" },
          { name_fr: "Richelieus en Cuir Glacé", name_ar: "أوكسفورد للمناسبات", href: "/homme?category=homme-chaussures" },
          { name_fr: "Bottines en Cuir & Suède", name_ar: "أحذية كاحل راقية", href: "/homme?category=homme-chaussures" },
          { name_fr: "Sneakers Sartoriales", name_ar: "أحذية رياضية أنيقة", href: "/homme?category=homme-chaussures" },
        ],
      },
      {
        title_fr: "Accessoires & Cuir",
        title_ar: "الإكسسوارات والكماليات",
        iconName: "Watch",
        items: [
          { name_fr: "Ceintures en Cuir Pleine Fleur", name_ar: "أحزمة جلدية بإبزيم فاخر", href: "/homme?category=homme-accessoires" },
          { name_fr: "Portefeuilles & Porte-cartes", name_ar: "محافظ بطاقات وجلود", href: "/homme?category=homme-accessoires" },
          { name_fr: "Cravates & Pochettes en Soie", name_ar: "ربطات عنق حريرية", href: "/homme?category=homme-accessoires" },
          { name_fr: "Boutons de Manchette Or & Argent", name_ar: "أزرار أكمام مميزة", href: "/homme?category=homme-accessoires" },
          { name_fr: "Lunettes & Parfums Rares", name_ar: "نظارات شمسية وعطور", href: "/homme?category=homme-accessoires" },
        ],
      },
    ],
  },
  WOMEN: {
    universe: "WOMEN",
    title_fr: "Catalogue Femme",
    title_ar: "كتالوج النساء",
    tagline_fr: "Haute maroquinerie, soieries délicates & coupes féminines",
    tagline_ar: "حقائب جلدية راقية، حرير خالص وتصاميم أنثوية مميزة",
    viewAllHref: "/femme",
    featured: {
      title_fr: "La Grâce Féminine AVELOR",
      title_ar: "سحر ورقي المرأة",
      subtitle_fr: "Sacs trapèze en cuir grainé, robes en soie & escarpins d'art.",
      subtitle_ar: "حقائب ترابيز فاخرة، فساتين سهرة حريرية وأحذية راقية.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
      href: "/femme",
      badge_fr: "Coup de Cœur",
      badge_ar: "الأكثر طلباً",
    },
    categories: [
      {
        title_fr: "Vêtements & Prêt-à-Porter",
        title_ar: "الملابس والفساتين",
        iconName: "Sparkles",
        items: [
          { name_fr: "Robes de Soirée & Cocktail", name_ar: "فساتين سهرة وأعراس", href: "/femme?category=femme-robes", badge: "Iconique" },
          { name_fr: "Tailleurs & Blazers Couture", name_ar: "سترات وبدلات نسائية", href: "/femme?category=femme-blazers" },
          { name_fr: "Pantalons Fluides & Jupes", name_ar: "سراويل وتنانير أنيقة", href: "/femme?category=femme-blazers" },
          { name_fr: "Chemisiers & Tops en Soie", name_ar: "قمصان وتوبات حريرية", href: "/femme?category=femme-robes" },
          { name_fr: "Manteaux en Cachemire", name_ar: "معاطف كشمير راقية", href: "/femme?category=femme-blazers" },
        ],
      },
      {
        title_fr: "Sacs à Main & Maroquinerie",
        title_ar: "حقائب اليد والجلديات",
        iconName: "Briefcase",
        items: [
          { name_fr: "Sacs à Main en Cuir Grainé", name_ar: "حقائب يد من الجلد المحبب", href: "/femme?category=femme-sacs", badge: "Best-seller" },
          { name_fr: "Sacs Portés Épaule & Crossbody", name_ar: "حقائب كتف وكروس بودي", href: "/femme?category=femme-sacs" },
          { name_fr: "Cabas & Totes de Prestige", name_ar: "حقائب توت كبيرة وعملية", href: "/femme?category=femme-sacs" },
          { name_fr: "Pochettes & Clutches de Soirée", name_ar: "كلاتش وحقائب سهرة للمناسبات", href: "/femme?category=femme-sacs" },
          { name_fr: "Mini Sacs Bijoux", name_ar: "حقائب يد صغيرة فاخرة", href: "/femme?category=femme-sacs" },
        ],
      },
      {
        title_fr: "Chaussures Haute Couture",
        title_ar: "الأحذية النسائية",
        iconName: "Footprints",
        items: [
          { name_fr: "Escarpins & Talons Aiguilles", name_ar: "أحذية كعب عالي كلاسيكية", href: "/femme?category=femme-chaussures", badge: "Élégance" },
          { name_fr: "Sandales Festives & Soirée", name_ar: "صنادل سهرة وحفلات", href: "/femme?category=femme-chaussures" },
          { name_fr: "Mules & Mocassins Souples", name_ar: "موكاسان وميول جلدية مريحة", href: "/femme?category=femme-chaussures" },
          { name_fr: "Bottines en Cuir Précieux", name_ar: "أحذية كاحل راقية للشتاء", href: "/femme?category=femme-chaussures" },
          { name_fr: "Ballerines en Cuir d'Agneau", name_ar: "باليرينا ناعمة من جلد الحمل", href: "/femme?category=femme-chaussures" },
        ],
      },
      {
        title_fr: "Accessoires & Joaillerie",
        title_ar: "الإكسسوارات والمجوهرات",
        iconName: "Crown",
        items: [
          { name_fr: "Foulards & Carrés en Soie Pure", name_ar: "أوشحة حريرية نقية", href: "/femme?category=femme-sacs" },
          { name_fr: "Ceintures Délicates à Boucle Or", name_ar: "أحزمة جلدية بإبزيم ذهبي", href: "/femme?category=femme-sacs" },
          { name_fr: "Petite Maroquinerie & Portefeuilles", name_ar: "محافظ وحافظات بطاقات نسائية", href: "/femme?category=femme-sacs" },
          { name_fr: "Bijoux & Parures Minimalistes", name_ar: "مجوهرات وأقراط راقية", href: "/femme?category=femme-sacs" },
          { name_fr: "Lunettes de Soleil Couture", name_ar: "نظارات شمسية فاخرة", href: "/femme?category=femme-sacs" },
        ],
      },
    ],
  },
};

const UNIVERSES: Universe[] = ["MEN", "WOMEN"];

const ICONS: Record<IconName, LucideIcon> = {
  Shirt,
  Briefcase,
  Footprints,
  Watch,
  Sparkles,
  Crown,
  ShoppingBag,
};

/* -------------------------------------------------------------------------- */
/*                              SMALL COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function CatalogueIcon({ name }: { name: IconName }) {
  const Icon = ICONS[name] ?? ShoppingBag;
  return <Icon aria-hidden="true" className="h-4 w-4 text-neutral-800" strokeWidth={1.5} />;
}

function CountBadge({ count, max }: { count: number; max: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute inset-e-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-semibold leading-none text-white"
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}

const iconButton =
  "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black";

interface MobileAccordionProps {
  data: CatalogueData;
  label: string;
  isArabic: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

function MobileAccordion({ data, label, isArabic, expanded, onToggle, onNavigate }: MobileAccordionProps) {
  const panelId = `avelor-mobile-${data.universe.toLowerCase()}`;
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-900"
      >
        <span>{label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180 text-black" : "text-neutral-400"}`}
        />
      </button>

      {expanded && (
        <div id={panelId} className="space-y-5 pb-4 ps-2 pt-1">
          {data.categories.map((cat) => (
            <div key={cat.title_fr} className="space-y-2">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
                <CatalogueIcon name={cat.iconName} />
                <span>{isArabic ? cat.title_ar : cat.title_fr}</span>
              </p>
              <ul className="space-y-0.5 border-s border-neutral-200 ps-5 text-sm text-neutral-600">
                {cat.items.map((item) => (
                  <li key={item.name_fr}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="flex items-center justify-between py-2 transition-colors hover:text-black"
                    >
                      <span>{isArabic ? item.name_ar : item.name_fr}</span>
                      {item.badge && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Link
            href={data.viewAllHref}
            onClick={onNavigate}
            className="inline-flex items-center gap-2 pt-1 text-xs font-bold uppercase tracking-wider text-black underline underline-offset-4"
          >
            <span>
              {isArabic
                ? `استكشف كل تشكيلة ${data.universe === "MEN" ? "الرجال" : "النساء"}`
                : `Tout afficher pour ${data.universe === "MEN" ? "Homme" : "Femme"}`}
            </span>
            <ArrowIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HEADER                                   */
/* -------------------------------------------------------------------------- */

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCatalogue, setActiveCatalogue] = useState<Universe | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Universe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const activeCatData = activeCatalogue ? CATALOGUES[activeCatalogue] : null;

  const closeMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setActiveCatalogue(null);
    setMiniCartOpen(false);
    setSearchOpen(false);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeMenus();
    setSearchQuery("");
  };

  const toggleCatalogue = (universe: Universe) => {
    setActiveCatalogue((curr) => (curr === universe ? null : universe));
    setUserDropdownOpen(false);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
    setActiveCatalogue(null);
    setUserDropdownOpen(false);
  };

  const toggleLanguage = () => setLanguage(isArabic ? "fr" : "ar");

  // Fermer tous les menus à chaque changement de page
  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);

  // Échap pour fermer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenus]);

  // Header compact au scroll : écouteur optimisé avec hystérésis et rAF pour éviter toute vibration
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrolled((prev) => {
            if (!prev && y > 40) return true;
            if (prev && y < 15) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu compte au clic extérieur
  useEffect(() => {
    if (!userDropdownOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [userDropdownOpen]);

  // Bloquer le scroll de la page quand le menu mobile est ouvert
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  // Focus automatique sur la recherche compacte
  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus();
  }, [searchOpen]);

  const megaOpen = Boolean(activeCatData);
  const overlayVisible = megaOpen || userDropdownOpen;

  return (
    <>
      {/* Lien d'évitement — accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-s-2 focus:top-2 focus:z-100 focus:bg-black focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-white"
      >
        {isArabic ? "تخطى إلى المحتوى" : "Aller au contenu principal"}
      </a>

      {/* 1. Bandeau d'annonce — au sommet de la page, défile naturellement sans secousse */}
      <div dir={isArabic ? "rtl" : "ltr"} className="relative z-40 bg-black text-white">
        <div className="mx-auto flex max-w-360 items-center justify-center gap-2 px-3 py-2 text-center">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
          <p className="text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.17em]">
            {isArabic
              ? "توصيل مجاني ابتداءً من 500 درهم — الدفع عند الاستلام"
              : "Livraison offerte dès 500 MAD · Paiement à la livraison"}
          </p>
        </div>
      </div>

      <header dir={isArabic ? "rtl" : "ltr"} className="sticky top-0 z-50 text-black">
        {/* Voile de fermeture au clic extérieur (sous le header, au-dessus de la page) */}
        {overlayVisible && (
          <div
            onClick={closeMenus}
            aria-hidden="true"
            className="fixed inset-0 z-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
          />
        )}

        <div
          className={`relative z-10 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
            scrolled && !megaOpen
              ? "shadow-[0_2px_15px_rgba(0,0,0,0.06)] border-b border-neutral-200/60"
              : "border-b border-neutral-200/80"
          }`}
        >
          {/* 2. Barre principale : hauteur stable, zéro reflow ni secousse */}
          <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
            <div className="grid h-16 sm:h-20 grid-cols-[1fr_auto_1fr] items-center gap-2">
              {/* Navigation desktop */}
              <nav
                aria-label={isArabic ? "التنقل الرئيسي" : "Navigation principale"}
                className="hidden items-center gap-4 lg:flex xl:gap-7"
              >
                {UNIVERSES.map((universe) => {
                  const active = activeCatalogue === universe;
                  return (
                    <button
                      key={universe}
                      type="button"
                      onClick={() => toggleCatalogue(universe)}
                      aria-expanded={active}
                      aria-haspopup="true"
                      aria-controls="avelor-mega-catalogue"
                      className={`group flex items-center gap-1.5 border-b-2 py-2 text-[11px] uppercase tracking-[0.19em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ${active
                        ? "border-black font-semibold text-black"
                        : "border-transparent font-medium text-neutral-700 hover:text-black"
                        }`}
                    >
                      <span>{universe === "MEN" ? t.nav.men : t.nav.women}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-3 w-3 transition-transform duration-200 group-hover:text-black ${active ? "rotate-180 text-black" : "text-neutral-400"
                          }`}
                      />
                    </button>
                  );
                })}

                <Link
                  href="/homme?is_new=true"
                  onClick={closeMenus}
                  className="relative py-2 text-[11px] font-medium uppercase tracking-[0.19em] text-neutral-700 transition-colors duration-200 after:absolute after:bottom-0 after:inset-s-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 hover:text-black hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                >
                  {t.nav.new_in}
                </Link>
              </nav>

              {/* Burger mobile */}
              <div className="flex items-center lg:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen((open) => !open);
                    setSearchOpen(false);
                  }}
                  className={iconButton}
                  aria-label={
                    mobileMenuOpen
                      ? isArabic ? "إغلاق القائمة" : "Fermer le menu"
                      : isArabic ? "فتح القائمة" : "Ouvrir le menu"
                  }
                  aria-expanded={mobileMenuOpen}
                  aria-controls="avelor-mobile-menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <Menu className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Logo */}
              <Link
                href="/"
                onClick={closeMenus}
                aria-label="AVELOR — Accueil"
                className="group flex min-w-0 items-center justify-center justify-self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
              >
                <Image
                  src="/logo.png"
                  alt="AVELOR"
                  width={160}
                  height={118}
                  priority
                  sizes="(max-width: 640px) 120px, 160px"
                  className="h-9 w-auto max-w-30 object-contain transition-opacity duration-300 group-hover:opacity-75 sm:h-11 sm:max-w-38"
                />
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-0.5 justify-self-end sm:gap-2">
                {/* Recherche inline (XL+) */}
                <form onSubmit={handleSearch} role="search" className="relative hidden xl:block">
                  <label htmlFor="header-search" className="sr-only">
                    {t.nav.search_placeholder}
                  </label>
                  <input
                    id="header-search"
                    type="search"
                    placeholder={t.nav.search_placeholder}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-9 w-44 border-b border-neutral-300 bg-transparent pe-8 ps-1 text-xs outline-none transition-all duration-200 placeholder:text-neutral-400 focus:w-56 focus:border-black 2xl:w-52 2xl:focus:w-64"
                  />
                  <button
                    type="submit"
                    aria-label={isArabic ? "بحث" : "Rechercher"}
                    className="absolute inset-e-1 top-1/2 -translate-y-1/2 text-neutral-600 transition-colors hover:text-black"
                  >
                    <Search className="h-4 w-4" strokeWidth={1.6} />
                  </button>
                </form>

                {/* Bouton recherche (< XL) */}
                <button
                  type="button"
                  onClick={toggleSearch}
                  aria-expanded={searchOpen}
                  aria-controls="avelor-search-panel"
                  aria-label={isArabic ? "بحث" : "Rechercher"}
                  className={`${iconButton} xl:hidden`}
                >
                  <Search className="h-4.5 w-4.5" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-[10px] font-semibold tracking-wide text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black sm:px-3"
                  title="Changer de langue / تغيير اللغة"
                  aria-label={isArabic ? "Passer en français" : "التبديل إلى العربية"}
                  lang={isArabic ? "fr" : "ar"}
                >
                  <Globe aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                  <span>{isArabic ? "FR" : "عربي"}</span>
                </button>

                {/* Compte */}
                <div ref={userMenuRef} className="relative hidden sm:block">
                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen((open) => !open);
                          setActiveCatalogue(null);
                          setSearchOpen(false);
                        }}
                        aria-expanded={userDropdownOpen}
                        aria-haspopup="menu"
                        aria-label={isArabic ? "حسابي" : "Mon compte"}
                        className="inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      >
                        <UserRound aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.5} />
                        <ChevronDown
                          aria-hidden="true"
                          className={`h-3 w-3 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {userDropdownOpen && (
                        <div
                          role="menu"
                          className="absolute inset-e-0 top-full z-50 mt-3 w-60 border border-neutral-200 bg-white py-2 shadow-[0_14px_40px_rgba(0,0,0,0.10)] animate-in fade-in slide-in-from-top-1 duration-150"
                        >
                          <div className="border-b border-neutral-100 px-4 py-3">
                            <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                              {isArabic ? "مسجّل الدخول باسم" : "Connecté en tant que"}
                            </p>
                            <p className="mt-1 truncate text-xs font-medium text-neutral-900">
                              {user.first_name || user.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            role="menuitem"
                            onClick={closeMenus}
                            className="flex items-center gap-3 px-4 py-3 text-xs text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                          >
                            <UserRound aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                            {t.nav.account}
                          </Link>
                          <Link
                            href="/wishlist"
                            role="menuitem"
                            onClick={closeMenus}
                            className="flex items-center gap-3 px-4 py-3 text-xs text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                          >
                            <Heart aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                            {isArabic ? "قائمة الأمنيات" : "Mes favoris"}
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              role="menuitem"
                              onClick={closeMenus}
                              className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
                            >
                              <LayoutDashboard aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                              {t.nav.admin}
                            </Link>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              closeMenus();
                              logout();
                            }}
                            className="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-3 text-start text-xs text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black"
                          >
                            <LogOut aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                            {isArabic ? "تسجيل الخروج" : "Déconnexion"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={closeMenus}
                      title={t.nav.account}
                      aria-label={t.nav.account}
                      className={iconButton}
                    >
                      <UserRound aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </Link>
                  )}
                </div>

                {/* Favoris */}
                <Link
                  href="/wishlist"
                  onClick={closeMenus}
                  title={isArabic ? "قائمة الأمنيات" : "Mes favoris"}
                  aria-label={`${isArabic ? "قائمة الأمنيات" : "Mes favoris"}${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`}
                  className={`${iconButton} hidden sm:inline-flex`}
                >
                  <Heart aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.5} />
                  <CountBadge count={wishlistCount} max={9} />
                </Link>

                {/* Panier */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    setMiniCartOpen(true);
                  }}
                  title={t.nav.cart}
                  aria-label={`${t.nav.cart}${itemCount > 0 ? ` (${itemCount})` : ""}`}
                  aria-haspopup="dialog"
                  className={iconButton}
                >
                  <ShoppingBag aria-hidden="true" className="h-4.75 w-4.75" strokeWidth={1.5} />
                  <CountBadge count={itemCount} max={99} />
                </button>
              </div>
            </div>
          </div>

          {/* Panneau de recherche compact (< XL) */}
          {searchOpen && (
            <div
              id="avelor-search-panel"
              className="border-t border-neutral-100 bg-white px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-150 sm:px-6 lg:px-10 xl:hidden"
            >
              <form onSubmit={handleSearch} role="search" className="relative mx-auto max-w-2xl">
                <label htmlFor="compact-header-search" className="sr-only">
                  {t.nav.search_placeholder}
                </label>
                <input
                  ref={mobileSearchRef}
                  id="compact-header-search"
                  type="search"
                  placeholder={t.nav.search_placeholder}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 w-full border border-neutral-200 bg-neutral-50 px-4 pe-11 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                />
                <button
                  type="submit"
                  aria-label={isArabic ? "بحث" : "Rechercher"}
                  className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black"
                >
                  <Search className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 3. Méga-menu catalogue (desktop) — ancré sous le header */}
        {activeCatData && (
          <div
            id="avelor-mega-catalogue"
            className="absolute inset-x-0 top-full z-10 hidden border-b border-neutral-200 bg-white shadow-[0_24px_50px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 lg:block"
          >
            <div className="mx-auto max-w-360 px-6 py-8 lg:px-10">
              {/* En-tête */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-black" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-black">
                      {isArabic ? activeCatData.title_ar : activeCatData.title_fr}
                    </h2>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {isArabic ? activeCatData.tagline_ar : activeCatData.tagline_fr}
                  </p>
                </div>

                <Link
                  href={activeCatData.viewAllHref}
                  onClick={closeMenus}
                  className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:text-neutral-600"
                >
                  <span>
                    {isArabic
                      ? `استكشف كامل تشكيلة ${activeCatData.universe === "MEN" ? "الرجال" : "النساء"}`
                      : `Voir toute la collection ${activeCatData.universe === "MEN" ? "Homme" : "Femme"}`}
                  </span>
                  <ArrowIcon
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
                      }`}
                  />
                </Link>
              </div>

              {/* Grille : 4 catégories + 1 carte vedette */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                {activeCatData.categories.map((cat) => (
                  <div key={cat.title_fr} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                      <CatalogueIcon name={cat.iconName} />
                      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-black">
                        {isArabic ? cat.title_ar : cat.title_fr}
                      </h3>
                    </div>

                    <ul className="space-y-2.5">
                      {cat.items.map((item) => (
                        <li key={item.name_fr}>
                          <Link
                            href={item.href}
                            onClick={closeMenus}
                            className="group flex items-center justify-between gap-2 text-xs text-neutral-600 transition-colors duration-150 hover:text-black"
                          >
                            <span className="py-0.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                              {isArabic ? item.name_ar : item.name_fr}
                            </span>
                            {item.badge && (
                              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-800 transition-colors group-hover:bg-black group-hover:text-white">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Carte vedette — entièrement cliquable */}
                <Link
                  href={activeCatData.featured.href}
                  onClick={closeMenus}
                  className="group relative flex min-h-65 flex-col justify-end overflow-hidden border border-neutral-200 bg-neutral-900 p-5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  <Image
                    src={activeCatData.featured.image}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <span className="inline-block bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black">
                      {isArabic ? activeCatData.featured.badge_ar : activeCatData.featured.badge_fr}
                    </span>
                    <h3 className="font-serif text-sm font-bold leading-tight">
                      {isArabic ? activeCatData.featured.title_ar : activeCatData.featured.title_fr}
                    </h3>
                    <p className="line-clamp-2 text-[11px] text-neutral-300">
                      {isArabic ? activeCatData.featured.subtitle_ar : activeCatData.featured.subtitle_fr}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider underline underline-offset-4 transition-colors group-hover:text-neutral-300">
                      <span>{isArabic ? "استكشف التشكيلة" : "Explorer"}</span>
                      <ArrowIcon aria-hidden="true" className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </div>

              {/* Réassurance */}
              <ul className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-5 text-[10px] text-neutral-600 sm:grid-cols-4 sm:text-[11px]">
                <li className="flex items-center gap-2">
                  <Truck aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{isArabic ? "توصيل مجاني ابتداءً من 500 درهم" : "Livraison offerte dès 500 MAD"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{isArabic ? "الدفع نقداً عند الاستلام (COD)" : "Paiement en espèces à la livraison"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{isArabic ? "إرجاع واستبدال مجاني خلال 14 يوماً" : "Échanges et retours sous 14 jours"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{isArabic ? "خدمة زبائن مميزة 7 أيام/7" : "Conciergerie privée 7j/7"}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 4. Menu mobile (drawer accordéon) */}
        {mobileMenuOpen && (
          <div
            id="avelor-mobile-menu"
            className="relative z-10 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-neutral-200 bg-white px-4 pb-8 pt-4 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 lg:hidden"
          >
            <form onSubmit={handleSearch} role="search" className="relative mb-4">
              <label htmlFor="mobile-header-search" className="sr-only">
                {t.nav.search_placeholder}
              </label>
              <input
                id="mobile-header-search"
                type="search"
                placeholder={t.nav.search_placeholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 w-full border border-neutral-200 bg-neutral-50 px-4 pe-10 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
              />
              <button
                type="submit"
                aria-label={isArabic ? "بحث" : "Rechercher"}
                className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-neutral-600"
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </form>

            <nav
              aria-label={isArabic ? "التنقل على الجوال" : "Navigation mobile"}
              className="flex flex-col divide-y divide-neutral-100"
            >
              {UNIVERSES.map((universe) => (
                <MobileAccordion
                  key={universe}
                  data={CATALOGUES[universe]}
                  label={universe === "MEN" ? t.nav.men : t.nav.women}
                  isArabic={isArabic}
                  expanded={mobileExpanded === universe}
                  onToggle={() => setMobileExpanded((curr) => (curr === universe ? null : universe))}
                  onNavigate={closeMenus}
                />
              ))}

              <Link
                href="/homme?is_new=true"
                onClick={closeMenus}
                className="block py-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
              >
                {t.nav.new_in}
              </Link>

              <Link
                href="/wishlist"
                onClick={closeMenus}
                className="flex items-center justify-between py-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
              >
                <span>{isArabic ? "قائمة الأمنيات" : "Mes favoris"}</span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={user ? "/account" : "/login"}
                onClick={closeMenus}
                className="block py-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700"
              >
                {t.nav.account}
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenus}
                  className="block py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-900"
                >
                  {t.nav.admin}
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    logout();
                  }}
                  className="block w-full py-4 text-start text-xs font-medium uppercase tracking-[0.18em] text-neutral-500"
                >
                  {isArabic ? "تسجيل الخروج" : "Déconnexion"}
                </button>
              )}
            </nav>

            <p className="mt-8 text-center text-[9px] uppercase tracking-[0.24em] text-neutral-400">
              AVELOR · {isArabic ? "أناقة بلا حدود · دار الأزياء الفاخرة" : "L’élégance sans frontières · Maison de Haute Couture"}
            </p>
          </div>
        )}
      </header>

      {/* Mini-panier */}
      <MiniCart open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
}