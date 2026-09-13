export const API_BASE = "http://localhost:4000/api";

async function fetchAdminAPI<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || "Unknown API error");
  }
  
  return json.data as T;
}

export async function getAdminCategories(token: string) {
  return fetchAdminAPI<any[]>("/categories", token);
}

export async function createAdminCategory(token: string, data: { type: string, name: string, slug: string }) {
  return fetchAdminAPI<any>("/admin/categories", token, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function createAdminSubcategory(token: string, data: { categoryId: string, name: string, slug: string }) {
  return fetchAdminAPI<any>("/admin/categories/subcategories", token, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function deleteAdminCategory(token: string, id: string) {
  return fetchAdminAPI<any>(`/admin/categories/${id}`, token, {
    method: "DELETE"
  });
}

export async function deleteAdminSubcategory(token: string, id: string) {
  return fetchAdminAPI<any>(`/admin/categories/subcategories/${id}`, token, {
    method: "DELETE"
  });
}
