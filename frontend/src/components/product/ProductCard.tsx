"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();

  const coverImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.is_cover)?.url || product.images[0].url
      : "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop";

  const hoverImage =
    product.images && product.images.length > 1
      ? product.images[1].url
      : coverImage;

  const name = language === "ar" ? product.name_ar : product.name_fr;
  const basePrice = Number(product.base_price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;

  // Variantes de couleurs uniques
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => v.color_code))
  );

  return (
    <div className="group flex flex-col h-full bg-white transition-all">
      {/* Conteneur Image avec ratio portrait mode */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 block"
      >
        <Image
          src={coverImage}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges Élégants */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPrice && (
            <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              PROMO
            </span>
          )}
          {product.is_new && !discountPrice && (
            <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-neutral-200">
              {language === "fr" ? "NOUVEAU" : "جديد"}
            </span>
          )}
        </div>
      </Link>

      {/* Informations Produit */}
      <div className="pt-3 pb-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Pastilles de couleurs */}
          {uniqueColors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {uniqueColors.map((code, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: code }}
                />
              ))}
            </div>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-medium text-neutral-900 group-hover:text-black line-clamp-2 transition-colors">
              {name}
            </h3>
          </Link>
        </div>

        {/* Prix en Dirhams Marocains (MAD) */}
        <div className="mt-2 flex items-baseline gap-2">
          {discountPrice ? (
            <>
              <span className="text-xs sm:text-sm font-semibold text-black">
                {discountPrice.toLocaleString("fr-MA")} {t.product.mad}
              </span>
              <span className="text-[11px] text-neutral-400 line-through">
                {basePrice.toLocaleString("fr-MA")} {t.product.mad}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-medium text-neutral-900">
              {basePrice.toLocaleString("fr-MA")} {t.product.mad}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
