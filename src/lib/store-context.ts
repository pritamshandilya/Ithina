/**
 * Lightweight in-memory store-scope context.
 *
 * After login the user selects (or the app auto-selects) a store.
 * All API calls that require `X-Store-Id` read from here.
 *
 * Persistence: we write to localStorage so a page refresh keeps the
 * selection, but we never block API calls when it is absent – the
 * backend will return 400 which surfaces as a normal error.
 *
 * `subscribe` supports `useSyncExternalStore` so UI updates when the
 * active store changes (same tab + other tabs via `storage` events).
 */

const STORE_KEY = "promo_active_store_id";

const listeners = new Set<() => void>();

function emit(): void {
  for (const cb of listeners) {
    cb();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORE_KEY || e.key === null) {
      emit();
    }
  });
}

export const StoreContext = {
  getStoreId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORE_KEY);
  },

  setStoreId(storeId: string): void {
    localStorage.setItem(STORE_KEY, storeId);
    emit();
  },

  clearStoreId(): void {
    localStorage.removeItem(STORE_KEY);
    emit();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
