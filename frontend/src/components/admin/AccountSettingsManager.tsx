"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  UserCheck,
  Shield,
  KeyRound,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  BadgeCheck,
  Smartphone,
  ShieldCheck,
  LogOut,
  Camera,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

interface AccountSettingsManagerProps {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export function AccountSettingsManager({ onNotify }: AccountSettingsManagerProps) {
  const { user, updateProfile, logout } = useAuth();

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Handle Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onNotify("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onNotify("L'image ne doit pas dépasser 5 Mo", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      // Optimize image via HTML Canvas
      const optimizedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDim = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Canvas non disponible"));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.88));
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await updateProfile({ avatar_url: optimizedDataUrl });
      onNotify("Photo de profil mise à jour avec succès", "success");
    } catch {
      onNotify("Erreur lors du traitement de l'image. Veuillez réessayer.", "error");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar_url) return;
    setUploadingAvatar(true);
    try {
      await updateProfile({ avatar_url: "" });
      onNotify("Photo de profil retirée", "success");
    } catch {
      onNotify("Erreur lors de la suppression de la photo", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      });
      onNotify("Profil administrateur mis à jour avec succès", "success");
    } catch {
      onNotify("Impossible de mettre à jour le profil. Veuillez réessayer.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      onNotify("Le mot de passe doit contenir au moins 8 caractères", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify("Les mots de passe ne correspondent pas", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        password: newPassword,
      });
      setNewPassword("");
      setConfirmPassword("");
      onNotify("Mot de passe mis à jour avec succès", "success");
    } catch {
      onNotify("Erreur lors du changement de mot de passe", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);

  return (
    <div className="space-y-8">
      {/* Hidden File Input for Avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* Profil Banner */}
      <div className="bg-white border border-neutral-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
            {/* Interactive Avatar */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-neutral-900 border-2 border-neutral-800 text-2xl font-serif font-bold text-white shadow-md overflow-hidden transition-transform duration-200 group-hover:scale-102"
                title="Cliquer pour changer la photo de profil"
              >
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={user?.first_name || "Admin"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{(user?.first_name?.[0] || user?.email?.[0] || "A").toUpperCase()}</span>
                )}

                {/* Hover overlay with camera */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  {uploadingAvatar ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider mt-1">Changer</span>
                    </>
                  )}
                </div>
              </button>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Compte actif" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-xl sm:text-2xl font-light tracking-wide text-neutral-900 uppercase">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Administrateur"}
                </h2>
                <span className="inline-flex items-center gap-1 bg-[#171714] text-[#d8c5a0] text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                  <ShieldCheck className="w-3 h-3 text-[#d8c5a0]" />
                  {user?.role || "ADMIN"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                {user?.email}
              </p>

              {/* Upload actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>{user?.avatar_url ? "Remplacer la photo" : "Uploader une photo"}</span>
                </button>

                {user?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-neutral-300 text-neutral-600 text-[11px] font-medium hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50"
                    title="Supprimer la photo actuelle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50/50 text-red-700 text-xs font-semibold uppercase tracking-wider hover:bg-red-100 hover:border-red-300 transition-colors w-full sm:w-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire Informations Personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-6"
        >
          <div className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                Informations Personnelles
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Coordonnées utilisées pour les signatures d&apos;audit et le back-office.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Adresse Email (Identifiant de connexion)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full h-10 px-3.5 bg-neutral-100 border border-neutral-200 text-xs text-neutral-500 cursor-not-allowed select-none"
                />
                <span className="absolute inset-y-0 right-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Vérifié
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                L&apos;adresse email principale est liée aux protocoles de sécurité du serveur.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ex. Karim"
                  className="w-full h-10 px-3.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 outline-none transition-colors focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ex. El Fassi"
                  className="w-full h-10 px-3.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 outline-none transition-colors focus:border-black focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Numéro de Téléphone (WhatsApp / Support interne)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 600 000 000"
                  className="w-full h-10 px-3.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 outline-none transition-colors focus:border-black focus:bg-white"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-xs hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Enregistrer le profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Formulaire Sécurité & Mot de Passe */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-6"
        >
          <div className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                Sécurité & Mot de Passe
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Renforcez la protection de vos accès au tableau de bord.
            </p>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 px-3.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 outline-none transition-colors focus:border-black focus:bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 px-3.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 outline-none transition-colors focus:border-black focus:bg-white"
              />
            </div>

            {/* Checklist de sécurité */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                Exigences de sécurité :
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-500" : "bg-neutral-300"}`} />
                <span className={hasMinLength ? "text-neutral-800" : "text-neutral-400"}>
                  Au moins 8 caractères
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? "bg-emerald-500" : "bg-neutral-300"}`} />
                <span className={hasUppercase ? "text-neutral-800" : "text-neutral-400"}>
                  Au moins une majuscule (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? "bg-emerald-500" : "bg-neutral-300"}`} />
                <span className={hasNumber ? "text-neutral-800" : "text-neutral-400"}>
                  Au moins un chiffre (0-9)
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="flex items-center gap-2 bg-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-xs hover:bg-black transition-colors disabled:opacity-40"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Modifier le mot de passe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Privilèges & Droits d'Accès Système */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
              Privilèges & Autorisations du Rôle
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Droits d&apos;administration accordés sur la base de données AVELOR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="border border-neutral-200/80 p-4 bg-neutral-50/50">
            <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Catalogue & Variantes</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Création, édition des fiches couture, ajustement des stocks et tarification en MAD.
            </p>
          </div>

          <div className="border border-neutral-200/80 p-4 bg-neutral-50/50">
            <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Commandes & Amana</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Validation des paiements à la livraison, suivi des bordereaux et facturation.
            </p>
          </div>

          <div className="border border-neutral-200/80 p-4 bg-neutral-50/50">
            <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Marketing & Promos</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Gestion des codes privilèges, bannières saisonnières et promotions exclusives.
            </p>
          </div>

          <div className="border border-neutral-200/80 p-4 bg-neutral-50/50">
            <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Traçabilité & Audit</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Accès complet et immuable au journal d&apos;audit de sécurité du système.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
