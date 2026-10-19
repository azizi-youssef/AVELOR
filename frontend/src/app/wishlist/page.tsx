"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";

export default function WishlistPage() {
  const { items, count } = useWishlist();
  const { language, direction, t } = useLanguage();
  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16" dir={isArabic ? "rtl" : "ltr"}>
      {/* En-tÃªte */}
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5" strokeWidth={1.5} />
          <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
            {isArabic ? "Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ù…Ù†ÙŠØ§Øª" : "Mes Favoris"}
          </h1>
          {count > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-2 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </div>
        {count > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            {isArabic
              ? `${count} Ù…Ù†ØªØ¬ Ù…Ø­ÙÙˆØ¸ ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Ø£Ù…Ù†ÙŠØ§ØªÙƒ`
              : `${count} article${count > 1 ? "s" : ""} sauvegardÃ©${count > 1 ? "s" : ""} dans vos favoris`}
          </p>
        )}
      </div>

      {count === 0 ? (
        /* Ã‰tat vide */
        <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
            <Heart className="h-7 w-7 text-neutral-400" strokeWidth={1.2} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-light uppercase tracking-wider">
              {isArabic ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…ÙØ¶Ù„Ø§Øª Ø¨Ø¹Ø¯" : "Aucun favori pour le moment"}
            </h2>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              {isArabic
                ? "Ø£Ø¶Ù Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„ØªÙŠ ØªØ¹Ø¬Ø¨Ùƒ Ø¥Ù„Ù‰ Ù‚Ø§Ø¦Ù…Ø© Ø£Ù…Ù†ÙŠØ§ØªÙƒ Ø¨Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ù‚Ù„Ø¨."
                : "Cliquez sur le cÅ“ur sur une carte produit pour sauvegarder vos piÃ¨ces prÃ©fÃ©rÃ©es."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/homme"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              {t.nav.men} <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/femme"
              className="inline-flex items-center gap-2 px-6 py-3 border border-black text-black text-xs font-semibold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
            >
              {t.nav.women} <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Grille de produits */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

