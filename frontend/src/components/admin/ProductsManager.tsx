"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, Category, ProductVariant } from "@/types";
import {
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  X,
  Loader2,
  CheckCircle,
  Archive,
} from "lucide-react";

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateProduct: (data: any) => Promise<void>;
  onUpdateProduct: (id: number, data: any) => Promise<void>;
  onDeleteProduct: (id: number, name: string) => Promise<void>;
  showModal: boolean;
  onCloseModal: () => void;
  onOpenModal: (product?: Product) => void;
}

export function ProductsManager({
  products,
  categories,
  searchQuery,
  onSearchChange,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  showModal,
  onCloseModal,
  onOpenModal,
}: ProductsManagerProps) {
  const [universeFilter, setUniverseFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formNameFr, setFormNameFr] = useState("");
  const [formNameAr, setFormNameAr] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formUniverse, setFormUniverse] = useState<"MEN" | "WOMEN">("MEN");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSize, setFormSize] = useState("50");
  const [formColor, setFormColor] = useState("Noir Sartorial");
  const [formColorCode, setFormColorCode] = useState("#111111");
  const [formStock, setFormStock] = useState("12");
  const [formImageUrl, setFormImageUrl] = useState("");

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormNameFr(product.name_fr);
      setFormNameAr(product.name_ar);
      setFormSku(product.sku);
      setFormSlug(product.slug);
      setFormPrice(String(product.base_price));
      setFormDiscount(product.discount_price ? String(product.discount_price) : "");
      setFormUniverse(product.universe === "WOMEN" ? "WOMEN" : "MEN");
      setFormCategoryId(String(product.category_id));
      setFormIsNew(product.is_new);
      setFormIsFeatured(product.is_featured);
      setFormImageUrl(product.images?.[0]?.url || "");
    } else {
      setEditingProduct(null);
      setFormNameFr("");
      setFormNameAr("");
      setFormSku("");
      setFormSlug("");
      setFormPrice("");
      setFormDiscount("");
      setFormUniverse("MEN");
      setFormCategoryId(categories[0]?.id ? String(categories[0].id) : "1");
      setFormIsNew(true);
      setFormIsFeatured(false);
      setFormSize("50");
      setFormColor("Noir Sartorial");
      setFormColorCode("#111111");
      setFormStock("10");
      setFormImageUrl("");
    }
    onOpenModal(product);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, {
          name_fr: formNameFr.trim(),
          name_ar: formNameAr.trim() || formNameFr.trim(),
          base_price: parseFloat(formPrice),
          discount_price: formDiscount ? parseFloat(formDiscount) : null,
          category_id: parseInt(formCategoryId),
          universe: formUniverse,
          is_new: formIsNew,
          is_featured: formIsFeatured,
        });
      } else {
        await onCreateProduct({
          name_fr: formNameFr.trim(),
          name_ar: formNameAr.trim() || formNameFr.trim(),
          sku: formSku.trim().toUpperCase(),
          slug: formSlug.trim().toLowerCase(),
          base_price: parseFloat(formPrice),
          discount_price: formDiscount ? parseFloat(formDiscount) : undefined,
          universe: formUniverse,
          category_id: parseInt(formCategoryId) || categories[0]?.id || 1,
          is_active: true,
          is_featured: formIsFeatured,
          is_new: formIsNew,
          variants: [
            {
              sku: `${formSku.trim().toUpperCase()}-${formSize}`,
              size: formSize,
              color_name_fr: formColor,
              color_name_ar: formColor,
              color_code: formColorCode,
              stock: parseInt(formStock) || 0,
              is_active: true,
            },
          ],
          images: formImageUrl
            ? [{ url: formImageUrl.trim(), is_cover: true, sort_order: 0 }]
            : [],
        });
      }
      onCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  const productList: Product[] = useMemo(() => {
    if (Array.isArray(products)) return products;
    if (products && Array.isArray((products as { items?: Product[] }).items)) {
      return (products as { items: Product[] }).items;
    }
    return [];
  }, [products]);

  const filtered = useMemo(() => {
    return productList.filter((p: Product) => {
      const matchUniverse = universeFilter === "ALL" || p.universe === universeFilter;
      const matchCategory =
        categoryFilter === "ALL" || String(p.category_id) === categoryFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? p.is_active : !p.is_active);
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.name_fr?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q);

      return matchUniverse && matchCategory && matchStatus && matchSearch;
    });
  }, [productList, universeFilter, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ── Barre de Filtres ───────────────────────────────────── */}
      <div className="bg-white border border-neutral-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Univers */}
            <select
              value={universeFilter}
              onChange={(e) => setUniverseFilter(e.target.value)}
              className="h-9 border border-neutral-300 bg-neutral-50 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-800 outline-none focus:border-black focus:bg-white"
            >
              <option value="ALL">Tous les Univers</option>
              <option value="MEN">AVELOR HOMME</option>
              <option value="WOMEN">AVELOR FEMME</option>
            </select>

            {/* Catégorie */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 border border-neutral-300 bg-neutral-50 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-800 outline-none focus:border-black focus:bg-white"
            >
              <option value="ALL">Toutes les Catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name_fr} ({c.universe === "MEN" ? "Homme" : "Femme"})
                </option>
              ))}
            </select>

            {/* Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 border border-neutral-300 bg-neutral-50 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-800 outline-none focus:border-black focus:bg-white"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="ACTIVE">Actifs en Boutique</option>
              <option value="ARCHIVED">Archivés</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-500 font-semibold">
              {filtered.length} pièce{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => handleOpenForm()}
              className="flex h-9 items-center gap-1.5 bg-black px-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Produit</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tableau des Produits ────────────────────────────────── */}
      <div className="bg-white border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Visuel</th>
                <th className="py-3 px-4">Modèle & SKU</th>
                <th className="py-3 px-4">Univers</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix Public</th>
                <th className="py-3 px-4">Variantes & Stock</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-neutral-400">
                    Aucun produit ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filtered.map((prod: Product) => {
                  const cover =
                    prod.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200";
                  const totalStock = prod.variants?.reduce((sum: number, v: ProductVariant) => sum + v.stock, 0) || 0;
                  const price = Number(prod.base_price);
                  const discount = prod.discount_price ? Number(prod.discount_price) : null;

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Image */}
                      <td className="py-3 px-4">
                        <div className="relative w-12 aspect-3/4 shrink-0 bg-neutral-100 border border-neutral-200 overflow-hidden">
                          <Image
                            src={cover}
                            alt={prod.name_fr}
                            fill
                            sizes="48px"
                            className="object-cover object-top"
                          />
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-neutral-900">{prod.name_fr}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          SKU: {prod.sku} · /{prod.slug}
                        </p>
                      </td>

                      {/* Universe */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            prod.universe === "MEN"
                              ? "bg-neutral-900 text-white"
                              : "bg-[#9c8053] text-white"
                          }`}
                        >
                          {prod.universe === "MEN" ? "Homme" : "Femme"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-neutral-700">
                        {prod.category?.name_fr || "Général"}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono">
                        {discount ? (
                          <div>
                            <span className="font-bold text-black">
                              {discount.toLocaleString("fr-MA")} MAD
                            </span>
                            <span className="ms-1.5 text-[10px] text-neutral-400 line-through">
                              {price.toLocaleString("fr-MA")}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-black">
                            {price.toLocaleString("fr-MA")} MAD
                          </span>
                        )}
                      </td>

                      {/* Variants & Stock */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-bold ${
                            totalStock === 0
                              ? "text-red-700"
                              : totalStock < 5
                              ? "text-amber-700"
                              : "text-neutral-800"
                          }`}
                        >
                          {totalStock} ex.
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-sans">
                          {prod.variants?.length || 0} variante{(prod.variants?.length || 0) > 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                            prod.is_active
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                              : "bg-neutral-100 text-neutral-500 border-neutral-300"
                          }`}
                        >
                          {prod.is_active ? "Actif" : "Archivé"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-500 hover:text-black border border-transparent hover:border-neutral-200"
                            title="Voir sur le site public"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenForm(prod)}
                            className="p-1.5 text-neutral-700 hover:text-black border border-transparent hover:border-neutral-200"
                            title="Modifier ce produit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {prod.is_active && (
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(prod.id, prod.name_fr)}
                              className="p-1.5 text-red-600 hover:text-red-800 border border-transparent hover:border-red-200"
                              title="Désactiver / Archiver"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Création / Modification de Produit ───────────── */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            onClick={onCloseModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c8053]">
                  {editingProduct ? "Fiche Atelier" : "Nouvelle Création"}
                </span>
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black">
                  {editingProduct ? `Modifier : ${editingProduct.name_fr}` : "Publier une Pièce Couture"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseModal}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Noms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Nom du Produit (Français) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameFr}
                    onChange={(e) => setFormNameFr(e.target.value)}
                    placeholder="Ex: Costume Croisé en Laine 130s"
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Nom du Produit (Arabe)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="بدلة رسمية من الصوف الملكي"
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50"
                  />
                </div>
              </div>

              {/* SKU & Slug (uniquement création) */}
              {!editingProduct && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      SKU Modèle (Unique) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                      placeholder="Ex: AVL-CST-01"
                      className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Slug URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase())}
                      placeholder="Ex: costume-croise-laine-130s"
                      className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Prix & Remise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Prix de Base (MAD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="4200.00"
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Prix Promotionnel (Optionnel, MAD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    placeholder="Laisser vide si pas de promo"
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50 font-mono"
                  />
                </div>
              </div>

              {/* Univers & Catégorie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Univers de Shopping *
                  </label>
                  <select
                    value={formUniverse}
                    onChange={(e) => setFormUniverse(e.target.value as any)}
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50 font-semibold"
                  >
                    <option value="MEN">AVELOR HOMME</option>
                    <option value="WOMEN">AVELOR FEMME</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Catégorie de Vestiaire *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name_fr} ({c.universe === "MEN" ? "Homme" : "Femme"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Première variante (en création) */}
              {!editingProduct && (
                <div className="border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                    Variante Initiale & Stock
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-1">Taille</label>
                      <input
                        type="text"
                        value={formSize}
                        onChange={(e) => setFormSize(e.target.value)}
                        className="w-full border border-neutral-300 p-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-1">Couleur (Nom)</label>
                      <input
                        type="text"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="w-full border border-neutral-300 p-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-1">Code Hex</label>
                      <input
                        type="text"
                        value={formColorCode}
                        onChange={(e) => setFormColorCode(e.target.value)}
                        className="w-full border border-neutral-300 p-1.5 text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-1">Stock Initial</label>
                      <input
                        type="number"
                        min={0}
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="w-full border border-neutral-300 p-1.5 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image URL */}
              {!editingProduct && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    URL Visuel Principal (Cover)
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-neutral-300 p-2 text-xs focus:border-black outline-none bg-neutral-50"
                  />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsNew}
                    onChange={(e) => setFormIsNew(e.target.checked)}
                    className="h-4 w-4 accent-black"
                  />
                  <span className="text-xs font-semibold">Marquer "Nouveauté"</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-black"
                  />
                  <span className="text-xs font-semibold">Mettre en Vedette (Home)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold uppercase tracking-wider text-xs hover:bg-neutral-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-black px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Enregistrer les modifications" : "Publier le Produit"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
