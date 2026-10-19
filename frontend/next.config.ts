import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      // Images de démonstration (dev uniquement)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage pour les images produits
      { protocol: "https", hostname: "mufbahcitcaizyvdyxlq.supabase.co" },
      // Cloudinary (si utilisé en production)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // CDN interne AVELOR (à activer en production)
      // { protocol: "https", hostname: "cdn.avelor.ma" },
    ],
  },
};

export default nextConfig;
