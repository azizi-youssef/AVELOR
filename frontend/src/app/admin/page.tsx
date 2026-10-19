"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Order, Product, Promotion, Campaign, AdminStats, AuditLog, Category } from "@/types";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Ticket, ShieldAlert, AlertTriangle, CheckCircle,
  Plus, RefreshCw, Search, ExternalLink, X, Eye, Trash2, DollarSign, TrendingUp, Clock,
  ArrowUpRight, ToggleLeft, ToggleRight, Layers, ShieldCheck, Loader2, Archive, Activity,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const stagger: Variants = { animate: { transition: { staggerChildren: 0.07 } } };
const cardVariant: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      duration: 0.45,
    },
  },
};

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-900 border-amber-300",
    CONFIRMED: "bg-blue-100 text-blue-900 border-blue-300",
    PROCESSING: "bg-purple-100 text-purple-900 border-purple-300",
    SHIPPED: "bg-indigo-100 text-indigo-900 border-indigo-300",
    DELIVERED: "bg-emerald-100 text-emerald-900 border-emerald-300",
    CANCELLED: "bg-red-100 text-red-900 border-red-300",
  };
  const labelMap: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmee",
    PROCESSING: "En preparation",
    SHIPPED: "Expediee",
    DELIVERED: "Livree",
    CANCELLED: "Annulee",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold tracking-wider uppercase ${colorMap[status] ?? "bg-neutral-100 text-neutral-800 border-neutral-300"}`}>
      {labelMap[status] ?? status}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 p-5 space-y-3">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-neutral-200 p-4 space-y-2">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isAdmin, token } = useAuth();
  const {} = useLanguage();
  const router = useRouter();

  type Tab = "dashboard" | "orders" | "products" | "promotions" | "campaigns" | "audit";
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [productUniverseFilter, setProductUniverseFilter] = useState("ALL");

  type Toast = { id: number; type: "success" | "error"; msg: string };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastRef = React.useRef(0);
  const pushToast = useCallback((type: "success" | "error", msg: string) => {
    const id = ++toastRef.current;
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [stockModalVariant, setStockModalVariant] = useState<{ id: number; name: string; sku: string; current: number } | null>(null);
  const [stockNewValue, setStockNewValue] = useState(0);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [newProdNameFr, setNewProdNameFr] = useState("");
  const [newProdNameAr, setNewProdNameAr] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdSlug, setNewProdSlug] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdDiscount, setNewProdDiscount] = useState("");
  const [newProdUniverse, setNewProdUniverse] = useState<"MEN" | "WOMEN">("MEN");
  const [newProdCategoryId, setNewProdCategoryId] = useState("");
  const [newProdSize, setNewProdSize] = useState("50");
  const [newProdColor, setNewProdColor] = useState("Noir");
  const [newProdColorCode, setNewProdColorCode] = useState("#111111");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdImage, setNewProdImage] = useState("");

  // Promo form
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [submittingPromo, setSubmittingPromo] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoNameFr, setNewPromoNameFr] = useState("Remise Privee AVELOR");
  const [newPromoVal, setNewPromoVal] = useState("15");
  const [newPromoType, setNewPromoType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [newPromoMin, setNewPromoMin] = useState("500");
  const [newPromoMaxUses, setNewPromoMaxUses] = useState("100");

  // Campaign form
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);
  const [newCampTitleFr, setNewCampTitleFr] = useState("");
  const [newCampTitleAr, setNewCampTitleAr] = useState("");
  const [newCampSubtitleFr, setNewCampSubtitleFr] = useState("");
  const [newCampLink, setNewCampLink] = useState("/homme");
  const [newCampImage, setNewCampImage] = useState("");
  const [newCampUniverse, setNewCampUniverse] = useState<"MEN" | "WOMEN" | "UNISEX">("MEN");

  /* Auth guard */
  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && !isAdmin) { router.push("/"); return; }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, isAdmin]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [s, o, p, pr, c, a, cats] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminOrders().catch(() => []),
        api.getProducts({ page_size: 100 }).catch(() => ({ items: [] })),
        api.getAdminPromotions().catch(() => []),
        api.getAdminCampaigns().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getCategories().catch(() => []),
      ]);
      setStats(s);
      setOrders(o || []);
      setProducts(p.items || []);
      setPromotions(pr || []);
      setCampaigns(c || []);
      setAuditLogs(a || []);
      setCategories(cats || []);
    } catch {
      pushToast("error", "Echec de chargement des donnees d'administration");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, tracking?: string) => {
    try {
      await api.updateOrderStatus(orderId, {
        status,
        tracking_number: tracking || undefined,
        payment_status: status === "DELIVERED" ? "PAID" : undefined,
      });
      pushToast("success", `Commande #${orderId} : ${status}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: status as any,
          shipment: tracking
            ? { carrier_name: "Amana Express", tracking_number: tracking }
            : selectedOrder.shipment,
        });
      }
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur de mise a jour du statut");
    }
  };

  const handleUpdateStock = async () => {
    if (!stockModalVariant) return;
    try {
      await api.updateVariantStock(stockModalVariant.id, stockNewValue);
      pushToast("success", `Stock ${stockModalVariant.sku} : ${stockNewValue} ex.`);
      setStockModalVariant(null);
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur de mise a jour du stock");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      await api.createProduct({
        name_fr: newProdNameFr.trim(),
        name_ar: newProdNameAr.trim() || newProdNameFr.trim(),
        sku: newProdSku.trim().toUpperCase(),
        slug: newProdSlug.trim().toLowerCase(),
        base_price: parseFloat(newProdPrice),
        discount_price: newProdDiscount ? parseFloat(newProdDiscount) : undefined,
        universe: newProdUniverse,
        category_id: newProdCategoryId ? parseInt(newProdCategoryId) : categories[0]?.id || 1,
        is_active: true,
        is_featured: false,
        is_new: true,
        variants: [{
          sku: `${newProdSku.trim().toUpperCase()}-${newProdSize}`,
          size: newProdSize,
          color_name_fr: newProdColor,
          color_name_ar: newProdColor,
          color_code: newProdColorCode,
          stock: parseInt(newProdStock) || 0,
          is_active: true,
        }],
        images: newProdImage ? [{ url: newProdImage.trim(), is_cover: true, sort_order: 0 }] : [],
      });
      pushToast("success", `Produit publie avec succes !`);
      setShowProductForm(false);
      setNewProdNameFr(""); setNewProdNameAr(""); setNewProdSku(""); setNewProdSlug("");
      setNewProdPrice(""); setNewProdDiscount(""); setNewProdImage("");
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur creation produit");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Confirmer la desactivation de "${name}" ?`)) return;
    try {
      await api.deleteProduct(id);
      pushToast("success", `"${name}" archive`);
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur archivage");
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPromo(true);
    try {
      await api.createPromotion({
        code: newPromoCode.trim().toUpperCase(),
        name_fr: newPromoNameFr.trim(),
        name_ar: newPromoNameFr.trim(),
        discount_type: newPromoType,
        discount_value: parseFloat(newPromoVal),
        min_order_amount: parseFloat(newPromoMin),
        max_uses: parseInt(newPromoMaxUses) || 100,
        is_active: true,
      });
      pushToast("success", `Code "${newPromoCode.toUpperCase()}" active !`);
      setShowPromoForm(false);
      setNewPromoCode("");
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur creation promo");
    } finally {
      setSubmittingPromo(false);
    }
  };

  const handleTogglePromotion = async (id: number) => {
    try {
      await api.togglePromotion(id);
      pushToast("success", "Statut promotion modifie");
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur changement statut");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCampaign(true);
    try {
      await api.createCampaign({
        title_fr: newCampTitleFr.trim(),
        title_ar: newCampTitleAr.trim() || newCampTitleFr.trim(),
        subtitle_fr: newCampSubtitleFr.trim(),
        link_url: newCampLink.trim(),
        desktop_image: newCampImage.trim(),
        target_universe: newCampUniverse,
        is_active: true,
        sort_order: campaigns.length,
      });
      pushToast("success", "Banniere creee avec succes");
      setShowCampaignForm(false);
      setNewCampTitleFr(""); setNewCampTitleAr(""); setNewCampSubtitleFr(""); setNewCampImage("");
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur creation banniere");
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm("Supprimer cette banniere ?")) return;
    try {
      await api.deleteCampaign(id);
      pushToast("success", "Banniere supprimee");
      loadData(true);
    } catch (err: any) {
      pushToast("error", err.message || "Erreur suppression");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const q = searchQuery.toLowerCase();
    return matchStatus && (!q
      || o.order_number.toLowerCase().includes(q)
      || o.customer_name.toLowerCase().includes(q)
      || (o.customer_email && o.customer_email.toLowerCase().includes(q))
      || o.customer_phone.includes(q));
  });

  const filteredProducts = products.filter((p) => {
    const matchUniverse = productUniverseFilter === "ALL" || p.universe === productUniverseFilter;
    const q = searchQuery.toLowerCase();
    return matchUniverse && (!q || p.name_fr.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  type TabCfg = { key: Tab; label: string; icon: React.ReactNode; count?: number };
  const TABS: TabCfg[] = [
    { key: "dashboard", label: "Tableau de Bord", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "orders", label: "Commandes", icon: <Package className="w-4 h-4" />, count: orders.length },
    { key: "products", label: "Catalogue", icon: <ShoppingBag className="w-4 h-4" />, count: products.length },
    { key: "promotions", label: "Codes Promo", icon: <Ticket className="w-4 h-4" />, count: promotions.length },
    { key: "campaigns", label: "Bannieres Hero", icon: <Layers className="w-4 h-4" />, count: campaigns.length },
    { key: "audit", label: "Journal Audit", icon: <ShieldAlert className="w-4 h-4" />, count: auditLogs.length },
  ];

  const inputCls = "w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black transition-colors";
  const btnPrimary = "px-6 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2";
  const btnSecondary = "px-4 py-2 bg-neutral-200 text-neutral-800 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-300 transition-colors";

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">

      {/* ── Toasts overlay ─────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-200 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ ease: EASE, duration: 0.35 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 shadow-xl border text-xs font-medium max-w-sm ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-red-50 border-red-300 text-red-900"
              }`}
            >
              {toast.type === "success"
                ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              <span className="flex-1">{toast.msg}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-black text-white border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center font-serif text-sm font-bold tracking-wider select-none">
              A
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold">AVELOR MAISON</span>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 font-mono uppercase tracking-wider">
                  {user?.role || "ADMIN"}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EN LIGNE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 tracking-wider">
                {user?.email || "Console de Controle et Gestion Centrale"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                onClick={() => setActiveTab("orders")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} en attente</span>
              </button>
            )}
            <button
              onClick={() => loadData()}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 transition-colors disabled:opacity-50"
            >
              {refreshing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Voir le Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? <DashboardSkeleton /> : (
          <>
            {/* KPI Cards */}
            {stats && (
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                <motion.div variants={cardVariant} className="bg-white border border-neutral-200 p-5 shadow-xs relative overflow-hidden group hover:border-black transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Chiffre d'Affaires</span>
                    <DollarSign className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-black font-light">
                    {Number(stats.total_revenue || 0).toLocaleString("fr-MA")}
                    <span className="text-sm font-sans font-medium text-neutral-500 ml-1">MAD</span>
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-1.5">
                    <TrendingUp className="w-3 h-3" /> Commandes validees
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                <motion.div variants={cardVariant} className="bg-white border border-neutral-200 p-5 shadow-xs relative overflow-hidden group hover:border-black transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Commandes Totales</span>
                    <Package className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-black font-light">{stats.total_orders || 0}</p>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block">Toutes periodes confondues</span>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                <motion.div variants={cardVariant} className={`border p-5 shadow-xs relative overflow-hidden group transition-colors ${
                  (stats.pending_orders || 0) > 0
                    ? "bg-amber-50 border-amber-300 hover:border-amber-500"
                    : "bg-white border-neutral-200 hover:border-black"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">A Traiter</span>
                    <Clock className={`w-4 h-4 ${(stats.pending_orders || 0) > 0 ? "text-amber-500" : "text-neutral-400"}`} />
                  </div>
                  <p className={`text-2xl sm:text-3xl font-serif font-light ${(stats.pending_orders || 0) > 0 ? "text-amber-800" : "text-black"}`}>
                    {stats.pending_orders || 0}
                  </p>
                  <span className={`text-[10px] font-medium mt-1.5 block ${(stats.pending_orders || 0) > 0 ? "text-amber-700" : "text-neutral-500"}`}>
                    {(stats.pending_orders || 0) > 0 ? "Action requise" : "Aucune commande en attente"}
                  </span>
                </motion.div>

                <motion.div variants={cardVariant} className={`border p-5 shadow-xs relative overflow-hidden group transition-colors ${
                  (stats.low_stock_count || 0) > 0
                    ? "bg-red-50 border-red-300 hover:border-red-500"
                    : "bg-white border-neutral-200 hover:border-black"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Alerte Stock</span>
                    <AlertTriangle className={`w-4 h-4 ${(stats.low_stock_count || 0) > 0 ? "text-red-500" : "text-neutral-400"}`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-black font-light">{stats.low_stock_count || 0}</p>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block">Variantes moins de 5 unites</span>
                </motion.div>
              </motion.div>
            )}

            {/* Tab bar */}
            <div className="bg-white border border-neutral-200 shadow-xs">
              <div className="flex border-b border-neutral-200 overflow-x-auto scrollbar-none">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSearchQuery(""); }}
                    className={`relative flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? "text-black font-bold bg-neutral-50"
                        : "text-neutral-500 hover:text-black hover:bg-neutral-50/50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 text-neutral-800">
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="activeTabBar"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                        transition={{ ease: EASE, duration: 0.3 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Toolbar */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100">
                <div className="relative flex-1 min-w-55 max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par reference, client, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "products" && (
                    <button onClick={() => setShowProductForm((v) => !v)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors">
                      {showProductForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{showProductForm ? "Fermer" : "Nouveau Produit"}</span>
                    </button>
                  )}
                  {activeTab === "promotions" && (
                    <button onClick={() => setShowPromoForm((v) => !v)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors">
                      {showPromoForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{showPromoForm ? "Fermer" : "Nouveau Code"}</span>
                    </button>
                  )}
                  {activeTab === "campaigns" && (
                    <button onClick={() => setShowCampaignForm((v) => !v)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors">
                      {showCampaignForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{showCampaignForm ? "Fermer" : "Nouvelle Banniere"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">

              {/* ── Dashboard ── */}
              {activeTab === "dashboard" && (
                <motion.div key="dashboard" {...fadeUp} transition={{ ease: EASE, duration: 0.4 }} className="space-y-8">
                  {stats ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white border border-neutral-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Commandes Recentes</h2>
                            <p className="text-xs text-neutral-400 mt-0.5">Dernieres transactions enregistrees</p>
                          </div>
                          <button onClick={() => setActiveTab("orders")} className="text-xs font-semibold text-black hover:underline flex items-center gap-1">
                            <span>Voir tout</span><ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {stats.recent_orders && stats.recent_orders.length > 0 ? (
                            stats.recent_orders.map((o: any) => (
                              <div key={o.id} className="py-3 flex items-center justify-between text-xs gap-4">
                                <div className="min-w-0">
                                  <span className="font-mono font-bold text-black block truncate">{o.order_number}</span>
                                  <span className="text-neutral-500 truncate block">{o.customer_name}</span>
                                </div>
                                <div className="text-right shrink-0 space-y-1">
                                  <span className="font-semibold text-black block font-mono">
                                    {Number(o.total_amount).toLocaleString("fr-MA")} MAD
                                  </span>
                                  <StatusBadge status={o.status} />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 flex flex-col items-center gap-3 text-neutral-400">
                              <Package className="w-8 h-8" strokeWidth={1} />
                              <p className="text-xs">Aucune commande recente</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white border border-neutral-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-black flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />Alertes Stock Critique
                            </h2>
                            <p className="text-xs text-neutral-400 mt-0.5">Variantes a moins de 5 unites</p>
                          </div>
                          <button onClick={() => setActiveTab("products")} className="text-xs font-semibold text-black hover:underline flex items-center gap-1">
                            <span>Inventaire</span><ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {stats.low_stock_items && stats.low_stock_items.length > 0 ? (
                            stats.low_stock_items.map((item) => (
                              <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-3">
                                <div className="min-w-0">
                                  <span className="font-medium text-black block truncate">{item.product_name}</span>
                                  <span className="text-[11px] text-neutral-500 font-mono">{item.sku} T.{item.size}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-bold text-red-600 font-mono px-2 py-0.5 bg-red-50 border border-red-200">{item.stock} ex.</span>
                                  <button
                                    onClick={() => { setStockModalVariant({ id: item.id, name: item.product_name, sku: item.sku, current: item.stock }); setStockNewValue(item.stock + 10); }}
                                    className="px-2.5 py-1 bg-black text-white text-[11px] font-medium hover:bg-neutral-800 transition-colors"
                                  >
                                    + Reappro
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 flex flex-col items-center gap-3 text-emerald-600">
                              <ShieldCheck className="w-8 h-8" strokeWidth={1} />
                              <p className="text-xs font-medium">Tous les stocks sont au-dessus du seuil critique</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-neutral-200 p-12 text-center text-neutral-400 text-sm">Aucune statistique disponible</div>
                  )}
                </motion.div>
              )}

              {/* ── Orders ── */}
              {activeTab === "orders" && (
                <motion.div key="orders" {...fadeUp} transition={{ ease: EASE, duration: 0.4 }} className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: "Toutes", val: "ALL" },
                      { label: "En attente", val: "PENDING" },
                      { label: "Confirmees", val: "CONFIRMED" },
                      { label: "En preparation", val: "PROCESSING" },
                      { label: "Expediees", val: "SHIPPED" },
                      { label: "Livrees", val: "DELIVERED" },
                      { label: "Annulees", val: "CANCELLED" },
                    ].map((f) => (
                      <button key={f.val} onClick={() => setOrderStatusFilter(f.val)}
                        className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          orderStatusFilter === f.val ? "bg-black text-white" : "bg-white border border-neutral-300 text-neutral-600 hover:border-black"
                        }`}>
                        {f.label}
                        {f.val !== "ALL" && (
                          <span className="ml-1.5 text-[10px] opacity-70">({orders.filter((o) => o.status === f.val).length})</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white border border-neutral-200 shadow-xs overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Commande</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Montant</th>
                          <th className="py-3 px-4">Paiement</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-black">{o.order_number}</td>
                              <td className="py-3 px-4 text-neutral-500">
                                {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium text-black block">{o.customer_name}</span>
                                <span className="text-neutral-400 text-[11px] font-mono">{o.customer_phone}</span>
                              </td>
                              <td className="py-3 px-4 font-bold text-black font-mono">{Number(o.total_amount).toLocaleString("fr-MA")} MAD</td>
                              <td className="py-3 px-4 text-neutral-600">{o.payment_method === "CASH_ON_DELIVERY" ? "COD" : "Carte"}</td>
                              <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => { setSelectedOrder(o); setTrackingInput(o.shipment?.tracking_number || ""); }}
                                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium border border-neutral-300 transition-colors inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" /><span>Details</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center">
                              <div className="flex flex-col items-center gap-3 text-neutral-400">
                                <Package className="w-8 h-8" strokeWidth={1} />
                                <span className="text-xs">Aucune commande trouvee</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ── Products ── */}
              {activeTab === "products" && (
                <motion.div key="products" {...fadeUp} transition={{ ease: EASE, duration: 0.4 }} className="space-y-5">
                  <AnimatePresence>
                    {showProductForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        transition={{ ease: EASE, duration: 0.35 }}
                        className="bg-white border-2 border-black p-6 shadow-md space-y-5"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-black">Ajouter un Nouveau Produit</h2>
                          <button onClick={() => setShowProductForm(false)} className="text-neutral-400 hover:text-black"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div><label className="block text-neutral-700 font-semibold mb-1">Nom Francais *</label><input type="text" required placeholder="Costume Croise Laine Royale" value={newProdNameFr} onChange={(e) => setNewProdNameFr(e.target.value)} className={inputCls} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Nom Arabe</label><input type="text" placeholder="بدلة صوف ملكية" value={newProdNameAr} onChange={(e) => setNewProdNameAr(e.target.value)} className={inputCls + " text-right"} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">SKU Unique *</label><input type="text" required placeholder="AV-M-CST-03" value={newProdSku} onChange={(e) => setNewProdSku(e.target.value)} className={inputCls + " font-mono uppercase"} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Slug URL *</label><input type="text" required placeholder="costume-croise-laine" value={newProdSlug} onChange={(e) => setNewProdSlug(e.target.value)} className={inputCls} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Prix de Base (MAD) *</label><input type="number" step="0.01" required placeholder="2890" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className={inputCls} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Prix Promo (MAD)</label><input type="number" step="0.01" placeholder="2490" value={newProdDiscount} onChange={(e) => setNewProdDiscount(e.target.value)} className={inputCls} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Univers *</label><select value={newProdUniverse} onChange={(e: any) => setNewProdUniverse(e.target.value)} className={inputCls}><option value="MEN">Homme</option><option value="WOMEN">Femme</option></select></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Categorie</label><select value={newProdCategoryId} onChange={(e) => setNewProdCategoryId(e.target.value)} className={inputCls}><option value="">Selectionner</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr} ({c.universe})</option>)}</select></div>
                          <div>
                            <label className="block text-neutral-700 font-semibold mb-1">Taille & Stock initial</label>
                            <div className="flex gap-2">
                              <input type="text" placeholder="50/M" value={newProdSize} onChange={(e) => setNewProdSize(e.target.value)} className="w-1/2 bg-neutral-50 border border-neutral-300 px-2 py-2 text-center font-bold text-xs focus:outline-none focus:border-black" />
                              <input type="number" placeholder="Qte" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="w-1/2 bg-neutral-50 border border-neutral-300 px-2 py-2 text-center font-bold text-xs focus:outline-none focus:border-black" />
                            </div>
                          </div>
                          <div className="sm:col-span-3"><label className="block text-neutral-700 font-semibold mb-1">URL Image HD *</label><input type="url" required placeholder="https://images.unsplash.com/..." value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} className={inputCls} /></div>
                          <div className="sm:col-span-3 flex justify-end gap-3 pt-2 border-t border-neutral-200">
                            <button type="button" onClick={() => setShowProductForm(false)} className={btnSecondary}>Annuler</button>
                            <button type="submit" disabled={submittingProduct} className={btnPrimary}>
                              {submittingProduct && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              Publier l'Article
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-medium">Filtrer :</span>
                    {["ALL", "MEN", "WOMEN"].map((u) => (
                      <button key={u} onClick={() => setProductUniverseFilter(u)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${productUniverseFilter === u ? "bg-black text-white font-bold" : "bg-white border border-neutral-300 text-neutral-700 hover:border-black"}`}>
                        {u === "ALL" ? "Tous" : u === "MEN" ? "Homme" : "Femme"}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-neutral-200 shadow-xs overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Apercu</th>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4">Produit</th>
                          <th className="py-3 px-4">Univers</th>
                          <th className="py-3 px-4">Prix</th>
                          <th className="py-3 px-4">Variantes</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => {
                            const coverImg = p.images?.find((img) => img.is_cover) || p.images?.[0];
                            return (
                              <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="py-3 px-4">{coverImg?.url ? <img src={coverImg.url} alt={p.name_fr} className="w-10 h-12 object-cover bg-neutral-100 border border-neutral-200" /> : <div className="w-10 h-12 bg-neutral-200 flex items-center justify-center text-[9px] text-neutral-400">N/A</div>}</td>
                                <td className="py-3 px-4 font-mono font-bold text-black text-[11px]">{p.sku}</td>
                                <td className="py-3 px-4"><span className="font-semibold text-black block">{p.name_fr}</span><span className="text-[11px] text-neutral-400">{p.name_ar}</span></td>
                                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-neutral-100 text-[10px] font-semibold uppercase">{p.universe === "MEN" ? "HOMME" : "FEMME"}</span></td>
                                <td className="py-3 px-4 font-mono font-bold text-black">{Number(p.base_price).toLocaleString("fr-MA")} MAD</td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {p.variants?.map((v) => (
                                      <button key={v.id}
                                        onClick={() => { setStockModalVariant({ id: v.id, name: p.name_fr, sku: v.sku, current: v.stock }); setStockNewValue(v.stock); }}
                                        className={`px-1.5 py-0.5 text-[10px] border transition-colors flex items-center gap-1 ${v.stock < 5 ? "bg-red-50 text-red-700 border-red-300 font-bold hover:bg-red-100" : "bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200"}`}
                                        title="Cliquer pour ajuster le stock"
                                      >
                                        <span style={{ background: v.color_code }} className="w-2 h-2 rounded-full border border-neutral-300 inline-block shrink-0" />
                                        {v.size}: {v.stock}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4"><span className={`px-2 py-0.5 text-[10px] font-bold ${p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"}`}>{p.is_active ? "ACTIF" : "ARCHIVE"}</span></td>
                                <td className="py-3 px-4 text-right space-x-1.5">
                                  <Link href={`/products/${p.slug}`} target="_blank" className="p-1.5 text-neutral-600 hover:text-black inline-block" title="Voir page publique"><ExternalLink className="w-3.5 h-3.5" /></Link>
                                  <button onClick={() => handleDeleteProduct(p.id, p.name_fr)} className="p-1.5 text-red-600 hover:text-red-800 inline-block" title="Archiver"><Archive className="w-3.5 h-3.5" /></button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={8} className="py-12 text-center"><div className="flex flex-col items-center gap-3 text-neutral-400"><ShoppingBag className="w-8 h-8" strokeWidth={1} /><span className="text-xs">Aucun article correspondant</span></div></td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ── Promotions ── */}
              {activeTab === "promotions" && (
                <motion.div key="promotions" {...fadeUp} transition={{ ease: EASE, duration: 0.4 }} className="space-y-5">
                  <AnimatePresence>
                    {showPromoForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        transition={{ ease: EASE, duration: 0.35 }}
                        className="bg-white border-2 border-black p-6 shadow-md space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-black">Creer un Code Privilege AVELOR</h2>
                          <button onClick={() => setShowPromoForm(false)} className="text-neutral-400 hover:text-black"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreatePromotion} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                          <div><label className="block text-neutral-700 font-semibold mb-1">Code Promo *</label><input type="text" required placeholder="AVELOR25" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} className={inputCls + " uppercase font-mono font-bold"} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Type</label><select value={newPromoType} onChange={(e: any) => setNewPromoType(e.target.value)} className={inputCls}><option value="PERCENTAGE">Pourcentage (%)</option><option value="FIXED">Montant Fixe (MAD)</option></select></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Valeur *</label><input type="number" step="0.01" required placeholder="20" value={newPromoVal} onChange={(e) => setNewPromoVal(e.target.value)} className={inputCls + " font-bold"} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Panier Min. (MAD) *</label><input type="number" step="0.01" required placeholder="500" value={newPromoMin} onChange={(e) => setNewPromoMin(e.target.value)} className={inputCls} /></div>
                          <div className="sm:col-span-4 flex justify-end gap-3 pt-2 border-t border-neutral-200">
                            <button type="button" onClick={() => setShowPromoForm(false)} className={btnSecondary}>Annuler</button>
                            <button type="submit" disabled={submittingPromo} className={btnPrimary}>
                              {submittingPromo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              Activer le Code
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="bg-white border border-neutral-200 shadow-xs overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                        <tr><th className="py-3 px-4">Code</th><th className="py-3 px-4">Description</th><th className="py-3 px-4">Valeur</th><th className="py-3 px-4">Panier Min.</th><th className="py-3 px-4">Utilisations</th><th className="py-3 px-4">Statut</th><th className="py-3 px-4 text-right">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {promotions.length > 0 ? (
                          promotions.map((pr) => (
                            <tr key={pr.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-black tracking-wider">{pr.code}</td>
                              <td className="py-3 px-4 text-neutral-600">{pr.name_fr}</td>
                              <td className="py-3 px-4 font-bold text-black">{pr.discount_type === "PERCENTAGE" ? `-${pr.discount_value}%` : `-${pr.discount_value} MAD`}</td>
                              <td className="py-3 px-4 font-mono">{Number(pr.min_order_amount).toLocaleString("fr-MA")} MAD</td>
                              <td className="py-3 px-4 font-mono">
                                <span className={pr.current_uses >= (pr.max_uses || 999) ? "text-red-600 font-bold" : "text-neutral-700"}>{pr.current_uses}</span>
                                <span className="text-neutral-400"> / {pr.max_uses || "inf"}</span>
                              </td>
                              <td className="py-3 px-4"><span className={`px-2 py-0.5 text-[10px] font-bold ${pr.is_active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"}`}>{pr.is_active ? "ACTIF" : "INACTIF"}</span></td>
                              <td className="py-3 px-4 text-right">
                                <button onClick={() => handleTogglePromotion(pr.id)} className="px-2.5 py-1 text-[11px] font-semibold border transition-colors inline-flex items-center gap-1 hover:border-black">
                                  {pr.is_active ? <><ToggleLeft className="w-3.5 h-3.5" />Desactiver</> : <><ToggleRight className="w-3.5 h-3.5" />Activer</>}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={7} className="py-12 text-center"><div className="flex flex-col items-center gap-3 text-neutral-400"><Ticket className="w-8 h-8" strokeWidth={1} /><span className="text-xs">Aucun code promotionnel</span></div></td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ── Campaigns ── */}
              {activeTab === "campaigns" && (
                <motion.div key="campaigns" {...fadeUp} transition={{ ease: EASE, duration: 0.4 }} className="space-y-5">
                  <AnimatePresence>
                    {showCampaignForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        transition={{ ease: EASE, duration: 0.35 }}
                        className="bg-white border-2 border-black p-6 shadow-md space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-black">Ajouter une Banniere Hero</h2>
                          <button onClick={() => setShowCampaignForm(false)} className="text-neutral-400 hover:text-black"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div><label className="block text-neutral-700 font-semibold mb-1">Titre Francais *</label><input type="text" required placeholder="Collection Hiver Royale" value={newCampTitleFr} onChange={(e) => setNewCampTitleFr(e.target.value)} className={inputCls} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Titre Arabe</label><input type="text" placeholder="تشكيلة الشتاء" value={newCampTitleAr} onChange={(e) => setNewCampTitleAr(e.target.value)} className={inputCls + " text-right"} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Sous-titre</label><input type="text" placeholder="L'elegance intemporelle..." value={newCampSubtitleFr} onChange={(e) => setNewCampSubtitleFr(e.target.value)} className={inputCls} /></div>
                          <div><label className="block text-neutral-700 font-semibold mb-1">Lien Destination</label><input type="text" placeholder="/homme ou /femme" value={newCampLink} onChange={(e) => setNewCampLink(e.target.value)} className={inputCls} /></div>
                          <div className="sm:col-span-2"><label className="block text-neutral-700 font-semibold mb-1">URL Photo HD *</label><input type="url" required placeholder="https://images.unsplash.com/..." value={newCampImage} onChange={(e) => setNewCampImage(e.target.value)} className={inputCls} /></div>
                          <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-neutral-200">
                            <button type="button" onClick={() => setShowCampaignForm(false)} className={btnSecondary}>Annuler</button>
                            <button type="submit" disabled={submittingCampaign} className={btnPrimary}>
                              {submittingCampaign && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              Enregistrer la Banniere
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaigns.length > 0 ? (
                      campaigns.map((camp) => (
                        <motion.div key={camp.id}
                          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ ease: EASE, duration: 0.4 }}
                          className="bg-white border border-neutral-200 shadow-xs overflow-hidden group"
                        >
                          <div className="relative h-48 bg-neutral-900 overflow-hidden">
                            <img src={camp.desktop_image} alt={camp.title_fr} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                              <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold">{camp.target_universe}</span>
                              <h3 className="text-base font-serif font-light">{camp.title_fr}</h3>
                              {camp.subtitle_fr && <p className="text-xs text-neutral-300 line-clamp-1">{camp.subtitle_fr}</p>}
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between text-xs border-t border-neutral-100">
                            <span className="text-neutral-500 font-mono text-[11px] truncate">-&gt; {camp.link_url}</span>
                            <button onClick={() => handleDeleteCampaign(camp.id)} className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 shrink-0 ml-2">
                              <Trash2 className="w-3.5 h-3.5" /><span>Supprimer</span>
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-2 py-16 flex flex-col items-center gap-4 text-neutral-400 bg-white border border-neutral-200">
                        <Layers className="w-10 h-10" strokeWidth={1} />
                        <p className="text-xs text-center max-w-xs">Aucune banniere configuree. Cliquez sur "Nouvelle Banniere" pour en ajouter une.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Audit ── */}
              {activeTab === "audit" && (
                <motion.div key="audit" {...fadeUp} transition={{ ease: EASE, duration: 0.4 }}>
                  <div className="bg-white border border-neutral-200 shadow-xs overflow-x-auto">
                    <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
                      <Activity className="w-4 h-4 text-neutral-600" />
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-black">Journal de Securite et Tracabilite</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Enregistrement immuable des actions sur la plateforme AVELOR</p>
                      </div>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                        <tr><th className="py-3 px-4">Date & Heure</th><th className="py-3 px-4">Action</th><th className="py-3 px-4">Entite</th><th className="py-3 px-4">Auteur</th><th className="py-3 px-4">Details</th><th className="py-3 px-4">IP</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                        {auditLogs.length > 0 ? (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 px-4 text-neutral-500">{new Date(log.created_at).toLocaleString("fr-FR")}</td>
                              <td className="py-3 px-4"><span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-[10px] font-bold uppercase">{log.action}</span></td>
                              <td className="py-3 px-4 text-neutral-700">{log.entity} #{log.entity_id}</td>
                              <td className="py-3 px-4 text-neutral-900 font-medium">{log.user_email || "Systeme"}</td>
                              <td className="py-3 px-4 text-neutral-600 font-sans text-xs">{log.details}</td>
                              <td className="py-3 px-4 text-neutral-400">{log.ip_address || "Interne"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={6} className="py-12 text-center"><div className="flex flex-col items-center gap-3 text-neutral-400 font-sans"><ShieldCheck className="w-8 h-8" strokeWidth={1} /><span className="text-xs">Aucun evenement d'audit enregistre</span></div></td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </>
        )}
      </main>

      {/* ── Modal commande ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
              transition={{ ease: EASE, duration: 0.4 }}
              className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-300 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sticky top-0 bg-white z-10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">Detail de la commande</span>
                  <h3 className="text-lg font-serif font-light text-black">#{selectedOrder.order_number}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-black p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 border border-neutral-200">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Client</span>
                    <p className="font-semibold text-black">{selectedOrder.customer_name}</p>
                    <p className="text-neutral-600">{selectedOrder.customer_email}</p>
                    <p className="text-neutral-600 font-mono">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Livraison Maroc</span>
                    <p className="text-neutral-800">{selectedOrder.shipping_address}</p>
                    <p className="text-neutral-800 font-semibold">{selectedOrder.shipping_city}</p>
                    {selectedOrder.delivery_notes && (
                      <p className="text-amber-800 text-[11px] italic mt-1">Note: {selectedOrder.delivery_notes}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black block">Articles ({selectedOrder.items?.length || 0})</span>
                  <div className="border border-neutral-200 divide-y divide-neutral-200 text-xs">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="font-semibold text-black block">{item.product_name_fr}</span>
                          <span className="text-neutral-500 font-mono text-[11px]">Ref: {item.sku} T.{item.size} {item.color_name_fr} x{item.quantity}</span>
                        </div>
                        <span className="font-mono font-bold text-black shrink-0">{Number(item.total_price).toLocaleString("fr-MA")} MAD</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-right text-xs space-y-1 pt-2 pr-1">
                    <div className="flex justify-between text-neutral-500"><span>Sous-total :</span><span className="font-mono">{Number(selectedOrder.subtotal).toLocaleString("fr-MA")} MAD</span></div>
                    <div className="flex justify-between text-neutral-500"><span>Frais de livraison :</span><span className="font-mono">{Number(selectedOrder.shipping_fee).toLocaleString("fr-MA")} MAD</span></div>
                    <div className="flex justify-between text-sm font-bold text-black border-t border-neutral-200 pt-2"><span>Total commande :</span><span className="font-mono">{Number(selectedOrder.total_amount).toLocaleString("fr-MA")} MAD</span></div>
                  </div>
                </div>
                <div className="space-y-3 bg-neutral-50 p-4 border border-neutral-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black block">Gestion expedition & Statut</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-neutral-600">Statut actuel :</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <input
                    type="text"
                    placeholder="Numero de suivi Amana / Aramex..."
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Confirmer", status: "CONFIRMED", cls: "bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100" },
                      { label: "En preparation", status: "PROCESSING", cls: "bg-purple-50 text-purple-900 border border-purple-300 hover:bg-purple-100" },
                      { label: "Expedier", status: "SHIPPED", cls: "bg-indigo-50 text-indigo-900 border border-indigo-300 hover:bg-indigo-100" },
                      { label: "Livre & Paye", status: "DELIVERED", cls: "bg-emerald-600 text-white hover:bg-emerald-700" },
                    ].map(({ label, status, cls }) => (
                      <button key={status} onClick={() => handleUpdateOrderStatus(selectedOrder.id, status, trackingInput)}
                        className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${cls}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "CANCELLED")}
                    className="w-full py-2 text-xs font-semibold uppercase tracking-wider border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Annuler la commande
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal stock ─────────────────────────────────────────── */}
      <AnimatePresence>
        {stockModalVariant && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ease: EASE, duration: 0.3 }}
              className="bg-white max-w-sm w-full border border-neutral-300 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-black">Mise a jour du Stock</h3>
                <button onClick={() => setStockModalVariant(null)} className="text-neutral-400 hover:text-black transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-black">{stockModalVariant.name}</p>
                <p className="font-mono text-neutral-500">Ref: {stockModalVariant.sku}</p>
                <p className="text-neutral-600">Stock actuel : <strong className="font-mono text-black">{stockModalVariant.current} ex.</strong></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Nouveau Stock Physique</label>
                <input
                  type="number" min="0" value={stockNewValue}
                  onChange={(e) => setStockNewValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-300 p-3 text-center text-2xl font-bold font-mono focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStockModalVariant(null)} className="flex-1 py-2.5 bg-neutral-200 text-neutral-800 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-300 transition-colors">Annuler</button>
                <button onClick={handleUpdateStock} className="flex-1 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors">Enregistrer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
