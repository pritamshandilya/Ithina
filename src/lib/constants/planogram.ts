/**
 * Planogram constants – category colors and shape mappings
 */

/** Tailwind bg-* classes for product blocks by category */
export const CATEGORY_COLORS: Record<string, string> = {
  "Aperitif Snacks": "bg-amber-100 dark:bg-amber-900/40",
  Chips: "bg-orange-100 dark:bg-orange-900/40",
  Snacks: "bg-yellow-100 dark:bg-yellow-900/40",
  "Kids Cereal": "bg-lime-100 dark:bg-lime-900/40",
  Coffee: "bg-amber-200 dark:bg-amber-800/50",
  "Baby Care": "bg-pink-100 dark:bg-pink-900/40",
  "First Aid": "bg-rose-100 dark:bg-rose-900/40",
  Grooming: "bg-violet-100 dark:bg-violet-900/40",
  Water: "bg-sky-100 dark:bg-sky-900/40",
  "Sparkling Water": "bg-cyan-100 dark:bg-cyan-900/40",
  "Soft Drinks": "bg-red-100 dark:bg-red-900/40",
  Juices: "bg-orange-200 dark:bg-orange-800/50",
  Nectars: "bg-amber-100 dark:bg-amber-900/40",
  Dairy: "bg-blue-100 dark:bg-blue-900/40",
  Milk: "bg-sky-50 dark:bg-sky-950/50",
  "Energy Drinks": "bg-emerald-100 dark:bg-emerald-900/40",
};

/** Default for unknown categories */
const DEFAULT_CATEGORY_COLOR = "bg-muted";

/** Returns Tailwind bg class for a category; fallback for unknown */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
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

/** Hex colors for SVG fill (main body) – darker tones for visibility on light card backgrounds */
const CATEGORY_FILL: Record<string, string> = {
  "Aperitif Snacks": "#d97706",
  Chips: "#ea580c",
  Snacks: "#ca8a04",
  "Kids Cereal": "#65a30d",
  Coffee: "#b45309",
  "Baby Care": "#db2777",
  "First Aid": "#e11d48",
  Grooming: "#7c3aed",
  Water: "#0284c7",
  "Sparkling Water": "#0891b2",
  "Soft Drinks": "#dc2626",
  Juices: "#c2410c",
  Nectars: "#d97706",
  Dairy: "#2563eb",
  Milk: "#0ea5e9",
  "Energy Drinks": "#059669",
};

/** Hex colors for SVG accent (cap, label, stroke) – darker for definition */
const CATEGORY_ACCENT: Record<string, string> = {
  "Aperitif Snacks": "#92400e",
  Chips: "#c2410c",
  Snacks: "#a16207",
  "Kids Cereal": "#4d7c0f",
  Coffee: "#78350f",
  "Baby Care": "#9d174d",
  "First Aid": "#b91c1c",
  Grooming: "#5b21b6",
  Water: "#0369a1",
  "Sparkling Water": "#0e7490",
  "Soft Drinks": "#b91c1c",
  Juices: "#9a3412",
  Nectars: "#92400e",
  Dairy: "#1d4ed8",
  Milk: "#0284c7",
  "Energy Drinks": "#047857",
};

const DEFAULT_FILL = "#6b7280";
const DEFAULT_ACCENT = "#4b5563";

/** Returns hex color for SVG fill */
export function getCategoryFill(category: string): string {
  return CATEGORY_FILL[category] ?? DEFAULT_FILL;
}

/** Returns hex color for SVG accent */
export function getCategoryAccent(category: string): string {
  return CATEGORY_ACCENT[category] ?? DEFAULT_ACCENT;
}
