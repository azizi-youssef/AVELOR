"use client";

import React from "react";
import { Loader2, AlertCircle, Check, ArrowRight } from "lucide-react";
import { ValidationErrors } from "./types";

interface ProductFormFooterProps {
  onCancel: () => void;
  submitting: boolean;
  isEditing: boolean;
  errors: ValidationErrors;
}

export function ProductFormFooter({
  onCancel,
  submitting,
  isEditing,
  errors,
}: ProductFormFooterProps) {
  const errorCount = Object.keys(errors).length;

  return (
    <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-[#E5E5E5] bg-paper/95 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        {errorCount > 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Veuillez corriger {errorCount} champ{errorCount > 1 ? "s" : ""} obligatoire{errorCount > 1 ? "s" : ""}.
            </span>
          </p>
        ) : (
          <p className="text-[11px] text-[#737373]">
            Toutes les modifications sont enregistrées directement dans la base de données AVELOR.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="border border-[#E5E5E5] bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#737373] transition-colors hover:border-neutral-400 hover:text-ink disabled:opacity-50"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-ink px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-xs transition-all hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B08D57]" />
              <span>Enregistrement en cours...</span>
            </>
          ) : (
            <>
              <span>{isEditing ? "Enregistrer les modifications" : "Publier la Pièce Couture"}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#B08D57]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
