"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ShoppingBag,
  Boxes,
  Users,
  Ticket,
  Image as ImageIcon,
  ShieldAlert,
  Settings,
  UserCheck,
  ExternalLink,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "analytics"
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "promotions"
  | "campaigns"
  | "audit"
  | "settings"
  | "account";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  ordersCount?: number;
  pendingOrdersCount?: number;
  productsCount?: number;
  lowStockCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
    badgeColor?: "amber" | "red" | "neutral";
  }>;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  ordersCount = 0,
  pendingOrdersCount = 0,
  productsCount = 0,
  lowStockCount = 0,
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const sections: NavSection[] = [
    {
      title: "Pilotage & Données",
      items: [
        {
          id: "dashboard",
          label: "Vue d'ensemble",
          icon: LayoutDashboard,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: "amber",
        },
        {
          id: "analytics",
          label: "Statistiques & Ventes",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Gestion Commerciale",
      items: [
        {
          id: "orders",
          label: "Commandes",
          icon: Package,
          badge: ordersCount > 0 ? ordersCount : undefined,
          badgeColor: pendingOrdersCount > 0 ? "amber" : "neutral",
        },
        {
          id: "products",
          label: "Catalogue Produits",
          icon: ShoppingBag,
          badge: productsCount > 0 ? productsCount : undefined,
        },
        {
          id: "inventory",
          label: "Inventaire & Stocks",
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: "red",
        },
        {
          id: "customers",
          label: "Fichier Clients",
          icon: Users,
        },
      ],
    },
    {
      title: "Marketing & Éditorial",
      items: [
        {
          id: "promotions",
          label: "Codes Promotions",
          icon: Ticket,
        },
        {
          id: "campaigns",
          label: "Bannières & Contenus",
          icon: ImageIcon,
        },
      ],
    },
    {
      title: "Gouvernance & Système",
      items: [
        {
          id: "audit",
          label: "Journal d'Audit",
          icon: ShieldAlert,
        },
        {
          id: "settings",
          label: "Paramètres Boutique",
          icon: Settings,
        },
        {
          id: "account",
          label: "Paramètres du Compte",
          icon: UserCheck,
        },
      ],
    },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 inset-s-0 z-50 flex w-72 flex-col bg-[#0d0d0c] text-white border-e border-neutral-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand identity header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-neutral-800/80 bg-black">
          <Link
            href="/"
            target="_blank"
            className="group flex flex-col focus:outline-none"
            title="Ouvrir la boutique dans un nouvel onglet"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-[0.25em] font-light text-white uppercase group-hover:text-[#d8c5a0] transition-colors">
                AVELOR
              </span>
              <span className="text-[9px] bg-neutral-800 text-[#d8c5a0] px-1.5 py-0.5 font-mono uppercase tracking-widest border border-neutral-700">
                PRO
              </span>
            </div>
            <span className="text-[9px] font-sans tracking-[0.28em] text-neutral-400 uppercase mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#d8c5a0]" />
              Maison de Haute Couture
            </span>
          </Link>
        </div>

        {/* Navigation links grouped by sections */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-none">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                {sec.title}
              </p>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`group relative flex w-full items-center justify-between rounded-none px-3 py-2.5 text-xs tracking-wider transition-all ${
                        isActive
                          ? "bg-white text-black font-semibold shadow-xs"
                          : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? "text-black" : "text-neutral-400 group-hover:text-white"
                          }`}
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        <span className="capitalize">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span
                            className={`flex h-4 min-w-4 items-center justify-center px-1 text-[9px] font-bold font-mono ${
                              isActive
                                ? "bg-black text-white"
                                : item.badgeColor === "red"
                                ? "bg-red-950 text-red-300 border border-red-800"
                                : item.badgeColor === "amber"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-neutral-800 text-neutral-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User admin profile & system actions */}
        <div className="border-t border-neutral-800/80 bg-neutral-950 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => handleNavClick("account")}
              className={`flex items-center gap-3 min-w-0 text-left w-full p-1.5 -m-1.5 rounded transition-colors group ${
                activeTab === "account" ? "bg-neutral-800/60 ring-1 ring-neutral-700" : "hover:bg-neutral-900/60"
              }`}
              title="Gérer les paramètres de votre compte"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 font-serif text-sm font-semibold text-white group-hover:border-neutral-500 transition-colors overflow-hidden">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.first_name?.[0] || user?.email?.[0] || "A").toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                    {user?.role || "ADMINISTRATEUR"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/60">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border border-neutral-800"
              title="Voir la boutique en direct"
            >
              <span>Boutique</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors border border-neutral-800 hover:border-red-900"
              title="Se déconnecter"
            >
              <span>Quitter</span>
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
