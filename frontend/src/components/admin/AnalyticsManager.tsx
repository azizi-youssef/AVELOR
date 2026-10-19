"use client";

import React, { useState } from "react";
import { AdminStats, AnalyticsData, Order } from "@/types";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Layers,
  Calendar,
  Users,
  Award,
  ArrowUpRight,
  RefreshCw,
  PieChart,
  BarChart3,
  Percent,
} from "lucide-react";

interface AnalyticsManagerProps {
  stats: AdminStats | null;
  analytics: AnalyticsData | null;
  orders: Order[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function AnalyticsManager({
  stats,
  analytics,
  orders,
  onRefresh,
  onNotify,
}: AnalyticsManagerProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "year" | "all">("7d");

  const totalRevenue = stats?.total_revenue || 0;
  const totalOrders = stats?.total_orders || 0;
  const avgCart = stats?.average_cart_value || (totalOrders > 0 ? totalRevenue / totalOrders : 0);

  // Universe comparison
  const hommeRev = stats?.universe_breakdown?.homme || 0;
  const femmeRev = stats?.universe_breakdown?.femme || 0;
  const universeTotal = hommeRev + femmeRev || 1;
  const hommePct = Math.round((hommeRev / universeTotal) * 100);
  const femmePct = Math.round((femmeRev / universeTotal) * 100);

  // Delivered vs Cancelled
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const deliveryRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Rapports Analytiques & Performance
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Indicateurs d'activité, ventilation par univers Homme/Femme et rentabilité des collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 p-0.5 text-xs">
            {[
              { key: "7d", label: "7 jours" },
              { key: "30d", label: "30 jours" },
              { key: "year", label: "Année" },
              { key: "all", label: "Global" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key as any)}
                className={`px-3 py-1 font-medium transition-colors ${
                  period === p.key
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onRefresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Chiffre d'Affaires Réel
            </span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-serif font-medium text-neutral-900">
            {totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
            <span className="text-xs font-sans text-neutral-500">MAD</span>
          </div>
          <div className="text-[10px] text-neutral-400">Paiements confirmés et à la livraison</div>
        </div>

        <div className="p-5 bg-white border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Commandes Totales
            </span>
            <ShoppingBag className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-serif font-medium text-neutral-900">
            {totalOrders}
          </div>
          <div className="text-[10px] text-neutral-400">Dont {deliveredCount} livrées</div>
        </div>

        <div className="p-5 bg-white border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Panier Moyen
            </span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-serif font-medium text-neutral-900">
            {avgCart.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}{" "}
            <span className="text-xs font-sans text-neutral-500">MAD</span>
          </div>
          <div className="text-[10px] text-neutral-400">Par commande finalisée</div>
        </div>

        <div className="p-5 bg-white border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Taux de Livraison
            </span>
            <Percent className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-serif font-medium text-neutral-900">
            {deliveryRate}%
          </div>
          <div className="text-[10px] text-neutral-400">
            {cancelledCount} commande(s) annulée(s)
          </div>
        </div>
      </div>

      {/* Universe Split: Homme vs Femme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                Répartition des Ventes par Univers
              </h3>
              <p className="text-xs text-neutral-500">
                Performance comparative AVELOR HOMME vs AVELOR FEMME
              </p>
            </div>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-4">
            {/* Visual ratio bar */}
            <div className="h-4 w-full bg-neutral-100 flex overflow-hidden">
              <div
                style={{ width: `${hommePct}%` }}
                className="bg-neutral-900 transition-all duration-500"
                title={`HOMME: ${hommePct}%`}
              />
              <div
                style={{ width: `${femmePct}%` }}
                className="bg-neutral-400 transition-all duration-500"
                title={`FEMME: ${femmePct}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 border border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-900" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    AVELOR HOMME
                  </span>
                </div>
                <div className="text-xl font-serif font-semibold text-neutral-900 mt-2">
                  {hommeRev.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal text-neutral-500">MAD</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Part de marché : <strong className="text-neutral-900">{hommePct}%</strong>
                </div>
              </div>

              <div className="p-4 border border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    AVELOR FEMME
                  </span>
                </div>
                <div className="text-xl font-serif font-semibold text-neutral-900 mt-2">
                  {femmeRev.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal text-neutral-500">MAD</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Part de marché : <strong className="text-neutral-900">{femmePct}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="bg-white border border-neutral-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                Revenus par Catégorie
              </h3>
              <p className="text-xs text-neutral-500">
                Volumes de vente et chiffre généré par rayon
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {analytics?.categories && analytics.categories.length > 0 ? (
              analytics.categories.map((cat, idx) => {
                const maxRev = Math.max(...analytics.categories.map((c) => c.revenue || 0), 1);
                const pct = Math.round(((cat.revenue || 0) / maxRev) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-800">{cat.name}</span>
                      <span className="font-mono text-neutral-900 font-semibold">
                        {Number(cat.revenue).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        MAD{" "}
                        <span className="text-neutral-400 font-normal">
                          ({cat.units_sold || 0} pces)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-neutral-800 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-neutral-400 text-xs">
                Aucune donnée de vente par catégorie disponible.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 6 Best-selling Products */}
      <div className="bg-white border border-neutral-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Palmarès des Meilleures Ventes
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Articles les plus plébiscités de la maison AVELOR
            </p>
          </div>
          <Award className="w-4 h-4 text-neutral-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.top_products && analytics.top_products.length > 0 ? (
            analytics.top_products.map((prod, idx) => (
              <div
                key={prod.id || idx}
                className="p-3 border border-neutral-200 flex items-center gap-3 hover:border-neutral-400 transition-colors bg-neutral-50/50"
              >
                <div className="relative w-14 h-16 bg-neutral-200 border border-neutral-300 shrink-0 overflow-hidden">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-serif font-bold text-neutral-400">
                      #{idx + 1}
                    </div>
                  )}
                  <span className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold px-1 font-mono">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-neutral-900 truncate">
                    {prod.title}
                  </h4>
                  <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">
                    {Number(prod.price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                    MAD
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-1 flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                      {prod.units_sold || 0} vendus
                    </span>
                    <span>•</span>
                    <span>
                      {(prod.revenue || 0).toLocaleString("fr-FR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      MAD
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-neutral-400 text-xs">
              Les statistiques des meilleures ventes apparaîtront au fil des commandes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
