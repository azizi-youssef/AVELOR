"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageSquare } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AVELOR ERROR BOUNDARY]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
          <AlertCircle className="w-8 h-8 stroke-[1.3]" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-medium block">
            Une interruption est survenue
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-neutral-900 tracking-tight">
            Excellence & Sérénité
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto">
            Nous rencontrons une difficulté momentanée lors de l&apos;affichage de cette page. Nos artisans techniques veillent au rétablissement du service.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-medium transition-all shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réessayer
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 hover:border-neutral-900 text-neutral-800 hover:text-black text-xs uppercase tracking-widest font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="pt-6 border-t border-neutral-200/60">
          <p className="text-[11px] text-neutral-400">
            Besoin d&apos;assistance immédiate ? Contactez notre concierge privé AVELOR.
          </p>
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] hover:underline font-medium mt-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Concierge WhatsApp 7j/7
          </a>
        </div>
      </div>
    </div>
  );
}
