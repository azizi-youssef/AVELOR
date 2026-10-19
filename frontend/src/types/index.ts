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
  sku: string;
  size: string;
  color_name_fr: string;
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
  delivery_notes?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: string | number;
  shipping_fee: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  admin_notes?: string;
  created_at: string;
  items: OrderItem[];
  shipment?: Shipment;
  payment?: Payment;
}

export interface Campaign {
  id: number;
  title_fr: string;
  title_ar: string;
  subtitle_fr?: string;
  subtitle_ar?: string;
  button_text_fr?: string;
  button_text_ar?: string;
  link_url: string;
  desktop_image: string;
  mobile_image?: string;
  target_universe: GenderUniverse;
  is_active: boolean;
  sort_order: number;
}

export interface Promotion {
  id: number;
  code: string;
  name_fr: string;
  name_ar: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: string | number;
  min_order_amount: string | number;
  starts_at?: string;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
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
  pending_orders: number;
  low_stock_count: number;
  low_stock_items?: LowStockItem[];
  recent_orders?: any[];
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
