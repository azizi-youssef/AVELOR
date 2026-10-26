"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, ArrowRight, ArrowLeft, Check, Sparkles, ShieldCheck } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { language, t, direction } = useLanguage();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      // Pick first in-stock variant or first variant
      const firstAvailable = product.variants?.find((v) => v.stock > 0) || product.variants?.[0] || null;
      setSelectedVariant(firstAvailable);
      setSelectedImageIndex(0);
      setQuantity(1);
      setAdded(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const isArabic = language === "ar";
  const name = isArabic ? product.name_ar : product.name_fr;
  const desc = isArabic ? (product.short_desc_ar || product.description_ar) : (product.short_desc_fr || product.description_fr);
  const basePrice = Number(product.base_price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const discountPercent = discountPrice ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : 0;
  const wishlisted = isWishlisted(product.id);

  const images = product.images && product.images.length > 0 ? product.images : [
    { id: 1, product_id: product.id, url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop", is_cover: true, sort_order: 0 }
  ];
  const activeImage = images[selectedImageIndex]?.url || images[0].url;

  // Sizes & Colors
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Map(product.variants.map((v) => [v.color_code, { code: v.color_code, name: isArabic ? v.color_name_ar : v.color_name_fr }])).values()
  );

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6 lg:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu rapide : ${name}`}
        dir={direction}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 inset-e-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-neutral-600 hover:text-black hover:bg-white transition-all shadow-sm"
            aria-label="Fermer l'aperçu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Gallery */}
          <div className="relative bg-neutral-100 flex flex-col justify-between p-6 sm:p-8">
            <div className="relative aspect-3/4 w-full overflow-hidden bg-white shadow-xs">
              <Image
                src={activeImage}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-all duration-300"
                priority
              />

              {discountPrice && (
                <span className="absolute top-3 inset-s-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 tracking-wider">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-18 shrink-0 overflow-hidden border transition-all ${
                      idx === selectedImageIndex ? "border-black ring-1 ring-black" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt="" fill sizes="56px" className="object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                  {product.category?.name_fr || "Haute Couture"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                  REF: {product.sku}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-light text-neutral-900 leading-tight">
                {name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                {discountPrice ? (
                  <>
                    <span className="text-xl font-medium text-neutral-900">
                      {discountPrice.toLocaleString("fr-MA")} {t.product.mad}
                    </span>
                    <span className="text-sm text-neutral-400 line-through">
                      {basePrice.toLocaleString("fr-MA")} {t.product.mad}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-medium text-neutral-900">
                    {basePrice.toLocaleString("fr-MA")} {t.product.mad}
                  </span>
                )}
              </div>

              {desc && (
                <p className="text-xs text-neutral-500 font-light leading-relaxed line-clamp-3">
                  {desc}
                </p>
              )}

              {/* Color options */}
              {uniqueColors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-600 block">
                    {t.product.color} : {selectedVariant?.color_name_fr || uniqueColors[0].name}
                  </span>
                  <div className="flex items-center gap-2">
                    {uniqueColors.map((c) => {
                      const isSelected = selectedVariant?.color_code === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            const match = product.variants.find((v) => v.color_code === c.code && v.size === selectedVariant?.size)
                              || product.variants.find((v) => v.color_code === c.code);
                            if (match) setSelectedVariant(match);
                          }}
                          className={`w-6 h-6 rounded-full border transition-all ${
                            isSelected ? "ring-2 ring-black ring-offset-2 scale-110" : "border-neutral-300 hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.code }}
                          title={c.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size options */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-600">
                      {t.product.size} : {selectedVariant?.size || "Choisir"}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {selectedVariant && selectedVariant.stock > 0
                        ? `${selectedVariant.stock} ${t.product.stock_left}`
                        : t.product.out_of_stock}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((sz) => {
                      const v = product.variants.find(
                        (item) => item.size === sz && (!selectedVariant || item.color_code === selectedVariant.color_code)
                      ) || product.variants.find((item) => item.size === sz);
                      const isSelected = selectedVariant?.size === sz;
                      const inStock = (v?.stock ?? 0) > 0;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={!inStock}
                          onClick={() => v && setSelectedVariant(v)}
                          className={`min-w-10 h-10 px-3 text-xs uppercase font-medium border transition-all ${
                            isSelected
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : inStock
                              ? "border-neutral-200 text-neutral-800 hover:border-black"
                              : "border-neutral-100 text-neutral-300 line-through cursor-not-allowed"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 text-xs uppercase tracking-widest font-medium transition-all ${
                    added
                      ? "bg-emerald-700 text-white"
                      : !selectedVariant || selectedVariant.stock <= 0
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-900 hover:bg-black text-white shadow-sm"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      Ajouté au Panier !
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {t.product.add_to_cart}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleItem(product)}
                  className={`h-11 w-11 flex items-center justify-center border transition-colors ${
                    wishlisted ? "border-black bg-black text-white" : "border-neutral-200 text-neutral-700 hover:border-black"
                  }`}
                  aria-label="Ajouter aux favoris"
                >
                  <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] hover:underline uppercase tracking-wider font-medium"
                >
                  <span>Voir la fiche détaillée du produit</span>
                  {isArabic ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>

                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Livraison Maroc & Retours 14j</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
