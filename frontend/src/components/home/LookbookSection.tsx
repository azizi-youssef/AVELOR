"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, ArrowLeft, Eye, Sparkles } from "lucide-react";

interface LookItem {
  id: string;
  title_fr: string;
  title_ar: string;
  subtitle_fr: string;
  subtitle_ar: string;
  image: string;
  universe: "MEN" | "WOMEN";
  link: string;
  tag_fr: string;
  tag_ar: string;
}

const LOOKS: LookItem[] = [
  {
    id: "look-1",
    title_fr: "L'Allure Atlantique",
    title_ar: "أناقة الأطلسي",
    subtitle_fr: "Costume croisé en laine Super 150s & chemise popeline d'Égypte.",
    subtitle_ar: "بدلة مزدوجة الأزرار من صوف سوبر 150 مع قميص بوبلين فاخر.",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop",
    universe: "MEN",
    link: "/homme",
    tag_fr: "Collection Homme • Look 01",
    tag_ar: "تشكيلة الرجال • إطلالة 01",
  },
  {
    id: "look-2",
    title_fr: "Soirée à la Mamounia",
    title_ar: "أمسية المأمونية",
    subtitle_fr: "Robe fluide en pure soie vert émeraude & finitions brodées main.",
    subtitle_ar: "فستان حريري انسيابي باللون الزمردي بتطريزات يدوية راقية.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    universe: "WOMEN",
    link: "/femme",
    tag_fr: "Collection Femme • Look 02",
    tag_ar: "تشكيلة النساء • إطلالة 02",
  },
  {
    id: "look-3",
    title_fr: "Sartorial Minimaliste",
    title_ar: "الكلاسيكية العصرية",
    subtitle_fr: "Manteau droit en cachemire double-face camel & pull mérinos.",
    subtitle_ar: "معطف كشمير بلون الكاميل الأنيق وكنزة صوف ميرينوس ناعمة.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop",
    universe: "WOMEN",
    link: "/femme",
    tag_fr: "Collection Femme • Look 03",
    tag_ar: "تشكيلة النساء • إطلالة 03",
  },
  {
    id: "look-4",
    title_fr: "L'Élégance Riviera",
    title_ar: "أناقة الريفيرا",
    subtitle_fr: "Veste déstructurée en lin et soie ivoire & pantalon ajusté.",
    subtitle_ar: "سترة خفيفة من الكتان والحرير العاجي مع سروال مفصل.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
    universe: "MEN",
    link: "/homme",
    tag_fr: "Collection Homme • Look 04",
    tag_ar: "تشكيلة الرجال • إطلالة 04",
  },
];

export function LookbookSection() {
  const { language, direction } = useLanguage();
  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<"ALL" | "MEN" | "WOMEN">("ALL");

  const filteredLooks = activeTab === "ALL"
    ? LOOKS
    : LOOKS.filter((l) => l.universe === activeTab);

  return (
    <section className="py-24 sm:py-32 bg-[#F6F4EE] border-y border-[#E8E4DA]" dir={direction}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
        {/* Header with filter tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9C8053] font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isArabic ? "كتيب الإطلالات والإلهام" : "Éditorial & Lookbook de Saison"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-neutral-900 tracking-tight">
              {isArabic ? "سحر التنسيق والأناقة الملكية" : "L'Allure AVELOR en Mouvement"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-lg font-light leading-relaxed">
              {isArabic
                ? "إطلالات متكاملة مدروسة بعناية لتمنحك تميزاً وسحراً استثنائياً في جميع المناسبات."
                : "Des silhouettes complètes immortalisées pour inspirer votre vestiaire de saison."}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex items-center p-1 bg-white border border-[#DDD7C8] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold transition-all ${
                activeTab === "ALL" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              {isArabic ? "الكل" : "Tous les looks"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("MEN")}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold transition-all ${
                activeTab === "MEN" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              {isArabic ? "رجال" : "Hommes"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WOMEN")}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold transition-all ${
                activeTab === "WOMEN" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              {isArabic ? "نساء" : "Femmes"}
            </button>
          </div>
        </div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLooks.map((look) => (
            <article
              key={look.id}
              className="group relative flex flex-col bg-white overflow-hidden border border-[#E8E4DA] shadow-xs hover:shadow-xl transition-all duration-500"
            >
              <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-200">
                <Image
                  src={look.image}
                  alt={isArabic ? look.title_ar : look.title_fr}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <span className="absolute top-3 inset-s-3 text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 bg-black/40 backdrop-blur-md text-[#E7D3A4] border border-[#E7D3A4]/30">
                  {isArabic ? look.tag_ar : look.tag_fr}
                </span>

                <div className="absolute bottom-4 inset-x-4 text-white space-y-1.5">
                  <h3 className="font-serif text-lg sm:text-xl font-light text-white leading-snug">
                    {isArabic ? look.title_ar : look.title_fr}
                  </h3>
                  <p className="text-[11px] text-white/75 font-light line-clamp-2 leading-relaxed">
                    {isArabic ? look.subtitle_ar : look.subtitle_fr}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-[#E8E4DA] flex items-center justify-between">
                <Link
                  href={look.link}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-900 group-hover:text-[#9C8053] transition-colors"
                >
                  <span>{isArabic ? "اكتشف الإطلالة" : "Découvrir le look"}</span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
