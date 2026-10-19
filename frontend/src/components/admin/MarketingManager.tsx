"use client";

import React, { useState } from "react";
import { Promotion } from "@/types";
import { api } from "@/lib/api";
import {
  Ticket,
  Plus,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Search,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Tag,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MarketingManagerProps {
  promotions: Promotion[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function MarketingManager({
  promotions,
  onRefresh,
  onNotify,
}: MarketingManagerProps) {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [validUntil, setValidUntil] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Filtered promotions
  const filteredPromotions = promotions.filter((p) => {
    const q = search.toLowerCase().trim();
    return !q || p.code?.toLowerCase().includes(q);
  });

  // Toggle active status
  const handleToggleActive = async (promo: Promotion) => {
    try {
      await api.updatePromotion(promo.id, { is_active: !promo.is_active });
      onNotify(`Code ${promo.code} ${!promo.is_active ? "activé" : "désactivé"}`, "success");
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur de mise à jour", "error");
    }
  };

  // Delete promotion
  const handleDelete = async (id: number, codeName: string) => {
    if (!window.confirm(`Supprimer définitivement le code promo "${codeName}" ?`)) return;
    try {
      await api.deletePromotion(id);
      onNotify(`Code promo "${codeName}" supprimé`, "success");
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur lors de la suppression", "error");
    }
  };

  // Create promotion
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      onNotify("Le code promo est requis", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPromotion({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: minOrderAmount ? Number(minOrderAmount) : undefined,
        max_uses: maxUses ? Number(maxUses) : undefined,
        valid_until: validUntil ? new Date(validUntil).toISOString() : undefined,
        is_active: isActive,
      });

      onNotify(`Code promo "${code.toUpperCase()}" créé avec succès`, "success");
      setShowCreateModal(false);
      // Reset form
      setCode("");
      setDiscountType("PERCENTAGE");
      setDiscountValue(10);
      setMinOrderAmount(0);
      setMaxUses(undefined);
      setValidUntil("");
      setIsActive(true);
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur lors de la création du code promo", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy code helper
  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    onNotify(`Code "${c}" copié`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Marketing & Codes Privilèges
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Création de coupons de réduction, pourcentages et remises en MAD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Code Promo
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par code (ex: AVELOR10, RAMADAN...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>{filteredPromotions.length} codes au total</span>
          <span>•</span>
          <span className="text-emerald-700 font-medium">
            {promotions.filter((p) => p.is_active).length} actifs
          </span>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 uppercase text-[10px] font-semibold tracking-wider text-neutral-600">
                <th className="py-3 px-4">Code Promo</th>
                <th className="py-3 px-4">Type & Valeur</th>
                <th className="py-3 px-4">Panier Minimum</th>
                <th className="py-3 px-4">Utilisations</th>
                <th className="py-3 px-4">Validité</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucun code promo créé.
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => {
                  const isExpired =
                    promo.valid_until && new Date(promo.valid_until) < new Date();

                  return (
                    <tr key={promo.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm bg-neutral-100 px-2.5 py-1 border border-neutral-300 text-neutral-900 tracking-wider">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => copyCode(promo.code)}
                            className="p-1 text-neutral-400 hover:text-black"
                            title="Copier le code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-medium text-neutral-900">
                        {promo.discount_type === "PERCENTAGE" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
                            -{promo.discount_value}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 border border-blue-200 font-bold">
                            -{Number(promo.discount_value).toLocaleString("fr-FR")} MAD
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        {promo.min_order_amount && Number(promo.min_order_amount) > 0 ? (
                          <span>
                            {Number(promo.min_order_amount).toLocaleString("fr-FR")} MAD
                          </span>
                        ) : (
                          <span className="text-neutral-400">Aucun minimum</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-neutral-700">
                        <span className="font-mono font-semibold">
                          {promo.used_count || 0}
                        </span>
                        {promo.max_uses ? (
                          <span className="text-neutral-400"> / {promo.max_uses}</span>
                        ) : (
                          <span className="text-neutral-400"> (Illimité)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        {promo.valid_until ? (
                          <span
                            className={
                              isExpired ? "text-red-600 font-medium" : "text-neutral-700"
                            }
                          >
                            {new Date(promo.valid_until).toLocaleDateString("fr-FR")}
                            {isExpired && " (Expiré)"}
                          </span>
                        ) : (
                          <span className="text-neutral-400">Permanent</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(promo)}
                          className="inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                        >
                          {promo.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <ToggleRight className="w-5 h-5" /> Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-neutral-400">
                              <ToggleLeft className="w-5 h-5" /> Inactif
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(promo.id, promo.code)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer le code promo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promotion Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white border border-neutral-300 shadow-2xl z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-base font-medium font-serif text-neutral-900">
                  Nouveau Code Promotionnel
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Code Promo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AVELOR20, MAISON10, RAMADAN..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-neutral-300 font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Type de remise
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-neutral-300 bg-white focus:outline-none focus:border-black text-xs"
                    >
                      <option value="PERCENTAGE">Pourcentage (%)</option>
                      <option value="FIXED">Montant fixe (MAD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Valeur de la remise *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={1}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
                        {discountType === "PERCENTAGE" ? "%" : "MAD"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Panier minimum (MAD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0 (aucun)"
                      value={minOrderAmount || ""}
                      onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Nombre d'utilisations max
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Illimité"
                      value={maxUses || ""}
                      onChange={(e) =>
                        setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  <label htmlFor="isActive" className="text-neutral-700 cursor-pointer font-medium">
                    Activer immédiatement ce code promotionnel
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-black text-white font-medium hover:bg-neutral-800 transition-colors"
                  >
                    {isSubmitting ? "Création..." : "Enregistrer le code promo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
