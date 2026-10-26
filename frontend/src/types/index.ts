export type GenderUniverse = "MEN" | "WOMEN" | "UNISEX";

export type UserRole = "ADMIN" | "CATALOG_MANAGER" | "ORDER_MANAGER" | "CUSTOMER";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "ONLINE_CARD";

export interface Category {
  id: number;
  slug: string;
  name_fr: string;
  name_ar: string;
  description_fr?: string;
  description_ar?: string;
  image_url?: string;
  universe: GenderUniverse;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size: string;
  color_name_fr: string;
  color_name_ar: string;
  color_code: string;
  stock: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text_fr?: string;
  alt_text_ar?: string;
  is_cover: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  short_desc_fr?: string;
  short_desc_ar?: string;
  description_fr?: string;
  description_ar?: string;
  base_price: string | number;
  discount_price?: string | number | null;
  universe: GenderUniverse;
  category_id: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  material_fr?: string;
  material_ar?: string;
  tags?: string[];
  created_at: string;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Address {
  id: number;
  user_id?: number;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  region?: string;
  postal_code?: string;
  delivery_instructions?: string;
  is_default: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  oauth_provider?: string;
  role: UserRole;
  is_active: boolean;
  addresses?: Address[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number;
  product_name_fr: string;
  product_name_ar: string;
  product_name?: string;
  product_image?: string;
  sku: string;
  size: string;
  color_name_fr: string;
  color?: string;
  unit_price: string | number;
  quantity: number;
  total_price: string | number;
}

export interface Shipment {
  carrier_name: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
}

export interface Payment {
  provider: string;
  transaction_id?: string;
  amount: string | number;
  status: PaymentStatus;
  payment_date?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  delivery_notes?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: string | number;
  shipping_fee?: string | number;
  shipping_amount?: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  admin_notes?: string;
  notes?: string;
  tracking_number?: string;
  created_at: string;
  items: OrderItem[];
  shipment?: Shipment;
  payment?: Payment;
  user_id?: number;
}

export interface Campaign {
  id: number;
  title_fr?: string;
  title_ar?: string;
  title?: string;
  subtitle_fr?: string;
  subtitle_ar?: string;
  subtitle?: string;
  button_text_fr?: string;
  button_text_ar?: string;
  link_url: string;
  desktop_image?: string;
  image_url?: string;
  mobile_image?: string;
  target_universe?: GenderUniverse | string;
  is_active: boolean;
  sort_order: number;
}

export interface Promotion {
  id: number;
  code: string;
  name_fr?: string;
  name_ar?: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: string | number;
  min_order_amount?: string | number;
  starts_at?: string;
  expires_at?: string;
  valid_until?: string;
  max_uses?: number;
  current_uses?: number;
  used_count?: number;
  is_active: boolean;
}

export interface LowStockItem {
  id: number;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  average_cart_value?: number;
  pending_orders: number;
  low_stock_count: number;
  out_of_stock_count?: number;
  total_customers?: number;
  total_products?: number;
  status_counts?: Record<string, number>;
  sales_timeline?: Array<{
    date: string;
    full_date: string;
    revenue: number;
    orders: number;
  }>;
  universe_breakdown?: {
    men_revenue?: number;
    women_revenue?: number;
    homme?: number;
    femme?: number;
  };
  low_stock_items?: LowStockItem[];
  recent_orders?: any[];
}

export interface Customer {
  id: number;
  email: string;
  name?: string;
  full_name?: string;
  phone?: string;
  city?: string;
  role: string;
  is_active?: boolean;
  total_orders?: number;
  orders_count?: number;
  total_spent?: number;
  last_order_date?: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  product_id?: number;
  product_name?: string;
  product_title?: string;
  product_sku?: string;
  sku: string;
  size: string;
  color_name?: string;
  color_code?: string;
  color?: string;
  stock: number;
  base_price?: number;
  price?: number;
  discount_price?: number | null;
  universe?: GenderUniverse | string;
  category_name?: string;
  category?: string;
  is_active?: boolean;
  status?: "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";
}

export interface InventoryMovementRecord {
  id: number;
  variant_id: number;
  sku: string;
  product_name?: string;
  product_title?: string;
  quantity: number;
  reason: string;
  order_id?: number | null;
  reference?: string | null;
  created_at: string;
}

export interface AnalyticsData {
  categories: Array<{
    id: number;
    slug?: string;
    name: string;
    universe?: string;
    revenue: number;
    units_sold: number;
  }>;
  top_products: Array<{
    id?: number;
    product_id?: number;
    name?: string;
    title?: string;
    image?: string;
    price?: number;
    units_sold: number;
    revenue: number;
  }>;
}

export interface StoreSettings {
  store_name?: string;
  currency?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  shipping_fee?: number;
  free_shipping_threshold?: number;
  return_window_days?: number;
  authorized_staff?: Array<{
    id?: number;
    name: string;
    email: string;
    role: string;
  }>;
  store?: {
    name: string;
    tagline: string;
    currency: string;
    contact_email: string;
    contact_phone: string;
    standard_shipping_fee: number;
    free_shipping_threshold: number;
    return_policy_days: number;
    cod_enabled: boolean;
    maintenance_mode: boolean;
  };
  authorized_users?: Array<{
    id: number;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: string;
  }>;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

