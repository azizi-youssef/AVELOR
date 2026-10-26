import {
  Product,
  ProductListResponse,
  Category,
  Order,
  User,
  Campaign,
  Promotion,
  AdminStats,
  Customer,
  InventoryItem,
  InventoryMovementRecord,
  AnalyticsData,
  StoreSettings,
  AuditLog,
  ProductVariant,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("avelor_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "Une erreur est survenue";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `Erreur HTTP ${res.status}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Produits
  getProducts: (params: Record<string, string | number | boolean | undefined> = {}): Promise<ProductListResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    return fetchApi<ProductListResponse>(`/products${qs ? `?${qs}` : ""}`);
  },

  getProduct: (slug: string): Promise<Product> => fetchApi<Product>(`/products/${slug}`),

  getSimilarProducts: (slug: string): Promise<Product[]> => fetchApi<Product[]>(`/products/${slug}/similar`),

  // Catégories
  getCategories: (universe?: string): Promise<Category[]> => {
    const qs = universe ? `?universe=${universe}` : "";
    return fetchApi<Category[]>(`/categories${qs}`);
  },

  getCategory: (slug: string): Promise<Category> => fetchApi<Category>(`/categories/${slug}`),

  // Campagnes bannières
  getCampaigns: (universe?: string): Promise<Campaign[]> => {
    const qs = universe ? `?universe=${universe}` : "";
    return fetchApi<Campaign[]>(`/campaigns/active${qs}`);
  },

  // Promotions
  validateCoupon: (code: string, subtotal: number, universe?: string) => {
    return fetchApi<{
      is_valid: boolean;
      code: string;
      discount_type?: "PERCENTAGE" | "FIXED";
      discount_value?: number;
      calculated_discount: number;
      message: string;
    }>("/promotions/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal, universe }),
    });
  },

  // Commandes
  createOrder: (orderData: Record<string, unknown>): Promise<Order> => {
    return fetchApi<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  trackOrder: (orderNumber: string, phone?: string): Promise<Order> => {
    const qs = phone ? `?phone=${encodeURIComponent(phone)}` : "";
    return fetchApi<Order>(`/orders/track/${orderNumber}${qs}`);
  },

  getMyOrders: (): Promise<Order[]> => fetchApi<Order[]>("/orders/my-orders"),

  // Auth
  login: (credentials: { email: string; password: string }): Promise<{ access_token: string; token_type: string; user: User }> => {
    return fetchApi<{ access_token: string; token_type: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: (userData: Record<string, unknown>): Promise<{ access_token: string; token_type: string; user: User }> => {
    return fetchApi<{ access_token: string; token_type: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  oauthCallback: (data: {
    provider: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    oauth_id?: string;
  }): Promise<{ access_token: string; token_type: string; user: User }> => {
    return fetchApi<{ access_token: string; token_type: string; user: User }>("/auth/oauth-callback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe: (): Promise<User> => fetchApi<User>("/auth/me"),

  updateMe: (data: { first_name?: string; last_name?: string; phone?: string; password?: string; avatar_url?: string | null }): Promise<User> => {
    return fetchApi<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  logout: (): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  // Administration
  getAdminStats: (): Promise<AdminStats> => fetchApi<AdminStats>("/admin/dashboard/stats"),

  getAdminOrders: (status?: string, search?: string): Promise<Order[]> => {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (search) query.append("search", search);
    const qs = query.toString();
    return fetchApi<Order[]>(`/admin/orders${qs ? `?${qs}` : ""}`);
  },

  updateOrderStatus: (orderId: number, data: string | { status: string; payment_status?: string; admin_notes?: string }): Promise<Order> => {
    const payload = typeof data === "string" ? { status: data } : data;
    return fetchApi<Order>(`/admin/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  createProduct: (data: Record<string, unknown>): Promise<Product> => {
    return fetchApi<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProduct: (id: number, data: Record<string, unknown>): Promise<Product> => {
    return fetchApi<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteProduct: (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  },

  updateOrder: (id: number, data: Record<string, unknown>): Promise<Order> => {
    return fetchApi<Order>(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getAdminCampaigns: (): Promise<Campaign[]> => fetchApi<Campaign[]>("/admin/campaigns"),

  createCampaign: (data: Record<string, unknown>): Promise<Campaign> => {
    return fetchApi<Campaign>("/admin/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCampaign: (id: number, data: Record<string, unknown>): Promise<Campaign> => {
    return fetchApi<Campaign>(`/admin/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteCampaign: (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/admin/campaigns/${id}`, {
      method: "DELETE",
    });
  },

  updateVariantStock: (variantId: number, stock: number, reason?: string): Promise<ProductVariant> => {
    return fetchApi<ProductVariant>(`/admin/variants/${variantId}/stock`, {
      method: "PUT",
      body: JSON.stringify({ stock, reason }),
    });
  },

  getAdminPromotions: (): Promise<Promotion[]> => fetchApi<Promotion[]>("/admin/promotions"),

  createPromotion: (data: Record<string, unknown>): Promise<Promotion> => {
    return fetchApi<Promotion>("/admin/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePromotion: (id: number, data: Record<string, unknown>): Promise<Promotion> => {
    return fetchApi<Promotion>(`/admin/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePromotion: (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/admin/promotions/${id}`, {
      method: "DELETE",
    });
  },

  togglePromotion: (id: number): Promise<Promotion> => {
    return fetchApi<Promotion>(`/admin/promotions/${id}/toggle`, {
      method: "PUT",
    });
  },

  getAuditLogs: (): Promise<AuditLog[]> => fetchApi<AuditLog[]>("/admin/audit-logs"),

  getAdminAuditLogs: (): Promise<AuditLog[]> => fetchApi<AuditLog[]>("/admin/audit-logs"),

  getAdminCustomers: (search?: string): Promise<Customer[]> => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return fetchApi<Customer[]>(`/admin/customers${q}`);
  },

  getAdminInventory: (params?: { low_stock_only?: boolean; universe?: string; search?: string }): Promise<InventoryItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.low_stock_only) searchParams.set("low_stock_only", "true");
    if (params?.universe && params.universe !== "ALL") searchParams.set("universe", params.universe);
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return fetchApi<InventoryItem[]>(`/admin/inventory${qs}`);
  },

  getInventoryMovements: (): Promise<InventoryMovementRecord[]> => fetchApi<InventoryMovementRecord[]>("/admin/inventory/movements"),

  getAdminAnalytics: (): Promise<AnalyticsData> => fetchApi<AnalyticsData>("/admin/analytics"),

  getAdminSettings: (): Promise<StoreSettings> => fetchApi<StoreSettings>("/admin/settings"),

  updateAdminSettings: (data: Record<string, unknown>): Promise<StoreSettings> => {
    return fetchApi<StoreSettings>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
