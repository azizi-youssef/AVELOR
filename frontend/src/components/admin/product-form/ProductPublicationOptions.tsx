"use client";

import React from "react";
import { Eye, Sparkles, Star, Globe, Lock, ShieldCheck } from "lucide-react";
import { ProductFormData } from "./types";

interface ProductPublicationOptionsProps {
  formData: ProductFormData;
  onChange: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

export function ProductPublicationOptions({
  formData,
  onChange,
}: ProductPublicationOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF6EE] text-[#B08D57]">
          <Eye className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
            E. Visibilité, Publication & Badges
          </h3>
          <p className="text-[11px] text-[#737373]">
            Contrôle du cycle de vie du produit, mise en vedette et affichage sur la boutique publique.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Statut : Actif / Brouillon */}
        <div
          onClick={() => onChange("is_active", !formData.is_active)}
          className={`cursor-pointer border p-4 transition-all ${
            formData.is_active
              ? "border-ink bg-paper shadow-2xs"
              : "border-[#E5E5E5] bg-[#F8F7F5] opacity-75"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {formData.is_active ? (
                <Globe className="h-4 w-4 text-emerald-600" />
              ) : (
                <Lock className="h-4 w-4 text-neutral-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                {formData.is_active ? "Publié en Ligne" : "Brouillon Privé"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => onChange("is_active", e.target.checked)}
              className="h-4 w-4 accent-ink"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#737373]">
            {formData.is_active
              ? "La création est visible et achetable immédiatement sur la boutique AVELOR."
              : "Visible uniquement par les administrateurs pour préparation en atelier."}
          </p>
        </div>

        {/* Nouveauté */}
        <div
          onClick={() => onChange("is_new", !formData.is_new)}
          className={`cursor-pointer border p-4 transition-all ${
            formData.is_new
              ? "border-[#B08D57] bg-[#FAF6EE]/40 shadow-2xs"
              : "border-[#E5E5E5] bg-paper"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${formData.is_new ? "text-[#B08D57]" : "text-neutral-400"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Badge Nouveauté
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.is_new}
              onChange={(e) => onChange("is_new", e.target.checked)}
              className="h-4 w-4 accent-[#B08D57]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#737373]">
            Affiche un macaron discret &ldquo;NOUVEAU&rdquo; sur les listings et filtre dans la section Nouveautés.
          </p>
        </div>

        {/* Mise en vedette (Homepage) */}
        <div
          onClick={() => onChange("is_featured", !formData.is_featured)}
          className={`cursor-pointer border p-4 transition-all ${
            formData.is_featured
              ? "border-ink bg-paper shadow-2xs"
              : "border-[#E5E5E5] bg-paper"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star
                className={`h-4 w-4 ${
                  formData.is_featured ? "fill-ink text-ink" : "text-neutral-400"
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Sélection du Moment
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => onChange("is_featured", e.target.checked)}
              className="h-4 w-4 accent-ink"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#737373]">
            Propulse cette création directement sur la vitrine d'accueil dans &ldquo;La sélection du moment&rdquo;.
          </p>
        </div>
      </div>
    </div>
  );
}
