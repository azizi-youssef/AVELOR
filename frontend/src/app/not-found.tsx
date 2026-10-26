import React from "react";
import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
          <Compass className="w-8 h-8 stroke-[1.2]" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-medium block">
            Page Introuvable • 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-neutral-900 tracking-tight">
            Cette pièce s&apos;est éclipsée
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
            La page ou la création que vous recherchez n&apos;est plus disponible ou a été déplacée. Explorez nos dernières collections.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Home className="w-3.5 h-3.5" />
            Retour à l&apos;accueil
          </Link>

          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 hover:border-neutral-900 text-neutral-800 hover:text-black text-xs uppercase tracking-widest font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Rechercher une pièce
          </Link>
        </div>
      </div>
    </div>
  );
}
