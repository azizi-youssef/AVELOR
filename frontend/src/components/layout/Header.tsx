"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag, UserRound, Search, Globe, Menu, X, ShieldCheck,
  ChevronDown, LogOut, LayoutDashboard,
} from "lucide-react";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isArabic = language === "ar";
  const navLinkClass =
    "relative py-2 text-[11px] font-medium uppercase tracking-[0.19em] text-neutral-700 transition-colors duration-200 hover:text-black after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full";

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
    setSearchQuery("");
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const toggleLanguage = () => setLanguage(isArabic ? "fr" : "ar");

  return (
    <header dir={isArabic ? "rtl" : "ltr"} className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white text-black">
      <div className="bg-black px-3 py-2 text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 text-center">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
          <p className="text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.17em]">
            {isArabic
              ? "توصيل مجاني ابتداءً من 500 درهم — الدفع عند الاستلام"
              : "Livraison offerte dès 500 MAD · Paiement à la livraison"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-2 sm:h-[88px]">
          <nav aria-label={isArabic ? "التنقل الرئيسي" : "Navigation principale"} className="hidden items-center gap-5 lg:flex xl:gap-8">
            <Link href="/homme" className={navLinkClass} onClick={closeMenus}>{t.nav.men}</Link>
            <Link href="/femme" className={navLinkClass} onClick={closeMenus}>{t.nav.women}</Link>
            <Link href="/homme?is_new=true" className={navLinkClass} onClick={closeMenus}>{t.nav.new_in}</Link>
          </nav>

          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="avelor-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>

          <Link href="/" onClick={closeMenus} aria-label="AVELOR — Accueil" className="group flex min-w-0 items-center justify-center justify-self-center">
            <Image
              src="/logo.png"
              alt="AVELOR"
              width={160}
              height={118}
              priority
              sizes="(max-width: 640px) 120px, 160px"
              className="h-10 w-auto max-w-[132px] object-contain transition-opacity duration-200 group-hover:opacity-75 sm:h-12 sm:max-w-[160px]"
            />
          </Link>

          <div className="flex items-center justify-self-end gap-1 sm:gap-3">
            <form onSubmit={handleSearch} role="search" className="relative hidden xl:block">
              <label htmlFor="header-search" className="sr-only">{t.nav.search_placeholder}</label>
              <input
                id="header-search"
                type="search"
                placeholder={t.nav.search_placeholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 w-44 border-b border-neutral-300 bg-transparent pe-8 ps-1 text-xs outline-none transition-colors placeholder:text-neutral-400 focus:border-black 2xl:w-52"
              />
              <button type="submit" aria-label={isArabic ? "بحث" : "Rechercher"} className={`absolute top-1/2 -translate-y-1/2 text-neutral-600 transition-colors hover:text-black ${isArabic ? "left-1" : "right-1"}`}>
                <Search className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </form>

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-[10px] font-semibold tracking-wide text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black sm:px-3"
              title="Changer de langue / تغيير اللغة"
              aria-label={isArabic ? "Switch to French" : "Passer en arabe"}
            >
              <Globe className="h-4 w-4" strokeWidth={1.5} />
              <span>{isArabic ? "FR" : "عربي"}</span>
            </button>

            <div className="relative hidden sm:block">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((open) => !open)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="menu"
                    className="inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
                    aria-label={isArabic ? "حسابي" : "Mon compte"}
                  >
                    <UserRound className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {userDropdownOpen && (
                    <div role="menu" className={`absolute top-full z-50 mt-3 w-56 border border-neutral-200 bg-white py-2 shadow-[0_14px_40px_rgba(0,0,0,0.10)] ${isArabic ? "left-0" : "right-0"}`}>
                      <div className="border-b border-neutral-100 px-4 py-3">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-400">Connecté en tant que</p>
                        <p className="mt-1 truncate text-xs font-medium text-neutral-900">{user.first_name || user.email}</p>
                      </div>
                      <Link href="/account" role="menuitem" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-xs text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black">
                        <UserRound className="h-4 w-4" strokeWidth={1.5} />{t.nav.account}
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" role="menuitem" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-50">
                          <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />{t.nav.admin}
                        </Link>
                      )}
                      <button type="button" role="menuitem" onClick={() => { closeMenus(); logout(); }} className="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-3 text-start text-xs text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black">
                        <LogOut className="h-4 w-4" strokeWidth={1.5} />{isArabic ? "تسجيل الخروج" : "Déconnexion"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" onClick={closeMenus} title={t.nav.account} aria-label={t.nav.account} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black">
                  <UserRound className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </Link>
              )}
            </div>

            <Link href="/cart" onClick={closeMenus} title={t.nav.cart} aria-label={`${t.nav.cart}${itemCount > 0 ? ` (${itemCount})` : ""}`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-100">
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.5} />
              {itemCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-semibold leading-none text-white">{itemCount > 99 ? "99+" : itemCount}</span>}
            </Link>
          </div>
        </div>

        <div className="hidden h-10 items-center justify-center border-t border-neutral-100 lg:flex">
          <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-neutral-400">
            {isArabic ? "أناقة بلا حدود" : "L’élégance sans frontières"}
          </p>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="avelor-mobile-menu" className="border-t border-neutral-200 bg-white px-4 pb-6 pt-4 shadow-lg lg:hidden">
          <form onSubmit={handleSearch} role="search" className="relative mb-5">
            <label htmlFor="mobile-header-search" className="sr-only">{t.nav.search_placeholder}</label>
            <input
              id="mobile-header-search"
              type="search"
              placeholder={t.nav.search_placeholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full border border-neutral-200 bg-neutral-50 px-4 pe-10 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
            />
            <button type="submit" aria-label={isArabic ? "بحث" : "Rechercher"} className={`absolute top-1/2 -translate-y-1/2 text-neutral-600 ${isArabic ? "left-3" : "right-3"}`}>
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </form>

          <nav aria-label={isArabic ? "التنقل الرئيسي" : "Navigation mobile"} className="flex flex-col">
            <Link href="/homme" onClick={closeMenus} className="border-b border-neutral-100 py-4 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:text-neutral-500">{t.nav.men}</Link>
            <Link href="/femme" onClick={closeMenus} className="border-b border-neutral-100 py-4 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:text-neutral-500">{t.nav.women}</Link>
            <Link href="/homme?is_new=true" onClick={closeMenus} className="border-b border-neutral-100 py-4 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:text-neutral-500">{t.nav.new_in}</Link>
            <Link href={user ? "/account" : "/login"} onClick={closeMenus} className="border-b border-neutral-100 py-4 text-xs font-medium uppercase tracking-[0.18em]">{t.nav.account}</Link>
            {isAdmin && <Link href="/admin" onClick={closeMenus} className="border-b border-neutral-100 py-4 text-xs font-semibold uppercase tracking-[0.18em]">{t.nav.admin}</Link>}
            {user && <button type="button" onClick={() => { closeMenus(); logout(); }} className="py-4 text-start text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">{isArabic ? "تسجيل الخروج" : "Déconnexion"}</button>}
          </nav>

          <p className="mt-5 text-center text-[9px] uppercase tracking-[0.24em] text-neutral-400">
            AVELOR · {isArabic ? "أناقة بلا حدود" : "L’élégance sans frontières"}
          </p>
        </div>
      )}
    </header>
  );
}
