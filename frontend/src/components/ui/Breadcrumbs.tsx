"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const { direction, language } = useLanguage();
  const isRtl = direction === "rtl";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: language === "ar" ? "الرئيسية" : "Accueil",
        item: "https://avelor.ma",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: `https://avelor.ma${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Fil d'Ariane"
        dir={direction}
        className={`flex items-center text-[11px] uppercase tracking-[0.18em] text-neutral-400 py-4 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <li className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-[#C5A059] transition-colors"
              title={language === "ar" ? "الرئيسية" : "Accueil"}
            >
              <Home className="w-3.5 h-3.5 stroke-[1.4]" />
              <span className="sr-only sm:not-sr-only">
                {language === "ar" ? "الرئيسية" : "Accueil"}
              </span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5 sm:gap-2">
                <ChevronIcon className="w-3 h-3 text-neutral-300 shrink-0" strokeWidth={1.5} />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-[#C5A059] transition-colors truncate max-w-35 sm:max-w-50"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="font-medium text-neutral-900 truncate max-w-40 sm:max-w-65"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
