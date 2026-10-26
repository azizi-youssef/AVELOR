"use client";

import React from "react";
import { Tag, Sparkles, AlertCircle, Percent, Shirt, Crown, UserCheck } from "lucide-react";
import { Category, GenderUniverse } from "@/types";
import { ProductFormData, ValidationErrors } from "./types";

interface ProductPricingSectionProps {
  formData: ProductFormData;
  onChange: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
  errors: ValidationErrors;
  categories: Category[];
}

export function ProductPricingSection({
  formData,
  onChange,
  errors,
  categories,
}: ProductPricingSectionProps) {
  const baseNum = parseFloat(formData.base_price) || 0;
  const discNum = parseFloat(formData.discount_price) || 0;
  const hasDiscount = discNum > 0 && discNum < baseNum;
  const discountPercent = hasDiscount ? Math.round(((baseNum - discNum) / baseNum) * 100) : 0;
  const savings = hasDiscount ? baseNum - discNum : 0;

  // Filtrer les catégories selon l'univers choisi (si univers choisi)
  const filteredCategories = categories.filter((c) => {
    if (formData.universe === "UNISEX") return true;
    return c.universe === formData.universe || c.universe === "UNISEX";
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF6EE] text-[#B08D57]">
          <Tag className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
            B. Prix, Remise & Classification Vestiaire
          </h3>
          <p className="text-[11px] text-[#737373]">
            Tarification en Dirhams marocains (MAD), privilèges promotionnels et univers.
          </p>
        </div>
      </div>

      {/* Univers de Shopping */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
          Univers Couture de Shopping *
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Homme */}
          <button
            type="button"
            onClick={() => onChange("universe", "MEN")}
            className={`flex items-center justify-between border p-3 text-start transition-all ${
              formData.universe === "MEN"
                ? "border-ink bg-ink text-white shadow-xs"
                : "border-[#E5E5E5] bg-paper text-ink hover:border-neutral-400"
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider">AVELOR Homme</span>
              <p className={`text-[10px] ${formData.universe === "MEN" ? "text-neutral-300" : "text-[#737373]"}`}>
                Sartorial, vestes, costumes
              </p>
            </div>
            <Shirt className={`h-4 w-4 ${formData.universe === "MEN" ? "text-[#B08D57]" : "text-neutral-400"}`} />
          </button>

          {/* Femme */}
          <button
            type="button"
            onClick={() => onChange("universe", "WOMEN")}
            className={`flex items-center justify-between border p-3 text-start transition-all ${
              formData.universe === "WOMEN"
                ? "border-ink bg-ink text-white shadow-xs"
                : "border-[#E5E5E5] bg-paper text-ink hover:border-neutral-400"
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider">AVELOR Femme</span>
              <p className={`text-[10px] ${formData.universe === "WOMEN" ? "text-neutral-300" : "text-[#737373]"}`}>
                Robes de soirée, tailleurs, soie
              </p>
            </div>
            <Crown className={`h-4 w-4 ${formData.universe === "WOMEN" ? "text-[#B08D57]" : "text-neutral-400"}`} />
          </button>

          {/* Unisexe */}
          <button
            type="button"
            onClick={() => onChange("universe", "UNISEX")}
            className={`flex items-center justify-between border p-3 text-start transition-all ${
              formData.universe === "UNISEX"
                ? "border-ink bg-ink text-white shadow-xs"
                : "border-[#E5E5E5] bg-paper text-ink hover:border-neutral-400"
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider">Collection Mixte</span>
              <p className={`text-[10px] ${formData.universe === "UNISEX" ? "text-neutral-300" : "text-[#737373]"}`}>
                Maroquinerie, accessoires d'art
              </p>
            </div>
            <UserCheck className={`h-4 w-4 ${formData.universe === "UNISEX" ? "text-[#B08D57]" : "text-neutral-400"}`} />
          </button>
        </div>
      </div>

      {/* Catégorie & Tarifs */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Catégorie */}
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            Catégorie de Vestiaire *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => onChange("category_id", e.target.value)}
            className={`w-full rounded-none border bg-paper px-3.5 py-2.5 text-xs font-medium text-ink transition-all hover:border-neutral-400 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink ${
              errors.category_id ? "border-red-500 bg-red-50/20" : "border-[#E5E5E5]"
            }`}
          >
            <option value="">Sélectionner une catégorie...</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name_fr} ({c.universe === "MEN" ? "Homme" : c.universe === "WOMEN" ? "Femme" : "Unisexe"})
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.category_id}</span>
            </p>
          )}
        </div>

        {/* Prix de base */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            Prix de Base Public (MAD) *
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => onChange("base_price", e.target.value)}
              placeholder="Ex: 4800.00"
              className={`w-full font-mono rounded-none border px-3.5 py-2.5 pr-14 text-xs text-ink transition-all placeholder:text-neutral-400 focus:outline-none ${
                errors.base_price
                  ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#E5E5E5] bg-paper hover:border-neutral-400 focus:border-ink focus:ring-1 focus:ring-ink"
              }`}
            />
            <span className="pointer-events-none absolute right-3 text-[11px] font-semibold text-[#737373]">
              MAD
            </span>
          </div>
          {errors.base_price && (
            <p className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.base_price}</span>
            </p>
          )}
        </div>

        {/* Prix promotionnel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
              Prix Remisé (Optionnel)
            </label>
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] px-1.5 py-0.5 text-[10px] font-bold text-[#B08D57]">
                <Percent className="h-2.5 w-2.5" />
                <span>-{discountPercent}%</span>
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.discount_price}
              onChange={(e) => onChange("discount_price", e.target.value)}
              placeholder="Laisser vide si pas de promo"
              className={`w-full font-mono rounded-none border px-3.5 py-2.5 pr-14 text-xs text-ink transition-all placeholder:text-neutral-400 focus:outline-none ${
                errors.discount_price
                  ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#E5E5E5] bg-paper hover:border-neutral-400 focus:border-ink focus:ring-1 focus:ring-ink"
              }`}
            />
            <span className="pointer-events-none absolute right-3 text-[11px] font-semibold text-[#737373]">
              MAD
            </span>
          </div>
          {errors.discount_price && (
            <p className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.discount_price}</span>
            </p>
          )}
          {hasDiscount && (
            <p className="text-[10px] text-emerald-700 font-medium">
              Économie client : {savings.toLocaleString("fr-MA")} MAD sur cette pièce.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
