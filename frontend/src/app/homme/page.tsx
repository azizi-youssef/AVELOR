import React, { Suspense } from "react";
import { Metadata } from "next";
import { UniverseView, UniverseConfig } from "@/components/universe/UniverseView";

export const metadata: Metadata = {
  title: "AVELOR Homme — L'Élégance Sartoriale Masculine au Maroc",
  description:
    "Découvrez la collection AVELOR Homme : costumes en laine italienne 130s, chemises en coton d'Égypte, souliers patinés et maroquinerie d'exception. Livraison offerte dès 500 MAD.",
};

const menConfig: UniverseConfig = {
  universe: "MEN",
  hero: {
    badge_fr: "Maison AVELOR · Univers Homme",
    badge_ar: "دار أفيولور · تشكيلة الرجال",
    title_fr: "L'Élégance au Masculin",
    title_ar: "الأناقة الرجالية الفاخرة",
    subtitle_fr:
      "Confection sartoriale d'exception, coupes magistrales et matières nobles pour l'homme contemporain qui exige la perfection.",
    subtitle_ar:
      "خياطة سارتوريال إيطالية متقنة، قصات راقية وأقمشة نبيلة صُممت للرجل العصري الباحث عن قمة التميز والأناقة.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2000&auto=format&fit=crop",
    tagline_fr: "Haute Couture & Tailoring",
    tagline_ar: "هوت كوتور وتفصيل راقٍ",
  },
  categories: [
    {
      id: "costumes",
      slug: "homme-costumes",
      name_fr: "Costumes & Blazers",
      name_ar: "بدلات وسترات رسمية",
      tagline_fr: "Laine italienne 130s",
      tagline_ar: "صوف إيطالي 130s",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "chemises",
      slug: "homme-chemises",
      name_fr: "Chemises & Polos",
      name_ar: "قمصان وبولو فاخرة",
      tagline_fr: "Coton d'Égypte 120/2",
      tagline_ar: "قطن مصري ناعم",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "chaussures",
      slug: "homme-chaussures",
      name_fr: "Chaussures & Derbies",
      name_ar: "أحذية وموكاسان راقية",
      tagline_fr: "Cuir patiné à la main",
      tagline_ar: "جلد طبيعي أصيل",
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "accessoires",
      slug: "homme-accessoires",
      name_fr: "Sacs & Maroquinerie",
      name_ar: "حقائب وجلديات فاخرة",
      tagline_fr: "Cuir pleine fleur d'art",
      tagline_ar: "حقائب سفر وإكسسوارات",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "46", "48", "50"],
  otherUniverse: {
    universe: "WOMEN",
    href: "/femme",
    name_fr: "Univers Féminin",
    name_ar: "عالم الأناقة النسائية",
    title_fr: "Découvrir AVELOR Femme",
    title_ar: "اكتشف تشكيلة أفيولور للنساء",
    subtitle_fr:
      "Robes sculpturales en satin de soie, tailleurs structurés et maroquinerie d'art façonnés avec grâce.",
    subtitle_ar:
      "فساتين سهرة من الحرير الطبيعي، بدلات أنثوية أنيقة وحقائب يد استثنائية صُممت بأعلى درجات الرقي.",
    cta_fr: "Explorer l'univers Femme",
    cta_ar: "استكشف التشكيلة النسائية",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop",
  },
};

export default function MenUniversePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs tracking-widest uppercase text-neutral-400">
          Chargement de l&apos;univers Homme...
        </div>
      }
    >
      <UniverseView config={menConfig} />
    </Suspense>
  );
}
