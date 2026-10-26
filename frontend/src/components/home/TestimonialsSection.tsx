"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Star, CheckCircle, Quote } from "lucide-react";

interface Review {
  id: string;
  name: string;
  city: string;
  itemBought: string;
  rating: number;
  date: string;
  quote_fr: string;
  quote_ar: string;
}

const REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Karim B.",
    city: "Casablanca (Anfa)",
    itemBought: "Costume Sartorial Laine Super 150s",
    rating: 5,
    date: "Il y a 3 jours",
    quote_fr: "La coupe est tout simplement digne des plus grands tailleurs de Savile Row. Le drapé tombe à la perfection et la livraison le lendemain à Casablanca a été d'un grand professionnalisme.",
    quote_ar: "القصة والخياطة تنافس كبرى دور الأزياء العالمية في لندن وميلانو. الأقمشة راقية جداً والتوصيل في الدار البيضاء تم بسرعة فائقة وبخدمة ملكية.",
  },
  {
    id: "rev-2",
    name: "Salma M.",
    city: "Rabat (Souissi)",
    itemBought: "Robe de Soie Drapée Émeraude",
    rating: 5,
    date: "Il y a 1 semaine",
    quote_fr: "Une merveille absolue. La soie est d'une douceur rare et les finitions intérieures démontrent un savoir-faire méticuleux. Je commanderai à nouveau sans hésiter pour les réceptions de saison.",
    quote_ar: "فستان في غاية الروعة والأنوثة. الحرير الطبيعي ملمسه ساحر والتشطيبات الداخلية متقنة لأبعد الحدود. تجربة تسوق راقية سأكررها بكل تأكيد.",
  },
  {
    id: "rev-3",
    name: "Driss T.",
    city: "Marrakech (Hivernage)",
    itemBought: "Manteau Cachemire Double-Face",
    rating: 5,
    date: "Il y a 2 semaines",
    quote_fr: "Chaleur, légèreté et noblesse du tissu. Le service concierge par WhatsApp est d'une réactivité exemplaire pour le choix des tailles. AVELOR redéfinit le prêt-à-porter de luxe au Maroc.",
    quote_ar: "دفء وخفة وأناقة استثنائية. خدمة الكونسيرج عبر الواتساب ساعدتني كثيراً في اختيار المقاس المناسب بدقة تامة. أفيولور ترتقي بمفهوم الموضة الفاخرة بالمغرب.",
  },
];

const PRESS_LOGOS = [
  "VOGUE",
  "GQ SARTORIAL",
  "L'OFFICIEL",
  "FORBES AFRIQUE",
  "LE MATIN DU LUXE",
];

export function TestimonialsSection() {
  const { language, direction } = useLanguage();
  const isArabic = language === "ar";

  return (
    <section className="py-24 sm:py-32 bg-white text-neutral-900 border-b border-neutral-200" dir={direction}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-16">
        {/* Title & Trust Summary */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] border border-[#E4D7BE] text-[#9C8053] text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Star className="w-3 h-3 fill-current" />
            <span>4.9 / 5 • {isArabic ? "أكثر من 650 تقييم موثق" : "+650 avis clients vérifiés"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight text-neutral-900">
            {isArabic ? "ثقة وتجارب زبنائنا المميزين" : "L'Excellence Reconnue"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
            {isArabic
              ? "آراء وتجارب أعضاء مجتمع أفيولور من عشاق الأناقة والقطع الحصرية في مختلف مدن المملكة."
              : "Les retours d'expérience de nos clients à Casablanca, Rabat, Marrakech et à l'international."}
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="relative flex flex-col justify-between p-8 bg-ivory border border-neutral-200/80 shadow-2xs hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute top-6 inset-e-6 w-8 h-8 text-[#E2DACB] stroke-1 pointer-events-none" />

              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#C5A059]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-none" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-neutral-700 font-light italic leading-relaxed pt-1">
                  &ldquo;{isArabic ? rev.quote_ar : rev.quote_fr}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-6 mt-6 border-t border-neutral-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    {rev.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {isArabic ? "طلب مؤكد" : "Achat vérifié"}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">{rev.city}</p>
                <p className="text-[10px] text-[#9C8053] font-medium truncate pt-1">
                  {rev.itemBought}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Press Bar */}
        <div className="pt-10 border-t border-neutral-200/80 text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-medium">
            {isArabic ? "كما ورد في أبرز المجلات والمنابر العالمية" : "Distinction & Presse Lifestyle"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all">
            {PRESS_LOGOS.map((logo) => (
              <span
                key={logo}
                className="font-serif text-sm sm:text-lg tracking-[0.25em] font-semibold text-neutral-700 select-none"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
