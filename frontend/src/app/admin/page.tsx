"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  AdminStats,
  Order,
  Product,
  Promotion,
  Campaign,
  AuditLog,
  Category,
  Customer,
  InventoryItem,
  InventoryMovementRecord,
  AnalyticsData,
  StoreSettings,
} from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Loader2,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";

// Admin components
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { ProductsManager } from "@/components/admin/ProductsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import CustomersManager from "@/components/admin/CustomersManager";
import InventoryManager from "@/components/admin/InventoryManager";
import AnalyticsManager from "@/components/admin/AnalyticsManager";
import MarketingManager from "@/components/admin/MarketingManager";
import ContentManager from "@/components/admin/ContentManager";
import SettingsManager from "@/components/admin/SettingsManager";
import AuditLogManager from "@/components/admin/AuditLogManager";
import { AccountSettingsManager } from "@/components/admin/AccountSettingsManager";

function AdminPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isAdmin } = useAuth();

  // Navigation State
  const initialTab = (searchParams.get("tab") as AdminTab) || "dashboard";
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovementRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Toast Notification State
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const notify = useCallback((message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  // Sync tab with URL
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  // Fetch all admin data concurrently
  const fetchAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const [
        statsRes,
        ordersRes,
        productsRes,
        categoriesRes,
        promosRes,
        campaignsRes,
        logsRes,
        customersRes,
        inventoryRes,
        movementsRes,
        analyticsRes,
        settingsRes,
      ] = await Promise.allSettled([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getProducts({ page_size: 50 }),
        api.getCategories(),
        api.getAdminPromotions(),
        api.getAdminCampaigns(),
        api.getAdminAuditLogs(),
        api.getAdminCustomers(),
        api.getAdminInventory(),
        api.getInventoryMovements(),
        api.getAdminAnalytics(),
        api.getAdminSettings(),
      ]);

      const toArray = (val: any) => (Array.isArray(val) ? val : val?.items || []);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (ordersRes.status === "fulfilled") setOrders(toArray(ordersRes.value));
      if (productsRes.status === "fulfilled") setProducts(toArray(productsRes.value));
      if (categoriesRes.status === "fulfilled") setCategories(toArray(categoriesRes.value));
      if (promosRes.status === "fulfilled") setPromotions(toArray(promosRes.value));
      if (campaignsRes.status === "fulfilled") setCampaigns(toArray(campaignsRes.value));
      if (logsRes.status === "fulfilled") setAuditLogs(toArray(logsRes.value));
      if (customersRes.status === "fulfilled") setCustomers(toArray(customersRes.value));
      if (inventoryRes.status === "fulfilled") setInventory(toArray(inventoryRes.value));
      if (movementsRes.status === "fulfilled") setMovements(toArray(movementsRes.value));
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
      if (settingsRes.status === "fulfilled") setSettings(settingsRes.value);
    } catch (e: any) {
      console.error("Erreur lors de la récupération des données:", e);
      notify("Une erreur est survenue lors de l'actualisation des données", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [notify]);

  // Initial load once authenticated
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchAllData();
    }
  }, [authLoading, user, isAdmin, fetchAllData]);

  // Auth Guard: Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="font-serif tracking-[0.3em] text-2xl font-light">AVELOR</div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-sans">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Vérification des accréditations de sécurité...</span>
        </div>
      </div>
    );
  }

  // Auth Guard: Unauthenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 text-center space-y-6">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-neutral-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-tight text-white">Console Administrateur</h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Cet espace est strictement réservé à la direction et au personnel autorisé de la Maison AVELOR. Veuillez vous identifier.
            </p>
          </div>
          <Link
            href="/login?redirect=/admin"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
          >
            Se Connecter
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="text-[11px] text-neutral-500">
            <Link href="/" className="hover:underline">
              ← Retourner à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Auth Guard: Non-Admin role
  if (!isAdmin && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 text-center space-y-6">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-tight text-white">Accès Non Autorisé</h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Votre compte ({user.email}) ne dispose pas des privilèges d'administrateur nécessaires pour accéder au back-office AVELOR.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
          >
            Retourner à la boutique
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Header quick "New..." action handler
  const handleCreateNew = () => {
    if (activeTab === "products") {
      setProductModalOpen(true);
    } else if (activeTab === "promotions") {
      window.dispatchEvent(new CustomEvent("admin:new-promotion"));
    } else if (activeTab === "campaigns") {
      window.dispatchEvent(new CustomEvent("admin:new-campaign"));
    } else {
      handleTabChange("products");
      setProductModalOpen(true);
    }
  };

  // Badges count for sidebar
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const lowStockCount = inventory.filter((i) => i.stock <= 5).length;

  return (
    <div className="min-h-screen bg-neutral-100 flex font-sans antialiased text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-9999 flex items-center gap-3 px-4 py-3 shadow-xl text-xs font-medium border ${
              notification.type === "success"
                ? "bg-neutral-900 text-white border-neutral-700"
                : "bg-red-950 text-red-200 border-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Onyx Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        ordersCount={orders.length}
        pendingOrdersCount={pendingOrdersCount}
        productsCount={products.length}
        lowStockCount={lowStockCount}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-neutral-50">
        {/* Sticky Header */}
        <AdminHeader
          activeTab={activeTab}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onRefresh={() => fetchAllData(true)}
          isRefreshing={isRefreshing}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          onPrimaryAction={handleCreateNew}
          onSelectTab={handleTabChange}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center text-neutral-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
              <p className="text-xs font-mono uppercase tracking-wider">
                Chargement des registres AVELOR...
              </p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "dashboard" && (
                <DashboardOverview
                  stats={stats}
                  onNavigateTab={handleTabChange}
                  onSelectOrder={(ord) => {
                    handleTabChange("orders");
                  }}
                  onQuickStockEdit={(item) => {
                    handleTabChange("inventory");
                  }}
                />
              )}

              {activeTab === "products" && (
                <ProductsManager
                  products={products}
                  categories={categories}
                  searchQuery={globalSearch}
                  onSearchChange={setGlobalSearch}
                  onCreateProduct={async (data) => {
                    await api.createProduct(data);
                    notify("Produit créé avec succès", "success");
                    await fetchAllData(true);
                  }}
                  onUpdateProduct={async (id, data) => {
                    await api.updateProduct(id, data);
                    notify("Produit mis à jour", "success");
                    await fetchAllData(true);
                  }}
                  onDeleteProduct={async (id, name) => {
                    await api.deleteProduct(id);
                    notify(`Produit "${name}" supprimé`, "success");
                    await fetchAllData(true);
                  }}
                  showModal={productModalOpen}
                  onCloseModal={() => setProductModalOpen(false)}
                  onOpenModal={() => setProductModalOpen(true)}
                />
              )}

              {activeTab === "orders" && (
                <OrdersManager
                  orders={orders}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "customers" && (
                <CustomersManager
                  customers={customers}
                  orders={orders}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                  onSelectOrder={() => {
                    handleTabChange("orders");
                  }}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryManager
                  inventory={inventory}
                  movements={movements}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "analytics" && (
                <AnalyticsManager
                  stats={stats}
                  analytics={analytics}
                  orders={orders}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "promotions" && (
                <MarketingManager
                  promotions={promotions}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "campaigns" && (
                <ContentManager
                  campaigns={campaigns}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "settings" && (
                <SettingsManager
                  settings={settings}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "audit" && (
                <AuditLogManager
                  auditLogs={auditLogs}
                  onRefresh={() => fetchAllData(true)}
                  onNotify={notify}
                />
              )}

              {activeTab === "account" && (
                <AccountSettingsManager onNotify={notify} />
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#d8c5a0]/30 border-t-[#d8c5a0] rounded-full animate-spin" />
          <p className="text-[#d8c5a0]/60 text-sm font-sans">Chargement de l&apos;espace admin…</p>
        </div>
      </div>
    }>
      <AdminPageInner />
    </Suspense>
  );
}
