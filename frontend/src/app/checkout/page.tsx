"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldCheck, Truck, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const {
    items,
    clearCart,
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    couponCode,
  } = useCart();
  const { language, direction, t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(
    user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE_CARD">(
    "CASH_ON_DELIVERY"
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      setErrorMsg("Veuillez renseigner tous les champs obligatoires (Nom, Téléphone, Adresse, Ville).");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Votre panier est vide.");
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        shipping_address: streetAddress.trim(),
        shipping_city: city.trim(),
        shipping_postal_code: postalCode.trim() || null,
        delivery_notes: deliveryNotes.trim() || null,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
        items: items.map((i) => ({
          variant_id: i.variant.id,
          quantity: i.quantity,
        })),
      };

      const res = await api.createOrder(orderPayload);
      clearCart();
      setConfirmedOrder(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la validation de la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  // Écran de confirmation de commande
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-neutral-900 text-white flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 stroke-[1.5]" />
        </div>

        <div className="space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-semibold block">
            {t.checkout.order_confirmed}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-black">
            Merci pour votre commande chez AVELOR
          </h1>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            {t.checkout.confirmation_text}
          </p>
        </div>

        {/* Carte de récapitulatif du reçu */}
        <div className="bg-neutral-50 p-6 sm:p-8 border border-neutral-200 text-left space-y-4 max-w-md mx-auto text-xs">
          <div className="flex justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500">{t.checkout.order_number} :</span>
            <span className="font-mono font-bold text-black">{confirmedOrder.order_number}</span>
          </div>

          <div className="flex justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500">Destinataire :</span>
            <span className="font-medium text-black">{confirmedOrder.customer_name}</span>
          </div>

          <div className="flex justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500">Ville de livraison :</span>
            <span className="font-medium text-black">{confirmedOrder.shipping_city}</span>
          </div>

          <div className="flex justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500">Mode de paiement :</span>
            <span className="font-medium text-black">Espèces à la livraison (COD)</span>
          </div>

          <div className="flex justify-between pt-2 text-sm font-serif font-bold text-black">
            <span>Montant à régler au livreur :</span>
            <span>{Number(confirmedOrder.total_amount).toLocaleString("fr-MA")} {t.product.mad}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            {t.checkout.back_home}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif">Votre panier est vide pour le moment.</h2>
        <Link href="/" className="inline-block text-xs uppercase underline tracking-wider font-semibold">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
          {t.checkout.title}
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Colonne Formulaire (Coordonnées, Adresse, Paiement) */}
        <div className="lg:col-span-2 space-y-10">
          {/* 1. Coordonnées personnelles */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              {t.checkout.contact_info}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.full_name} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mehdi Bennani"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.phone} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 06 61 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.email}
                </label>
                <input
                  type="email"
                  placeholder="contact@exemple.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* 2. Adresse de livraison au Maroc */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              {t.checkout.shipping_address}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.address} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Numéro, rue, quartier, étage..."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.city} *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                >
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Fès">Fès</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Meknès">Meknès</option>
                  <option value="Oujda">Oujda</option>
                  <option value="Kenitra">Kénitra</option>
                  <option value="Tétouan">Tétouan</option>
                  <option value="Autre ville">Autre ville du Maroc</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.postal_code}
                </label>
                <input
                  type="text"
                  placeholder="20000"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-600 mb-1 font-medium">
                  {t.checkout.notes}
                </label>
                <textarea
                  rows={2}
                  placeholder="Exemple : Sonner à la porte 4B, appeler avant le passage..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* 3. Moyen de Paiement */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
              {t.checkout.payment_method}
            </h2>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border border-black bg-neutral-50 cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === "CASH_ON_DELIVERY"}
                  onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  className="mt-1 text-black focus:ring-black"
                />
                <div>
                  <span className="text-xs font-bold text-black block">
                    {t.checkout.cod}
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    {t.checkout.cod_desc}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-neutral-200 bg-white opacity-60 cursor-not-allowed">
                <input
                  type="radio"
                  name="payment_method"
                  disabled
                  value="ONLINE_CARD"
                  className="mt-1 text-neutral-400"
                />
                <div>
                  <span className="text-xs font-semibold text-neutral-700 block">
                    {t.checkout.card}
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Paiement sécurisé CMI en cours d'agrément bancaire au Maroc.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Colonne Récapitulatif Articles & Total */}
        <div className="bg-neutral-50 p-6 sm:p-8 space-y-6 border border-neutral-200 h-fit">
          <h2 className="text-base font-serif font-light uppercase tracking-wider text-black border-b border-neutral-200 pb-3">
            Articles de la commande
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {items.map((i) => {
              const name = language === "ar" ? i.product.name_ar : i.product.name_fr;
              const price = i.product.discount_price
                ? Number(i.product.discount_price)
                : Number(i.product.base_price);
              return (
                <div key={i.variant.id} className="flex justify-between gap-3 text-xs">
                  <div>
                    <span className="font-medium text-black block truncate max-w-[180px]">
                      {name}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Taille: {i.variant.size} &bull; Qté: {i.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-black flex-shrink-0">
                    {(price * i.quantity).toLocaleString("fr-MA")} {t.product.mad}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-200 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>{t.cart.subtotal}</span>
              <span className="font-medium text-black">
                {subtotal.toLocaleString("fr-MA")} {t.product.mad}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-700 font-medium">
                <span>{t.cart.discount} ({couponCode})</span>
                <span>-{discountAmount.toLocaleString("fr-MA")} {t.product.mad}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>{t.cart.shipping}</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-green-700 font-semibold">{t.cart.shipping_free}</span>
                ) : (
                  `${shippingFee.toLocaleString("fr-MA")} ${t.product.mad}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-serif font-medium text-black pt-4 border-t border-neutral-200">
              <span>{t.cart.total}</span>
              <span>{totalAmount.toLocaleString("fr-MA")} {t.product.mad}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-black text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors flex items-center justify-center gap-2"
          >
            <span>{submitting ? t.checkout.processing : t.checkout.place_order}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
