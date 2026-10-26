import { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { Product, Category } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://avelor.ma";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/homme`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/femme`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamic products from database
  let products: Product[] = [];
  try {
    const res = await api.getProducts({ page_size: 50 });
    products = res.items || [];
  } catch (error) {
    console.error("Unable to load sitemap products from DB:", error);
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Categories from database
  let categories: Category[] = [];
  try {
    categories = await api.getCategories();
  } catch (error) {
    console.error("Unable to load sitemap categories from DB:", error);
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => {
    const isMen = cat.universe === "MEN";
    return {
      url: `${baseUrl}/${isMen ? "homme" : "femme"}?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
