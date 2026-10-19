import React, { Suspense } from "react";
import { Metadata } from "next";
import { UniverseView, UniverseConfig } from "@/components/universe/UniverseView";

export const metadata: Metadata = {
  title: "AVELOR Femme — L'Art de l'Élégance Féminine & Haute Couture au Maroc",
  description:
    "Découvrez la collection AVELOR Femme : robes en satin de soie, tailleurs structurés, escarpins vernis et maroquinerie d'art. Livraison offerte dès 500 MAD.",
};

const womenConfig: UniverseConfig = {
  universe: "WOMEN",
  hero: {
    badge_fr: "Maison AVELOR · Univers Femme",
    badge_ar: "دار أفيولور · تشكيلة النساء",
    title_fr: "L'Art de l'Élégance",
    title_ar: "فن الأناقة النسائية",
    subtitle_fr:
      "Soie pure, robes sculpturales et maroquinerie d'art. Une féminité affirmée sublimée par les codes intemporels de la haute couture.",
    subtitle_ar:
      "حرير خالص، فساتين ساحرة ومصنوعات جلدية راقية. أنوثة ساحرة تتجلى في أرقى تصاميم الهوت كوتور العالمية.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    tagline_fr: "Haute Couture & Prêt-à-Porter Féminin",
    tagline_ar: "هوت كوتور وأزياء نسائية فاخرة",
  },
  categories: [
    {
      id: "robes",
      slug: "femme-robes",
      name_fr: "Robes & Soirée",
      name_ar: "فساتين وسهرة راقية",
      tagline_fr: "Satin de soie & Créations",
      tagline_ar: "حرير ساتان طبيعي",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "blazers",
      slug: "femme-blazers",
      name_fr: "Tailleurs & Blazers",
      name_ar: "سترات وبدلات نسائية",
      tagline_fr: "Lignes structurées & Crêpe",
      tagline_ar: "قصات عصرية وأزرار مذهبة",
      image: "https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "sacs",
      slug: "femme-sacs",
      name_fr: "Sacs à Main",
      name_ar: "حقائب يد جلدية فاخرة",
      tagline_fr: "Cuir grainé & Fermoirs dorés",
      tagline_ar: "جلد محبب وأقفال ذهبية",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "chaussures",
      slug: "femme-chaussures",
      name_fr: "Chaussures & Escarpins",
      name_ar: "أحذية وأحذية كعب عالي",
      tagline_fr: "Cuir verni & Talons stiletto",
      tagline_ar: "جلد لماع وتصاميم أيقونية",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
    },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "34", "36", "38", "40", "42", "44", "TU"],
  otherUniverse: {
    universe: "MEN",
    href: "/homme",
    name_fr: "Univers Masculin",
    name_ar: "عالم الأناقة الرجالية",
    title_fr: "Découvrir AVELOR Homme",
    title_ar: "اكتشف تشكيلة أفيولور للرجال",
    subtitle_fr:
      "Costumes croisés en laine royale italienne, chemises en coton d'Égypte et souliers patinés d'exception.",
    subtitle_ar:
      "بدلات كلاسيكية فاخرة من الصوف الإيطالي، قمصان قطن مصري وأحذية جلدية راقية مخصصة للرجل المتميز.",
    cta_fr: "Explorer l'univers Homme",
    cta_ar: "استكشف التشكيلة الرجالية",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920&auto=format&fit=crop",
  },
};

export default function WomenUniversePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs tracking-widest uppercase text-neutral-400">
          Chargement de l&apos;univers Femme...
        </div>
      }
    >
      <UniverseView config={womenConfig} />
    </Suspense>
  );
}
