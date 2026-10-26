"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Sparkles, Layers, Tag, ImageIcon, Eye, FileText, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProductFormData,
  ProductModalProps,
  ValidationErrors,
  FormTab,
} from "./types";
import { ProductGeneralInformation } from "./ProductGeneralInformation";
import { ProductPricingSection } from "./ProductPricingSection";
import { ProductVariantsManager } from "./ProductVariantsManager";
import { ProductImageUploader } from "./ProductImageUploader";
import { ProductPublicationOptions } from "./ProductPublicationOptions";
import { ProductFormFooter } from "./ProductFormFooter";

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  categories,
  existingProducts = [],
}: ProductModalProps) {
  const isEditing = Boolean(editingProduct);
  const [activeTab, setActiveTab] = useState<FormTab>("general");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
    name_fr: "",
    name_ar: "",
    sku: "",
    slug: "",
    short_desc_fr: "",
    short_desc_ar: "",
    description_fr: "",
    description_ar: "",
    material_fr: "",
    material_ar: "",
    base_price: "",
    discount_price: "",
    universe: "MEN",
    category_id: categories[0]?.id ? String(categories[0].id) : "1",
    is_active: true,
    is_featured: false,
    is_new: true,
    variants: [
      {
        sku: "AVL-MOD-50",
        size: "50",
        color_name_fr: "Noir Sartorial",
        color_name_ar: "أسود سارتوريال",
        color_code: "#111111",
        stock: 12,
        is_active: true,
      },
    ],
    images: [],
  });

  // Recharger le formulaire lors de l'ouverture ou du changement d'édition
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSuccessNotice(null);
    setActiveTab("general");

    if (editingProduct) {
      setFormData({
        name_fr: editingProduct.name_fr || "",
        name_ar: editingProduct.name_ar || "",
        sku: editingProduct.sku || "",
        slug: editingProduct.slug || "",
        short_desc_fr: editingProduct.short_desc_fr || "",
        short_desc_ar: editingProduct.short_desc_ar || "",
        description_fr: editingProduct.description_fr || "",
        description_ar: editingProduct.description_ar || "",
        material_fr: editingProduct.material_fr || "",
        material_ar: editingProduct.material_ar || "",
        base_price: String(editingProduct.base_price || ""),
        discount_price: editingProduct.discount_price ? String(editingProduct.discount_price) : "",
        universe: editingProduct.universe || "MEN",
        category_id: editingProduct.category_id ? String(editingProduct.category_id) : (categories[0]?.id ? String(categories[0].id) : "1"),
        is_active: editingProduct.is_active ?? true,
        is_featured: editingProduct.is_featured ?? false,
        is_new: editingProduct.is_new ?? false,
        variants:
          editingProduct.variants && editingProduct.variants.length > 0
            ? editingProduct.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                size: v.size,
                color_name_fr: v.color_name_fr,
                color_name_ar: v.color_name_ar,
                color_code: v.color_code,
                stock: v.stock,
                is_active: v.is_active,
              }))
            : [
                {
                  sku: `${editingProduct.sku}-50`,
                  size: "50",
                  color_name_fr: "Noir Sartorial",
                  color_name_ar: "أسود سارتوريال",
                  color_code: "#111111",
                  stock: 10,
                  is_active: true,
                },
              ],
        images:
          editingProduct.images && editingProduct.images.length > 0
            ? editingProduct.images.map((img) => ({
                id: img.id,
                url: img.url,
                alt_text_fr: img.alt_text_fr,
                alt_text_ar: img.alt_text_ar,
                is_cover: img.is_cover,
                sort_order: img.sort_order,
              }))
            : [],
      });
    } else {
      // Nouveau produit
      const firstCatId = categories[0]?.id ? String(categories[0].id) : "1";
      setFormData({
        name_fr: "",
        name_ar: "",
        sku: "",
        slug: "",
        short_desc_fr: "",
        short_desc_ar: "",
        description_fr: "",
        description_ar: "",
        material_fr: "",
        material_ar: "",
        base_price: "",
        discount_price: "",
        universe: "MEN",
        category_id: firstCatId,
        is_active: true,
        is_featured: false,
        is_new: true,
        variants: [
          {
            sku: "",
            size: "50",
            color_name_fr: "Noir Sartorial",
            color_name_ar: "أسود سارتوريال",
            color_code: "#111111",
            stock: 12,
            is_active: true,
          },
        ],
        images: [],
      });
    }
  }, [isOpen, editingProduct, categories]);

  // Fermeture par touche Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  const handleFieldChange = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const validate = (): boolean => {
    const errs: ValidationErrors = {};

    if (!formData.name_fr.trim()) {
      errs.name_fr = "Le nom en français est requis.";
    }
    if (!formData.name_ar.trim()) {
      errs.name_ar = "Le nom en arabe est requis pour l'expérience bilingue.";
    }
    if (!isEditing && !formData.sku.trim()) {
      errs.sku = "Le code SKU est requis.";
    } else if (!isEditing) {
      const isDuplicate = existingProducts.some(
        (p) => p.sku?.toUpperCase() === formData.sku.trim().toUpperCase()
      );
      if (isDuplicate) {
        errs.sku = "Ce code SKU est déjà attribué à une autre pièce du catalogue.";
      }
    }

    if (!formData.slug.trim()) {
      errs.slug = "Le slug d'URL permanente est requis.";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errs.slug = "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets.";
    }

    const baseVal = parseFloat(formData.base_price);
    if (!formData.base_price || isNaN(baseVal) || baseVal <= 0) {
      errs.base_price = "Veuillez renseigner un prix de base positif en MAD.";
    }

    if (formData.discount_price) {
      const discVal = parseFloat(formData.discount_price);
      if (isNaN(discVal) || discVal <= 0) {
        errs.discount_price = "Le prix promotionnel doit être un montant valide supérieur à 0.";
      } else if (discVal >= baseVal) {
        errs.discount_price = "Le prix promotionnel doit être strictement inférieur au prix de base.";
      }
    }

    if (!formData.category_id) {
      errs.category_id = "Veuillez associer une catégorie de vestiaire.";
    }

    if (!formData.variants || formData.variants.length === 0) {
      errs.variants = "Veuillez ajouter au moins une taille ou variante.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Naviguer automatiquement vers le premier onglet qui a une erreur
      if (errors.name_fr || errors.name_ar || errors.sku || errors.slug) {
        setActiveTab("general");
      } else if (errors.base_price || errors.discount_price || errors.category_id) {
        setActiveTab("pricing");
      } else if (errors.variants) {
        setActiveTab("variants");
      }
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData, isEditing);
      setSuccessNotice(
        isEditing
          ? "Pièce couture mise à jour avec succès !"
          : "Nouvelle pièce publiée dans le catalogue AVELOR !"
      );
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || "Une erreur est survenue lors de l'enregistrement de la pièce.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop sombre raffiné avec flou doux */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => {
          if (!submitting) onClose();
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Fenêtre Modale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-none border border-[#E5E5E5] bg-paper shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]"
      >
        {/* En-tête de la modale — Blanc pur, zéro fond noir parasite */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-paper px-6 py-4.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B08D57]">
                Atelier Haute Couture · AVELOR
              </span>
              <span className="h-1 w-1 rounded-full bg-[#B08D57]" />
              <span className="text-[10px] uppercase tracking-wider text-[#737373]">
                {isEditing ? `Référence #${editingProduct?.id}` : "Nouvel enregistrement"}
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-normal text-ink tracking-tight">
              {isEditing ? `Modifier : ${editingProduct?.name_fr}` : "Création d'une Nouvelle Pièce"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center border border-[#E5E5E5] text-[#737373] transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
            aria-label="Fermer la modale"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barre de navigation d'onglets rapides */}
        <div className="flex border-b border-[#E5E5E5] bg-[#F8F7F5] px-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === "general"
                ? "border-ink text-ink bg-paper"
                : "border-transparent text-[#737373] hover:text-ink"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Général</span>
            {(errors.name_fr || errors.name_ar || errors.sku || errors.slug) && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === "pricing"
                ? "border-ink text-ink bg-paper"
                : "border-transparent text-[#737373] hover:text-ink"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Prix & Catégorie</span>
            {(errors.base_price || errors.discount_price || errors.category_id) && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("variants")}
            className={`flex items-center gap-2 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === "variants"
                ? "border-ink text-ink bg-paper"
                : "border-transparent text-[#737373] hover:text-ink"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Tailles & Stocks</span>
            <span className="rounded-full bg-neutral-200 px-1.5 py-0.2 text-[9px] font-mono text-neutral-800">
              {formData.variants.length}
            </span>
            {errors.variants && <span className="h-1.5 w-1.5 rounded-full bg-red-600" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === "images"
                ? "border-ink text-ink bg-paper"
                : "border-transparent text-[#737373] hover:text-ink"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Visuels</span>
            <span className="rounded-full bg-neutral-200 px-1.5 py-0.2 text-[9px] font-mono text-neutral-800">
              {formData.images.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("publication")}
            className={`flex items-center gap-2 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === "publication"
                ? "border-ink text-ink bg-paper"
                : "border-transparent text-[#737373] hover:text-ink"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Publication</span>
          </button>
        </div>

        {/* Formulaire défilant */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-8">
            {successNotice && (
              <div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {errors.form && (
              <div className="border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800">
                {errors.form}
              </div>
            )}

            {/* Vue par onglet actif avec transition */}
            {activeTab === "general" && (
              <ProductGeneralInformation
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                isEditing={isEditing}
              />
            )}

            {activeTab === "pricing" && (
              <ProductPricingSection
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                categories={categories}
              />
            )}

            {activeTab === "variants" && (
              <ProductVariantsManager
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
              />
            )}

            {activeTab === "images" && (
              <ProductImageUploader
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
              />
            )}

            {activeTab === "publication" && (
              <ProductPublicationOptions
                formData={formData}
                onChange={handleFieldChange}
              />
            )}
          </div>

          {/* Pied du formulaire sticky */}
          <ProductFormFooter
            onCancel={onClose}
            submitting={submitting}
            isEditing={isEditing}
            errors={errors}
          />
        </form>
      </motion.div>
    </div>
  );
}
