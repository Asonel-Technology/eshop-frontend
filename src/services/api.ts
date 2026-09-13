import type { Category, Product, Subcategory } from "../data";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface PublicSettings {
  momoCode: string | null;
  whatsappNumber: string | null;
  deliveryZones: { zone: string; fee: number }[];
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || "Unknown API error");
  }
  return json.data as T;
}

export async function getPublicSettings() {
  return fetchAPI<PublicSettings>("/settings/public");
}

const mapItem = (item: any): Product => ({
  id: item.id,
  name: item.name,
  category: item.category?.name || "Unknown",
  categoryId: item.categoryId,
  categorySlug: item.category?.slug,
  subcategoryId: item.subcategoryId,
  subcategory: item.subcategory,
  price: item.price,
  originalPrice: item.originalPrice,
  rating: item.averageRating || 0,
  reviews: item.ratingCount || 0,
  img: item.images?.[0] || "",
  images: item.images || [],
  stock: item.quantity > 5 ? "In Stock" : item.quantity > 0 ? "Low Stock" : "Out of Stock",
  description: item.description || "",
  isFeatured: item.isFeatured,
  hasColors: item.hasColors,
  hasSizes: item.hasSizes,
  variants: item.variants || [],
});

export async function getFeaturedItems() {
  const data = await fetchAPI<any>("/items/featured");
  
  return {
    products: (data.products || []).map(mapItem),
    foods: (data.foods || []).map(mapItem)
  };
}

export interface GetItemsParams {
  type?: "PRODUCT" | "FOOD";
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getItems(params: GetItemsParams = {}) {
  const query = new URLSearchParams();
  if (params.type) query.append("type", params.type);
  if (params.categorySlug) query.append("category", params.categorySlug);
  if (params.subcategorySlug) query.append("subcategory", params.subcategorySlug);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", String(params.page));
  if (params.pageSize) query.append("pageSize", String(params.pageSize));

  const data = await fetchAPI<any>(`/items?${query.toString()}`);
  
  return {
    items: (data.items || []).map(mapItem) as Product[],
    total: data.total,
    page: data.page,
    pageSize: data.pageSize
  };
}

export async function getItem(id: string | number) {
  const data = await fetchAPI<any>(`/items/${id}`);
  return mapItem(data);
}

export async function getCategories(type: "PRODUCT" | "FOOD") {
  const data = await fetchAPI<any[]>(`/categories?type=${type}`);
  return data.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || "📦",
    img: cat.imageUrl || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop&auto=format",
    imageUrl: cat.imageUrl,
    color: cat.colorCode || "#111111",
    colorCode: cat.colorCode,
    count: cat.items?.length || 0,
    subcategories: cat.subcategories || []
  })) as Category[];
}

export interface LocationItem {
  id: string;
  name: string;
}

export async function getProvinces() {
  return fetchAPI<LocationItem[]>("/locations/provinces");
}

export async function getDistricts(provinceId: string) {
  return fetchAPI<LocationItem[]>(`/locations/districts?provinceId=${provinceId}`);
}

export async function getSectors(districtId: string) {
  return fetchAPI<LocationItem[]>(`/locations/sectors?districtId=${districtId}`);
}

export async function uploadPaymentProof(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/uploads/payment-proof`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload screenshot");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data.url;
}

export interface OrderPayload {
  customerName: string;
  phone: string;
  provinceId: string;
  districtId: string;
  sectorId: string;
  paymentProofUrl: string;
  items: { itemId: string; quantity: number; color?: string; size?: string }[];
}

export async function submitOrder(payload: OrderPayload) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to submit order");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}


export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message || "Login failed");
  return json.data; // { admin, accessToken }
}
