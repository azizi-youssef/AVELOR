"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  AlertTriangle,
  CheckCircle,
  Truck,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, token } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "promotions" | "audit">("dashboard");
  const [stats, setStats] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire nouveau produit
  const [newProdNameFr, setNewProdNameFr] = useState("");
  const [newProdNameAr, setNewProdNameAr] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdSlug, setNewProdSlug] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdUniverse, setNewProdUniverse] = useState<"MEN" | "WOMEN">("MEN");
  const [newProdSize, setNewProdSize] = useState("50");
  const [newProdColor, setNewProdColor] = useState("Noir");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdImage, setNewProdImage] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Formulaire nouvelle promotion
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoVal, setNewPromoVal] = useState("15");
  const [newPromoType, setNewPromoType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [newPromoMin, setNewPromoMin] = useState("500");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, [token, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, o, p, pr, a] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getProducts({ page_size: 50 }),
        api.getAdminPromotions(),
        api.getAuditLogs(),
      ]);
      setStats(s);
      setOrders(o || []);
      setProducts(p.items || []);
      setPromotions(pr || []);
      setAuditLogs(a || []);
    } catch (err) {
      console.error("Erreur admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, trackingNumber?: string) => {
    try {
      await api.updateOrderStatus(orderId, {
        status,
        tracking_number: trackingNumber || undefined,
        payment_status: status === "DELIVERED" ? "PAID" : undefined,
      });
      setActionSuccess(`Statut de la commande mis à jour vers ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erreur de mise à jour");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        sku: newProdSku.trim().toUpperCase(),
        slug: newProdSlug.trim().toLowerCase(),
        name_fr: newProdNameFr.trim(),
        name_ar: newProdNameAr.trim(),
        base_price: parseFloat(newProdPrice),
        universe: newProdUniverse,
        category_id: newProdUniverse === "MEN" ? 1 : 5,
        variants: [
          {
            sku: `${newProdSku.trim().toUpperCase()}-${newProdSize}-BLK`,
            size: newProdSize,
            color_name_fr: newProdColor,
            color_name_ar: newProdColor === "Noir" ? "أسود" : newProdColor,
            color_code: "#000000",
            stock: parseInt(newProdStock),
          },
        ],
        images: [
          {
            url: newProdImage || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop",
            is_cover: true,
          },
        ],
      });
      setActionSuccess("Produit créé avec succès !");
      setTimeout(() => setActionSuccess(null), 3000);
      setNewProdNameFr("");
      setNewProdNameAr("");
      setNewProdSku("");
      setNewProdSlug("");
      setNewProdPrice("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Erreur création produit");
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPromotion({
        code: newPromoCode.trim().toUpperCase(),
        name_fr: `Remise ${newPromoCode.toUpperCase()}`,
        name_ar: `خصم ${newPromoCode.toUpperCase()}`,
        discount_type: newPromoType,
        discount_value: parseFloat(newPromoVal),
        min_order_amount: parseFloat(newPromoMin),
        is_active: true,
      });
      setActionSuccess("Code promo créé avec succès !");
      setTimeout(() => setActionSuccess(null), 3000);
      setNewPromoCode("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Erreur création promotion");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête Administration */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block mb-1">
            Maison AVELOR Maroc
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
            Panneau d'Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-xs font-medium hover:border-black transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
          <Link
            href="/"
            className="px-4 py-1.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Voir la Boutique
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Barre d'onglets */}
      <div className="flex border-b border-neutral-200 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "dashboard" ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-black"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tableau de Bord</span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "orders" ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-black"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Commandes ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "products" ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-black"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catalogue ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("promotions")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "promotions" ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-black"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Codes Promo ({promotions.length})</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : DASHBOARD STATS */}
      {activeTab === "dashboard" && stats && (
        <div className="space-y-8 fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Chiffre d'Affaires Réalisé
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-light text-black">
                {Number(stats.total_revenue).toLocaleString("fr-MA")} MAD
              </p>
              <p className="text-[11px] text-neutral-400">Commandes confirmées ou livrées</p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Commandes Totales
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-light text-black">
                {stats.total_orders}
              </p>
              <p className="text-[11px] text-neutral-400">Depuis l'ouverture du site</p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Commandes à Traiter
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-light text-amber-700">
                {stats.pending_orders}
              </p>
              <p className="text-[11px] text-neutral-400">En attente ou préparation</p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-2">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Alertes Stock Faible
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-light text-red-600">
                {stats.low_stock_count}
              </p>
              <p className="text-[11px] text-neutral-400">Variantes avec &lt; 5 unités</p>
            </div>
          </div>

          {/* Alertes Stock Faible */}
          {stats.low_stock_items && stats.low_stock_items.length > 0 && (
            <div className="border border-amber-200 bg-amber-50/50 p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Variantes de produits nécessitant un réapprovisionnement</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {stats.low_stock_items.map((item: any) => (
                  <div key={item.id} className="bg-white p-3 border border-amber-200 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-black truncate max-w-[180px]">{item.product_name}</p>
                      <p className="text-neutral-500 text-[11px]">Taille: {item.size} &bull; {item.color}</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-xs">
                      {item.stock} restants
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET 2 : GESTION DES COMMANDES */}
      {activeTab === "orders" && (
        <div className="space-y-6 fade-in">
          <div className="border border-neutral-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">N° Commande</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Paiement</th>
                  <th className="py-3 px-4 text-right">Mettre à jour le Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black">{o.order_number}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-black block">{o.customer_name}</span>
                      <span className="text-[11px] text-neutral-500">{o.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4">{o.shipping_city}</td>
                    <td className="py-3 px-4 font-semibold text-black">
                      {Number(o.total_amount).toLocaleString("fr-MA")} MAD
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-neutral-100 text-black text-[10px] font-bold">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-neutral-600 font-medium">
                        {o.payment_method === "CASH_ON_DELIVERY" ? "Espèces (COD)" : o.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "CONFIRMED")}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium text-[10px]"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "SHIPPED", `TRK-${o.id}-MA`)}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-medium text-[10px]"
                      >
                        Expédier
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "DELIVERED")}
                        className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium text-[10px]"
                      >
                        Livrée
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "CANCELLED")}
                        className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium text-[10px]"
                      >
                        Annuler
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : GESTION DU CATALOGUE PRODUITS */}
      {activeTab === "products" && (
        <div className="space-y-10 fade-in">
          {/* Formulaire Création Produit */}
          <div className="bg-neutral-50 p-6 border border-neutral-200 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              Ajouter une nouvelle création au catalogue
            </h2>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Nom Français</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Veste de Soirée Velours"
                  value={newProdNameFr}
                  onChange={(e) => setNewProdNameFr(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Nom Arabe</label>
                <input
                  type="text"
                  required
                  placeholder="سترة مخملية راقية"
                  value={newProdNameAr}
                  onChange={(e) => setNewProdNameAr(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">SKU (Référence)</label>
                <input
                  type="text"
                  required
                  placeholder="AV-M-VST-02"
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black uppercase"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Slug URL</label>
                <input
                  type="text"
                  required
                  placeholder="veste-soiree-velours-noir"
                  value={newProdSlug}
                  onChange={(e) => setNewProdSlug(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black lowercase"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Prix de Vente (MAD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="2450.00"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Univers</label>
                <select
                  value={newProdUniverse}
                  onChange={(e: any) => setNewProdUniverse(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                >
                  <option value="MEN">Homme</option>
                  <option value="WOMEN">Femme</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Taille initiale</label>
                <input
                  type="text"
                  value={newProdSize}
                  onChange={(e) => setNewProdSize(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black uppercase"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Couleur</label>
                <input
                  type="text"
                  value={newProdColor}
                  onChange={(e) => setNewProdColor(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Stock initial</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-neutral-600 mb-1 font-medium">URL Photo Haute Définition (Unsplash ou hébergée)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Publier l'Article
                </button>
              </div>
            </form>
          </div>

          {/* Liste des produits existants */}
          <div className="border border-neutral-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Nom du produit</th>
                  <th className="py-3 px-4">Univers</th>
                  <th className="py-3 px-4">Prix</th>
                  <th className="py-3 px-4">Variantes & Stock</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-black">{p.name_fr}</td>
                    <td className="py-3 px-4">{p.universe}</td>
                    <td className="py-3 px-4 font-semibold text-black">
                      {Number(p.base_price).toLocaleString("fr-MA")} MAD
                    </td>
                    <td className="py-3 px-4">
                      {p.variants?.map((v: any) => (
                        <span key={v.id} className="inline-block bg-neutral-100 px-1.5 py-0.5 rounded mr-1 text-[10px]">
                          {v.size} ({v.stock})
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-green-700 font-semibold text-[11px]">Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : PROMOTIONS */}
      {activeTab === "promotions" && (
        <div className="space-y-8 fade-in">
          <div className="bg-neutral-50 p-6 border border-neutral-200 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              Créer un nouveau code promotionnel
            </h2>
            <form onSubmit={handleCreatePromotion} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Code Promo</label>
                <input
                  type="text"
                  required
                  placeholder="AVELOR20"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 uppercase focus:outline-none focus:border-black font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Type de Réduction</label>
                <select
                  value={newPromoType}
                  onChange={(e: any) => setNewPromoType(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                >
                  <option value="PERCENTAGE">Pourcentage (%)</option>
                  <option value="FIXED">Montant Fixe (MAD)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Valeur (ex: 15% ou 100 MAD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPromoVal}
                  onChange={(e) => setNewPromoVal(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Montant Minimum (MAD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPromoMin}
                  onChange={(e) => setNewPromoMin(e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Activer le Code
                </button>
              </div>
            </form>
          </div>

          <div className="border border-neutral-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 border-b border-neutral-200 uppercase tracking-wider text-neutral-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Valeur</th>
                  <th className="py-3 px-4">Montant Minimum</th>
                  <th className="py-3 px-4">Utilisations</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {promotions.map((pr) => (
                  <tr key={pr.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black">{pr.code}</td>
                    <td className="py-3 px-4">{pr.discount_type}</td>
                    <td className="py-3 px-4 font-semibold text-black">
                      {pr.discount_type === "PERCENTAGE" ? `${pr.discount_value}%` : `${pr.discount_value} MAD`}
                    </td>
                    <td className="py-3 px-4">{Number(pr.min_order_amount).toLocaleString("fr-MA")} MAD</td>
                    <td className="py-3 px-4 font-mono">{pr.current_uses} fois</td>
                    <td className="py-3 px-4">
                      <span className="text-green-700 font-semibold">Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
