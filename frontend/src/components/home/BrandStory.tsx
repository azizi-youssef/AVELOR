"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, Scissors, Compass, Award, ArrowRight, ArrowLeft } from "lucide-react";

export function BrandStory() {
  const { language, direction } = useLanguage();
  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-[#161513] text-[#FAF8F5] py-24 sm:py-32" dir={direction}>
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#C5A059]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-[#C5A059]/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Images Grid (Asymmetric Luxury Collage) */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-4/5 w-full max-w-md mx-auto lg:max-w-none overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop"
                alt="Atelier de haute confection AVELOR"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />

              {/* Floating Badge */}
              <div className="absolute bottom-6 inset-s-6 bg-[#C5A059]/20 border border-[#C5A059]/40 backdrop-blur-md px-4 py-3 max-w-55">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#E7D3A4] font-semibold">
                  {isArabic ? "صناعة متقنة" : "Sartorial Craft"}
                </p>
                <p className="text-xs font-serif italic text-white/90 mt-1">
                  {isArabic ? "أقمشة إيطالية وحرفية مغربية ملكية" : "Étoffes nobles & précision d’artisanat d'exception."}
                </p>
              </div>
            </div>

            {/* Overlapping secondary photo */}
            <div className="hidden sm:block absolute -bottom-10 -right-6 lg:-right-10 w-48 h-60 overflow-hidden border-2 border-[#161513] shadow-2xl bg-neutral-800">
              <Image
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop"
                alt="Détail de tissu précieux"
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C5A059]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isArabic ? "دار الأزياء والقصة" : "Notre Histoire • Maison AVELOR"}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight leading-[1.15] text-white">
                {isArabic ? (
                  <>
                    فن الخياطة الرفيعة <br />
                    <span className="italic font-normal text-[#E7D3A4]">بأصالة مغربية وأفق عالمي</span>
                  </>
                ) : (
                  <>
                    L&apos;Élégance Intemporelle, <br />
                    <span className="italic font-normal text-[#E7D3A4]">façonnée avec noblesse</span>
                  </>
                )}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              {isArabic
                ? "ولدت دار أفيولور AVELOR من شغف عارم بالملابس الفاخرة التي تدوم لأجيال. نمزج بين دقة الخياطة الإيطالية الكلاسيكية وعراقة الذوق المغربي الرفيع، لنبتكر قطعاً تمنح حضوراً واثقاً لا تشوبه شائبة."
                : "Fondée sur l'exigence du beau et la pérennité du vêtement, la Maison AVELOR sublime l'allure contemporaine. Chaque pièce est le fruit d'une rencontre entre les draps de laine des plus prestigieuses filatures italiennes, la pure soie naturelle et le savoir-faire méticuleux de maîtres artisans."}
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <Scissors className="w-5 h-5 text-[#C5A059] stroke-[1.4]" />
                <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
                  {isArabic ? "تفصيل دقيق" : "Coupe Sartoriale"}
                </h4>
                <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                  {isArabic ? "قصات مريحة تبرز القوام بكل فخامة" : "Lignes impeccables qui subliment naturellement la silhouette."}
                </p>
              </div>

              <div className="space-y-2">
                <Award className="w-5 h-5 text-[#C5A059] stroke-[1.4]" />
                <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
                  {isArabic ? "خامات نادرة" : "Matières Nobles"}
                </h4>
                <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                  {isArabic ? "صوف سوبر 150، كشمير وحرير نقي" : "Laine mérinos Super 150s, cachemire et cuirs pleine fleur."}
                </p>
              </div>

              <div className="space-y-2">
                <Compass className="w-5 h-5 text-[#C5A059] stroke-[1.4]" />
                <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
                  {isArabic ? "إصدارات محدودة" : "Éditions Rares"}
                </h4>
                <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                  {isArabic ? "قطع حصرية مصممة لفرادة تميزك" : "Séries limitées garantissant exclusivité et distinction."}
                </p>
              </div>
            </div>

            {/* Signature & Link */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center font-serif text-lg text-[#E7D3A4]">
                  AV
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-medium text-white">Atelier AVELOR</p>
                  <p className="text-[10px] text-neutral-400">Casablanca • Tanger • Milan</p>
                </div>
              </div>

              <Link
                href="/homme"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#E7D3A4] hover:text-white transition-colors group"
              >
                <span>{isArabic ? "اكتشفوا فلسفتنا وإبداعاتنا" : "Explorer notre univers"}</span>
                <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
