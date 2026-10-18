"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const { login, register } = useAuth();
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

  const fillDemoAdmin = () => {
    setEmail("admin@avelor.ma");
    setPassword("AdminAvelor2026!");
    setIsRegister(false);
  };

  const fillDemoClient = () => {
    setEmail("client@avelor.ma");
    setPassword("ClientAvelor2026!");
    setIsRegister(false);
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

      {/* Raccourcis de démonstration rapide */}
      <div className="border-t border-neutral-200 pt-6 space-y-3">
        <span className="text-[11px] text-neutral-400 block text-center uppercase tracking-wider font-semibold">
          Identifiants de Démonstration AVELOR
        </span>
        <div className="flex gap-2 text-[11px]">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200"
          >
            Compte Administrateur
          </button>
          <button
            type="button"
            onClick={fillDemoClient}
            className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200"
          >
            Compte Client Test
          </button>
        </div>
      </div>
    </div>
  );
}
