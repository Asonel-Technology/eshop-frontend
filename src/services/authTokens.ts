/**
 * Admin token storage and renewal.
 *
 * Access tokens live ~15 minutes. The login response also returns a refresh token, which
 * used to be discarded — so the owner was silently signed out mid-task. This keeps both and
 * renews the access token on demand.
 */
const ACCESS_KEY = "adminToken";
const REFRESH_KEY = "adminRefreshToken";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/** Shared so parallel 401s trigger one refresh, not one per request. */
let refreshInFlight: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function storeTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function expireSession() {
  clearTokens();
  onSessionExpired?.();
}

/** Returns a fresh access token, or null if the session cannot be recovered. */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) {
    expireSession();
    return Promise.resolve(null);
  }

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        expireSession();
        return null;
      }

      storeTokens(json.data.accessToken);
      return json.data.accessToken as string;
    } catch {
      // Network failure is not an expired session — keep the tokens and let the caller retry.
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
