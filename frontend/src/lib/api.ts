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
  getProducts: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    return fetchApi<any>(`/products${qs ? `?${qs}` : ""}`);
  },

  getProduct: (slug: string) => fetchApi<any>(`/products/${slug}`),

  getSimilarProducts: (slug: string) => fetchApi<any[]>(`/products/${slug}/similar`),

  // Catégories
  getCategories: (universe?: string) => {
    const qs = universe ? `?universe=${universe}` : "";
    return fetchApi<any[]>(`/categories${qs}`);
  },

  getCategory: (slug: string) => fetchApi<any>(`/categories/${slug}`),

  // Campagnes bannières
  getCampaigns: (universe?: string) => {
    const qs = universe ? `?universe=${universe}` : "";
    return fetchApi<any[]>(`/campaigns/active${qs}`);
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
  createOrder: (orderData: any) => {
    return fetchApi<any>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  trackOrder: (orderNumber: string, phone?: string) => {
    const qs = phone ? `?phone=${encodeURIComponent(phone)}` : "";
    return fetchApi<any>(`/orders/track/${orderNumber}${qs}`);
  },

  getMyOrders: () => fetchApi<any[]>("/orders/my-orders"),

  // Auth
  login: (credentials: { email: string; password: string }) => {
    return fetchApi<{ access_token: string; token_type: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: (userData: any) => {
    return fetchApi<{ access_token: string; token_type: string; user: any }>("/auth/register", {
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
  }) => {
    return fetchApi<{ access_token: string; token_type: string; user: any }>("/auth/oauth-callback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe: () => fetchApi<any>("/auth/me"),
  updateMe: (data: { first_name?: string; last_name?: string; phone?: string; password?: string; avatar_url?: string | null }) => {
    return fetchApi<any>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Administration
  getAdminStats: () => fetchApi<any>("/admin/dashboard/stats"),
  getAdminOrders: (status?: string, search?: string) => {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (search) query.append("search", search);
    const qs = query.toString();
    return fetchApi<any[]>(`/admin/orders${qs ? `?${qs}` : ""}`);
  },
  updateOrderStatus: (orderId: number, data: any) => {
    return fetchApi<any>(`/admin/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  createProduct: (data: any) => {
    return fetchApi<any>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateProduct: (id: number, data: any) => {
    return fetchApi<any>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteProduct: (id: number) => {
    return fetchApi<any>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  },
  updateOrder: (id: number, data: any) => {
    return fetchApi<any>(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  getAdminCampaigns: () => fetchApi<any[]>("/admin/campaigns"),
  createCampaign: (data: any) => {
    return fetchApi<any>("/admin/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateCampaign: (id: number, data: any) => {
    return fetchApi<any>(`/admin/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteCampaign: (id: number) => {
    return fetchApi<any>(`/admin/campaigns/${id}`, {
      method: "DELETE",
    });
  },
  updateVariantStock: (variantId: number, stock: number, reason?: string) => {
    return fetchApi<any>(`/admin/variants/${variantId}/stock`, {
      method: "PUT",
      body: JSON.stringify({ stock, reason }),
    });
  },
  getAdminPromotions: () => fetchApi<any[]>("/admin/promotions"),
  createPromotion: (data: any) => {
    return fetchApi<any>("/admin/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updatePromotion: (id: number, data: any) => {
    return fetchApi<any>(`/admin/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deletePromotion: (id: number) => {
    return fetchApi<any>(`/admin/promotions/${id}`, {
      method: "DELETE",
    });
  },
  togglePromotion: (id: number) => {
    return fetchApi<any>(`/admin/promotions/${id}/toggle`, {
      method: "PUT",
    });
  },
  getAuditLogs: () => fetchApi<any[]>("/admin/audit-logs"),
  getAdminAuditLogs: () => fetchApi<any[]>("/admin/audit-logs"),
  getAdminCustomers: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return fetchApi<any[]>(`/admin/customers${q}`);
  },
  getAdminInventory: (params?: { low_stock_only?: boolean; universe?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.low_stock_only) searchParams.set("low_stock_only", "true");
    if (params?.universe && params.universe !== "ALL") searchParams.set("universe", params.universe);
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return fetchApi<any[]>(`/admin/inventory${qs}`);
  },
  getInventoryMovements: () => fetchApi<any[]>("/admin/inventory/movements"),
  getAdminAnalytics: () => fetchApi<any>("/admin/analytics"),
  getAdminSettings: () => fetchApi<any>("/admin/settings"),
  updateAdminSettings: (data: any) => {
    return fetchApi<any>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

