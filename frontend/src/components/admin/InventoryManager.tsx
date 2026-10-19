"use client";

import React, { useState, useMemo } from "react";
import { InventoryItem, InventoryMovementRecord } from "@/types";
import { api } from "@/lib/api";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Archive,
  RefreshCw,
  Plus,
  ArrowUpDown,
  History,
  Boxes,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryManagerProps {
  inventory: InventoryItem[];
  movements: InventoryMovementRecord[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function InventoryManager({
  inventory,
  movements,
  onRefresh,
  onNotify,
}: InventoryManagerProps) {
  const [activeTab, setActiveTab] = useState<"stocks" | "movements">("stocks");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOW" | "OUT" | "IN_STOCK">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Stock Adjustment Modal state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("RESTOCK");
  const [customNote, setCustomNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.sku?.toLowerCase().includes(q) ||
        item.product_title?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q) ||
        item.size?.toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === "LOW") {
        matchStatus = item.stock <= 5 && item.stock > 0;
      } else if (statusFilter === "OUT") {
        matchStatus = item.stock === 0;
      } else if (statusFilter === "IN_STOCK") {
        matchStatus = item.stock > 5;
      }

      return matchSearch && matchStatus;
    });
  }, [inventory, search, statusFilter]);

  const totalPages = Math.ceil(filteredInventory.length / pageSize) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [filteredInventory, page, pageSize]);

  // Movements filter
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const q = search.toLowerCase().trim();
      return (
        !q ||
        m.sku?.toLowerCase().includes(q) ||
        m.product_title?.toLowerCase().includes(q) ||
        m.reason?.toLowerCase().includes(q) ||
        m.reference?.toLowerCase().includes(q)
      );
    });
  }, [movements, search]);

  // Open adjustment modal
  const openAdjustModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setNewQuantity(item.stock);
    setReason("RESTOCK");
    setCustomNote("");
  };

  // Submit stock adjustment
  const handleSaveStock = async () => {
    if (!adjustingItem) return;
    setIsSubmitting(true);
    try {
      const reasonText = customNote ? `${reason}: ${customNote}` : reason;
      await api.updateVariantStock(adjustingItem.id, newQuantity, reasonText);
      onNotify(`Stock mis à jour pour ${adjustingItem.sku} (${newQuantity} unités)`, "success");
      setAdjustingItem(null);
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur de mise à jour du stock", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stock status counts
  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;
  const lowStockCount = inventory.filter((i) => i.stock <= 5 && i.stock > 0).length;
  const totalUnits = inventory.reduce((acc, i) => acc + (i.stock || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Inventaire & Mouvements de Stock
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {inventory.length} variantes au catalogue • {totalUnits} unités physiques en entrepôt
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-neutral-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Unités en Stock
          </div>
          <div className="text-2xl font-serif text-neutral-900 mt-1">
            {totalUnits.toLocaleString("fr-FR")}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Sur l'ensemble des tailles/couleurs</div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Variantes Totales
          </div>
          <div className="text-2xl font-serif text-neutral-900 mt-1">
            {inventory.length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">SKUs gérés</div>
        </div>

        <div
          onClick={() => {
            setActiveTab("stocks");
            setStatusFilter("LOW");
          }}
          className={`p-4 bg-white border transition-colors cursor-pointer ${
            statusFilter === "LOW" ? "border-amber-500 ring-1 ring-amber-500" : "border-neutral-200"
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Stocks Faibles (&le; 5)
          </div>
          <div className="text-2xl font-serif text-amber-700 mt-1">
            {lowStockCount}
          </div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Nécessite réapprovisionnement</div>
        </div>

        <div
          onClick={() => {
            setActiveTab("stocks");
            setStatusFilter("OUT");
          }}
          className={`p-4 bg-white border transition-colors cursor-pointer ${
            statusFilter === "OUT" ? "border-red-500 ring-1 ring-red-500" : "border-neutral-200"
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-red-700 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Ruptures de Stock
          </div>
          <div className="text-2xl font-serif text-red-700 mt-1">
            {outOfStockCount}
          </div>
          <div className="text-[10px] text-red-600/80 mt-0.5">Produits indisponibles</div>
        </div>
      </div>

      {/* Main Tabs switcher */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => {
            setActiveTab("stocks");
            setPage(1);
          }}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "stocks"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>État des Stocks par Variante ({inventory.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("movements");
            setPage(1);
          }}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "movements"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Journal des Mouvements ({movements.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={
              activeTab === "stocks"
                ? "Rechercher par SKU, titre, couleur, taille..."
                : "Rechercher par SKU, produit, raison, référence..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-black transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeTab === "stocks" && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { key: "ALL", label: "Tous", count: inventory.length },
              { key: "LOW", label: "Faibles (≤ 5)", count: lowStockCount },
              { key: "OUT", label: "Ruptures", count: outOfStockCount },
              { key: "IN_STOCK", label: "En Stock (> 5)", count: inventory.length - lowStockCount - outOfStockCount },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  statusFilter === f.key
                    ? "bg-black text-white font-medium"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === f.key ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Stocks table */}
      {activeTab === "stocks" ? (
        <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80 uppercase text-[10px] font-semibold tracking-wider text-neutral-600">
                  <th className="py-3 px-4">SKU / Référence</th>
                  <th className="py-3 px-4">Produit & Catégorie</th>
                  <th className="py-3 px-4">Taille</th>
                  <th className="py-3 px-4">Couleur</th>
                  <th className="py-3 px-4 text-right">Prix (MAD)</th>
                  <th className="py-3 px-4 text-center">Quantité en Stock</th>
                  <th className="py-3 px-4">État</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400">
                      <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Aucune variante trouvée.
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item) => {
                    const isOut = item.stock === 0;
                    const isLow = item.stock <= 5 && item.stock > 0;

                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {item.sku}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-900">
                            {item.product_title || item.product_name || "Sans titre"}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {item.universe ? `${item.universe} • ` : ""}
                            {item.category || item.category_name || "Standard"}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 font-bold">
                            {item.size || "TU"}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-neutral-700">{item.color || item.color_name || "Standard"}</span>
                        </td>

                        <td className="py-3 px-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                          {Number(item.price ?? item.base_price ?? 0).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          <span className="text-[10px] text-neutral-400 font-normal">MAD</span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold text-sm whitespace-nowrap">
                          <span
                            className={
                              isOut
                                ? "text-red-600"
                                : isLow
                                ? "text-amber-600"
                                : "text-neutral-900"
                            }
                          >
                            {item.stock}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                              <XCircle className="w-3 h-3" /> Rupture
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                              <AlertTriangle className="w-3 h-3" /> Faible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle className="w-3 h-3" /> En stock
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="px-2.5 py-1 text-xs text-neutral-700 hover:text-black border border-neutral-200 hover:border-black transition-colors"
                          >
                            Ajuster stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50/50 text-xs">
            <span className="text-neutral-500">
              Affichage de <span className="font-medium text-neutral-900">{filteredInventory.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> à{" "}
              <span className="font-medium text-neutral-900">
                {Math.min(page * pageSize, filteredInventory.length)}
              </span>{" "}
              sur <span className="font-medium text-neutral-900">{filteredInventory.length}</span> variantes
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 border border-neutral-200 bg-white text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-neutral-700 font-medium">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 border border-neutral-200 bg-white text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Movements Journal */
        <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80 uppercase text-[10px] font-semibold tracking-wider text-neutral-600">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">SKU / Produit</th>
                  <th className="py-3 px-4 text-center">Variation</th>
                  <th className="py-3 px-4">Raison</th>
                  <th className="py-3 px-4">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-400">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Aucun mouvement de stock enregistré.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                          {mov.created_at
                            ? new Date(mov.created_at).toLocaleString("fr-FR")
                            : "—"}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-medium text-neutral-900">
                            {mov.sku}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate max-w-xs">
                            {mov.product_title || "Article catalogue"}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              isPositive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isPositive ? `+${mov.quantity}` : mov.quantity}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-medium text-neutral-800">
                          {mov.reason}
                        </td>

                        <td className="py-3 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                          {mov.reference || "Manuel"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      <AnimatePresence>
        {adjustingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdjustingItem(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-neutral-300 shadow-2xl z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <h3 className="text-base font-medium font-serif text-neutral-900">
                    Ajuster le Stock
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    {adjustingItem.sku}
                  </p>
                </div>
                <button
                  onClick={() => setAdjustingItem(null)}
                  className="text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-neutral-50 border border-neutral-200">
                  <div className="text-neutral-600 font-medium">
                    {adjustingItem.product_title || adjustingItem.product_name || "Produit AVELOR"}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-3">
                    <span>Taille : <strong>{adjustingItem.size}</strong></span>
                    <span>Couleur : <strong>{adjustingItem.color || adjustingItem.color_name || "Standard"}</strong></span>
                    <span>Stock actuel : <strong>{adjustingItem.stock}</strong></span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Nouvelle quantité en stock
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewQuantity((q) => Math.max(0, q - 1))}
                      className="w-9 h-9 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center py-2 border border-neutral-300 font-mono text-base font-semibold focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => setNewQuantity((q) => q + 1)}
                      className="w-9 h-9 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1 text-center">
                    Variation :{" "}
                    <span
                      className={`font-mono font-bold ${
                        newQuantity - adjustingItem.stock >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {newQuantity - adjustingItem.stock >= 0
                        ? `+${newQuantity - adjustingItem.stock}`
                        : newQuantity - adjustingItem.stock}
                    </span>{" "}
                    unités
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Motif de l'ajustement
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 bg-white focus:outline-none focus:border-black text-xs"
                  >
                    <option value="RESTOCK">Réapprovisionnement fournisseur</option>
                    <option value="INVENTORY_COUNT">Inventaire physique / Régularisation</option>
                    <option value="RETURN">Retour client conforme</option>
                    <option value="DAMAGED">Article défectueux / Perte</option>
                    <option value="OTHER">Autre motif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Note complémentaire (optionnelle)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bon de livraison BL-2026-88"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveStock}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  {isSubmitting ? "Enregistrement..." : "Confirmer la mise à jour"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
