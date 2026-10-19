"use client";

import React from "react";
import { AdminStats, Order } from "@/types";
import {
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Users,
  Boxes,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface DashboardOverviewProps {
  stats: AdminStats | null;
  onNavigateTab: (tab: AdminTab) => void;
  onSelectOrder: (order: Order) => void;
  onQuickStockEdit: (item: { id: number; name: string; sku: string; current: number }) => void;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "En attente", cls: "bg-amber-50 text-amber-900 border-amber-300" },
    CONFIRMED: { label: "Confirmée", cls: "bg-blue-50 text-blue-900 border-blue-300" },
    PROCESSING: { label: "En préparation", cls: "bg-purple-50 text-purple-900 border-purple-300" },
    SHIPPED: { label: "Expédiée", cls: "bg-indigo-50 text-indigo-900 border-indigo-300" },
    DELIVERED: { label: "Livrée", cls: "bg-emerald-50 text-emerald-900 border-emerald-300" },
    CANCELLED: { label: "Annulée", cls: "bg-red-50 text-red-900 border-red-300" },
  };
  const current = map[status] || { label: status, cls: "bg-neutral-100 text-neutral-800 border-neutral-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${current.cls}`}>
      {current.label}
    </span>
  );
}

export function DashboardOverview({
  stats,
  onNavigateTab,
  onSelectOrder,
  onQuickStockEdit,
}: DashboardOverviewProps) {
  if (!stats) return null;

  const totalRevenue = Number(stats.total_revenue || 0);
  const averageCart = Number(stats.average_cart_value || 0);
  const totalOrders = Number(stats.total_orders || 0);
  const pendingOrders = Number(stats.pending_orders || 0);
  const lowStockCount = Number(stats.low_stock_count || 0);
  const outOfStockCount = Number(stats.out_of_stock_count || 0);
  const totalCustomers = Number(stats.total_customers || 0);
  const totalProducts = Number(stats.total_products || 0);

  const menRev = Number(stats.universe_breakdown?.men_revenue || 0);
  const womenRev = Number(stats.universe_breakdown?.women_revenue || 0);
  const totalUniverseRev = menRev + womenRev || 1;
  const menPercent = Math.round((menRev / totalUniverseRev) * 100);
  const womenPercent = 100 - menPercent;

  // Timeline SVG calculations
  const timeline = stats.sales_timeline || [];
  const maxRev = Math.max(...timeline.map((t) => t.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* ── 1. Cartes KPIs Principales ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Chiffre d'Affaires */}
        <div className="group relative bg-white border border-neutral-200 p-6 shadow-xs transition-all hover:border-black hover:shadow-md">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Chiffre d'Affaires</span>
            <DollarSign className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </div>
          <p className="font-serif text-3xl font-light text-black tracking-tight">
            {totalRevenue.toLocaleString("fr-MA")}
            <span className="ms-1.5 font-sans text-xs font-semibold text-neutral-500">MAD</span>
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Commandes nettes encaissées</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Commandes Totales */}
        <div
          onClick={() => onNavigateTab("orders")}
          className="group relative bg-white border border-neutral-200 p-6 shadow-xs transition-all hover:border-black hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Commandes Totales</span>
            <Package className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </div>
          <p className="font-serif text-3xl font-light text-black tracking-tight">
            {totalOrders}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Toutes périodes</span>
            <span className="font-semibold text-black group-hover:underline inline-flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Panier Moyen */}
        <div className="group relative bg-white border border-neutral-200 p-6 shadow-xs transition-all hover:border-black hover:shadow-md">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Panier Moyen</span>
            <ShoppingBag className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </div>
          <p className="font-serif text-3xl font-light text-black tracking-tight">
            {averageCart.toLocaleString("fr-MA")}
            <span className="ms-1.5 font-sans text-xs font-semibold text-neutral-500">MAD</span>
          </p>
          <div className="mt-3 text-[11px] text-neutral-500">
            <span>Ratio revenu par commande</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Commandes à Traiter */}
        <div
          onClick={() => onNavigateTab("orders")}
          className={`group relative p-6 shadow-xs transition-all cursor-pointer border ${
            pendingOrders > 0
              ? "bg-amber-50/50 border-amber-300 hover:border-amber-500 hover:shadow-md"
              : "bg-white border-neutral-200 hover:border-black"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
              À Traiter / En Attente
            </span>
            <Clock className={`w-4 h-4 ${pendingOrders > 0 ? "text-amber-600" : "text-neutral-400"}`} />
          </div>
          <p className={`font-serif text-3xl font-light tracking-tight ${pendingOrders > 0 ? "text-amber-900" : "text-black"}`}>
            {pendingOrders}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className={pendingOrders > 0 ? "text-amber-800 font-semibold" : "text-neutral-500"}>
              {pendingOrders > 0 ? "Action logistique requise" : "Flux à jour"}
            </span>
            <span className="font-semibold text-black group-hover:underline inline-flex items-center gap-1">
              Ouvrir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-0.5 ${pendingOrders > 0 ? "bg-amber-600" : "bg-black"} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>

      {/* ── 2. Bandeau Métriques Secondaires ────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-50 border border-neutral-200 p-4">
        <div className="flex items-center gap-3 px-3 py-2 border-r border-neutral-200 last:border-r-0">
          <div className="flex h-9 w-9 items-center justify-center bg-white border border-neutral-200 shrink-0">
            <Boxes className="w-4 h-4 text-neutral-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Total Produits</p>
            <p className="text-base font-bold text-black">{totalProducts}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 border-r border-neutral-200 last:border-r-0">
          <div className="flex h-9 w-9 items-center justify-center bg-white border border-neutral-200 shrink-0">
            <Users className="w-4 h-4 text-neutral-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Clients Enregistrés</p>
            <p className="text-base font-bold text-black">{totalCustomers}</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("inventory")}
          className="flex items-center gap-3 px-3 py-2 border-r border-neutral-200 last:border-r-0 cursor-pointer hover:bg-white transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-amber-100 border border-amber-200 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Stock Faible (&lt; 5)</p>
            <p className="text-base font-bold text-amber-800">{lowStockCount}</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("inventory")}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-red-100 border border-red-200 shrink-0">
            <ShieldAlert className="w-4 h-4 text-red-700" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Rupture (0 ex.)</p>
            <p className="text-base font-bold text-red-800">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* ── 3. Graphique Temporel & Ventilation Univers ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique de ventes (7 derniers jours) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c8053]">
                Activité Récente
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                Évolution des Ventes (7 Derniers Jours)
              </h2>
            </div>
            <span className="text-[11px] font-mono font-medium text-neutral-500">
              Devise : MAD
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400">
              Aucune donnée temporelle disponible pour l'instant.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Barres horizontales monochromes épurées */}
              <div className="space-y-3">
                {timeline.map((day) => {
                  const widthPercent = Math.max((day.revenue / maxRev) * 100, 2);
                  return (
                    <div key={day.full_date} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-600 font-semibold">{day.date}</span>
                        <div className="flex gap-4">
                          <span className="text-neutral-400">{day.orders} cde{day.orders > 1 ? "s" : ""}</span>
                          <span className="text-black font-bold">
                            {day.revenue.toLocaleString("fr-MA")} MAD
                          </span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-700"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Ventilation par Univers (Homme vs Femme) */}
        <div className="bg-white border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c8053]">
                Segmentation Marché
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                Répartition des Ventes par Univers
              </h2>
            </div>

            <div className="space-y-4 pt-2">
              {/* HOMME */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-black uppercase tracking-wider">AVELOR HOMME</span>
                  <span className="font-mono font-semibold">{menRev.toLocaleString("fr-MA")} MAD ({menPercent}%)</span>
                </div>
                <div className="h-2.5 w-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-neutral-900" style={{ width: `${menPercent}%` }} />
                </div>
              </div>

              {/* FEMME */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-black uppercase tracking-wider">AVELOR FEMME</span>
                  <span className="font-mono font-semibold">{womenRev.toLocaleString("fr-MA")} MAD ({womenPercent}%)</span>
                </div>
                <div className="h-2.5 w-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-[#9c8053]" style={{ width: `${womenPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 mt-6">
            <button
              type="button"
              onClick={() => onNavigateTab("analytics")}
              className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-black hover:text-neutral-600 transition-colors"
            >
              <span>Consulter le rapport complet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Alertes Stocks & Commandes Récentes ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes Récentes (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c8053]">
                Opérations Récentes
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                Dernières Commandes Clients
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-semibold text-black uppercase tracking-wider hover:underline"
            >
              Voir toutes ({totalOrders})
            </button>
          </div>

          {(!stats.recent_orders || stats.recent_orders.length === 0) ? (
            <p className="py-12 text-center text-xs text-neutral-400">
              Aucune commande enregistrée pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    <th className="py-2.5">Numéro</th>
                    <th className="py-2.5">Client</th>
                    <th className="py-2.5">Ville</th>
                    <th className="py-2.5">Montant</th>
                    <th className="py-2.5">Statut</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {stats.recent_orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 font-bold text-black">{o.order_number}</td>
                      <td className="py-3 font-sans font-medium text-neutral-900">{o.customer_name}</td>
                      <td className="py-3 font-sans text-neutral-600">{o.customer_city || "Maroc"}</td>
                      <td className="py-3 font-bold text-black">
                        {Number(o.total_amount).toLocaleString("fr-MA")} MAD
                      </td>
                      <td className="py-3 font-sans">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateTab("orders");
                            onSelectOrder(o);
                          }}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-colors"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertes Stocks Faibles (1 col) */}
        <div className="bg-white border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
                  Priorité Logistique
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                  Stocks Sensibles (&lt; 5 ex.)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("inventory")}
                className="text-xs font-semibold text-black uppercase tracking-wider hover:underline"
              >
                Inventaire
              </button>
            </div>

            {(!stats.low_stock_items || stats.low_stock_items.length === 0) ? (
              <p className="py-12 text-center text-xs text-neutral-400">
                Aucune alerte de stock faible actuellement.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100 mt-2">
                {stats.low_stock_items.slice(0, 5).map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="min-w-0 pe-2">
                      <p className="font-bold text-black truncate">{v.product_name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        SKU: {v.sku} · {v.size} / {v.color}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                        v.stock === 0 ? "bg-red-100 text-red-900 border border-red-300" : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}>
                        {v.stock} ex.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickStockEdit({
                            id: v.id,
                            name: v.product_name,
                            sku: v.sku,
                            current: v.stock,
                          })
                        }
                        className="p-1 border border-neutral-300 hover:border-black text-[10px] font-semibold uppercase hover:bg-black hover:text-white transition-colors"
                        title="Ajuster le stock"
                      >
                        + / -
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={() => onNavigateTab("inventory")}
              className="flex w-full items-center justify-center gap-2 bg-neutral-100 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-colors"
            >
              <span>Accéder à l'inventaire complet</span>
              <Boxes className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
