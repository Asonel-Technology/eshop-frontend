import { getAccessToken, refreshAccessToken } from "./authTokens";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Authenticated admin request. On a 401 it renews the access token once and replays the
 * request, so a 15-minute token expiry is invisible to the person using the dashboard.
 */
async function fetchAdminAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  // Never set Content-Type for FormData — the browser must add the multipart boundary.
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401 && allowRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return fetchAdminAPI<T>(endpoint, options, false);
    throw new Error("Your session has expired. Please sign in again.");
  }

  // DELETE endpoints reply 204 with no body.
  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);
  if (!json?.success) {
    throw new Error(json?.message || `Request failed (${response.status})`);
  }
  return json.data as T;
}

export async function getAdminCategories() {
  return fetchAdminAPI<any[]>("/categories");
}

export async function createAdminCategory(data: { type: string; name: string; slug: string }) {
  return fetchAdminAPI<any>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createAdminSubcategory(data: { categoryId: string; name: string; slug: string }) {
  return fetchAdminAPI<any>("/admin/categories/subcategories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminCategory(id: string) {
  return fetchAdminAPI<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

export async function deleteAdminSubcategory(id: string) {
  return fetchAdminAPI<void>(`/admin/categories/subcategories/${id}`, { method: "DELETE" });
}

export interface AdminItemList {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAdminItems(params: { type?: string; search?: string; page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize ?? 50));
  return fetchAdminAPI<AdminItemList>(`/admin/items?${query.toString()}`);
}

export async function getAdminItem(id: string) {
  return fetchAdminAPI<any>(`/admin/items/${id}`);
}

export async function createAdminItem(form: FormData) {
  return fetchAdminAPI<any>("/admin/items", { method: "POST", body: form });
}

export async function updateAdminItem(id: string, form: FormData) {
  return fetchAdminAPI<any>(`/admin/items/${id}`, { method: "PUT", body: form });
}

export async function deleteAdminItem(id: string) {
  return fetchAdminAPI<void>(`/admin/items/${id}`, { method: "DELETE" });
}

export async function getAdminOrders(status?: string) {
  const query = status ? `?status=${status}` : "";
  return fetchAdminAPI<any[]>(`/admin/orders${query}`);
}

export async function getAdminOrder(id: string) {
  return fetchAdminAPI<any>(`/admin/orders/${id}`);
}

export async function updateAdminOrderStatus(id: string, status: string) {
  return fetchAdminAPI<any>(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminSettings() {
  return fetchAdminAPI<any>("/admin/settings");
}

export async function updateAdminSettings(data: Record<string, string>) {
  return fetchAdminAPI<any>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getAdminDeliveryFees() {
  return fetchAdminAPI<{ zone: string; fee: number }[]>("/admin/delivery-fees");
}

export async function upsertAdminDeliveryFee(zone: string, fee: number) {
  return fetchAdminAPI<any>("/admin/delivery-fees", {
    method: "POST",
    body: JSON.stringify({ zone, fee }),
  });
}
