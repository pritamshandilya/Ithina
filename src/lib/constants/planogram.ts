/**
 * Planogram constants – category colors and shape mappings
 */

/** Optional curated overrides for known flagship categories. */
const CATEGORY_COLOR_OVERRIDES: Record<string, string> = {
  "Soft Drinks": "border-red-700/55 dark:border-red-500/55",
  Water: "border-sky-700/55 dark:border-sky-500/55",
  "Energy Drinks": "border-emerald-700/55 dark:border-emerald-500/55",
};

/** Rotating border palette used for all unknown categories. */
const CATEGORY_BORDER_PALETTE = [
  "border-rose-700/55 dark:border-rose-500/55",
  "border-orange-700/55 dark:border-orange-500/55",
  "border-amber-700/55 dark:border-amber-500/55",
  "border-yellow-700/55 dark:border-yellow-500/55",
  "border-lime-700/55 dark:border-lime-500/55",
  "border-emerald-700/55 dark:border-emerald-500/55",
  "border-teal-700/55 dark:border-teal-500/55",
  "border-cyan-700/55 dark:border-cyan-500/55",
  "border-sky-700/55 dark:border-sky-500/55",
  "border-blue-700/55 dark:border-blue-500/55",
  "border-indigo-700/55 dark:border-indigo-500/55",
  "border-violet-700/55 dark:border-violet-500/55",
  "border-fuchsia-700/55 dark:border-fuchsia-500/55",
  "border-pink-700/55 dark:border-pink-500/55",
] as const;

/** Default for empty/uncategorized values */
const DEFAULT_CATEGORY_COLOR = "border-border/70";

function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase();
}

function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Returns Tailwind bg class for a category; fallback for unknown */
export function getCategoryColor(category: string): string {
  const normalized = normalizeCategoryKey(category);
  if (!normalized) return DEFAULT_CATEGORY_COLOR;
  const override = CATEGORY_COLOR_OVERRIDES[category];
  if (override) return override;
  const toneIndex = hashString(normalized) % CATEGORY_BORDER_PALETTE.length;
  return CATEGORY_BORDER_PALETTE[toneIndex];
}

/** Shape style: "box" = square, "bottle" = rounded (beverages, liquids) */
export type ProductShapeType = "box" | "bottle";

/** Categories that use bottle-like shape (rounded) */
const BOTTLE_CATEGORIES = new Set([
  "Water",
  "Sparkling Water",
  "Soft Drinks",
  "Juices",
  "Nectars",
  "Dairy",
  "Milk",
  "Baby Care",
]);

/** Returns shape type for category – wireframe uses CSS border-radius */
export function getProductShapeType(category: string): ProductShapeType {
  return BOTTLE_CATEGORIES.has(category) ? "bottle" : "box";
}

/** Rotating SVG color palette used for unknown categories. */
const CATEGORY_FILL_PALETTE = [
  "#be123c",
  "#c2410c",
  "#b45309",
  "#a16207",
  "#4d7c0f",
  "#047857",
  "#0f766e",
  "#0e7490",
  "#0369a1",
  "#1d4ed8",
  "#3730a3",
  "#5b21b6",
  "#a21caf",
  "#be185d",
] as const;

const CATEGORY_ACCENT_PALETTE = [
  "#881337",
  "#9a3412",
  "#92400e",
  "#854d0e",
  "#3f6212",
  "#065f46",
  "#115e59",
  "#155e75",
  "#075985",
  "#1e40af",
  "#312e81",
  "#4c1d95",
  "#86198f",
  "#9d174d",
] as const;

const DEFAULT_FILL = "#1e3a8a";
const DEFAULT_ACCENT = "#1e40af";

/** Returns hex color for SVG fill */
export function getCategoryFill(category: string): string {
  const normalized = normalizeCategoryKey(category);
  if (!normalized) return DEFAULT_FILL;
  const toneIndex = hashString(normalized) % CATEGORY_FILL_PALETTE.length;
  return CATEGORY_FILL_PALETTE[toneIndex];
}

/** Returns hex color for SVG accent */
export function getCategoryAccent(category: string): string {
  const normalized = normalizeCategoryKey(category);
  if (!normalized) return DEFAULT_ACCENT;
  const toneIndex = hashString(normalized) % CATEGORY_ACCENT_PALETTE.length;
  return CATEGORY_ACCENT_PALETTE[toneIndex];
}
