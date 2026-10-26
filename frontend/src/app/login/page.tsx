"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const { login, register, loginWithOAuth } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google") => {
    setErrorMsg(null);
    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'accès au service Google");
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email: email.trim().toLowerCase(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        });
      } else {
        await login(email.trim().toLowerCase(), password);
      }
      router.push("/account");
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block">
          Espace Privé AVELOR
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light uppercase tracking-wider text-black">
          {isRegister ? "Créer un Compte" : "Connexion Client"}
        </h1>
      </div>

      {/* Bouton Google OAuth Supabase */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={!!oauthLoading || loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-neutral-300 hover:border-black text-neutral-900 font-medium text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {oauthLoading === "google" ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>
            {oauthLoading === "google"
              ? "Redirection vers Google..."
              : "Continuer avec Google"}
          </span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium absolute">
            Ou avec votre email
          </span>
        </div>
      </div>

      {/* Tabs Connexion / Inscription */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => {
            setIsRegister(false);
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 text-xs uppercase font-semibold tracking-wider transition-colors border-b-2 ${
            !isRegister ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          Se Connecter
        </button>
        <button
          onClick={() => {
            setIsRegister(true);
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 text-xs uppercase font-semibold tracking-wider transition-colors border-b-2 ${
            isRegister ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          Créer un Compte
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {isRegister && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 mb-1 font-medium">Prénom</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-neutral-600 mb-1 font-medium">Nom</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-neutral-600 mb-1 font-medium">Téléphone (Maroc)</label>
              <input
                type="tel"
                placeholder="+212 6..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-neutral-600 mb-1 font-medium">Adresse Email</label>
          <input
            type="email"
            required
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-neutral-600 mb-1 font-medium">Mot de passe</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-black text-white font-semibold uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
        >
          {loading ? "Chargement..." : isRegister ? "S'inscrire" : "Connexion"}
        </button>
      </form>

    </div>
  );
}
