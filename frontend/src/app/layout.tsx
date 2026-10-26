import type { Metadata, Viewport } from "next";
import { Cinzel, Plus_Jakarta_Sans, Tajawal } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { DocumentLanguage } from "@/components/layout/DocumentLanguage";
import { LuxuryCursor } from "@/components/ui/LuxuryCursor";


const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-avelor-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-avelor-sans",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-avelor-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://avelor.ma"),
  title: {
    default: "AVELOR | Maison de mode au Maroc",
    template: "%s | AVELOR",
  },
  description:
    "Découvrez les collections AVELOR pour homme et femme : des pièces sélectionnées avec soin, une élégance contemporaine et une livraison partout au Maroc.",
  applicationName: "AVELOR",
  keywords: [
    "AVELOR",
    "mode au Maroc",
    "vêtements homme",
    "vêtements femme",
    "mode premium",
    "boutique en ligne Maroc",
  ],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "AVELOR | Maison de mode au Maroc",
    description:
      "L’élégance contemporaine, des collections choisies et une signature intemporelle.",
    type: "website",
    locale: "fr_MA",
    siteName: "AVELOR",
    images: [
      {
        url: "/logo.png",
        alt: "AVELOR — Maison de mode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AVELOR | Maison de mode au Maroc",
    description:
      "Découvrez les collections AVELOR pour homme et femme.",
    images: ["/logo.png"],
  },
  // Add metadataBase once the production domain is confirmed.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#22221e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${cinzel.variable} ${jakarta.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#faf9f6] font-sans text-[#171714] antialiased selection:bg-[#d8c5a0] selection:text-[#171714]">
        <a
          href="#main-content"
          className="sr-only z-100 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:bg-white focus:px-4 focus:py-3 focus:text-black focus:shadow-lg"
        >
          Aller au contenu
        </a>

        <LanguageProvider>
          <DocumentLanguage />
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <main id="main-content" className="flex-1 outline-none">
                      {children}
                    </main>
                    <Footer />
                  </div>
                  <ToastContainer />
                  <LuxuryCursor />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
