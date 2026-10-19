"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, ProductVariant } from "@/types";
import { api } from "@/lib/api";
import { initialProducts } from "@/lib/mock-data";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  Share2,
  ZoomIn,
  X,
  Ruler,
} from "lucide-react";

// ─── Lightbox Zoom ────────────────────────────────────────────────────────────
function ImageZoomModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image agrandie"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw] w-full aspect-[3/4]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt={alt} fill priority sizes="90vw" className="object-contain" />
      </div>
    </div>
  );
}

// ─── Accordéon ───────────────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-neutral-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-xs font-bold uppercase tracking-widest text-neutral-900 hover:text-black transition-colors"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>
      {open && (
        <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Modal Guide des Tailles ──────────────────────────────────────────────────
function SizeGuideModal({ onClose, isArabic }: { onClose: () => void; isArabic: boolean }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const sizes = [
    { size: "36", chest: "88", waist: "72", hips: "92" },
    { size: "38", chest: "92", waist: "76", hips: "96" },
    { size: "40", chest: "96", waist: "80", hips: "100" },
    { size: "42", chest: "100", waist: "84", hips: "104" },
    { size: "44", chest: "104", waist: "88", hips: "108" },
    { size: "46", chest: "108", waist: "92", hips: "112" },
    { size: "48", chest: "112", waist: "96", hips: "116" },
    { size: "50", chest: "116", waist: "100", hips: "120" },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center text-neutral-500 hover:text-black transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-5">
          {isArabic ? "دليل المقاسات" : "Guide des tailles"}
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          {isArabic
            ? "قياسات الجسم بالسنتيمتر — خذ القياسات في أوسع نقطة"
            : "Mesures de corps en centimètres — prendre les mensurations à l'endroit le plus large."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                <th className="border border-neutral-200 px-3 py-2 text-start font-bold uppercase tracking-wider">{isArabic ? "المقاس" : "Taille"}</th>
                <th className="border border-neutral-200 px-3 py-2 text-start font-bold uppercase tracking-wider">{isArabic ? "الصدر" : "Poitrine"}</th>
                <th className="border border-neutral-200 px-3 py-2 text-start font-bold uppercase tracking-wider">{isArabic ? "الخصر" : "Taille"}</th>
                <th className="border border-neutral-200 px-3 py-2 text-start font-bold uppercase tracking-wider">{isArabic ? "الأرداف" : "Hanches"}</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.size} className="hover:bg-neutral-50 transition-colors">
                  <td className="border border-neutral-200 px-3 py-2 font-semibold">{row.size}</td>
                  <td className="border border-neutral-200 px-3 py-2">{row.chest} cm</td>
                  <td className="border border-neutral-200 px-3 py-2">{row.waist} cm</td>
                  <td className="border border-neutral-200 px-3 py-2">{row.hips} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page Produit ─────────────────────────────────────────────────────────────
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { language, direction, t } = useLanguage();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isArabic = language === "ar";
  const ArrowIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProduct(slug),
      api.getSimilarProducts(slug).catch(() => []),
    ])
      .then(([data, sim]) => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const cover = data.images.find((img: any) => img.is_cover) || data.images[0];
          setSelectedImage(cover.url);
        }
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].size);
          setSelectedColor(data.variants[0].color_name_fr);
          setSelectedVariant(data.variants[0]);
        }
        setSimilarProducts(sim || []);
      })
      .catch(() => {
        // Fallback: chercher dans les données mock locales
        const mockProduct = initialProducts.find((p) => p.slug === slug);
        if (mockProduct) {
          setProduct(mockProduct);
          if (mockProduct.images && mockProduct.images.length > 0) {
            const cover = mockProduct.images.find((img) => img.is_cover) || mockProduct.images[0];
            setSelectedImage(cover.url);
          }
          if (mockProduct.variants && mockProduct.variants.length > 0) {
            setSelectedSize(mockProduct.variants[0].size);
            setSelectedColor(mockProduct.variants[0].color_name_fr);
            setSelectedVariant(mockProduct.variants[0]);
          }
          const similar = initialProducts
            .filter((p) => p.universe === mockProduct.universe && p.id !== mockProduct.id)
            .slice(0, 4);
          setSimilarProducts(similar);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product || !product.variants) return;
    const match = product.variants.find(
      (v) => v.size === selectedSize && (v.color_name_fr === selectedColor || v.color_name_ar === selectedColor)
    );
    if (match) {
      setSelectedVariant(match);
    } else {
      const fallback = product.variants.find((v) => v.size === selectedSize);
      if (fallback) setSelectedVariant(fallback);
    }
  }, [selectedSize, selectedColor, product]);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem(product!, selectedVariant, 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name_fr, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-4 bg-neutral-200 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-neutral-100" />
          <div className="space-y-6">
            <div className="h-8 bg-neutral-200 w-3/4" />
            <div className="h-5 bg-neutral-200 w-1/3" />
            <div className="h-24 bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif">{isArabic ? "المنتج غير موجود" : "Produit non trouvé"}</h2>
        <Link href="/" className="inline-block text-xs uppercase underline tracking-wider">
          {isArabic ? "العودة إلى الرئيسية" : "Retour à l'accueil"}
        </Link>
      </div>
    );
  }

  const name = isArabic ? product.name_ar : product.name_fr;
  const description = isArabic ? product.description_ar : product.description_fr;
  const basePrice = Number(product.base_price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const wishlisted = isWishlisted(product.id);

  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(
    new Map(product.variants.map((v) => [v.color_name_fr, { name_fr: v.color_name_fr, name_ar: v.color_name_ar, code: v.color_code }])).values()
  );

  return (
    <>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Fil d'Ariane */}
        <nav aria-label={isArabic ? "مسار التنقل" : "Fil d'ariane"} className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">{t.nav.home}</Link>
          <span aria-hidden>/</span>
          <Link href={product.universe === "MEN" ? "/homme" : "/femme"} className="hover:text-black transition-colors">
            {product.universe === "MEN" ? t.nav.men : t.nav.women}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-black truncate max-w-xs">{name}</span>
        </nav>

        {/* Grid principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Galerie */}
          <div className="space-y-4">
            <div className="relative group aspect-[3/4] w-full overflow-hidden bg-neutral-100 border border-neutral-100">
              <Image
                src={selectedImage || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop"}
                alt={name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white/90 backdrop-blur-sm text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label={isArabic ? "تكبير الصورة" : "Agrandir l'image"}
              >
                <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2" role="listbox" aria-label={isArabic ? "صور المنتج" : "Images du produit"}>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    role="option"
                    aria-selected={selectedImage === img.url}
                    className={`relative w-20 aspect-[3/4] flex-shrink-0 overflow-hidden border-2 transition-all ${
                      selectedImage === img.url ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt="" fill sizes="80px" className="object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Panneau achat */}
          <div className="space-y-7 flex flex-col">
            {/* Titre + actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block">
                  AVELOR · {product.sku}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black leading-tight">
                  {name}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                <button
                  onClick={() => toggleItem(product)}
                  aria-label={wishlisted ? (isArabic ? "إزالة من المفضلة" : "Retirer des favoris") : (isArabic ? "أضف إلى المفضلة" : "Ajouter aux favoris")}
                  className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                    wishlisted ? "border-black bg-black text-white" : "border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                  }`}
                >
                  <Heart className="h-4 w-4" strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label={isArabic ? "مشاركة المنتج" : "Partager ce produit"}
                  className="flex h-9 w-9 items-center justify-center border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Prix */}
            <div className="flex items-baseline gap-3">
              {discountPrice ? (
                <>
                  <span className="text-2xl font-serif font-medium text-black">
                    {discountPrice.toLocaleString("fr-MA")} {t.product.mad}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {basePrice.toLocaleString("fr-MA")} {t.product.mad}
                  </span>
                  <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    -{Math.round(((basePrice - discountPrice) / basePrice) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-serif font-medium text-black">
                  {basePrice.toLocaleString("fr-MA")} {t.product.mad}
                </span>
              )}
            </div>

            {/* Sélecteur Couleur */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-neutral-700">{t.product.color} :</span>
                <span className="text-neutral-500 font-medium">
                  {isArabic ? colors.find((c) => c.name_fr === selectedColor)?.name_ar : selectedColor}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(c.name_fr)}
                    aria-label={isArabic ? c.name_ar : c.name_fr}
                    aria-pressed={selectedColor === c.name_fr}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === c.name_fr ? "border-black scale-110" : "border-neutral-200 hover:border-neutral-500"
                    }`}
                    style={{ backgroundColor: c.code }}
                  >
                    {selectedColor === c.name_fr && (
                      <span className={`w-2 h-2 rounded-full ${
                        c.code.toLowerCase() === "#ffffff" || c.code.toLowerCase() === "#fffff0" ? "bg-black" : "bg-white"
                      }`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur Taille + Guide */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-neutral-700">{t.product.size} :</span>
                  {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 5 && (
                    <span className="text-amber-700 text-[11px] font-medium">
                      {isArabic ? `${selectedVariant.stock} ${t.product.stock_left}` : `Plus que ${selectedVariant.stock} ${t.product.stock_left}`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-500 underline underline-offset-2 hover:text-black transition-colors"
                >
                  <Ruler className="h-3 w-3" strokeWidth={1.5} />
                  {isArabic ? "دليل المقاسات" : "Guide des tailles"}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => {
                  const variantForSize = product.variants.find((v) => v.size === s && v.color_name_fr === selectedColor);
                  const isOutOfStock = !variantForSize || variantForSize.stock <= 0;
                  return (
                    <button
                      key={s}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s)}
                      aria-pressed={selectedSize === s}
                      className={`py-2.5 text-xs uppercase font-semibold border transition-all ${
                        selectedSize === s
                          ? "border-black bg-black text-white"
                          : isOutOfStock
                          ? "border-neutral-100 text-neutral-300 bg-neutral-50 cursor-not-allowed line-through"
                          : "border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton panier */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  !selectedVariant || selectedVariant.stock <= 0
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-neutral-800 active:scale-[0.99]"
                }`}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                <span>{!selectedVariant || selectedVariant.stock <= 0 ? t.product.out_of_stock : t.product.add_to_cart}</span>
              </button>

              {addedToast && (
                <div className="p-3 bg-neutral-900 text-white text-xs flex items-center justify-between fade-in" role="status" aria-live="polite">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>{isArabic ? "تمت الإضافة إلى السلة بنجاح." : "Article ajouté avec succès à votre panier."}</span>
                  </div>
                  <Link href="/cart" className="underline font-semibold hover:text-neutral-300">
                    {isArabic ? "رؤية السلة" : "Voir le panier"}
                  </Link>
                </div>
              )}
            </div>

            {/* Réassurance */}
            <div className="grid grid-cols-1 gap-2 border border-neutral-100 p-4 bg-neutral-50 text-xs text-neutral-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-neutral-800 shrink-0" strokeWidth={1.5} />
                <span>{isArabic ? "توصيل سريع لجميع أنحاء المغرب (24-48 ساعة)" : "Livraison express 24h-48h partout au Maroc"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-800 shrink-0" strokeWidth={1.5} />
                <span>{isArabic ? "الدفع نقداً عند الاستلام (COD)" : "Paiement en espèces à la livraison (COD)"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-neutral-800 shrink-0" strokeWidth={1.5} />
                <span>{isArabic ? "استبدال مجاني خلال 7 أيام" : "Échange de taille facile sous 7 jours"}</span>
              </div>
            </div>

            {/* Accordéons */}
            <div className="space-y-0">
              {description && (
                <Accordion title={t.product.details} defaultOpen>
                  <p>{description}</p>
                </Accordion>
              )}
              <Accordion title={isArabic ? "التركيبة والخامات" : "Composition & Matières"}>
                <p>{isArabic
                  ? "100% صوف إيطالي بكر — بطانة من الحرير الطبيعي — أزرار جوزة الهند الطبيعية"
                  : "100% laine vierge italienne — doublure soie naturelle — boutons nacre naturelle."}</p>
              </Accordion>
              <Accordion title={isArabic ? "تعليمات العناية والغسيل" : "Entretien & Lavage"}>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{isArabic ? "تنظيف جاف فقط" : "Nettoyage à sec uniquement"}</li>
                  <li>{isArabic ? "كي بحرارة منخفضة" : "Repassage à basse température"}</li>
                  <li>{isArabic ? "لا تغسل في الغسالة" : "Ne pas laver en machine"}</li>
                  <li>{isArabic ? "احفظها في كيس القماش المرفق" : "Conserver dans la housse fournie"}</li>
                </ul>
              </Accordion>
              <Accordion title={isArabic ? "الشحن والإرجاع" : "Livraison & Retours"}>
                <div className="space-y-2">
                  <p>{isArabic ? "توصيل مجاني لجميع الطلبات فوق 500 درهم." : "Livraison gratuite pour toute commande supérieure à 500 MAD."}</p>
                  <p>{isArabic ? "استبدال بالمقاس المناسب مجاني خلال 7 أيام من تاريخ الاستلام." : "Échange de taille offert pendant 7 jours après réception."}</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <section className="pt-12 border-t border-neutral-200">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-serif font-light uppercase tracking-wider text-black">
                {t.product.similar_products}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} priority={idx < 2} />
              ))}
            </div>
          </section>
        )}
      </div>

      {zoomOpen && selectedImage && (
        <ImageZoomModal src={selectedImage} alt={name} onClose={() => setZoomOpen(false)} />
      )}
      {sizeGuideOpen && (
        <SizeGuideModal onClose={() => setSizeGuideOpen(false)} isArabic={isArabic} />
      )}
    </>
  );
}
