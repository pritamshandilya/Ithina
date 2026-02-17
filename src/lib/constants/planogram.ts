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
