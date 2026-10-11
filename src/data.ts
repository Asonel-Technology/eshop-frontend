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
  type?: "PRODUCT" | "FOOD";
  unit?: string;
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
  type?: "PRODUCT" | "FOOD";
  unit?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
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

export function isButcherItem(item?: { type?: string; categorySlug?: string } | null) {
  if (!item) return false;
  if (item.type === "FOOD") return true;
  return item.categorySlug === "butcher" || item.categorySlug === "meat";
}

/** Backend `unit` for FOOD (kg, g, pcs, l). Meat defaults to kg. */
export function itemUnit(item?: { type?: string; unit?: string | null; categorySlug?: string } | null) {
  if (!item) return undefined;
  if (item.unit) return item.unit;
  if (isButcherItem(item)) return "kg";
  return undefined;
}

export function formatItemPrice(n: number, item?: { type?: string; unit?: string | null; categorySlug?: string } | null) {
  const money = formatRWF(n);
  const unit = itemUnit(item);
  return unit ? `${money} / ${unit}` : money;
}

export function shopCategoriesOnly(categories: Category[]) {
  return categories.filter((c) => !isButcherCategory(c));
}

export function catalogFallbackImage(categories: Category[], products: Product[]) {
  const fromCategory = shopCategoriesOnly(categories).find((c) => c.imageUrl)?.imageUrl;
  if (fromCategory) return fromCategory;
  return products.find((p) => !isButcherItem(p) && p.img)?.img || "";
}

export function categoryCover(
  cat: Category,
  products: Product[],
  fallback = "",
  sub?: Subcategory,
) {
  if (sub) {
    const fromSub = products.find((p) => String(p.subcategoryId) === String(sub.id) && p.img);
    if (fromSub?.img) return fromSub.img;
  }
  if (!sub && cat.imageUrl) return cat.imageUrl;
  const fromCat = products.find((p) => String(p.categoryId) === String(cat.id) && p.img);
  if (fromCat?.img) return fromCat.img;
  if (cat.imageUrl) return cat.imageUrl;
  return fallback;
}

export function shopBrowseTiles(categories: Category[], products: Product[]) {
  const fallback = catalogFallbackImage(categories, products);
  const tiles: { key: string; label: string; slug: string; parentSlug: string; subSlug?: string; img: string }[] = [];
  for (const cat of shopCategoriesOnly(categories)) {
    tiles.push({
      key: cat.id,
      label: cat.name,
      slug: cat.slug,
      parentSlug: cat.slug,
      img: categoryCover(cat, products, fallback),
    });
    for (const sub of cat.subcategories || []) {
      tiles.push({
        key: sub.id,
        label: sub.name,
        slug: sub.slug,
        parentSlug: cat.slug,
        subSlug: sub.slug,
        img: categoryCover(cat, products, fallback, sub),
      });
    }
  }
  return tiles;
}

export function tilePath(tile: { parentSlug: string; subSlug?: string }) {
  return tile.subSlug ? `/category/${tile.parentSlug}?sub=${tile.subSlug}` : `/category/${tile.parentSlug}`;
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
