import { Category, GenderUniverse, Product } from "@/types";

export interface VariantFormData {
  id?: number;
  sku: string;
  size: string;
  color_name_fr: string;
  color_name_ar: string;
  color_code: string;
  stock: number;
  is_active: boolean;
}

export interface ImageFormData {
  id?: number;
  url: string;
  alt_text_fr?: string;
  alt_text_ar?: string;
  is_cover: boolean;
  sort_order: number;
}

export interface ProductFormData {
  name_fr: string;
  name_ar: string;
  sku: string;
  slug: string;
  short_desc_fr: string;
  short_desc_ar: string;
  description_fr: string;
  description_ar: string;
  material_fr: string;
  material_ar: string;
  base_price: string;
  discount_price: string;
  universe: GenderUniverse;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  variants: VariantFormData[];
  images: ImageFormData[];
}

export type FormTab = "general" | "pricing" | "variants" | "images" | "publication";

export interface ValidationErrors {
  [key: string]: string;
}

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData, isEdit: boolean) => Promise<void>;
  editingProduct?: Product | null;
  categories: Category[];
  existingProducts?: Product[];
}
