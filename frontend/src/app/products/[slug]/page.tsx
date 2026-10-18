"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, ProductVariant } from "@/types";
import { api } from "@/lib/api";
import { ShieldCheck, Truck, RotateCcw, Check, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { language, direction, t } = useLanguage();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const ArrowIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    setLoading(true);
    api.getProduct(slug)
      .then((data) => {
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
      })
      .catch((err) => console.error("Erreur chargement produit:", err))
      .finally(() => setLoading(false));

    api.getSimilarProducts(slug)
      .then((sim) => setSimilarProducts(sim || []))
      .catch((err) => console.error("Erreur similaires:", err));
  }, [slug]);

  // Synchroniser la variante selon taille et couleur choisies
  useEffect(() => {
    if (!product || !product.variants) return;
    const match = product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (v.color_name_fr === selectedColor || v.color_name_ar === selectedColor)
    );
    if (match) {
      setSelectedVariant(match);
    } else {
      const fallback = product.variants.find((v) => v.size === selectedSize);
      if (fallback) setSelectedVariant(fallback);
    }
  }, [selectedSize, selectedColor, product]);

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
        <h2 className="text-2xl font-serif">Produit non trouvé</h2>
        <Link href="/" className="inline-block text-xs uppercase underline tracking-wider">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const name = language === "ar" ? product.name_ar : product.name_fr;
  const description = language === "ar" ? product.description_ar : product.description_fr;
  const basePrice = Number(product.base_price);
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;

  // Tailles disponibles uniques
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  // Couleurs disponibles
  const colors = Array.from(
    new Map(
      product.variants.map((v) => [
        v.color_name_fr,
        {
          name_fr: v.color_name_fr,
          name_ar: v.color_name_ar,
          code: v.color_code,
        },
      ])
    ).values()
  );

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem(product, selectedVariant, 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-black transition-colors">
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link
          href={product.universe === "MEN" ? "/homme" : "/femme"}
          className="hover:text-black transition-colors"
        >
          {product.universe === "MEN" ? t.nav.men : t.nav.women}
        </Link>
        <span>/</span>
        <span className="text-black truncate max-w-xs">{name}</span>
      </nav>

      {/* Détails du produit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Galerie d'Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 border border-neutral-100">
            <Image
              src={selectedImage || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop"}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>

          {/* Miniatures */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 aspect-[3/4] flex-shrink-0 overflow-hidden border-2 transition-all ${
                    selectedImage === img.url ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt="Miniature"
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panneau d'achat et sélection */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block mb-1">
                AVELOR Atelier &bull; {product.sku}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
                {name}
              </h1>
            </div>

            {/* Prix en MAD */}
            <div className="flex items-baseline gap-3">
              {discountPrice ? (
                <>
                  <span className="text-2xl font-serif font-medium text-black">
                    {discountPrice.toLocaleString("fr-MA")} {t.product.mad}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {basePrice.toLocaleString("fr-MA")} {t.product.mad}
                  </span>
                  <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ml-2">
                    PROMO
                  </span>
                </>
              ) : (
                <span className="text-2xl font-serif font-medium text-black">
                  {basePrice.toLocaleString("fr-MA")} {t.product.mad}
                </span>
              )}
            </div>

            {/* Sélecteur de Couleur */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-neutral-700">
                  {t.product.color} :
                </span>
                <span className="text-neutral-500 font-medium">
                  {language === "ar"
                    ? colors.find((c) => c.name_fr === selectedColor)?.name_ar
                    : selectedColor}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(c.name_fr)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === c.name_fr ? "border-black scale-110" : "border-neutral-300 hover:border-neutral-500"
                    }`}
                    style={{ backgroundColor: c.code }}
                    title={language === "ar" ? c.name_ar : c.name_fr}
                  >
                    {selectedColor === c.name_fr && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          c.code.toLowerCase() === "#ffffff" || c.code.toLowerCase() === "#fffff0"
                            ? "bg-black"
                            : "bg-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur de Taille */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-neutral-700">
                  {t.product.size} :
                </span>
                {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 5 && (
                  <span className="text-amber-700 text-[11px] font-medium">
                    Plus que {selectedVariant.stock} {t.product.stock_left}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => {
                  const variantForSize = product.variants.find(
                    (v) => v.size === s && v.color_name_fr === selectedColor
                  );
                  const isOutOfStock = !variantForSize || variantForSize.stock <= 0;

                  return (
                    <button
                      key={s}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 text-xs uppercase font-semibold border transition-all ${
                        selectedSize === s
                          ? "border-black bg-black text-white"
                          : isOutOfStock
                          ? "border-neutral-200 text-neutral-300 bg-neutral-50 cursor-not-allowed line-through"
                          : "border-neutral-200 text-neutral-800 hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton d'Ajout au Panier */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  !selectedVariant || selectedVariant.stock <= 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-neutral-800 active:scale-[0.99]"
                }`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                <span>
                  {!selectedVariant || selectedVariant.stock <= 0
                    ? t.product.out_of_stock
                    : t.product.add_to_cart}
                </span>
              </button>

              {/* Toast de confirmation */}
              {addedToast && (
                <div className="mt-3 p-3 bg-neutral-900 text-white text-xs flex items-center justify-between fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Article ajouté avec succès à votre panier.</span>
                  </div>
                  <Link href="/cart" className="underline font-semibold hover:text-neutral-300">
                    Voir le panier
                  </Link>
                </div>
              )}
            </div>

            {/* Réassurance Rapide */}
            <div className="border-t border-neutral-100 pt-6 space-y-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-neutral-800" />
                <span>Livraison express à domicile au Maroc (24h à 48h).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-800" />
                <span>Paiement en espèces lors de la livraison (Cash on Delivery).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-neutral-800" />
                <span>Échange de taille facile sous 7 jours.</span>
              </div>
            </div>
          </div>

          {/* Description & Confection */}
          <div className="border-t border-neutral-200 pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              {t.product.details}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Produits Similaires */}
      {similarProducts.length > 0 && (
        <section className="pt-12 border-t border-neutral-200">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-light uppercase tracking-wider text-black">
              {t.product.similar_products}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
