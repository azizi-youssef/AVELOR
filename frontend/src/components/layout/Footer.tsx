"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Truck, RotateCcw, Clock } from "lucide-react";

export function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800">
      {/* 4 Piliers d'excellence AVELOR */}
      <div className="border-b border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start space-y-2">
              <Truck className="w-6 h-6 text-neutral-300 stroke-[1.5]" />
              <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">
                {t.sections.free_shipping}
              </h4>
              <p className="text-xs text-neutral-400">
                {t.sections.free_shipping_desc}
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-start space-y-2">
              <ShieldCheck className="w-6 h-6 text-neutral-300 stroke-[1.5]" />
              <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">
                {t.sections.cash_on_delivery}
              </h4>
              <p className="text-xs text-neutral-400">
                {t.sections.cash_on_delivery_desc}
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-start space-y-2">
              <RotateCcw className="w-6 h-6 text-neutral-300 stroke-[1.5]" />
              <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">
                {t.sections.authentic}
              </h4>
              <p className="text-xs text-neutral-400">
                {t.sections.authentic_desc}
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-start space-y-2">
              <Clock className="w-6 h-6 text-neutral-300 stroke-[1.5]" />
              <h4 className="text-sm font-semibold tracking-wider uppercase text-neutral-100">
                {t.sections.support}
              </h4>
              <p className="text-xs text-neutral-400">
                {t.sections.support_desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liens de navigation et informations légales */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo et présentation */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-white.png"
                alt="AVELOR Luxury Fashion"
                width={170}
                height={125}
                className="object-contain h-14 sm:h-16 w-auto -ml-2"
              />
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {t.footer.about_text}
            </p>
            <div className="text-xs text-neutral-400 pt-2">
              <p>Casablanca &bull; Rabat &bull; Marrakech</p>
              <p className="text-neutral-500 mt-1">contact@avelor.ma &bull; +212 5 22 00 00 00</p>
            </div>
          </div>

          {/* Univers */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold tracking-widest uppercase text-neutral-300">
              {t.footer.universes}
            </h5>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/homme" className="hover:text-white transition-colors">
                  {t.nav.men}
                </Link>
              </li>
              <li>
                <Link href="/femme" className="hover:text-white transition-colors">
                  {t.nav.women}
                </Link>
              </li>
              <li>
                <Link href="/homme?category=costumes" className="hover:text-white transition-colors">
                  Costumes & Blazers
                </Link>
              </li>
              <li>
                <Link href="/femme?category=robes" className="hover:text-white transition-colors">
                  Robes & Soie
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Client */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold tracking-widest uppercase text-neutral-300">
              {t.footer.customer_service}
            </h5>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  {t.nav.account}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  {t.nav.cart}
                </Link>
              </li>
              <li>
                <span className="text-neutral-500">{t.footer.shipping_policy}</span>
              </li>
              <li>
                <span className="text-neutral-500">{t.footer.terms}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold tracking-widest uppercase text-neutral-300">
              Newsletter Privilège
            </h5>
            <p className="text-xs text-neutral-400">
              {language === "fr"
                ? "Recevez en avant-première nos invitations privées et nouvelles collections."
                : "توصلوا حصرياً بأحدث التشكيلات والدعوات الخاصة."}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 w-full focus:outline-none focus:border-white"
              />
              <button className="bg-white text-black px-4 text-xs uppercase tracking-wider font-semibold hover:bg-neutral-200 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
