"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { Package, User, MapPin, LogOut, ArrowRight, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  const { user, token, logout, isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && !loading) {
      router.push("/login");
      return;
    }

    if (token) {
      api.getMyOrders()
        .then((res) => setOrders(res || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [token, loading, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold">En attente</span>;
      case "CONFIRMED":
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold">Confirmée</span>;
      case "PROCESSING":
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold">En préparation</span>;
      case "SHIPPED":
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold">Expédiée</span>;
      case "DELIVERED":
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold">Livrée</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold">Annulée</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block mb-1">
            Espace Client
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
            Bonjour, {user?.first_name || user?.email}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
            >
              Panneau Administrateur
            </Link>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs font-medium text-neutral-700 hover:text-black hover:border-black transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Informations Profil & Adresses */}
        <div className="space-y-6">
          <div className="bg-neutral-50 p-6 border border-neutral-200 space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              Informations Personnelles
            </h2>
            <div className="space-y-2 text-neutral-600">
              <p>
                <strong>Nom :</strong> {user?.first_name} {user?.last_name}
              </p>
              <p>
                <strong>Email :</strong> {user?.email}
              </p>
              <p>
                <strong>Téléphone :</strong> {user?.phone || "Non renseigné"}
              </p>
              <p>
                <strong>Rôle :</strong> {user?.role}
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 p-6 border border-neutral-200 space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              Livraison au Maroc
            </h2>
            <div className="space-y-2 text-neutral-600">
              <div className="flex items-center gap-2 text-neutral-800">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold">AVELOR Express Maroc</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Toutes vos commandes sont préparées sous 24h et expédiées avec paiement en espèces à la livraison.
              </p>
            </div>
          </div>
        </div>

        {/* Historique des Commandes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-base font-serif font-light uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
            Historique de vos Commandes ({orders.length})
          </h2>

          {loading ? (
            <div className="text-xs text-neutral-400 py-8">Chargement de votre historique...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 border border-neutral-200 space-y-3">
              <Package className="w-8 h-8 text-neutral-400 mx-auto stroke-[1.2]" />
              <p className="text-xs text-neutral-500">Vous n'avez pas encore passé de commande.</p>
              <Link
                href="/homme"
                className="inline-block px-4 py-2 bg-black text-white text-[11px] font-semibold uppercase tracking-wider"
              >
                Découvrir la collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white border border-neutral-200 p-6 space-y-4 transition-all hover:border-black"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-100 pb-3 text-xs">
                    <div>
                      <span className="font-mono font-bold text-black text-sm block">
                        {o.order_number}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(o.created_at).toLocaleDateString("fr-MA", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(o.status)}
                      <span className="text-sm font-semibold text-black">
                        {Number(o.total_amount).toLocaleString("fr-MA")} {t.product.mad}
                      </span>
                    </div>
                  </div>

                  {/* Articles de la commande */}
                  <div className="space-y-2 text-xs">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-neutral-600">
                        <span>
                          {item.product_name_fr} ({item.size}) &times; {item.quantity}
                        </span>
                        <span>{Number(item.total_price).toLocaleString("fr-MA")} {t.product.mad}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expédition et Suivi */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-neutral-500">
                    <span>
                      Livraison à : <strong>{o.shipping_city}</strong> ({o.shipping_address})
                    </span>
                    {o.shipment?.tracking_number && (
                      <span className="bg-neutral-100 px-2.5 py-1 text-black font-mono">
                        N° Suivi : {o.shipment.tracking_number}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
