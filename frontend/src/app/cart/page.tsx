"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    couponCode,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { language, direction, t } = useLanguage();
  const [inputCoupon, setInputCoupon] = useState("");
  const [applying, setApplying] = useState(false);

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setApplying(true);
    await applyCoupon(inputCoupon);
    setApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
          {t.cart.empty}
        </h1>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          {language === "fr"
            ? "Découvrez nos collections pour Homme et Femme et sélectionnez vos pièces favorites."
            : "تصفحوا مجموعاتنا الراقية للرجال والنساء واختاروا قطعكم المفضلة."}
        </p>
        <div>
          <Link
            href="/homme"
            className="inline-block px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            {t.cart.empty_cta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
          {t.cart.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
        {/* Liste des articles du panier */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
            const name = language === "ar" ? item.product.name_ar : item.product.name_fr;
            const price = item.product.discount_price
              ? Number(item.product.discount_price)
              : Number(item.product.base_price);
            const coverImage =
              item.product.images && item.product.images.length > 0
                ? item.product.images[0].url
                : "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop";

            return (
              <div
                key={item.variant.id}
                className="flex gap-4 sm:gap-6 py-6 border-b border-neutral-200 items-start"
              >
                <div className="relative w-24 sm:w-28 aspect-[3/4] flex-shrink-0 bg-neutral-100 overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={name}
                    fill
                    sizes="120px"
                    className="object-cover object-top"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-xs sm:text-sm font-medium text-black hover:underline"
                      >
                        {name}
                      </Link>
                      <div className="text-[11px] text-neutral-500 mt-1 space-x-2 rtl:space-x-reverse">
                        <span>
                          {t.product.size}: <strong>{item.variant.size}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          {t.product.color}: <strong>{item.variant.color_name_fr}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-semibold text-black">
                        {(price * item.quantity).toLocaleString("fr-MA")} {t.product.mad}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-neutral-400">
                          {price.toLocaleString("fr-MA")} {t.product.mad} / unité
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contrôle de Quantité & Bouton Supprimer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-600 transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                        className={`p-1.5 transition-colors ${
                          item.quantity >= item.variant.stock
                            ? "text-neutral-300 cursor-not-allowed"
                            : "hover:bg-neutral-100 text-neutral-600"
                        }`}
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variant.id)}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                      title={t.cart.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Récapitulatif de la commande */}
        <div className="bg-neutral-50 p-6 sm:p-8 space-y-6 border border-neutral-200 h-fit">
          <h2 className="text-base font-serif font-light uppercase tracking-wider text-black border-b border-neutral-200 pb-3">
            Récapitulatif
          </h2>

          {/* Formulaire Code Promotionnel */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Code Promotionnel
            </span>
            {couponCode ? (
              <div className="flex items-center justify-between bg-neutral-100 p-2.5 text-xs border border-neutral-300">
                <span className="font-mono font-bold text-black">{couponCode}</span>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:underline text-[11px]"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: BIENVENUE10"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  className="w-full text-xs bg-white border border-neutral-300 px-3 py-2 uppercase focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={applying || !inputCoupon.trim()}
                  className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
                >
                  {applying ? "..." : t.cart.apply_coupon}
                </button>
              </form>
            )}
            {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
          </div>

          {/* Lignes de calcul des totaux */}
          <div className="space-y-3 pt-3 border-t border-neutral-200 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>{t.cart.subtotal}</span>
              <span className="font-medium text-black">
                {subtotal.toLocaleString("fr-MA")} {t.product.mad}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-700 font-medium">
                <span>{t.cart.discount}</span>
                <span>-{discountAmount.toLocaleString("fr-MA")} {t.product.mad}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>{t.cart.shipping}</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-green-700 font-semibold">{t.cart.shipping_free}</span>
                ) : (
                  `${shippingFee.toLocaleString("fr-MA")} ${t.product.mad}`
                )}
              </span>
            </div>

            {shippingFee > 0 && (
              <p className="text-[10px] text-neutral-400">
                Livraison gratuite dès 500 MAD (Plus que {(500 - subtotal + discountAmount).toFixed(0)} MAD)
              </p>
            )}

            <div className="flex justify-between text-base font-serif font-medium text-black pt-4 border-t border-neutral-200">
              <span>{t.cart.total}</span>
              <span>{totalAmount.toLocaleString("fr-MA")} {t.product.mad}</span>
            </div>
          </div>

          {/* Bouton Checkout */}
          <div className="pt-2">
            <Link
              href="/checkout"
              className="w-full py-4 bg-black text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>{t.cart.checkout_btn}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-neutral-700" />
            <span>Paiement en espèces à la livraison au Maroc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
