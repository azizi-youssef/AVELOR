"use client";

import React, { useState } from "react";
import { Plus, Trash2, Layers, AlertCircle, Sparkles, Check, Package } from "lucide-react";
import { ProductFormData, VariantFormData, ValidationErrors } from "./types";

interface ProductVariantsManagerProps {
  formData: ProductFormData;
  onChange: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
  errors: ValidationErrors;
}

const LUXURY_PALETTE = [
  { name_fr: "Noir Sartorial", name_ar: "أسود سارتوريال", hex: "#111111" },
  { name_fr: "Blanc Pur", name_ar: "أبيض ناصع", hex: "#FFFFFF" },
  { name_fr: "Bleu Nuit Céleste", name_ar: "أزرق ليلي", hex: "#0B1B3D" },
  { name_fr: "Vert Émeraude", name_ar: "أخضر زمردي", hex: "#0A3A2A" },
  { name_fr: "Camel Doré", name_ar: "جملي ملكي", hex: "#B08D57" },
  { name_fr: "Bordeaux Royal", name_ar: "عنابي ملكي", hex: "#58111A" },
  { name_fr: "Gris Anthracite", name_ar: "رمادي داكن", hex: "#3A3A3C" },
  { name_fr: "Ivoire Crêpe", name_ar: "عاجي كريب", hex: "#F3EDE2" },
];

export function ProductVariantsManager({
  formData,
  onChange,
  errors,
}: ProductVariantsManagerProps) {
  const [activeColorPreset, setActiveColorPreset] = useState<string>("#111111");

  const totalStock = formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

  const addVariant = () => {
    const nextIndex = formData.variants.length + 1;
    const baseSku = formData.sku || "AVL-MOD";
    const newVariant: VariantFormData = {
      sku: `${baseSku}-${nextIndex}`,
      size: "50",
      color_name_fr: "Noir Sartorial",
      color_name_ar: "أسود سارتوريال",
      color_code: "#111111",
      stock: 10,
      is_active: true,
    };
    onChange("variants", [...formData.variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      alert("Une pièce couture doit comporter au moins une variante ou taille active.");
      return;
    }
    const updated = formData.variants.filter((_, i) => i !== index);
    onChange("variants", updated);
  };

  const updateVariant = <K extends keyof VariantFormData>(
    index: number,
    field: K,
    val: VariantFormData[K]
  ) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: val };
    onChange("variants", updated);
  };

  // Générateurs rapides de grille de tailles
  const generateSizes = (sizes: string[]) => {
    const baseSku = formData.sku || "AVL-MOD";
    const selectedColor =
      formData.variants[0] || {
        color_name_fr: "Noir Sartorial",
        color_name_ar: "أسود سارتوريال",
        color_code: "#111111",
      };

    const newVariants: VariantFormData[] = sizes.map((size) => ({
      sku: `${baseSku}-${size}`,
      size,
      color_name_fr: selectedColor.color_name_fr,
      color_name_ar: selectedColor.color_name_ar,
      color_code: selectedColor.color_code,
      stock: 8,
      is_active: true,
    }));

    onChange("variants", newVariants);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF6EE] text-[#B08D57]">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
              C. Tailles, Nuances & Inventaire ({formData.variants.length} variante{formData.variants.length > 1 ? "s" : ""})
            </h3>
            <p className="text-[11px] text-[#737373]">
              Gestion multi-tailles, codes couleurs haute précision et stocks disponibles en atelier.
            </p>
          </div>
        </div>

        {/* Badge total stock */}
        <div className="flex items-center gap-2 border border-[#E5E5E5] bg-[#F8F7F5] px-3 py-1">
          <Package className="h-3.5 w-3.5 text-[#B08D57]" />
          <span className="text-[11px] font-mono font-bold text-ink">
            Stock Total : {totalStock} pièces
          </span>
        </div>
      </div>

      {errors.variants && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.variants}</span>
        </div>
      )}

      {/* Palette de nuances rapides */}
      <div className="space-y-2 border border-[#E5E5E5] bg-[#F8F7F5] p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink">
            Nuancier Haute Couture AVELOR (Application Rapide)
          </span>
          <span className="text-[10px] text-[#737373]">Cliquez pour sélectionner une couleur de référence</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {LUXURY_PALETTE.map((pal) => {
            const isSelected = activeColorPreset === pal.hex;
            return (
              <button
                key={pal.name_fr}
                type="button"
                onClick={() => {
                  setActiveColorPreset(pal.hex);
                  // Optionnel : appliquer à la première variante ou variante active
                  if (formData.variants.length > 0) {
                    updateVariant(0, "color_name_fr", pal.name_fr);
                    updateVariant(0, "color_name_ar", pal.name_ar);
                    updateVariant(0, "color_code", pal.hex);
                  }
                }}
                className={`group flex items-center gap-1.5 border px-2.5 py-1 text-xs transition-all ${
                  isSelected
                    ? "border-ink bg-paper shadow-xs"
                    : "border-transparent bg-paper/60 hover:border-neutral-300"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-neutral-300 shadow-2xs"
                  style={{ backgroundColor: pal.hex }}
                />
                <span className="text-[11px] font-medium text-ink">{pal.name_fr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Raccourcis de génération de tailles */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
          Générer grille :
        </span>
        <button
          type="button"
          onClick={() => generateSizes(["S", "M", "L", "XL"])}
          className="border border-[#E5E5E5] bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink hover:border-black"
        >
          Prêt-à-Porter (S, M, L, XL)
        </button>
        <button
          type="button"
          onClick={() => generateSizes(["48", "50", "52", "54", "56"])}
          className="border border-[#E5E5E5] bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink hover:border-black"
        >
          Costumes & Tailleurs (48 à 56)
        </button>
        <button
          type="button"
          onClick={() => generateSizes(["40", "41", "42", "43", "44", "45"])}
          className="border border-[#E5E5E5] bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink hover:border-black"
        >
          Souliers (40 à 45)
        </button>
        <button
          type="button"
          onClick={() => generateSizes(["Unique"])}
          className="border border-[#E5E5E5] bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink hover:border-black"
        >
          Taille Unique (Maroquinerie)
        </button>
      </div>

      {/* Liste des variantes */}
      <div className="space-y-3">
        {formData.variants.map((variant, index) => (
          <div
            key={index}
            className="group relative border border-[#E5E5E5] bg-paper p-4 transition-all hover:border-neutral-400 hover:shadow-2xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="font-mono text-xs font-bold text-ink">
                  SKU : {variant.sku || `${formData.sku || "AVL"}-${variant.size}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-600 transition-colors"
                  title="Supprimer cette variante"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
              {/* Taille */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  Taille *
                </label>
                <input
                  type="text"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, "size", e.target.value.trim())}
                  placeholder="50, L..."
                  className="w-full rounded-none border border-[#E5E5E5] bg-paper px-2.5 py-1.5 text-xs font-bold text-ink focus:border-ink focus:outline-none"
                />
              </div>

              {/* Nom couleur FR */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  Couleur (FR) *
                </label>
                <input
                  type="text"
                  value={variant.color_name_fr}
                  onChange={(e) => updateVariant(index, "color_name_fr", e.target.value)}
                  placeholder="Noir Sartorial"
                  className="w-full rounded-none border border-[#E5E5E5] bg-paper px-2.5 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
                />
              </div>

              {/* Nom couleur AR */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  اللون (AR)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={variant.color_name_ar}
                  onChange={(e) => updateVariant(index, "color_name_ar", e.target.value)}
                  placeholder="أسود ملكي"
                  className="w-full rounded-none border border-[#E5E5E5] bg-paper px-2.5 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
                />
              </div>

              {/* Sélecteur Code HEX */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  Nuance HEX *
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-300">
                    <input
                      type="color"
                      value={variant.color_code.startsWith("#") ? variant.color_code : "#111111"}
                      onChange={(e) => updateVariant(index, "color_code", e.target.value)}
                      className="absolute -inset-2 h-12 w-12 cursor-pointer opacity-0"
                    />
                    <div
                      className="h-full w-full rounded-full"
                      style={{ backgroundColor: variant.color_code }}
                    />
                  </div>
                  <input
                    type="text"
                    value={variant.color_code}
                    onChange={(e) => updateVariant(index, "color_code", e.target.value.toUpperCase())}
                    className="w-full font-mono rounded-none border border-[#E5E5E5] bg-paper px-2 py-1.5 text-[11px] text-ink focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  Stock Disponible *
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => updateVariant(index, "stock", Math.max(0, (variant.stock || 0) - 1))}
                    className="flex h-8 w-7 items-center justify-center border border-r-0 border-[#E5E5E5] bg-[#F8F7F5] text-xs font-bold hover:bg-neutral-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono rounded-none border border-[#E5E5E5] bg-paper py-1.5 text-center text-xs font-bold text-ink focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateVariant(index, "stock", (variant.stock || 0) + 1)}
                    className="flex h-8 w-7 items-center justify-center border border-l-0 border-[#E5E5E5] bg-[#F8F7F5] text-xs font-bold hover:bg-neutral-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton d'ajout */}
      <button
        type="button"
        onClick={addVariant}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-[#B08D57]/60 bg-[#FAF6EE]/40 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#B08D57] transition-all hover:border-[#B08D57] hover:bg-[#FAF6EE]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
