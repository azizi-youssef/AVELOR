"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, ArrowRight, ArrowLeft, Share2, Check, ShoppingBag, Sparkles, Copy } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Product } from "@/types";
import { api } from "@/lib/api";

function WishlistContent() {
  const { items: myItems, count, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const { language, direction, t } = useLanguage();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const isArabic = language === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const sharedParam = searchParams.get("shared");
  const [sharedProducts, setSharedProducts] = useState<Product[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load shared items if ?shared=id1,id2,id3 exists
  useEffect(() => {
    if (!sharedParam) return;
    const ids = sharedParam.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    if (ids.length === 0) return;

    setLoadingShared(true);
    api.getProducts({ page_size: 50 })
      .then((res) => {
        const items = res.items || [];
        const matched = items.filter((p) => ids.includes(p.id));
        setSharedProducts(matched);
      })
      .catch((err) => {
        console.error("Erreur récupération wishlist partagée:", err);
        setSharedProducts([]);
      })
      .finally(() => setLoadingShared(false));
  }, [sharedParam]);

  const isViewingShared = Boolean(sharedParam && sharedProducts.length > 0);
  const displayedItems = isViewingShared ? sharedProducts : myItems;

  const handleShare = () => {
    if (myItems.length === 0) return;
    const ids = myItems.map((p) => p.id).join(",");
    const url = `${window.location.origin}/wishlist?shared=${ids}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast(
        isArabic ? "تم نسخ رابط المفضلة !" : "Lien de votre sélection copié !",
        {
          type: "success",
          subMessage: isArabic
            ? "يمكنكم الآن مشاركة قائمتكم المفضلة مع أصدقائكم."
            : "Partagez votre sélection personnelle AVELOR avec vos proches.",
        }
      );
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    displayedItems.forEach((product) => {
      const firstInStock = product.variants?.find((v) => v.stock > 0);
      if (firstInStock) {
        addItem(product, firstInStock, 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast(
        isArabic ? `تمت إضافة ${addedCount} قطع إلى السلة` : `${addedCount} pièces ajoutées au panier`,
        { type: "success" }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8" dir={isArabic ? "rtl" : "ltr"}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          {
            label: isArabic ? "قائمة الأمنيات" : "Mes Favoris",
          },
        ]}
      />

      {/* Shared selection banner */}
      {isViewingShared && (
        <div className="p-4 sm:p-5 bg-[#FAF6EE] border border-[#E5D7BE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#9C8053] shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                {isArabic ? "قائمة أمنيات تمت مشاركتها معكم" : "Sélection partagée par un proche"}
              </p>
              <p className="text-[11px] text-neutral-600">
                {isArabic
                  ? "تصفحوا هذه القطع الفاخرة المختارة من دار أفيولور."
                  : "Découvrez les pièces d'exception favorites sélectionnées pour vous."}
              </p>
            </div>
          </div>

          <Link
            href="/wishlist"
            className="text-xs uppercase tracking-wider font-semibold text-[#9C8053] underline hover:text-black transition-colors"
          >
            {isArabic ? "الرجوع إلى قائمتي الشخصية" : "Voir mes propres favoris"}
          </Link>
        </div>
      )}

      {/* Header bar */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-black" strokeWidth={1.5} fill="currentColor" />
            <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
              {isArabic ? "قائمة الأمنيات" : "Mes Favoris"}
            </h1>
            {displayedItems.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-2 text-xs font-bold text-white">
                {displayedItems.length}
              </span>
            )}
          </div>
          {displayedItems.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              {isArabic
                ? `${displayedItems.length} منتج محفوظ في قائمة الأمنيات`
                : `${displayedItems.length} création${displayedItems.length > 1 ? "s" : ""} d'exception dans votre sélection`}
            </p>
          )}
        </div>

        {/* Actions bar */}
        {displayedItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 hover:border-black text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (isArabic ? "تم النسخ" : "Lien copié") : (isArabic ? "مشاركة قائمتي" : "Partager ma sélection")}</span>
            </button>

            <button
              type="button"
              onClick={handleAddAllToCart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isArabic ? "إضافة الكل إلى السلة" : "Tout ajouter au panier"}</span>
            </button>
          </div>
        )}
      </div>

      {displayedItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Heart className="h-7 w-7" strokeWidth={1.2} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-light uppercase tracking-wider text-neutral-900">
              {isArabic ? "لا توجد مفضلات بعد" : "Aucun favori pour le moment"}
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              {isArabic
                ? "انقر فوق رمز القلب على بطاقة أي قطعة لإضافتها إلى قائمة أمنياتك والرجوع إليها لاحقاً."
                : "Cliquez sur l'icône cœur sur une création pour sauvegarder vos pièces préférées et composer votre vestiaire idéal."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/homme"
              className="inline-flex items-center gap-2 px-7 py-3 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm"
            >
              {t.nav.men} <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/femme"
              className="inline-flex items-center gap-2 px-7 py-3 border border-neutral-300 text-neutral-900 text-xs font-semibold uppercase tracking-widest hover:border-black transition-colors"
            >
              {t.nav.women} <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {displayedItems.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Chargement de vos favoris...</div>}>
      <WishlistContent />
    </Suspense>
  );
}
