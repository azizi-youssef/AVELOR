"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { Mail, Check, Sparkles, ArrowRight, ArrowLeft, Shield } from "lucide-react";

export function NewsletterSection() {
  const { language, direction } = useLanguage();
  const { toast } = useToast();
  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState("");
  const [preference, setPreference] = useState<"ALL" | "MEN" | "WOMEN">("ALL");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast(
        isArabic ? "مرحباً بكم في الدائرة الخاصة !" : "Bienvenue dans le Cercle Privé AVELOR",
        {
          type: "success",
          subMessage: isArabic
            ? "تم تسجيل بريدكم بنجاح. كود الترحيب BIENVENUE10 متاح لكم."
            : "Votre code -10% BIENVENUE10 a été réservé pour votre commande.",
        }
      );
    }, 600);
  };

  return (
    <section className="relative overflow-hidden bg-[#1B1A17] text-white py-24 sm:py-32" dir={direction}>
      {/* Decorative lines */}
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 border border-[#C5A059]/40 bg-[#C5A059]/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#E7D3A4]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isArabic ? "امتيازات حصرية" : "Privilège Exclusif"}</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight leading-tight">
            {isArabic ? "انضموا إلى الدائرة الخاصة AVELOR" : "Rejoignez le Cercle Privé AVELOR"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? "استمتعوا بأسبقية الوصول إلى التشكيلات الجديدة، دعوات العروض الخاصة وخصم ترحيبي 10٪ على أول طلبية لكم."
              : "Soyez les premiers informés de l'arrivée de nos nouvelles créations, bénéficiez d'accès réservés aux ventes privées et recevez 10% sur votre première commande."}
          </p>
        </div>

        {submitted ? (
          <div className="max-w-md mx-auto p-6 border border-[#C5A059]/60 bg-white/5 backdrop-blur-md space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-serif text-[#E7D3A4]">
              {isArabic ? "تم تسجيل اشتراككم بنجاح" : "Votre inscription est confirmée"}
            </p>
            <p className="text-xs text-neutral-300">
              {isArabic
                ? "شكراً لانضمامكم. استخدموا الرمز BIENVENUE10 عند الشراء."
                : "Merci pour votre confiance. Utilisez le code BIENVENUE10 lors de votre commande."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
            {/* Preference pills */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreference("ALL")}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                  preference === "ALL"
                    ? "bg-[#C5A059] text-black font-semibold"
                    : "bg-white/10 text-neutral-300 hover:bg-white/15"
                }`}
              >
                {isArabic ? "الكل" : "Toutes les créations"}
              </button>
              <button
                type="button"
                onClick={() => setPreference("MEN")}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                  preference === "MEN"
                    ? "bg-[#C5A059] text-black font-semibold"
                    : "bg-white/10 text-neutral-300 hover:bg-white/15"
                }`}
              >
                {isArabic ? "رجال" : "Hommes"}
              </button>
              <button
                type="button"
                onClick={() => setPreference("WOMEN")}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                  preference === "WOMEN"
                    ? "bg-[#C5A059] text-black font-semibold"
                    : "bg-white/10 text-neutral-300 hover:bg-white/15"
                }`}
              >
                {isArabic ? "نساء" : "Femmes"}
              </button>
            </div>

            {/* Email input & CTA */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <Mail className="absolute top-1/2 -translate-y-1/2 inset-s-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isArabic ? "أدخلوا بريدكم الإلكتروني..." : "Votre adresse email personnelle..."
                  }
                  className="w-full bg-white/10 border border-white/20 focus:border-[#C5A059] px-10 py-3.5 text-xs text-white placeholder-neutral-400 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#C5A059] hover:bg-[#D8B672] text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-98 disabled:opacity-70"
              >
                <span>{loading ? (isArabic ? "جاري التسجيل..." : "Inscription...") : (isArabic ? "انضموا الآن" : "Rejoindre")}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 pt-2">
              <Shield className="w-3 h-3 text-[#C5A059]" />
              <span>
                {isArabic
                  ? "نحترم خصوصيتكم وسرية بياناتكم. إلغاء الاشتراك متاح بضغطة واحدة."
                  : "Respect absolu de votre vie privée. Désabonnement possible en 1 clic."}
              </span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
