import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
}

export function MiniCart({ open, onClose }: MiniCartProps) {
  const { items, updateQuantity, removeItem, subtotal, shippingFee, totalAmount } = useCart();
  const { language, direction, t } = useLanguage();
  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-60 flex"
          role="dialog"
          aria-modal="true"
          aria-label={isArabic ? "سلة التسوق" : "Votre panier"}
          dir={isArabic ? "rtl" : "ltr"}
        >
          {/* Overlay avec fondu fluide */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel slide-in avec physique soyeuse */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ x: isArabic ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? "-100%" : "100%" }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className={`fixed top-0 ${isArabic ? "left-0" : "right-0"} h-full w-full max-w-md bg-white shadow-2xl flex flex-col outline-none`}
          >
        {/* En-tÃªte du mini-panier */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-black">
              {t.cart.title}
            </h2>
            {items.length > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
            aria-label={isArabic ? "Ø¥ØºÙ„Ø§Ù‚" : "Fermer"}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Corps : liste des articles */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-neutral-400" strokeWidth={1.2} />
              </div>
              <p className="text-sm text-neutral-500">{t.cart.empty}</p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-black underline underline-offset-4"
              >
                {t.cart.empty_cta}
                <ArrowIcon className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <ul className="space-y-5 divide-y divide-neutral-100">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const name = isArabic ? item.product.name_ar : item.product.name_fr;
                  const price = item.product.discount_price
                    ? Number(item.product.discount_price)
                    : Number(item.product.base_price);
                  const coverImage =
                    item.product.images && item.product.images.length > 0
                      ? item.product.images.find((img) => img.is_cover)?.url || item.product.images[0].url
                      : "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400";

                  return (
                    <motion.li
                      key={item.variant.id}
                      layout
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, scale: 0.92, transition: { duration: 0.25 } }}
                      className="flex gap-4 pt-5 first:pt-0 overflow-hidden"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={onClose}
                        className="relative w-20 aspect-3/4 shrink-0 overflow-hidden bg-neutral-100 border border-neutral-100"
                      >
                        <Image
                          src={coverImage}
                          alt={name}
                          fill
                          sizes="80px"
                          className="object-cover object-top"
                        />
                      </Link>

                      {/* Infos produit */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={onClose}
                          className="text-xs font-semibold text-black uppercase tracking-wider hover:underline line-clamp-2"
                        >
                          {name}
                        </Link>

                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-wider">
                          <span>{isArabic ? "المقاس" : "Taille"} : {item.variant.size}</span>
                          <span>·</span>
                          <div
                            className="w-3 h-3 rounded-full border border-neutral-300 shrink-0"
                            style={{ backgroundColor: item.variant.color_code }}
                            title={isArabic ? item.variant.color_name_ar : item.variant.color_name_fr}
                          />
                          <span>{isArabic ? item.variant.color_name_ar : item.variant.color_name_fr}</span>
                        </div>

                        <p className="text-xs font-bold text-black">
                          {(price * item.quantity).toLocaleString("fr-MA")} {t.product.mad}
                        </p>

                        {/* Contrôle quantité */}
                        <div className="flex items-center gap-2 pt-1">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.88 }}
                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={isArabic ? "تقليل الكمية" : "Diminuer la quantité"}
                            className="flex h-6 w-6 items-center justify-center border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-3 w-3" strokeWidth={2} />
                          </motion.button>
                          <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.88 }}
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock}
                            aria-label={isArabic ? "زيادة الكمية" : "Augmenter la quantité"}
                            className="flex h-6 w-6 items-center justify-center border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" strokeWidth={2} />
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => removeItem(item.variant.id)}
                            aria-label={isArabic ? "حذف" : "Supprimer"}
                            className="ms-auto flex h-6 w-6 items-center justify-center text-neutral-400 hover:text-black transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Pied : totaux + actions */}
        {items.length > 0 && (
          <div className="border-t border-neutral-100 px-5 py-5 space-y-4 bg-white">
            {/* RÃ©capitulatif */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>{t.cart.subtotal}</span>
                <span>{subtotal.toLocaleString("fr-MA")} {t.product.mad}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{t.cart.shipping}</span>
                <span>
                  {shippingFee === 0
                    ? <span className="text-green-700 font-medium">{t.cart.shipping_free}</span>
                    : `${shippingFee} ${t.product.mad}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-black border-t border-neutral-100 pt-2 mt-2">
                <span>{t.cart.total}</span>
                <span>{totalAmount.toLocaleString("fr-MA")} {t.product.mad}</span>
              </div>
            </div>

            {/* Livraison gratuite progress */}
            {subtotal < 500 && (
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-500">
                  {isArabic
                    ? `${(500 - subtotal).toLocaleString("fr-MA")} Ø¯Ø±Ù‡Ù… Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ ØªÙˆØµÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ`
                    : `Plus que ${(500 - subtotal).toLocaleString("fr-MA")} MAD pour la livraison gratuite`}
                </p>
                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Boutons CTA */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 bg-black py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-neutral-800 transition-colors"
              >
                <span>{t.cart.checkout_btn}</span>
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="flex w-full items-center justify-center py-3 text-xs font-medium uppercase tracking-wider text-neutral-600 border border-neutral-200 hover:border-black hover:text-black transition-colors"
              >
                {isArabic ? "Ø¹Ø±Ø¶ Ø§Ù„Ø³Ù„Ø© Ø§Ù„ÙƒØ§Ù…Ù„Ø©" : "Voir le panier complet"}
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )}
</AnimatePresence>
);
}


