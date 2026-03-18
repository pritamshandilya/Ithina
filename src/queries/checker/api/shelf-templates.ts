import type {
  ShelfTemplate,
  ShelfTemplateCreateInput,
  ShelfTemplateUpdateInput,
} from "@/types/shelf-template";

const STORAGE_KEY = "dd-pog:shelf-templates:v1";

function storageKeyForStore(storeId: string) {
  return `${STORAGE_KEY}:${storeId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function simulateNetworkDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStorage(storeId: string): ShelfTemplate[] {
  try {
    const raw = localStorage.getItem(storageKeyForStore(storeId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ShelfTemplate[];
  } catch {
    return [];
  }
}

function writeStorage(storeId: string, items: ShelfTemplate[]) {
  localStorage.setItem(storageKeyForStore(storeId), JSON.stringify(items));
}

function getSeedTemplates(): ShelfTemplate[] {
  const ts = nowIso();
  return [
    {
      id: "tpl-gondola-standard",
      name: "Gondola (Standard)",
      description: "Default gondola bay used for most grocery aisles.",
      fixtureType: "gondola",
      zone: "Grocery",
      section: "General",
      width: 1200,
      height: 1800,
      depth: 450,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: "tpl-endcap-promo",
      name: "End Cap (Promo)",
      description: "Promotional end cap with a narrower footprint.",
      fixtureType: "end_cap",
      zone: "Promotions",
      section: "Seasonal",
      width: 900,
      height: 1700,
      depth: 500,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: "tpl-cooler-door",
      name: "Cooler (Door)",
      description: "Standard refrigerated cooler fixture.",
      fixtureType: "cooler",
      zone: "Dairy",
      section: "Cold",
      width: 1000,
      height: 2000,
      depth: 700,
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

function ensureSeeded(storeId: string): ShelfTemplate[] {
  const existing = readStorage(storeId);
  if (existing.length > 0) return existing;
  const seeded = getSeedTemplates();
  writeStorage(storeId, seeded);
  return seeded;
}

function newId(): string {
  return `tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function fetchShelfTemplates(storeId: string): Promise<ShelfTemplate[]> {
  await simulateNetworkDelay();
  return ensureSeeded(storeId).slice().sort((a, b) => a.name.localeCompare(b.name));
}

export async function createShelfTemplate(
  storeId: string,
  input: ShelfTemplateCreateInput,
): Promise<ShelfTemplate> {
  await simulateNetworkDelay();
  const items = ensureSeeded(storeId);
  const ts = nowIso();
  const created: ShelfTemplate = {
    ...input,
    id: newId(),
    createdAt: ts,
    updatedAt: ts,
  };
  const next = [...items, created];
  writeStorage(storeId, next);
  return created;
}

export async function updateShelfTemplate(
  storeId: string,
  input: ShelfTemplateUpdateInput,
): Promise<ShelfTemplate> {
  await simulateNetworkDelay();
  const items = ensureSeeded(storeId);
  const idx = items.findIndex((t) => t.id === input.id);
  if (idx === -1) {
    throw new Error("Template not found");
  }
  const existing = items[idx]!;
  const updated: ShelfTemplate = {
    ...existing,
    ...input,
    updatedAt: nowIso(),
  };
  const next = items.slice();
  next[idx] = updated;
  writeStorage(storeId, next);
  return updated;
}

export async function deleteShelfTemplate(storeId: string, id: string): Promise<void> {
  await simulateNetworkDelay();
  const items = ensureSeeded(storeId);
  const next = items.filter((t) => t.id !== id);
  writeStorage(storeId, next);
}

