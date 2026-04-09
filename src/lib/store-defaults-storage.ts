import type { ShelfTemplate, ShelfTemplateCreateInput } from "@/types/shelf-template";

type StoreDefaultsData = {
  fixtureTypes?: string[];
  /**
   * Shelf templates are persisted via `src/queries/checker/api/shelf-templates.ts`.
   * This is left here to keep the defaults model extensible without breaking callers.
   */
  shelfTemplates?: ShelfTemplate[] | ShelfTemplateCreateInput[];
};

function storeDefaultsKey(storeId: string) {
  return `dd-pog:store-defaults:${storeId}`;
}

function readStoreDefaults(storeId: string): StoreDefaultsData {
  try {
    const raw = localStorage.getItem(storeDefaultsKey(storeId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoreDefaultsData;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeStoreDefaults(storeId: string, data: StoreDefaultsData) {
  localStorage.setItem(storeDefaultsKey(storeId), JSON.stringify(data));
}

export function readStoreFixtureTypeLabels(storeId: string): string[] {
  const defaults = readStoreDefaults(storeId);
  const fixtureTypes = defaults.fixtureTypes;
  return Array.isArray(fixtureTypes) ? fixtureTypes.filter(Boolean) : [];
}

export function mergeStoreDefaults(storeId: string, payload: { fixtureTypes?: string[] }) {
  const existing = readStoreDefaults(storeId);
  const next: StoreDefaultsData = {
    ...existing,
    ...payload,
  };

  if (payload.fixtureTypes) {
    // Preserve order while de-duping.
    const seen = new Set<string>();
    next.fixtureTypes = payload.fixtureTypes.filter((t) => {
      const key = t.trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  writeStoreDefaults(storeId, next);
}

