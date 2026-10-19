"use client";

import React, { useEffect, useState } from "react";
import {
  Menu,
  Search,
  RefreshCw,
  Loader2,
  Clock,
  Plus,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AdminTab } from "./AdminSidebar";

interface AdminHeaderProps {
  activeTab: AdminTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleMobileSidebar: () => void;
  onPrimaryAction?: () => void;
  onSelectTab?: (tab: AdminTab) => void;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string; actionLabel?: string }> = {
  dashboard: {
    title: "Tableau de Bord & Vue d'Ensemble",
    subtitle: "Indicateurs clés de performance commerciale, commandes récentes et alertes opérationnelles.",
  },
  analytics: {
    title: "Statistiques & Performance",
    subtitle: "Rapports des ventes, ventilation par univers Homme/Femme et analyse par catégorie.",
  },
  orders: {
    title: "Gestion des Commandes",
    subtitle: "Traitement, facturation, suivi logistique Amana et expéditions des colis clients.",
  },
  products: {
    title: "Catalogue Produits & Variantes",
    subtitle: "Création, modification des fiches couture, gestion des tailles, nuances et prix.",
    actionLabel: "+ Nouveau Produit",
  },
  inventory: {
    title: "Inventaire & Mouvements de Stock",
    subtitle: "Supervision des niveaux de stock par variante et historique des mouvements.",
  },
  customers: {
    title: "Fichier & Historique Clients",
    subtitle: "Portefeuille clientèle AVELOR, coordonnées de livraison et valeur à vie (LTV).",
  },
  promotions: {
    title: "Marketing & Codes Privilèges",
    subtitle: "Gestion des coupons de réduction, remises en pourcentage ou valeurs fixes.",
    actionLabel: "+ Nouveau Code Promo",
  },
  campaigns: {
    title: "Contenus & Bannières Hero",
    subtitle: "Gestion éditoriale de la page d'accueil, bannières saisonnières et liens d'action.",
    actionLabel: "+ Nouvelle Bannière",
  },
  audit: {
    title: "Journal d'Audit & Sécurité",
    subtitle: "Traçabilité intégrale et immuable des opérations administratives sensibles.",
  },
  settings: {
    title: "Configuration & Paramètres",
    subtitle: "Devise, livraison standard & gratuite, politique de conciergerie et utilisateurs autorisés.",
  },
  account: {
    title: "Paramètres du Compte & Sécurité",
    subtitle: "Informations personnelles, identifiants d'accès administrateur et sécurité du compte.",
  },
};

export function AdminHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onToggleMobileSidebar,
  onPrimaryAction,
  onSelectTab,
}: AdminHeaderProps) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("fr-MA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Africa/Casablanca",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabInfo = TAB_TITLES[activeTab] || {
    title: "Administration",
    subtitle: "Panneau de gestion AVELOR.",
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Mobile trigger & breadcrumb title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-700 hover:bg-neutral-100 lg:hidden"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c8053]">
                AVELOR BACK-OFFICE
              </span>
              <span className="text-neutral-300">/</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 truncate">
                {activeTab}
              </span>
            </div>
            <h1 className="truncate font-serif text-base sm:text-lg font-semibold tracking-wide text-black uppercase">
              {tabInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Search, Clock, Refresh & Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real-time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-mono text-neutral-600">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Casablanca {timeStr}</span>
          </div>

          {/* Search box for searchable tabs */}
          {["orders", "products", "inventory", "customers", "promotions"].includes(activeTab) && (
            <div className="relative hidden md:block w-48 lg:w-64">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 w-full border border-neutral-300 bg-neutral-50 ps-8 pe-3 text-xs outline-none transition-all placeholder:text-neutral-400 focus:border-black focus:bg-white"
              />
              <Search className="absolute inset-s-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            </div>
          )}

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-9 items-center gap-1.5 border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors disabled:opacity-50"
            title="Actualiser les données"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          {/* Mon Compte shortcut */}
          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab("account")}
              className={`flex h-9 items-center gap-2 border px-2.5 sm:px-3 text-xs font-medium transition-colors ${
                activeTab === "account"
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-black"
              }`}
              title="Paramètres de mon compte"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-neutral-800 text-[9px] text-white font-serif shrink-0">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.first_name?.[0] || user?.email?.[0] || "A").toUpperCase()
                )}
              </div>
              <span className="hidden sm:inline">Mon Compte</span>
            </button>
          )}

          {/* Action button if defined for this tab */}
          {tabInfo.actionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="flex h-9 items-center gap-1.5 bg-black px-4 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{tabInfo.actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
