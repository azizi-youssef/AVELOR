"use client";

import React, { useState, useEffect } from "react";
import { StoreSettings } from "@/types";
import { api } from "@/lib/api";
import {
  Settings,
  Store,
  DollarSign,
  Truck,
  ShieldCheck,
  Save,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  UserCheck,
} from "lucide-react";

interface SettingsManagerProps {
  settings: StoreSettings | null;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function SettingsManager({
  settings,
  onRefresh,
  onNotify,
}: SettingsManagerProps) {
  const [formData, setFormData] = useState<Partial<StoreSettings>>({
    store_name: "AVELOR MAISON",
    currency: "MAD",
    contact_email: "concierge@avelor.ma",
    contact_phone: "+212 5 22 00 00 00",
    address: "Boulevard d'Anfa, Casablanca, Maroc",
    shipping_fee: 50,
    free_shipping_threshold: 1000,
    return_window_days: 14,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateAdminSettings(formData);
      onNotify("Paramètres de la boutique enregistrés avec succès", "success");
      await onRefresh();
    } catch (e: any) {
      onNotify(e.message || "Erreur lors de la sauvegarde des paramètres", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Configuration & Paramètres de la Boutique
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Informations de l'enseigne AVELOR, devise MAD, règles de livraison et accès autorisés
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Store className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Identité & Coordonnées de la Maison
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Nom de la boutique
              </label>
              <input
                type="text"
                required
                value={formData.store_name || ""}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-serif text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Devise Principale
              </label>
              <input
                type="text"
                disabled
                value={formData.currency || "MAD"}
                className="w-full px-3 py-2 border border-neutral-200 bg-neutral-100 font-mono text-neutral-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Toutes les transactions et factures sont émises en Dirhams Marocains (MAD).
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Email Conciergerie / Support
              </label>
              <input
                type="email"
                required
                value={formData.contact_email || ""}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 font-mono text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Téléphone Service Client
              </label>
              <input
                type="text"
                value={formData.contact_phone || ""}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Adresse du Showroom / Siège
              </label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Policies */}
        <div className="bg-white border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Truck className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Livraison, Expédition & Retours (Maroc)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Frais de livraison standard (MAD)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.shipping_fee ?? 50}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_fee: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Tarif appliqué aux commandes inférieures au seuil gratuit.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Seuil de livraison offerte (MAD)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.free_shipping_threshold ?? 1000}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    free_shipping_threshold: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Livraison gratuite à partir de ce montant (ex: 1 000 MAD).
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                Délai de retour (Jours)
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.return_window_days ?? 14}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    return_window_days: parseInt(e.target.value) || 14,
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Période légale pour échange ou remboursement conforme.
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Administrators & Staff */}
        <div className="bg-white border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Personnel Autorisé & Privilèges Administrateur
            </h3>
          </div>

          <div className="border border-neutral-200 divide-y divide-neutral-100 text-xs">
            {((settings?.authorized_staff || settings?.authorized_users) && (settings.authorized_staff?.length || settings.authorized_users?.length)) ? (
              ((settings.authorized_staff || settings.authorized_users) as any[]).map((staff: any, idx: number) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs font-serif">
                      {staff.name ? staff.name.charAt(0) : "A"}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{staff.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {staff.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono uppercase tracking-wider">
                      {staff.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-neutral-500 text-center">
                Comptes administrateurs avec accès complet à la console AVELOR.
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Enregistrement..." : "Enregistrer les Paramètres"}
          </button>
        </div>
      </form>
    </div>
  );
}
