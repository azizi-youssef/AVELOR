
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type PaymentMethod = "CASH_ON_DELIVERY" | "ONLINE_CARD";

interface ConfirmedOrder {
  order_number: string | number;
  customer_name: string;
  shipping_city: string;
  total_amount: number | string;
  payment_method?: PaymentMethod;
}

const inputClass =
  "mt-2 w-full rounded-sm border border-[#DED9D0] bg-white px-4 py-3.5 text-sm text-[#171717] placeholder:text-[#A7A29A] outline-none transition-colors hover:border-[#B8AD9A] focus:border-[#A58B5B] focus:ring-2 focus:ring-[#A58B5B]/15 disabled:cursor-not-allowed disabled:bg-[#F3F1ED]";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#625D55]";

const sectionClass =
  "border-b border-[#E8E3DA] pb-8";

function formatMAD(value: number | string, language: string) {
  return `${Number(value || 0).toLocaleString(
    language === "ar" ? "ar-MA" : "fr-MA",
    { maximumFractionDigits: 2 }
  )} MAD`;
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-[#A58B5B]">*</span>}
      </label>
      {children}
    </div>
  );
}

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

  const [fullName, setFullName] = useState(
    user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] =
    useState<ConfirmedOrder | null>(null);

  const isRTL = direction === "rtl";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const inputId = (id: string) => `checkout-${id}`;

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      setErrorMsg(
        "Veuillez renseigner votre nom, votre téléphone, votre adresse et votre ville."
      );
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Votre panier est vide. Ajoutez des articles avant de continuer.");
      return;
    }

    const normalizedPhone = phone.trim();

    if (!/^[+\d\s().-]{8,20}$/.test(normalizedPhone)) {
      setErrorMsg("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customer_name: fullName.trim(),
        customer_phone: normalizedPhone,
        customer_email: email.trim() || null,
        shipping_address: streetAddress.trim(),
        shipping_city: city.trim(),
        shipping_postal_code: postalCode.trim() || null,
        delivery_notes: deliveryNotes.trim() || null,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
        items: items.map((item) => ({
          variant_id: item.variant.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.createOrder(orderPayload);

      // Do not empty the cart until the API confirms order creation.
      setConfirmedOrder({
        ...response,
        payment_method: response.payment_method ?? paymentMethod,
      });

      clearCart();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la validation de votre commande."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const paymentLabel =
    confirmedOrder?.payment_method === "ONLINE_CARD"
      ? "Paiement par carte"
      : "Espèces à la livraison";

  // Confirmation
  if (confirmedOrder) {
    return (
      <main
        dir={direction}
        className="min-h-[70vh] bg-[#FAF9F6] px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D7C7A8] bg-[#F1EBDD]">
            <CheckCircle2 className="h-8 w-8 text-[#887044]" strokeWidth={1.5} />
          </div>

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9B8359]">
            {t.checkout.order_confirmed}
          </p>

          <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
            Merci pour votre confiance.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#716B62]">
            {t.checkout.confirmation_text}
          </p>

          <div className="mt-9 border border-[#E8E3DA] bg-white p-5 text-left sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-[#E8E3DA] pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A8378]">
                  {t.checkout.order_number}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-ink">
                  {confirmedOrder.order_number}
                </p>
              </div>
              <Package className="h-6 w-6 text-[#A58B5B]" strokeWidth={1.4} />
            </div>

            <div className="space-y-4 py-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#777168]">Destinataire</span>
                <span className="text-right font-medium text-ink">
                  {confirmedOrder.customer_name}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#777168]">Ville de livraison</span>
                <span className="text-right font-medium text-ink">
                  {confirmedOrder.shipping_city}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#777168]">Paiement</span>
                <span className="text-right font-medium text-ink">
                  {paymentLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#E8E3DA] pt-5">
              <span className="text-xs uppercase tracking-wider text-[#625D55]">
                Total de la commande
              </span>
              <span className="font-serif text-xl text-ink">
                {formatMAD(confirmedOrder.total_amount, language)}
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-ink px-8 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#39352E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A58B5B]"
            >
              {t.checkout.back_home}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <main
        dir={direction}
        className="flex min-h-[65vh] items-center justify-center bg-[#FAF9F6] px-4 py-16"
      >
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#E8E3DA] bg-white">
            <ShoppingBag className="h-7 w-7 text-[#A58B5B]" strokeWidth={1.4} />
          </div>

          <h1 className="mt-6 font-serif text-2xl text-ink">
            Votre panier est vide
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#777168]">
            Découvrez notre collection et trouvez les pièces qui vous correspondent.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 bg-ink px-7 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#39352E]"
          >
            <ArrowIcon className="h-4 w-4" />
            {t.checkout.back_home}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir={direction} className="min-h-screen bg-[#FAF9F6] text-ink">
      {/* Page heading */}
      <div className="border-b border-[#E8E3DA] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#777168] transition hover:text-ink"
          >
            {isRTL ? (
              <ArrowRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5" />
            )}
            Continuer mes achats
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#A58B5B]">
                AVELOR · FINALISATION
              </p>
              <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
                {t.checkout.title}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#777168]">
                Complétez vos informations pour finaliser votre commande en toute sérénité.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777168]">
              <LockKeyhole className="h-4 w-4 text-[#A58B5B]" />
              Commande sécurisée
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { number: "01", label: "Coordonnées" },
              { number: "02", label: "Livraison" },
              { number: "03", label: "Paiement" },
            ].map((step, index) => (
              <div key={step.number}>
                <div
                  className={`h-0.5 ${index === 0 ? "bg-[#A58B5B]" : "bg-[#E8E3DA]"
                    }`}
                />
                <p className="mt-2 text-[9px] uppercase tracking-widest text-[#777168] sm:text-[10px]">
                  <span className="mr-1.5 font-semibold text-[#A58B5B]">
                    {step.number}
                  </span>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <form
          onSubmit={handleSubmitOrder}
          aria-busy={submitting}
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12"
        >
          {/* Customer form */}
          <div className="min-w-0 space-y-8 sm:space-y-10">
            {errorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 border border-[#E8C5C0] bg-[#FFF7F5] p-4 text-sm text-[#9F332B]"
              >
                <span className="font-semibold">!</span>
                <p>{errorMsg}</p>
              </div>
            )}

            {/* 01 Contact */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#DCCEB5] text-xs font-medium text-[#967B4D]">
                  01
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.13em]">
                    {t.checkout.contact_info}
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-[#777168]">
                    Vos coordonnées pour le suivi de votre commande.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field id={inputId("name")} label={t.checkout.full_name} required>
                  <input
                    id={inputId("name")}
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex. : Mehdi Bennani"
                    className={inputClass}
                  />
                </Field>

                <Field id={inputId("phone")} label={t.checkout.phone} required>
                  <input
                    id={inputId("phone")}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex. : 06 61 00 00 00"
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field id={inputId("email")} label={t.checkout.email}>
                    <input
                      id={inputId("email")}
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.ma"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* 02 Shipping */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#DCCEB5] text-xs font-medium text-[#967B4D]">
                  02
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.13em]">
                    {t.checkout.shipping_address}
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-[#777168]">
                    Indiquez l'adresse à laquelle recevoir votre commande.
                  </p>
                </div>
                <MapPin className="ml-auto h-5 w-5 shrink-0 text-[#A58B5B]" strokeWidth={1.4} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id={inputId("address")} label={t.checkout.address} required>
                    <input
                      id={inputId("address")}
                      name="street-address"
                      autoComplete="street-address"
                      required
                      maxLength={250}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Rue, quartier, numéro, étage..."
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field id={inputId("city")} label={t.checkout.city} required>
                  <select
                    id={inputId("city")}
                    name="city"
                    autoComplete="address-level2"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Fès">Fès</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Meknès">Meknès</option>
                    <option value="Oujda">Oujda</option>
                    <option value="Kénitra">Kénitra</option>
                    <option value="Tétouan">Tétouan</option>
                    <option value="Nador">Nador</option>
                    <option value="Autre ville">Autre ville du Maroc</option>
                  </select>
                </Field>

                <Field id={inputId("postal")} label={t.checkout.postal_code}>
                  <input
                    id={inputId("postal")}
                    name="postal-code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={12}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Ex. : 20000"
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field id={inputId("notes")} label={t.checkout.notes}>
                    <textarea
                      id={inputId("notes")}
                      name="delivery-notes"
                      rows={3}
                      maxLength={500}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Instructions utiles pour la livraison..."
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* 03 Payment */}
            <section>
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#DCCEB5] text-xs font-medium text-[#967B4D]">
                  03
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.13em]">
                    {t.checkout.payment_method}
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-[#777168]">
                    Choisissez le mode de règlement disponible.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-4 border bg-white p-4 transition-colors sm:p-5 ${paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-[#A58B5B] ring-1 ring-[#A58B5B]/15"
                      : "border-[#E8E3DA] hover:border-[#B8AD9A]"
                    }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className="mt-1 h-4 w-4 accent-[#A58B5B]"
                  />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#F5F1E8]">
                    <Truck className="h-5 w-5 text-[#92784C]" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider">
                      {t.checkout.cod}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#777168]">
                      {t.checkout.cod_desc}
                    </span>
                  </span>
                  {paymentMethod === "CASH_ON_DELIVERY" && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#A58B5B]" />
                  )}
                </label>

                <div className="flex items-start gap-4 border border-dashed border-[#DDD7CD] bg-[#F5F3EF] p-4 opacity-75 sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-white">
                    <CreditCard className="h-5 w-5 text-[#777168]" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider">
                      {t.checkout.card}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#777168]">
                      Paiement par carte indisponible pour le moment.
                    </p>
                  </div>
                  <span className="shrink-0 border border-[#DDD7CD] px-2 py-1 text-[9px] uppercase tracking-wider text-[#777168]">
                    Bientôt
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="border border-[#E4DED3] bg-white">
              <div className="flex items-center justify-between border-b border-[#E8E3DA] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-serif text-xl">
                    Récapitulatif
                  </h2>
                  <p className="mt-1 text-[11px] text-[#777168]">
                    {items.length} article(s) dans votre panier
                  </p>
                </div>
                <ShoppingBag className="h-5 w-5 text-[#A58B5B]" strokeWidth={1.4} />
              </div>

              <div className="max-h-90 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                {items.map((item) => {
                  const name =
                    language === "ar"
                      ? item.product.name_ar
                      : item.product.name_fr;

                  const unitPrice = Number(
                    item.product.discount_price ?? item.product.base_price
                  );

                  return (
                    <div
                      key={item.variant.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="wrap-break-word text-sm font-medium leading-5 text-[#25221D]">
                          {name}
                        </p>
                        <p className="mt-1 text-[11px] text-[#8A8378]">
                          Taille : {item.variant.size} · Qté : {item.quantity}
                        </p>
                        <p className="mt-1 text-xs text-[#777168]">
                          {formatMAD(unitPrice, language)} / unité
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums">
                        {formatMAD(unitPrice * item.quantity, language)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#E8E3DA] px-5 py-5 sm:px-6">
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#777168]">{t.cart.subtotal}</span>
                    <span className="font-medium tabular-nums">
                      {formatMAD(subtotal, language)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#55765A]">
                        {t.cart.discount}
                        {couponCode ? ` (${couponCode})` : ""}
                      </span>
                      <span className="font-medium tabular-nums text-[#55765A]">
                        −{formatMAD(discountAmount, language)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#777168]">{t.cart.shipping}</span>
                    {shippingFee === 0 ? (
                      <span className="font-semibold uppercase tracking-wide text-[#55765A]">
                        {t.cart.shipping_free}
                      </span>
                    ) : (
                      <span className="font-medium tabular-nums">
                        {formatMAD(shippingFee, language)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-[#E8E3DA] pt-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#777168]">
                        {t.cart.total}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8A8378]">
                        Taxes incluses si applicables
                      </p>
                    </div>
                    <p className="font-serif text-2xl tabular-nums text-ink">
                      {formatMAD(totalAmount, language)}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-ink px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#38332B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A58B5B] disabled:cursor-not-allowed disabled:bg-[#A7A29A]"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      {t.checkout.processing}
                    </>
                  ) : (
                    <>
                      {t.checkout.place_order}
                      <ArrowIcon className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-start gap-2.5 border-t border-[#E8E3DA] pt-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#A58B5B]" strokeWidth={1.5} />
                  <p className="text-[10px] leading-5 text-[#777168]">
                    Vos informations sont utilisées pour traiter votre commande.
                    Le paiement par carte reste désactivé tant qu'il n'est pas intégré.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] leading-5 text-[#8A8378]">
              Besoin d'aide ? Consultez les informations de votre boutique.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
