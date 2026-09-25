export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  img: string;
  qty: number;
  /** Kept separate rather than as one label: the backend matches stock on color AND size. */
  color?: string;
  size?: string;
  emoji?: string;
}

/** Human-readable variant label, e.g. "Red / XL". Display only - never sent to the API. */
export function variantLabel(item: Pick<CartItem, "color" | "size">) {
  return [item.color, item.size].filter(Boolean).join(" / ");
}

export interface ProductVariant {
  id?: string;
  color?: string;
  size?: string;
  quantity: number;
}

export interface Product {
  id: string | number;
  name: string;
  category: string;
  categoryId: string | number;
  categorySlug?: string;
  subcategoryId?: string;
  subcategory?: Subcategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  img: string;
  images?: string[];
  badge?: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  variants?: ProductVariant[];
  hasColors?: boolean;
  hasSizes?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isDeal?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type?: "PRODUCT" | "FOOD";
  icon?: string;
  img?: string;
  imageUrl?: string;
  description?: string;
  count?: number;
  productCount?: number;
  color?: string;
  colorCode?: string;
  subcategories?: Subcategory[];
}

/** Only the butcher opens the special meat page. Clothes, oils, and other goods stay on the shop grid. */
export function isButcherCategory(category?: Pick<Category, "type" | "slug"> | null) {
  if (!category) return false;
  if (category.slug === "butcher" || category.slug === "meat") return true;
  return category.type === "FOOD";
}

/** Accepts 07xxxxxxxx, 7xxxxxxxx, and +2507xxxxxxxx. Prefixes are not frozen. */
export function isRwandaMobile(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length === 12) return digits[3] === "7";
  if (digits.startsWith("0") && digits.length === 10) return digits[1] === "7";
  if (digits.length === 9 && digits.startsWith("7")) return true;
  return false;
}

export function formatRWF(n: number) {
  return "RWF " + n.toLocaleString();
}

export function discountPct(current: number, original: number) {
  return Math.round(((original - current) / original) * 100);
}
