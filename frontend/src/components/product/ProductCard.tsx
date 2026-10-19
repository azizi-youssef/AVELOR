"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { toggleItem, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);

  const coverImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.is_cover)?.url || product.images[0].url
      : "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop";

  const hoverImage =
    product.images && product.images.length > 1 ? product.images[1].url : null;

  const name = language === "ar" ? product.name_ar : product.name_fr;
  const basePrice = Number(product.base_price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const discountPercent = discountPrice ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : 0;
  const wishlisted = isWishlisted(product.id);

  // Couleurs uniques
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color_code)));
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <article
      className="group flex flex-col h-full bg-white"
      aria-label={name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full"
          tabIndex={0}
          aria-label={name}
        >
          {/* Image principale */}
          <Image
            src={coverImage}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-top transition-all duration-700 ease-out ${
              hoverImage && hovered ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Image hover (second angle) */}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-top transition-opacity duration-700 ease-out absolute inset-0 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPrice && (
            <span className="bg-black text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
              -{discountPercent}%
            </span>
          )}
          {product.is_new && !discountPrice && (
            <span className="bg-white/90 backdrop-blur-sm text-black text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-neutral-200">
              {language === "fr" ? "NOUVEAU" : "Ø¬Ø¯ÙŠØ¯"}
            </span>
          )}
          {!inStock && (
            <span className="bg-neutral-400 text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
              {language === "fr" ? "Ã‰PUISÃ‰" : "Ù†ÙØ°"}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product);
          }}
          aria-label={wishlisted ? (language === "fr" ? "Retirer des favoris" : "Ø¥Ø²Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…ÙØ¶Ù„Ø©") : (language === "fr" ? "Ajouter aux favoris" : "Ø£Ø¶Ù Ø¥Ù„Ù‰ Ø§Ù„Ù…ÙØ¶Ù„Ø©")}
          aria-pressed={wishlisted}
          className={`absolute top-2 end-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            wishlisted
              ? "bg-black text-white opacity-100"
              : "bg-white/80 backdrop-blur-sm text-neutral-600 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart
            className="h-3.5 w-3.5"
            strokeWidth={1.5}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Infos produit */}
      <div className="pt-3 pb-4 flex flex-col flex-1 justify-between" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="space-y-1.5">
          {/* Pastilles couleurs */}
          {uniqueColors.length > 0 && (
            <div className="flex items-center gap-1.5" aria-hidden>
              {uniqueColors.slice(0, 4).map((code, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-200 flex-shrink-0"
                  style={{ backgroundColor: code }}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[9px] text-neutral-400">+{uniqueColors.length - 4}</span>
              )}
            </div>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-medium text-neutral-800 group-hover:text-black line-clamp-2 transition-colors leading-snug">
              {name}
            </h3>
          </Link>
        </div>

        {/* Prix */}
        <div className="mt-2 flex items-baseline gap-2">
          {discountPrice ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-black">
                {discountPrice.toLocaleString("fr-MA")} {t.product.mad}
              </span>
              <span className="text-[10px] text-neutral-400 line-through">
                {basePrice.toLocaleString("fr-MA")}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-neutral-900">
              {basePrice.toLocaleString("fr-MA")} {t.product.mad}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

