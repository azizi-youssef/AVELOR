"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUp,
  Check,
  Loader2,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const CONTACT = {
  email: "aziziyoussef207@gmail.com",
  whatsapp: "https://wa.me/212522000000",
  city_fr: "Nador, Maroc",
  city_ar: "الناظور، المغرب",
};

type Social = { name: string; href: string; icon: React.ReactNode };

const SOCIALS: Social[] = [
  {
    name: "Instagram",
    href: "https://instagram.com/avelor.ma",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/avelor.ma",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@avelor.ma",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.19 8.19 0 004.79 1.53V6.92a4.85 4.85 0 01-1.02-.23z" />
      </svg>
    ),
  },
];

interface FooterLink {
  label_fr: string;
  label_ar: string;
  href?: string; // sans href → affiché comme "bientôt disponible"
  external?: boolean;
}

const UNIVERSE_LINKS: FooterLink[] = [
  { label_fr: "Costumes & Blazers", label_ar: "البدلات والسترات", href: "/homme?category=homme-costumes" },
  { label_fr: "Chaussures Homme", label_ar: "أحذية الرجال", href: "/homme?category=homme-chaussures" },
  { label_fr: "Robes & Soie", label_ar: "الفساتين والحرير", href: "/femme?category=femme-robes" },
  { label_fr: "Sacs Femme", label_ar: "حقائب النساء", href: "/femme?category=femme-sacs" },
  { label_fr: "Nouveautés", label_ar: "وصل حديثاً", href: "/homme?is_new=true" },
  { label_fr: "Mes Favoris", label_ar: "قائمة الأمنيات", href: "/wishlist" },
];

interface PillarProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/* -------------------------------------------------------------------------- */
/*                              SMALL COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function Pillar({ icon: Icon, title, desc }: PillarProps) {
  return (
    <div className="flex flex-col items-center space-y-1 text-center sm:items-start sm:text-start">
      <Icon className="h-5 w-5 text-neutral-300" strokeWidth={1.5} aria-hidden="true" />
      <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-100">{title}</h4>
      <p className="text-[11px] sm:text-xs leading-relaxed text-neutral-400">{desc}</p>
    </div>
  );
}

const linkClass =
  "inline-block py-0.5 text-neutral-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4";

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-300">{children}</h5>;
}

type NewsletterStatus = "idle" | "loading" | "success" | "error";

function Newsletter({
  isArabic,
  onSubscribe,
}: {
  isArabic: boolean;
  onSubscribe?: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || status === "loading") return;

    setStatus("loading");
    try {
      if (onSubscribe) await onSubscribe(value);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2.5">
      <ColumnTitle>{isArabic ? "النشرة الخاصة" : "Newsletter Privilège"}</ColumnTitle>
      <p className="text-xs leading-relaxed text-neutral-400">
        {isArabic
          ? "توصلوا حصرياً بأحدث التشكيلات والدعوات الخاصة."
          : "Recevez en avant-première nos invitations privées et nouvelles collections."}
      </p>

      {status === "success" ? (
        <p
          role="status"
          className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200"
        >
          <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-white" />
          {isArabic ? "شكراً، تم تسجيل اشتراكك." : "Merci, votre inscription est confirmée."}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex"
          aria-label={isArabic ? "النشرة الإخبارية" : "Inscription à la newsletter"}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            {isArabic ? "بريدك الإلكتروني" : "Votre email"}
          </label>
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={isArabic ? "بريدك الإلكتروني" : "Votre email"}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? "newsletter-error" : undefined}
            className="min-w-0 flex-1 border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 transition-colors focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex shrink-0 items-center justify-center whitespace-nowrap bg-white px-3.5 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-70"
          >
            {status === "loading" ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : isArabic ? (
              "اشتراك"
            ) : (
              "S'abonner"
            )}
          </button>
        </form>
      )}

      {status === "error" && (
        <p id="newsletter-error" role="alert" className="text-xs text-red-400">
          {isArabic ? "تعذّر التسجيل، حاول مرة أخرى." : "Inscription impossible, veuillez réessayer."}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */

interface FooterProps {
  /** Branchez ici votre appel API newsletter (ex. POST /api/newsletter). */
  onSubscribe?: (email: string) => Promise<void>;
}

export function Footer({ onSubscribe }: FooterProps = {}) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const [logoFailed, setLogoFailed] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer dir={isArabic ? "rtl" : "ltr"} className="border-t border-neutral-800 bg-neutral-950 text-white">
      {/* Piliers */}
      <div className="border-b border-neutral-800 py-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4 md:gap-8">
            <Pillar icon={Truck} title={t.sections.free_shipping} desc={t.sections.free_shipping_desc} />
            <Pillar icon={ShieldCheck} title={t.sections.cash_on_delivery} desc={t.sections.cash_on_delivery_desc} />
            <Pillar icon={BadgeCheck} title={t.sections.authentic} desc={t.sections.authentic_desc} />
            <Pillar icon={Clock} title={t.sections.support} desc={t.sections.support_desc} />
          </div>
        </div>
      </div>

      {/* Liens + newsletter */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr] lg:gap-8">
          {/* Marque */}
          <div className="space-y-3.5">
            <Link
              href="/"
              aria-label="AVELOR — Accueil"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950"
            >
              {logoFailed ? (
                <span className="font-serif text-xl font-bold tracking-[0.3em]">AVELOR</span>
              ) : (
                <Image
                  src="/logo-white.png"
                  alt="AVELOR Luxury Fashion"
                  width={240}
                  height={150}
                  priority
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 190px, 220px"
                  className="h-12 w-auto max-w-none object-contain transition-opacity duration-300 group-hover:opacity-75 sm:h-14 lg:h-16"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-neutral-400">{t.footer.about_text}</p>

            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                <span>{isArabic ? CONTACT.city_ar : CONTACT.city_fr}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                <a href={`mailto:${CONTACT.email}`} className="break-all transition-colors hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  WhatsApp
                  <span className="sr-only">{isArabic ? " (يفتح في نافذة جديدة)" : " (nouvel onglet)"}</span>
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-2.5 pt-1">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`AVELOR — ${s.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-colors hover:border-white hover:text-white focus-visible:border-white focus-visible:text-white focus-visible:outline-none"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Univers */}
          <nav aria-label={t.footer.universes} className="space-y-2.5">
            <ColumnTitle>{t.footer.universes}</ColumnTitle>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/homme" className={linkClass}>
                  {t.nav.men}
                </Link>
              </li>
              <li>
                <Link href="/femme" className={linkClass}>
                  {t.nav.women}
                </Link>
              </li>
              {UNIVERSE_LINKS.map((l) => (
                <li key={l.label_fr}>
                  <Link href={l.href!} className={linkClass}>
                    {isArabic ? l.label_ar : l.label_fr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Service client */}
          <nav aria-label={t.footer.customer_service} className="space-y-2.5">
            <ColumnTitle>{t.footer.customer_service}</ColumnTitle>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/account" className={linkClass}>
                  {t.nav.account}
                </Link>
              </li>
              <li>
                <Link href="/cart" className={linkClass}>
                  {t.nav.cart}
                </Link>
              </li>
              <li>
                <Link href="/track" className={linkClass}>
                  {isArabic ? "تتبع طلبيتي" : "Suivre ma commande"}
                </Link>
              </li>
              <li>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
              </li>
              {/* Pages légales : ajoutez href dès que les routes existent */}
              <li>
                <span aria-disabled="true" className="inline-block cursor-default py-0.5 text-neutral-600">
                  {isArabic ? "سياسة الشحن والإرجاع" : t.footer.shipping_policy}
                </span>
              </li>
              <li>
                <span aria-disabled="true" className="inline-block cursor-default py-0.5 text-neutral-600">
                  {isArabic ? "الشروط والأحكام العامة" : t.footer.terms}
                </span>
              </li>
            </ul>
          </nav>

          {/* Newsletter */}
          <Newsletter isArabic={isArabic} onSubscribe={onSubscribe} />
        </div>

        {/* Bas de page */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-5 text-xs text-neutral-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {t.footer.rights}
          </p>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              {isArabic ? "الدفع عند الاستلام" : "Paiement à la livraison"}
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 border border-neutral-700 px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-neutral-300 transition-colors hover:border-white hover:text-white focus-visible:border-white focus-visible:outline-none"
            >
              <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
              {isArabic ? "إلى الأعلى" : "Haut de page"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}