"use client";

import React, { useState, useMemo } from "react";
import { Customer, Order } from "@/types";
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Award,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomersManagerProps {
  customers: Customer[];
  orders: Order[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
  onSelectOrder?: (order: Order) => void;
}

export default function CustomersManager({
  customers,
  orders,
  onRefresh,
  onNotify,
  onSelectOrder,
}: CustomersManagerProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q);

      let matchTier = true;
      if (tierFilter === "VIP") {
        matchTier = (c.total_spent || 0) >= 2000;
      } else if (tierFilter === "RETURNING") {
        matchTier = (c.orders_count || 0) > 1;
      } else if (tierFilter === "NEW") {
        matchTier = (c.orders_count || 0) <= 1;
      }

      return matchSearch && matchTier;
    });
  }, [customers, search, tierFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  // Customer orders
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        (o.customer_email && o.customer_email.toLowerCase() === selectedCustomer.email.toLowerCase()) ||
        o.user_id === selectedCustomer.id
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Gestion de la Clientèle
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {customers.length} clients enregistrés • Profils, fidélité et historique des commandes
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
            Total Comptes
          </div>
          <div className="text-2xl font-serif text-neutral-900 mt-1">
            {customers.length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Comptes acheteurs actifs</div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Clients VIP (&gt; 2 000 MAD)
          </div>
          <div className="text-2xl font-serif text-neutral-900 mt-1">
            {customers.filter((c) => (c.total_spent || 0) >= 2000).length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Fidélité haute valeur</div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Clients Récurents
          </div>
          <div className="text-2xl font-serif text-neutral-900 mt-1">
            {customers.filter((c) => (c.orders_count || 0) > 1).length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Plus d'une commande</div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Dépense Moyenne
          </div>
          <div className="text-2xl font-serif text-neutral-900 mt-1">
            {customers.length > 0
              ? (
                  customers.reduce((acc, c) => acc + (c.total_spent || 0), 0) /
                  (customers.filter((c) => (c.orders_count || 0) > 0).length || 1)
                ).toLocaleString("fr-FR", { maximumFractionDigits: 0 })
              : 0}{" "}
            <span className="text-xs font-normal text-neutral-500">MAD</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Par client actif</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, ville..."
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

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "ALL", label: "Tous" },
            { key: "VIP", label: "VIP (> 2 000 MAD)" },
            { key: "RETURNING", label: "Fidèles (> 1 cde)" },
            { key: "NEW", label: "Nouveaux" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTierFilter(t.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                tierFilter === t.key
                  ? "bg-black text-white font-medium"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 uppercase text-[10px] font-semibold tracking-wider text-neutral-600">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Ville</th>
                <th className="py-3 px-4 text-center">Commandes</th>
                <th className="py-3 px-4 text-right">Total Dépensé</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const isVip = (cust.total_spent || 0) >= 2000;
                  const initials = (cust.full_name || cust.email || "C")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 flex items-center gap-1.5">
                              <span>{cust.full_name || "Client anonyme"}</span>
                              {isVip && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-bold tracking-wider uppercase">
                                  <Award className="w-2.5 h-2.5" /> VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              Inscrit le{" "}
                              {cust.created_at
                                ? new Date(cust.created_at).toLocaleDateString("fr-FR")
                                : "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                        {cust.email}
                      </td>

                      <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">
                        {cust.phone || "—"}
                      </td>

                      <td className="py-3 px-4 text-neutral-700 whitespace-nowrap font-medium">
                        {cust.city || "Maroc"}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-medium">
                          {cust.orders_count || 0}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                        {(cust.total_spent || 0).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] font-normal text-neutral-500">MAD</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            cust.role === "ADMIN"
                              ? "bg-black text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {cust.role}
                        </span>
                      </td>

                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-2.5 py-1 text-xs text-neutral-700 hover:text-black border border-neutral-200 hover:border-black transition-colors"
                        >
                          Voir profil
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
            Affichage de <span className="font-medium text-neutral-900">{filteredCustomers.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> à{" "}
            <span className="font-medium text-neutral-900">
              {Math.min(page * pageSize, filteredCustomers.length)}
            </span>{" "}
            sur <span className="font-medium text-neutral-900">{filteredCustomers.length}</span> clients
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

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white border border-neutral-300 shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-serif text-base font-bold">
                    {(selectedCustomer.full_name || selectedCustomer.email || "C")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium font-serif">
                        {selectedCustomer.full_name || "Client anonyme"}
                      </h3>
                      {(selectedCustomer.total_spent || 0) >= 2000 && (
                        <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 text-center">
                    <div className="text-[10px] uppercase font-semibold text-neutral-500">
                      Total Dépensé
                    </div>
                    <div className="text-lg font-serif font-semibold text-neutral-900 mt-1">
                      {(selectedCustomer.total_spent || 0).toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-normal">MAD</span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 text-center">
                    <div className="text-[10px] uppercase font-semibold text-neutral-500">
                      Commandes
                    </div>
                    <div className="text-lg font-serif font-semibold text-neutral-900 mt-1">
                      {selectedCustomer.orders_count || 0}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 text-center">
                    <div className="text-[10px] uppercase font-semibold text-neutral-500">
                      Panier Moyen
                    </div>
                    <div className="text-lg font-serif font-semibold text-neutral-900 mt-1">
                      {(selectedCustomer.orders_count || 0) > 0
                        ? (
                            (selectedCustomer.total_spent || 0) /
                            selectedCustomer.orders_count!
                          ).toLocaleString("fr-FR", { maximumFractionDigits: 0 })
                        : 0}{" "}
                      <span className="text-xs font-normal">MAD</span>
                    </div>
                  </div>
                </div>

                {/* Contact information details */}
                <div className="p-4 border border-neutral-200 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Coordonnées du client
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-neutral-700">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Email :</span>
                      <span className="font-mono">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Téléphone :</span>
                      <span>{selectedCustomer.phone || "Non renseigné"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Ville :</span>
                      <span className="font-medium">{selectedCustomer.city || "Maroc"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Rôle :</span>
                      <span className="uppercase font-semibold text-[10px]">{selectedCustomer.role}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Orders History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      Historique des commandes ({customerOrders.length})
                    </div>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="p-6 border border-neutral-200 text-center text-neutral-400 bg-neutral-50">
                      Aucune commande enregistrée pour ce client.
                    </div>
                  ) : (
                    <div className="border border-neutral-200 divide-y divide-neutral-100">
                      {customerOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                        >
                          <div>
                            <div className="font-mono font-medium text-neutral-900 flex items-center gap-2">
                              <span>{ord.order_number || `#${ord.id}`}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-700">
                                {ord.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}{" "}
                              • {ord.items?.length || 0} article(s)
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-neutral-900">
                              {Number(ord.total_amount).toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              MAD
                            </div>
                            {onSelectOrder && (
                              <button
                                onClick={() => {
                                  setSelectedCustomer(null);
                                  onSelectOrder(ord);
                                }}
                                className="text-[10px] text-neutral-500 hover:text-black underline mt-0.5 inline-block"
                              >
                                Ouvrir commande →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
