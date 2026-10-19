"use client";

import React, { useState } from "react";
import { Campaign } from "@/types";
import { api } from "@/lib/api";
import {
  Image,
  Plus,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Layers,
  ArrowUpDown,
  RefreshCw,
  X,
  Eye,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentManagerProps {
  campaigns: Campaign[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function ContentManager({
  campaigns,
  onRefresh,
  onNotify,
}: ContentManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/homme");
  const [targetUniverse, setTargetUniverse] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Toggle active
  const handleToggleActive = async (camp: Campaign) => {
    try {
      await api.updateCampaign(camp.id, { is_active: !camp.is_active });
      onNotify(`Bannière "${camp.title}" mise à jour`, "success");
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur de mise à jour", "error");
    }
  };

  // Delete campaign
  const handleDelete = async (id: number, bannerTitle: string) => {
    if (!window.confirm(`Supprimer la bannière "${bannerTitle}" ?`)) return;
    try {
      await api.deleteCampaign(id);
      onNotify(`Bannière "${bannerTitle}" supprimée`, "success");
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur lors de la suppression", "error");
    }
  };

  // Create campaign
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      onNotify("Titre et image sont obligatoires", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createCampaign({
        title: title.trim(),
        subtitle: subtitle.trim(),
        image_url: imageUrl.trim(),
        link_url: linkUrl.trim(),
        target_universe: targetUniverse === "ALL" ? undefined : targetUniverse,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });

      onNotify("Bannière éditoriale créée avec succès", "success");
      setShowCreateModal(false);
      // Reset form
      setTitle("");
      setSubtitle("");
      setImageUrl("");
      setLinkUrl("/homme");
      setTargetUniverse("ALL");
      setSortOrder(0);
      setIsActive(true);
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur lors de la création de la bannière", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Contenus & Bannières Éditoriales
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gestion des visuels de tête (Hero Banners), campagnes saisonnières et liens de redirection
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
            Nouvelle Bannière Hero
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-neutral-400 bg-white border border-neutral-200">
            <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Aucune bannière de campagne configurée.</p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white border border-neutral-200 shadow-sm overflow-hidden flex flex-col group hover:border-neutral-400 transition-all"
            >
              {/* Media Preview */}
              <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                <img
                  src={camp.image_url}
                  alt={camp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-black/70 backdrop-blur text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                    {camp.target_universe || "GLOBAL"}
                  </span>
                  <span className="px-2 py-0.5 bg-white/80 backdrop-blur text-black text-[10px] font-mono font-bold">
                    Ordre : {camp.sort_order || 0}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-serif font-bold text-sm leading-tight text-white line-clamp-1">
                    {camp.title}
                  </h4>
                  {camp.subtitle && (
                    <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">
                      {camp.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Banner Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                    Lien de redirection
                  </div>
                  <a
                    href={camp.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-neutral-700 hover:text-black flex items-center gap-1 truncate text-[11px]"
                  >
                    <span>{camp.link_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => handleToggleActive(camp)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    {camp.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <ToggleRight className="w-5 h-5" /> En ligne
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-neutral-400">
                        <ToggleLeft className="w-5 h-5" /> Hors ligne
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(camp.id, camp.title || "Bannière")}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer la bannière"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Banner Modal */}
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
                  Nouvelle Bannière Éditoriale Hero
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
                    Titre Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ÉLÉGANCE AUTOMNE-HIVER 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-black font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Sous-titre / Accroche
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: L'artisanat du cachemire et des coupes sur mesure"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    URL de l'image haute définition *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Univers cible
                    </label>
                    <select
                      value={targetUniverse}
                      onChange={(e) => setTargetUniverse(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs focus:outline-none focus:border-black"
                    >
                      <option value="ALL">Tous les univers</option>
                      <option value="HOMME">AVELOR HOMME (/homme)</option>
                      <option value="FEMME">AVELOR FEMME (/femme)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Lien d'action (Call-To-Action)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: /categories/manteaux-vestes ou /homme"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isCampActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  <label
                    htmlFor="isCampActive"
                    className="text-neutral-700 cursor-pointer font-medium"
                  >
                    Activer immédiatement sur la boutique
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
                    {isSubmitting ? "Publication..." : "Publier la bannière"}
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
