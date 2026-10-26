"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon, Plus, Trash2, Star, Check, AlertCircle, Info, ExternalLink } from "lucide-react";
import { ProductFormData, ImageFormData, ValidationErrors } from "./types";

interface ProductImageUploaderProps {
  formData: ProductFormData;
  onChange: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
  errors: ValidationErrors;
}

export function ProductImageUploader({
  formData,
  onChange,
  errors,
}: ProductImageUploaderProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const addImage = () => {
    setUrlError(null);
    const trimmed = newImageUrl.trim();
    if (!trimmed) {
      setUrlError("Veuillez saisir une URL d'image valide.");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setUrlError("L'URL doit commencer par http:// ou https://");
      return;
    }

    const isFirst = formData.images.length === 0;
    const newImg: ImageFormData = {
      url: trimmed,
      is_cover: isFirst,
      sort_order: formData.images.length,
      alt_text_fr: formData.name_fr || "Visuel produit AVELOR",
    };

    onChange("images", [...formData.images, newImg]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    const wasCover = formData.images[index]?.is_cover;
    const updated = formData.images.filter((_, i) => i !== index);
    // Si on a supprimé la couverture et qu'il reste des images, désigner la première comme couverture
    if (wasCover && updated.length > 0) {
      updated[0].is_cover = true;
    }
    onChange("images", updated);
  };

  const setCoverImage = (index: number) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      is_cover: i === index,
    }));
    onChange("images", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF6EE] text-[#B08D57]">
            <ImageIcon className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
              D. Galerie Visuelle & Visuels Atelier ({formData.images.length} image{formData.images.length > 1 ? "s" : ""})
            </h3>
            <p className="text-[11px] text-[#737373]">
              Visuel de couverture principal et angles photographiques au ratio vertical haute couture (3:4).
            </p>
          </div>
        </div>
      </div>

      {errors.images && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.images}</span>
        </div>
      )}

      {/* Ajout d'image par URL */}
      <div className="border border-[#E5E5E5] bg-[#F8F7F5] p-4 space-y-3">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink">
          Ajouter une Image Haute Résolution par URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => {
              setNewImageUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="https://images.unsplash.com/... ou URL Supabase Storage"
            className="flex-1 rounded-none border border-[#E5E5E5] bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-neutral-400 focus:border-ink focus:outline-none"
          />
          <button
            type="button"
            onClick={addImage}
            className="flex items-center justify-center gap-1.5 bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ajouter au Lookbook</span>
          </button>
        </div>
        {urlError && (
          <p className="flex items-center gap-1 text-[11px] text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{urlError}</span>
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-[#737373]">
          <Info className="h-3 w-3 text-[#B08D57]" />
          <span>Recommandé : Ratio portrait 3:4 (ex: 1200x1600px). La première image est automatiquement définie comme couverture principale.</span>
        </div>
      </div>

      {/* Galerie des vignettes */}
      {formData.images.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E5E5] bg-paper py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF6EE] text-[#B08D57]">
            <ImageIcon className="h-6 w-6 stroke-1" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink">
            Aucun visuel associé
          </p>
          <p className="mt-1 max-w-sm text-[11px] text-[#737373]">
            Saisissez l'URL d'une image ci-dessus pour prévisualiser et organiser la galerie de cette création.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {formData.images.map((img, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden border transition-all ${
                img.is_cover
                  ? "border-[#B08D57] ring-2 ring-[#B08D57]/30 shadow-xs"
                  : "border-[#E5E5E5] bg-paper hover:border-neutral-400"
              }`}
            >
              {/* Aspect ratio 3/4 */}
              <div className="relative aspect-3/4 w-full bg-neutral-100">
                <Image
                  src={img.url}
                  alt={`Visuel ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover object-top"
                />

                {/* Badge Couverture */}
                {img.is_cover && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#B08D57] shadow-xs">
                    <Star className="h-2.5 w-2.5 fill-[#B08D57]" />
                    <span>Couverture</span>
                  </div>
                )}

                {/* Overlay d'actions au survol */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="flex h-7 w-7 items-center justify-center bg-white/90 text-neutral-800 hover:bg-red-600 hover:text-white transition-colors"
                      title="Supprimer cette image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {!img.is_cover && (
                    <button
                      type="button"
                      onClick={() => setCoverImage(index)}
                      className="w-full bg-[#B08D57] py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#9c7b49] transition-colors"
                    >
                      Définir en Couverture
                    </button>
                  )}
                </div>
              </div>

              {/* Barre sous l'image */}
              <div className="p-2 bg-paper border-t border-[#E5E5E5] text-[10px] text-[#737373] truncate">
                Visuel {index + 1} {img.is_cover ? "· Couverture" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
