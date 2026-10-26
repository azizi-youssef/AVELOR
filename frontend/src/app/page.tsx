"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Campaign } from "@/types";
import { api } from "@/lib/api";
import { ArrowRight, Sparkles, ArrowLeft, ArrowUpRight, Truck, ShieldCheck, Gem, Check } from "lucide-react";
import { LuxuryFadeIn, LuxuryStagger, LuxuryStaggerItem, LuxuryScaleHover, motion } from "@/components/ui/motion";
import { BrandStory } from "@/components/home/BrandStory";
import { LookbookSection } from "@/components/home/LookbookSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

export default function HomePage() {
  const { language, direction, t } = useLanguage();
  const { toast } = useToast();
  const isArabic = language === "ar";
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      try {
        const [prodRes, campRes] = await Promise.all([
          api.getProducts({ is_featured: true, page_size: 8 }),
          api.getCampaigns(),
        ]);

        if (!active) return;
        if (prodRes?.items && prodRes.items.length > 0) {
          setFeaturedProducts(prodRes.items);
        } else {
          // Si aucun produit n'est explicitement marqué is_featured, charger les derniers produits actifs
          const allRes = await api.getProducts({ page_size: 8 });
          if (active && allRes?.items) setFeaturedProducts(allRes.items);
        }
        if (campRes) setCampaigns(campRes);
      } catch (error) {
        console.error("Unable to load homepage content from database:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  const heroCampaign = campaigns[0] ?? null;
  const heroTitle = heroCampaign
    ? (isArabic ? heroCampaign.title_ar : heroCampaign.title_fr)
    : t.hero.title;
  const heroSubtitle = heroCampaign
    ? (isArabic ? heroCampaign.subtitle_ar : heroCampaign.subtitle_fr)
    : t.hero.subtitle;

  return (
    <main dir={direction} className="overflow-hidden bg-[#faf9f6] text-[#171714]">
      {/* Hero */}
      <section className="relative isolate flex min-h-170 h-[min(86svh,900px)] items-center justify-center overflow-hidden bg-[#191916] sm:min-h-180">
        <Image
          src={
            heroCampaign?.desktop_image ||
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2200&auto=format&fit=crop"
          }
          alt="Collection de mode AVELOR"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-linear-to-r from-black/35 via-transparent to-black/10" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto w-full max-w-5xl px-5 py-24 text-center text-white sm:px-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-7 inline-flex items-center gap-2 border border-white/35 bg-black/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.28em] backdrop-blur-sm sm:text-[11px]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d8c5a0]" />
            <span>{isArabic ? "دار أفيلور — أناقة مغربية" : "AVELOR · Maison de mode au Maroc"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-4xl font-serif text-4xl font-light uppercase leading-[1.12] tracking-[0.07em] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {heroTitle}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto my-7 h-px w-16 bg-[#d8c5a0]"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="mx-auto max-w-xl text-sm font-light leading-7 text-white/85 sm:text-base sm:leading-8"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/homme"
              className="group inline-flex min-h-12 items-center justify-center gap-3 bg-[#f7f4ed] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#171714] transition-colors duration-300 hover:bg-[#d8c5a0] sm:min-w-48"
            >
              {t.hero.shop_men}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/femme"
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/75 bg-black/10 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#171714] sm:min-w-48"
            >
              {t.hero.shop_women}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <p className="mt-12 text-[9px] uppercase tracking-[0.32em] text-white/65">
            {isArabic ? "أناقة خالدة · تفاصيل مختارة" : "Élégance intemporelle · Détails choisis"}
          </p>
        </motion.div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-[#d8c5a0]/80 to-transparent" />
      </section>

      {/* Brand benefits */}
      <section className="border-b border-[#e9e5dc] bg-[#f3f0e9]">
        <LuxuryStagger className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#e0dbd0] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <LuxuryStaggerItem className="flex items-center justify-center gap-3 py-5 text-center sm:py-6">
            <Gem className="h-4 w-4 shrink-0 text-[#9c8053]" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#45433d]">
              {isArabic ? "اختيارات راقية" : "Sélection soignée"}
            </span>
          </LuxuryStaggerItem>
          <LuxuryStaggerItem className="flex items-center justify-center gap-3 py-5 text-center sm:py-6">
            <Truck className="h-4 w-4 shrink-0 text-[#9c8053]" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#45433d]">
              {isArabic ? "التوصيل في جميع أنحاء المغرب" : "Livraison partout au Maroc"}
            </span>
          </LuxuryStaggerItem>
          <LuxuryStaggerItem className="flex items-center justify-center gap-3 py-5 text-center sm:py-6">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#9c8053]" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#45433d]">
              {isArabic ? "تجربة تسوق موثوقة" : "Expérience d’achat sécurisée"}
            </span>
          </LuxuryStaggerItem>
        </LuxuryStagger>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <LuxuryFadeIn className="mb-10 text-center sm:mb-14">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c8053]">
            {isArabic ? "اكتشف مجموعاتنا" : "Les univers AVELOR"}
          </p>
          <h2 className="font-serif text-3xl font-light uppercase tracking-[0.06em] sm:text-4xl">
            {isArabic ? "أناقة لكل أسلوب" : "Deux univers, une signature"}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#77746d]">
            {isArabic
              ? "قطع مختارة تجمع بين الجودة والتصميم والأناقة اليومية."
              : "Des pièces choisies pour conjuguer caractère, qualité et élégance au quotidien."}
          </p>
        </LuxuryFadeIn>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
          <LuxuryFadeIn direction="right" distance={30}>
            <Link href="/homme" className="group relative isolate block min-h-110 overflow-hidden bg-[#292722] sm:min-h-147.5">
              <Image
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop"
                alt="Collection homme AVELOR"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-black/5 transition-opacity duration-300 group-hover:from-black/90" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#e1cfad]">
                  {isArabic ? "الأناقة والوقار" : "L’allure & la précision"}
                </p>
                <h3 className="font-serif text-3xl font-light uppercase tracking-[0.08em] sm:text-4xl">
                  {t.nav.men}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                  {isArabic
                    ? "تصاميم أنيقة وتفاصيل راقية لإطلالة مميزة."
                    : "Des essentiels raffinés et des silhouettes affirmées pour chaque occasion."}
                </p>
                <span className="mt-6 inline-flex items-center gap-3 border-b border-white/50 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  {isArabic ? "اكتشف المجموعة" : "Explorer la collection"}
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          </LuxuryFadeIn>

          <LuxuryFadeIn direction="left" distance={30}>
            <Link href="/femme" className="group relative isolate block min-h-110 overflow-hidden bg-[#292722] sm:min-h-147.5">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1400&auto=format&fit=crop"
                alt="Collection femme AVELOR"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-black/5 transition-opacity duration-300 group-hover:from-black/90" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#e1cfad]">
                  {isArabic ? "الرقة والأنوثة الخالدة" : "La grâce & la modernité"}
                </p>
                <h3 className="font-serif text-3xl font-light uppercase tracking-[0.08em] sm:text-4xl">
                  {t.nav.women}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                  {isArabic
                    ? "قطع عصرية تجمع بين الأنوثة والبساطة الراقية."
                    : "Des pièces contemporaines où la féminité rencontre une simplicité sophistiquée."}
                </p>
                <span className="mt-6 inline-flex items-center gap-3 border-b border-white/50 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  {isArabic ? "اكتشفي المجموعة" : "Explorer la collection"}
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          </LuxuryFadeIn>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <LuxuryFadeIn className="mb-9 flex flex-col gap-5 border-b border-[#e9e5dc] pb-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c8053]">
                {isArabic ? "اختياراتنا لكم" : "La sélection du moment"}
              </p>
              <h2 className="font-serif text-3xl font-light uppercase tracking-[0.06em] sm:text-4xl">
                {t.sections.popular}
              </h2>
            </div>
            <Link
              href="/homme"
              className="inline-flex w-fit items-center gap-2 border-b border-[#b6a17e] pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-[#9c8053]"
            >
              {isArabic ? "عرض جميع المنتجات" : "Voir toute la sélection"}
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </LuxuryFadeIn>

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-3/4 bg-[#f0eee9]" />
                  <div className="mt-4 h-3 w-3/4 bg-[#f0eee9]" />
                  <div className="mt-3 h-3 w-1/2 bg-[#f0eee9]" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <LuxuryStagger className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <LuxuryStaggerItem key={product.id}>
                  <ProductCard product={product} priority={index < 4} />
                </LuxuryStaggerItem>
              ))}
            </LuxuryStagger>
          ) : (
            <div className="py-14 text-center text-sm text-[#77746d]">
              {isArabic ? "لا توجد منتجات مميزة حالياً." : "Aucun produit à la une pour le moment."}
            </div>
          )}
        </div>
      </section>

      {/* Brand Story — L'âme de marque AVELOR */}
      <BrandStory />

      {/* Lookbook / Éditorial Lifestyle */}
      <LookbookSection />

      {/* Promotion avec Countdown Timer */}
      <section className="relative overflow-hidden bg-[#1E1D19] px-5 py-24 text-center text-white sm:px-8 sm:py-32">
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full border border-[#C5A059]/10" />
        <div className="pointer-events-none absolute -bottom-40 -right-16 h-96 w-96 rounded-full border border-[#C5A059]/10" />

        <LuxuryFadeIn className="relative mx-auto max-w-3xl space-y-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d8c5a0]">
            {isArabic ? "امتياز خاص بكم" : "Une attention pour votre première commande"}
          </p>

          <h2 className="font-serif text-3xl font-light uppercase leading-tight tracking-wider sm:text-5xl">
            {isArabic ? "خصم حصري 10٪" : "Votre première commande, à -10 %"}
          </h2>

          <p className="mx-auto max-w-xl text-sm leading-7 text-white/70 font-light">
            {isArabic
              ? "استخدموا الرمز أدناه عند الطلب واستفيدوا من التوصيل المجاني في جميع أنحاء المغرب."
              : "Utilisez ce code lors de votre commande et profitez de la livraison offerte partout au Maroc."}
          </p>

          {/* Countdown timer */}
          <div className="pt-2">
            <CountdownTimer
              title={isArabic ? "ينتهي العرض الترحيبي خلال" : "Offre de bienvenue à durée limitée"}
            />
          </div>

          <div className="mx-auto inline-flex items-center gap-4 border border-[#d8c5a0]/60 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm">
            <span className="font-mono text-sm tracking-[0.24em] text-[#e5d6ba] sm:text-base">BIENVENUE10</span>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  void navigator.clipboard.writeText("BIENVENUE10");
                  setCopiedCode(true);
                  toast(
                    isArabic ? "تم نسخ الرمز بنجاح !" : "Code promo copié !",
                    {
                      type: "success",
                      subMessage: isArabic ? "BIENVENUE10 (-10%) جاهز للاستخدام" : "BIENVENUE10 (-10%) est dans votre presse-papiers",
                    }
                  );
                  setTimeout(() => setCopiedCode(false), 2500);
                }
              }}
              className="border-l border-white/20 pl-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/90 hover:text-[#d8c5a0] transition-colors flex items-center gap-1.5"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isArabic ? "تم النسخ" : "Copié !"}</span>
                </>
              ) : (
                <span>{isArabic ? "نسخ الرمز" : "Copier"}</span>
              )}
            </button>
          </div>

          <div className="pt-4">
            <Link
              href="/homme"
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#f7f4ed] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#171714] transition-colors hover:bg-[#d8c5a0] shadow-md"
            >
              {isArabic ? "اكتشفوا المجموعة" : "Découvrir la collection"}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </LuxuryFadeIn>
      </section>

      {/* Témoignages & Presse */}
      <TestimonialsSection />

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Newsletter / Le Cercle Privé */}
      <NewsletterSection />
    </main>
  );
}
