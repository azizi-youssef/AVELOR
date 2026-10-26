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
import { ProductModal } from "./product-form/ProductModal";

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

  // État du produit en cours d'édition (ou null pour nouvelle création)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenForm = (product?: Product) => {
    setEditingProduct(product || null);
    onOpenModal(product);
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

      {/* ── Modal Haute Couture de Création / Modification de Produit ───────────── */}
      <ProductModal
        isOpen={showModal}
        onClose={onCloseModal}
        onSubmit={async (data, isEdit) => {
          if (isEdit && editingProduct) {
            await onUpdateProduct(editingProduct.id, {
              name_fr: data.name_fr.trim(),
              name_ar: data.name_ar.trim() || data.name_fr.trim(),
              short_desc_fr: data.short_desc_fr?.trim() || null,
              short_desc_ar: data.short_desc_ar?.trim() || null,
              description_fr: data.description_fr?.trim() || null,
              description_ar: data.description_ar?.trim() || null,
              material_fr: data.material_fr?.trim() || null,
              material_ar: data.material_ar?.trim() || null,
              base_price: parseFloat(data.base_price),
              discount_price: data.discount_price ? parseFloat(data.discount_price) : null,
              category_id: parseInt(data.category_id),
              universe: data.universe,
              is_new: data.is_new,
              is_featured: data.is_featured,
              is_active: data.is_active,
              variants: data.variants.map((v) => ({
                sku: v.sku.trim() || `${editingProduct.sku}-${v.size}`,
                size: v.size.trim(),
                color_name_fr: v.color_name_fr.trim(),
                color_name_ar: v.color_name_ar.trim() || v.color_name_fr.trim(),
                color_code: v.color_code.trim(),
                stock: v.stock || 0,
                is_active: v.is_active,
              })),
              images: data.images.map((img, idx) => ({
                url: img.url.trim(),
                alt_text_fr: img.alt_text_fr || data.name_fr,
                alt_text_ar: img.alt_text_ar || data.name_ar,
                is_cover: img.is_cover || (idx === 0),
                sort_order: img.sort_order || idx,
              })),
            });
          } else {
            await onCreateProduct({
              name_fr: data.name_fr.trim(),
              name_ar: data.name_ar.trim() || data.name_fr.trim(),
              sku: data.sku.trim().toUpperCase(),
              slug: data.slug.trim().toLowerCase(),
              short_desc_fr: data.short_desc_fr?.trim() || undefined,
              short_desc_ar: data.short_desc_ar?.trim() || undefined,
              description_fr: data.description_fr?.trim() || undefined,
              description_ar: data.description_ar?.trim() || undefined,
              material_fr: data.material_fr?.trim() || undefined,
              material_ar: data.material_ar?.trim() || undefined,
              base_price: parseFloat(data.base_price),
              discount_price: data.discount_price ? parseFloat(data.discount_price) : undefined,
              universe: data.universe,
              category_id: parseInt(data.category_id) || categories[0]?.id || 1,
              is_active: data.is_active,
              is_featured: data.is_featured,
              is_new: data.is_new,
              variants: data.variants.map((v) => ({
                sku: v.sku.trim() || `${data.sku.trim().toUpperCase()}-${v.size}`,
                size: v.size.trim(),
                color_name_fr: v.color_name_fr.trim(),
                color_name_ar: v.color_name_ar.trim() || v.color_name_fr.trim(),
                color_code: v.color_code.trim(),
                stock: v.stock || 0,
                is_active: v.is_active,
              })),
              images: data.images.map((img, idx) => ({
                url: img.url.trim(),
                alt_text_fr: img.alt_text_fr || data.name_fr,
                alt_text_ar: img.alt_text_ar || data.name_ar,
                is_cover: img.is_cover || (idx === 0),
                sort_order: img.sort_order || idx,
              })),
            });
          }
        }}
        editingProduct={editingProduct}
        categories={categories}
        existingProducts={productList}
      />
    </div>
  );
}
