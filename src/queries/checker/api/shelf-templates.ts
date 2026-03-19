import type {
  ShelfTemplate,
  ShelfTemplateCreateInput,
  ShelfTemplateUpdateInput,
} from "@/types/shelf-template";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

const STORAGE_KEY = "dd-pog:shelf-templates:v2";
const MM_PER_INCH = 25.4;

type ShelfTemplateSeed = Omit<
  ShelfTemplate,
  "width" | "height" | "depth" | "createdAt" | "updatedAt"
> & {
  widthInch: number;
  heightInch: number;
  depthInch: number;
};

const SHELF_TEMPLATE_SEEDS: ShelfTemplateSeed[] = [
  {
    id: "tpl-4-shelf-standard",
    name: "4-shelf standard (48\"W)",
    description: "Standard 4-shelf gondola bay with a 48-inch width.",
    fixtureType: "gondola",
    zone: "Grocery",
    section: "General",
    widthInch: 48,
    heightInch: 72,
    depthInch: 18,
  },
  {
    id: "tpl-5-shelf-tall",
    name: "5-shelf tall (48\"W)",
    description: "Tall 5-shelf gondola bay with a 48-inch width.",
    fixtureType: "gondola",
    zone: "Grocery",
    section: "General",
    widthInch: 48,
    heightInch: 84,
    depthInch: 18,
  },
  {
    id: "tpl-3-shelf-cooler",
    name: "3-shelf cooler",
    description: "Refrigerated 3-shelf cooler bay.",
    fixtureType: "cooler",
    zone: "Dairy",
    section: "Cold",
    widthInch: 48,
    heightInch: 78,
    depthInch: 30,
  },
];

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

function toStoreDimension(valueInches: number, unit: StoreDimensionUnit): number {
  if (unit === "inch") {
    return Number(valueInches.toFixed(2));
  }
  if (unit === "cm") {
    return Math.round(valueInches * 2.54);
  }
  return Math.round(valueInches * MM_PER_INCH);
}

function getSeedTemplates(unit: StoreDimensionUnit): ShelfTemplate[] {
  const ts = nowIso();
  return SHELF_TEMPLATE_SEEDS.map((seed) => ({
    id: seed.id,
    name: seed.name,
    description: seed.description,
    fixtureType: seed.fixtureType,
    zone: seed.zone,
    section: seed.section,
    width: toStoreDimension(seed.widthInch, unit),
    height: toStoreDimension(seed.heightInch, unit),
    depth: toStoreDimension(seed.depthInch, unit),
    createdAt: ts,
    updatedAt: ts,
  }));
}

function ensureSeeded(storeId: string, unit: StoreDimensionUnit): ShelfTemplate[] {
  const existing = readStorage(storeId);
  if (existing.length > 0) return existing;
  const seeded = getSeedTemplates(unit);
  writeStorage(storeId, seeded);
  return seeded;
}

function newId(): string {
  return `tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function fetchShelfTemplates(
  storeId: string,
  unit: StoreDimensionUnit = "mm",
): Promise<ShelfTemplate[]> {
  await simulateNetworkDelay();
  return ensureSeeded(storeId, unit)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createShelfTemplate(
  storeId: string,
  input: ShelfTemplateCreateInput,
): Promise<ShelfTemplate> {
  await simulateNetworkDelay();
  const items = ensureSeeded(storeId, "mm");
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
  const items = ensureSeeded(storeId, "mm");
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
  const items = ensureSeeded(storeId, "mm");
  const next = items.filter((t) => t.id !== id);
  writeStorage(storeId, next);
}

export async function replaceShelfTemplates(
  storeId: string,
  inputs: ShelfTemplateCreateInput[],
): Promise<ShelfTemplate[]> {
  await simulateNetworkDelay();
  const ts = nowIso();
  const next: ShelfTemplate[] = inputs.map((input, idx) => ({
    ...input,
    id: `tpl-${Date.now()}-${idx}-${Math.random().toString(16).slice(2)}`,
    createdAt: ts,
    updatedAt: ts,
  }));
  writeStorage(storeId, next);
  return next;
}

