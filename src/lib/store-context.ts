/**
 * Lightweight in-memory store-scope context.
 *
 * After login the user selects (or the app auto-selects) a store.
 * All API calls that require `X-Store-Id` read from here.
 *
 * Persistence: we write to localStorage so a page refresh keeps the
 * selection, but we never block API calls when it is absent – the
 * backend will return 400 which surfaces as a normal error.
 */

const STORE_KEY = "promo_active_store_id";

export const StoreContext = {
  getStoreId(): string | null {
    return localStorage.getItem(STORE_KEY);
  },

  setStoreId(storeId: string): void {
    localStorage.setItem(STORE_KEY, storeId);
  },

  clearStoreId(): void {
    localStorage.removeItem(STORE_KEY);
  },
};
