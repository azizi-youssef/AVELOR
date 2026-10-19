"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Synchronise dynamiquement les attributs lang et dir sur la balise <html>
 * en fonction de la langue sélectionnée (fr / ar) et de la direction RTL.
 */
export function DocumentLanguage() {
  const { language, direction } = useLanguage();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
    }
  }, [language, direction]);

  return null;
}

export default DocumentLanguage;
