"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Campaign } from "@/types";
import { api } from "@/lib/api";
import { initialProducts, initialCampaigns } from "@/lib/mock-data";
import { ArrowRight, Sparkles, ArrowLeft } from "lucide-react";

export default function HomePage() {
  const { language, direction, t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(initialProducts);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [loading, setLoading] = useState(false);

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, campRes] = await Promise.all([
          api.getProducts({ is_featured: true, page_size: 8 }),
          api.getCampaigns(),
        ]);
        if (prodRes && prodRes.items && prodRes.items.length > 0) {
          setFeaturedProducts(prodRes.items);
        }
        if (campRes && campRes.length > 0) {
          setCampaigns(campRes);
        }
      } catch (err) {
        // En cas d'attente de connexion DB, les collections par défaut restent affichées
      }
    }
    loadHomeData();
  }, []);

  const heroCampaign = campaigns.length > 0 ? campaigns[0] : null;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Grand Hero Banner Principal */}
      <section style={{ position: "relative" }} className="relative h-[85vh] sm:h-[90vh] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        <Image
          src={
            heroCampaign?.desktop_image ||
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop"
          }
          alt="AVELOR Luxury"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-6 fade-in">
          <div className="inline-flex items-center gap-2 border border-white/30 backdrop-blur-md px-3 py-1 text-xs tracking-widest uppercase font-light">
            <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
            <span>Maison de Luxe AVELOR Maroc</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-serif tracking-[0.15em] font-light uppercase leading-tight">
            {heroCampaign
              ? language === "ar"
                ? heroCampaign.title_ar
                : heroCampaign.title_fr
              : t.hero.title}
          </h1>

          <p className="text-xs sm:text-base text-neutral-200 max-w-2xl mx-auto font-light leading-relaxed">
            {heroCampaign
              ? language === "ar"
                ? heroCampaign.subtitle_ar
                : heroCampaign.subtitle_fr
              : t.hero.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/homme"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              {t.hero.shop_men}
            </Link>
            <Link
              href="/femme"
              className="w-full sm:w-auto px-8 py-3.5 border border-white text-white text-xs font-semibold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              {t.hero.shop_women}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Double Portail : Collection Homme vs Collection Femme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2">
            Deux Univers Distincts
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
            Choisissez Votre Univers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Univers Homme */}
          <Link
            href="/homme"
            style={{ position: "relative" }}
            className="group relative h-[500px] sm:h-[600px] overflow-hidden bg-neutral-900 block"
          >
            <Image
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
              alt="Collection Homme"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-300 font-light">
                {language === "fr" ? "L'Allure & La Rigueur" : "الأناقة والوقار"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider">
                {t.nav.men}
              </h3>
              <p className="text-xs text-neutral-300 max-w-sm font-light">
                {language === "fr"
                  ? "Costumes sur mesure en laine d'Italie, chemises en coton d'Égypte et souliers de prestige."
                  : "بدلات راقية من الصوف الإيطالي، قمصان قطنية فاخرة وأحذية سارتوريال."}
              </p>
              <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === "fr" ? "Explorer Homme" : "دخول عالم الرجال"}</span>
                <ArrowIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Univers Femme */}
          <Link
            href="/femme"
            style={{ position: "relative" }}
            className="group relative h-[500px] sm:h-[600px] overflow-hidden bg-neutral-900 block"
          >
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
              alt="Collection Femme"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-300 font-light">
                {language === "fr" ? "La Grâce & La Pureté" : "الرقة والأنوثة الخالدة"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider">
                {t.nav.women}
              </h3>
              <p className="text-xs text-neutral-300 max-w-sm font-light">
                {language === "fr"
                  ? "Robes sculpturales en satin de soie, blazers ceinturés et sacs à main d'exception."
                  : "فساتين سهرة ساحرة، بدلات كريب أنيقة وحقائب يد من الجلود الفاخرة."}
              </p>
              <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === "fr" ? "Explorer Femme" : "دخول عالم النساء"}</span>
                <ArrowIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Pièces Emblématiques / Produits en Vedette */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-neutral-100">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-1">
              Sélection Exclusive
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
              {t.sections.popular}
            </h2>
          </div>
          <Link
            href="/homme"
            className="mt-4 sm:mt-0 text-xs font-semibold uppercase tracking-widest hover:text-neutral-500 transition-colors inline-flex items-center gap-1.5"
          >
            <span>{language === "fr" ? "Tout afficher" : "عرض الكل"}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-neutral-100 w-full" />
                <div className="h-3 bg-neutral-100 w-3/4" />
                <div className="h-3 bg-neutral-100 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Bannière Campagne promotionnelle */}
      <section className="bg-neutral-50 py-16 sm:py-24 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 font-semibold">
            Privilège Réservé au Maroc
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-light uppercase tracking-widest text-black">
            {language === "fr" ? "Code de Réduction Exclusif : BIENVENUE10" : "رمز خصم حصري : BIENVENUE10"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto font-light leading-relaxed">
            {language === "fr"
              ? "Bénéficiez de 10% de réduction immédiate sur votre première commande ainsi que de la livraison gratuite partout au Royaume."
              : "استفيدوا من خصم 10% فوري على طلبيتكم الأولى مع توصيل مجاني إلى باب منزلكم في كافة ربوع المملكة."}
          </p>
          <div className="pt-2">
            <Link
              href="/homme"
              className="inline-block px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              {language === "fr" ? "Profiter de l'offre" : "الاستفادة من العرض"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
