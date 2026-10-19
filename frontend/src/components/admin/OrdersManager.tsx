"use client";

import React, { useState, useMemo } from "react";
import { Order, OrderStatus } from "@/types";
import { api } from "@/lib/api";
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Printer,
  X,
  AlertCircle,
  Check,
  RefreshCw,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrdersManagerProps {
  orders: Order[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  PENDING: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmée",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "En préparation",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    icon: Package,
  },
  SHIPPED: {
    label: "Expédiée",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Livrée",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: Check,
  },
  CANCELLED: {
    label: "Annulée",
    bg: "bg-neutral-100",
    text: "text-neutral-500",
    border: "border-neutral-300",
    icon: XCircle,
  },
};

const PAYMENT_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "À la livraison / En attente", bg: "bg-amber-100", text: "text-amber-900" },
  PAID: { label: "Payé", bg: "bg-emerald-100", text: "text-emerald-900" },
  FAILED: { label: "Échoué", bg: "bg-red-100", text: "text-red-900" },
  REFUNDED: { label: "Remboursé", bg: "bg-neutral-200", text: "text-neutral-800" },
};

export default function OrdersManager({
  orders,
  onRefresh,
  onNotify,
}: OrdersManagerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q) ||
        o.shipping_city?.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  // Open detail drawer
  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumberInput(order.tracking_number || "");
    setAdminNotesInput(order.notes || "");
  };

  // Update order status
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      onNotify(`Commande #${orderId} mise à jour : ${newStatus}`, "success");
      await onRefresh();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as OrderStatus } : null));
      }
    } catch (e: any) {
      onNotify(e.message || "Erreur lors de la mise à jour du statut", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Save shipping tracking info
  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setUpdatingId(selectedOrder.id);
    try {
      await api.updateOrder(selectedOrder.id, {
        tracking_number: trackingNumberInput,
        notes: adminNotesInput,
      });
      onNotify("Informations de suivi enregistrées", "success");
      await onRefresh();
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              tracking_number: trackingNumberInput,
              notes: adminNotesInput,
            }
          : null
      );
    } catch (e: any) {
      onNotify(e.message || "Erreur d'enregistrement", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onNotify(`${label} copié dans le presse-papier`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Gestion des Commandes
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {orders.length} commandes au total • Traitement, suivi Amana et statuts de livraison
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par n° de commande, client, email, ville, téléphone..."
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

        {/* Status quick tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (st) => {
              const count =
                st === "ALL"
                  ? orders.length
                  : orders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    statusFilter === st
                      ? "bg-black text-white font-medium"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <span>{st === "ALL" ? "Toutes" : STATUS_CONFIG[st]?.label || st}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === st ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 uppercase text-[10px] font-semibold tracking-wider text-neutral-600">
                <th className="py-3 px-4">Commande</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client & Contact</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 text-right">Montant (MAD)</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Paiement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucune commande trouvée correspondant à vos critères.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || {
                    label: order.status,
                    bg: "bg-neutral-100",
                    text: "text-neutral-700",
                    border: "border-neutral-300",
                    icon: Clock,
                  };
                  const StatusIcon = cfg.icon;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{order.order_number || `#${order.id}`}</span>
                          {order.tracking_number && (
                            <span
                              title={`Suivi Amana: ${order.tracking_number}`}
                              className="text-[10px] bg-neutral-100 text-neutral-700 px-1 py-0.5 rounded font-mono"
                            >
                              📦
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">
                          {order.customer_name || "Client anonyme"}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-45">
                          {order.customer_email || order.customer_phone || "Sans contact"}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-700 whitespace-nowrap">
                        <span className="font-medium">{order.shipping_city || "Maroc"}</span>
                        {order.shipping_postal_code && (
                          <span className="text-neutral-400 text-[10px] ml-1">
                            ({order.shipping_postal_code})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                        {Number(order.total_amount).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] font-normal text-neutral-500">MAD</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-[11px] font-medium py-1 px-2 border rounded-none cursor-pointer focus:outline-none ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <option value="PENDING">En attente</option>
                          <option value="CONFIRMED">Confirmée</option>
                          <option value="PROCESSING">En préparation</option>
                          <option value="SHIPPED">Expédiée</option>
                          <option value="DELIVERED">Livrée</option>
                          <option value="CANCELLED">Annulée</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold ${
                            order.payment_status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {order.payment_status === "PAID" ? "Payé" : "À réception"}
                        </span>
                      </td>

                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenDetail(order)}
                          className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
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
            Affichage de <span className="font-medium text-neutral-900">{filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> à{" "}
            <span className="font-medium text-neutral-900">
              {Math.min(page * pageSize, filteredOrders.length)}
            </span>{" "}
            sur <span className="font-medium text-neutral-900">{filteredOrders.length}</span> commandes
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

      {/* Slide-over Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                      Commande
                    </span>
                    <span className="font-mono font-semibold text-base">
                      {selectedOrder.order_number || `#${selectedOrder.id}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                    <span>
                      Passée le{" "}
                      {selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleString("fr-FR")
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                    title="Imprimer le bon"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Status Switcher Strip */}
                <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Statut de la commande
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "PENDING", label: "En attente" },
                      { key: "CONFIRMED", label: "Confirmée" },
                      { key: "PROCESSING", label: "Préparation" },
                      { key: "SHIPPED", label: "Expédiée" },
                      { key: "DELIVERED", label: "Livrée" },
                      { key: "CANCELLED", label: "Annulée" },
                    ].map((st) => (
                      <button
                        key={st.key}
                        disabled={updatingId === selectedOrder.id}
                        onClick={() => handleStatusChange(selectedOrder.id, st.key)}
                        className={`py-2 px-3 border text-xs font-medium transition-all ${
                          selectedOrder.status === st.key
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shipping & Delivery Carrier Tracking */}
                <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-neutral-700" />
                      Expédition & Numéro de Suivi (Amana Express)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ex: AMN-MA-849202"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-black"
                    />
                    <button
                      onClick={handleSaveTracking}
                      disabled={updatingId === selectedOrder.id}
                      className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-medium transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>

                {/* Customer & Shipping Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-neutral-200 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Client
                    </div>
                    <div className="font-medium text-sm text-neutral-900">
                      {selectedOrder.customer_name || "Client anonyme"}
                    </div>
                    <div className="text-neutral-600 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      <span>{selectedOrder.customer_email || "Aucun email"}</span>
                      {selectedOrder.customer_email && (
                        <button
                          onClick={() => copyToClipboard(selectedOrder.customer_email!, "Email")}
                          className="text-neutral-400 hover:text-black"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-neutral-600 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{selectedOrder.customer_phone || "Aucun téléphone"}</span>
                      {selectedOrder.customer_phone && (
                        <button
                          onClick={() =>
                            copyToClipboard(selectedOrder.customer_phone!, "Téléphone")
                          }
                          className="text-neutral-400 hover:text-black"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border border-neutral-200 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Adresse de livraison
                    </div>
                    <div className="text-neutral-800 font-medium">
                      {selectedOrder.shipping_address || "Non spécifiée"}
                    </div>
                    <div className="text-neutral-600">
                      {selectedOrder.shipping_city || "Maroc"}
                      {selectedOrder.shipping_postal_code ? ` — ${selectedOrder.shipping_postal_code}` : ""}
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      Pays : {selectedOrder.shipping_country || "Maroc"}
                    </div>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Articles commandés ({selectedOrder.items?.length || 0})
                  </div>

                  <div className="border border-neutral-200 divide-y divide-neutral-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden flex items-center justify-center">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name || item.product_name_fr}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-neutral-400" />
                              )}
                            </div>

                            <div>
                              <div className="font-medium text-neutral-900">
                                {item.product_name || item.product_name_fr}
                              </div>
                              <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                                {item.size && <span>Taille : {item.size}</span>}
                                {(item.color || item.color_name_fr) && (
                                  <>
                                    <span>•</span>
                                    <span>Couleur : {item.color || item.color_name_fr}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>Qté : {item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-neutral-900">
                              {(Number(item.unit_price) * item.quantity).toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              MAD
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {Number(item.unit_price).toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              MAD / unité
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-neutral-400">
                        Aucun détail d'article disponible
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex justify-between text-neutral-600">
                    <span>Sous-total articles</span>
                    <span>
                      {Number(selectedOrder.subtotal || selectedOrder.total_amount).toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      MAD
                    </span>
                  </div>

                  {selectedOrder.shipping_amount !== undefined && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Frais de livraison</span>
                      <span>
                        {Number(selectedOrder.shipping_amount) === 0
                          ? "Gratuit"
                          : `${Number(selectedOrder.shipping_amount).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })} MAD`}
                      </span>
                    </div>
                  )}

                  {selectedOrder.discount_amount && Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Remise code promo</span>
                      <span>
                        -
                        {Number(selectedOrder.discount_amount).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        MAD
                      </span>
                    </div>
                  )}

                  <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-sm text-neutral-900">
                    <span>Total de la commande</span>
                    <span className="font-serif">
                      {Number(selectedOrder.total_amount).toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      MAD
                    </span>
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Notes administratives & Instructions
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Notes privées réservées à l'équipe AVELOR (ex: client VIP, appel de confirmation effectué...)"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:border-black resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveTracking}
                      disabled={updatingId === selectedOrder.id}
                      className="px-4 py-1.5 bg-neutral-900 text-white hover:bg-black text-xs font-medium transition-colors"
                    >
                      Enregistrer la note
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
