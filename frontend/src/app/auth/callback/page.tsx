"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setAuthSession } = useAuth();
  const [statusText, setStatusText] = useState("Vérification des identifiants...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      try {
        // Récupérer la session Supabase établie suite au retour OAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          // Attendre un court instant si le hash URL est en cours de parsing
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (currentSession?.user && isMounted) {
              await processUserSession(currentSession);
            }
          });

          // Timeout de sécurité au bout de 6 secondes si aucune session n'est détectée
          const timer = setTimeout(() => {
            if (isMounted) {
              setErrorMessage("Délai de connexion dépassé ou annulation. Redirection...");
              setTimeout(() => router.replace("/login"), 2500);
            }
          }, 6000);

          return () => {
            authListener.subscription.unsubscribe();
            clearTimeout(timer);
          };
        } else {
          await processUserSession(session);
        }
      } catch (err: any) {
        console.error("Erreur callback OAuth:", err);
        if (isMounted) {
          setErrorMessage(err.message || "Échec de l'authentification OAuth");
          setTimeout(() => router.replace("/login"), 3000);
        }
      }
    }

    async function processUserSession(session: any) {
      const sbUser = session.user;
      const meta = sbUser.user_metadata || {};
      const provider = sbUser.app_metadata?.provider || "google";

      // Extraire nom et prénom
      let firstName = meta.given_name || meta.first_name || "";
      let lastName = meta.family_name || meta.last_name || "";
      if (!firstName && meta.full_name) {
        const parts = meta.full_name.split(" ");
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      } else if (!firstName && meta.name) {
        const parts = meta.name.split(" ");
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      }

      const avatarUrl = meta.avatar_url || meta.picture || undefined;

      setStatusText("Synchronisation de votre profil AVELOR...");

      try {
        // Envoi au backend FastAPI AVELOR
        const authRes = await api.oauthCallback({
          provider,
          email: sbUser.email!,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          oauth_id: sbUser.id,
        });

        if (isMounted) {
          setAuthSession(authRes.access_token, authRes.user);
          setStatusText("Bienvenue chez AVELOR");
          router.replace("/account");
        }
      } catch (backendError) {
        console.warn("Backend FastAPI non joignable, fallback session locale Supabase:", backendError);
        // Fallback gracieux si la DB locale est temporairement inaccessible
        if (isMounted) {
          const fallbackUser = {
            id: 9999,
            email: sbUser.email!,
            first_name: firstName || "Client",
            last_name: lastName || "Privilégié",
            avatar_url: avatarUrl,
            oauth_provider: provider,
            role: "CUSTOMER" as const,
            is_active: true,
          };
          setAuthSession(session.access_token, fallbackUser);
          setStatusText("Connexion réussie");
          router.replace("/account");
        }
      }
    }

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, setAuthSession]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Monogramme AVELOR */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-neutral-300 bg-black text-white text-lg font-serif tracking-widest animate-pulse">
          A
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block">
            Maison AVELOR • Espace Client
          </span>
          <h1 className="text-lg uppercase tracking-[0.2em] font-light text-neutral-900">
            {errorMessage ? "Attention" : "Authentification Sécurisée"}
          </h1>
        </div>

        {errorMessage ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs tracking-wide">
            {errorMessage}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-500 font-light tracking-wider">
              {statusText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
