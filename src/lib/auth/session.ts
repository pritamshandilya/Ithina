const STORAGE_KEYS = {
  token: "core_auth_token",
  expiryEpochMs: "core_auth_expiry_ms",
  storeId: "core_store_id",
} as const;

const LEGACY_STORAGE_KEYS = {
  token: "pog_auth_token",
  expiryEpochMs: "pog_auth_expiry_ms",
  storeId: "pog_store_id",
} as const;

export function getAuthToken(): string | null {
  return (
    localStorage.getItem(STORAGE_KEYS.token) ??
    localStorage.getItem(LEGACY_STORAGE_KEYS.token)
  );
}

export function setAuthSession(token: string, expiresInSeconds: number): void {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(
    STORAGE_KEYS.expiryEpochMs,
    String(Date.now() + expiresInSeconds * 1000),
  );
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.expiryEpochMs);
  localStorage.removeItem(LEGACY_STORAGE_KEYS.token);
  localStorage.removeItem(LEGACY_STORAGE_KEYS.expiryEpochMs);
}

export function isSessionAuthenticated(): boolean {
  const token = getAuthToken();
  const expiry = Number(
    localStorage.getItem(STORAGE_KEYS.expiryEpochMs) ??
      localStorage.getItem(LEGACY_STORAGE_KEYS.expiryEpochMs) ??
      "0",
  );
  return Boolean(token) && Number.isFinite(expiry) && Date.now() < expiry;
}

export function getSelectedStoreId(): string | null {
  return (
    localStorage.getItem(STORAGE_KEYS.storeId) ??
    localStorage.getItem(LEGACY_STORAGE_KEYS.storeId)
  );
}

export function setSelectedStoreId(storeId: string): void {
  localStorage.setItem(STORAGE_KEYS.storeId, storeId);
}

export function clearSelectedStoreId(): void {
  localStorage.removeItem(STORAGE_KEYS.storeId);
  localStorage.removeItem(LEGACY_STORAGE_KEYS.storeId);
}
