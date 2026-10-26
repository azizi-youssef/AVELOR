"use client";

import React from "react";
import { Sparkles, RefreshCw, AlertCircle, FileText, Layers } from "lucide-react";
import { ProductFormData, ValidationErrors } from "./types";

interface ProductGeneralInformationProps {
  formData: ProductFormData;
  onChange: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
  errors: ValidationErrors;
  isEditing: boolean;
}

export function ProductGeneralInformation({
  formData,
  onChange,
  errors,
  isEditing,
}: ProductGeneralInformationProps) {
  const generateSlugFromName = () => {
    if (!formData.name_fr.trim()) return;
    const generated = formData.name_fr
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlève accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    onChange("slug", generated);
  };

  const generateSkuFromName = () => {
    if (!formData.name_fr.trim() && !formData.universe) return;
    const prefix = formData.universe === "WOMEN" ? "AVL-FEM" : "AVL-HOM";
    const cleanWord = formData.name_fr
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3) || "MOD";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    onChange("sku", `${prefix}-${cleanWord}-${randomSuffix}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF6EE] text-[#B08D57]">
          <FileText className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
            A. Informations Générales & Fiche Atelier
          </h3>
          <p className="text-[11px] text-[#737373]">
            Titres bilingues, identifiants uniques et narration éditoriale de la pièce.
          </p>
        </div>
      </div>

      {/* Titres Français et Arabe */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Nom FR */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink">
            <span>Nom du Produit (Français) *</span>
            <span className="text-[10px] text-[#737373] font-normal">Recommandé : 3 à 8 mots</span>
          </label>
          <input
            type="text"
            value={formData.name_fr}
            onChange={(e) => {
              onChange("name_fr", e.target.value);
              if (!formData.slug && !isEditing) {
                const auto = e.target.value
                  .toLowerCase()
                  .trim()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                onChange("slug", auto);
              }
            }}
            placeholder="Ex: Costume Croisé en Laine Royale Italienne"
            className={`w-full rounded-none border px-3.5 py-2.5 text-xs text-ink transition-all placeholder:text-neutral-400 focus:outline-none ${
              errors.name_fr
                ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#E5E5E5] bg-paper hover:border-neutral-400 focus:border-ink focus:ring-1 focus:ring-ink"
            }`}
          />
          {errors.name_fr && (
            <p className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.name_fr}</span>
            </p>
          )}
        </div>

        {/* Nom AR */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink">
            <span>Nom du Produit (Arabe) *</span>
            <span className="text-[10px] text-[#B08D57] font-serif">العربية</span>
          </label>
          <input
            type="text"
            dir="rtl"
            value={formData.name_ar}
            onChange={(e) => onChange("name_ar", e.target.value)}
            placeholder="بدلة رسمية متقنة من الصوف الإيطالي الملكي"
            className={`w-full rounded-none border px-3.5 py-2.5 text-xs text-ink transition-all placeholder:text-neutral-400 focus:outline-none ${
              errors.name_ar
                ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#E5E5E5] bg-paper hover:border-neutral-400 focus:border-ink focus:ring-1 focus:ring-ink"
            }`}
          />
          {errors.name_ar && (
            <p className="flex items-center gap-1 text-[11px] text-red-600" dir="rtl">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.name_ar}</span>
            </p>
          )}
        </div>
      </div>

      {/* SKU & Slug */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* SKU */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
              SKU Modèle (Identifiant Unique) *
            </label>
            {!isEditing && (
              <button
                type="button"
                onClick={generateSkuFromName}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#B08D57] hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                <span>Générer</span>
              </button>
            )}
          </div>
          <input
            type="text"
            disabled={isEditing}
            value={formData.sku}
            onChange={(e) => onChange("sku", e.target.value.toUpperCase().trim())}
            placeholder="Ex: AVL-CST-101"
            className={`w-full font-mono rounded-none border px-3.5 py-2.5 text-xs transition-all placeholder:text-neutral-400 focus:outline-none ${
              isEditing ? "bg-[#F8F7F5] text-[#737373] cursor-not-allowed border-[#E5E5E5]" : ""
            } ${
              errors.sku
                ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#E5E5E5] bg-paper hover:border-neutral-400 focus:border-ink focus:ring-1 focus:ring-ink"
            }`}
          />
          {errors.sku && (
            <p className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.sku}</span>
            </p>
          )}
          <p className="text-[10px] text-[#737373]">
            Format recommandé : AVL-[UNIVERS]-[TYPE]-[NUM]. Sert de racine pour les variantes.
          </p>
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
              Slug URL Permanente *
            </label>
            {!isEditing && (
              <button
                type="button"
                onClick={generateSlugFromName}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#B08D57] hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Synchroniser nom</span>
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 text-[11px] font-mono text-[#737373]">
              /products/
            </span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                onChange(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                )
              }
              placeholder="costume-croise-laine-royale"
              className={`w-full font-mono rounded-none border py-2.5 pl-22 pr-3.5 text-xs text-ink transition-all placeholder:text-neutral-400 focus:outline-none ${
                errors.slug
                  ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#E5E5E5] bg-paper hover:border-neutral-400 focus:border-ink focus:ring-1 focus:ring-ink"
              }`}
            />
          </div>
          {errors.slug && (
            <p className="flex items-center gap-1 text-[11px] text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.slug}</span>
            </p>
          )}
        </div>
      </div>

      {/* Matières & Composition */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            Composition & Matières d'Exception (FR)
          </label>
          <input
            type="text"
            value={formData.material_fr}
            onChange={(e) => onChange("material_fr", e.target.value)}
            placeholder="Ex: 100% Laine Vierge Super 130s italienne, doublure soie"
            className="w-full rounded-none border border-[#E5E5E5] bg-paper px-3.5 py-2.5 text-xs text-ink transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            المواد والخامات النبيلة (AR)
          </label>
          <input
            type="text"
            dir="rtl"
            value={formData.material_ar}
            onChange={(e) => onChange("material_ar", e.target.value)}
            placeholder="مثال: 100% صوف بكر سوبر 130s إيطالي، بطانة من الحرير الطبيعي"
            className="w-full rounded-none border border-[#E5E5E5] bg-paper px-3.5 py-2.5 text-xs text-ink transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>
      </div>

      {/* Description courte */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            Accroche / Description Courte (FR)
          </label>
          <input
            type="text"
            value={formData.short_desc_fr}
            onChange={(e) => onChange("short_desc_fr", e.target.value)}
            placeholder="Ex: Silhouette sartoriale affirmée, finitions atelier cousues main."
            className="w-full rounded-none border border-[#E5E5E5] bg-paper px-3.5 py-2 text-xs text-ink transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-ink focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            الوصف المختصر (AR)
          </label>
          <input
            type="text"
            dir="rtl"
            value={formData.short_desc_ar}
            onChange={(e) => onChange("short_desc_ar", e.target.value)}
            placeholder="قصة عصرية فاخرة وتشطيبات يدوية راقية."
            className="w-full rounded-none border border-[#E5E5E5] bg-paper px-3.5 py-2 text-xs text-ink transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-ink focus:outline-none"
          />
        </div>
      </div>

      {/* Description Détaillée */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            Description Détaillée Éditoriale (FR)
          </label>
          <textarea
            rows={4}
            value={formData.description_fr}
            onChange={(e) => onChange("description_fr", e.target.value)}
            placeholder="Détails de coupe, doublures intérieures, conseils de port et entretien..."
            className="w-full rounded-none border border-[#E5E5E5] bg-paper p-3 text-xs leading-relaxed text-ink transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-ink focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink">
            الوصف التفصيلي للقطعة (AR)
          </label>
          <textarea
            rows={4}
            dir="rtl"
            value={formData.description_ar}
            onChange={(e) => onChange("description_ar", e.target.value)}
            placeholder="تفاصيل الخياطة، البطانات الفاخرة، إرشادات الارتداء والعناية..."
            className="w-full rounded-none border border-[#E5E5E5] bg-paper p-3 text-xs leading-relaxed text-ink transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-ink focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
