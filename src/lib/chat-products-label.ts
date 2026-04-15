import type { StagedSku } from "@/types/wizard";

/** Build a single-line products summary for chat summary cards from staged SKUs. */
export function buildChatProductsLabel(skus: StagedSku[]): string | null {
  const rows = skus.filter((s) => s.included !== false);
  if (rows.length === 0) return null;

  const free = rows.filter((s) => s.isFree);
  const main = rows.filter((s) => !s.isFree);

  if (main.length === 1 && free.length === 1) {
    return `${main[0].name} — Buy · ${free[0].name} — Free`;
  }
  if (rows.length <= 4) {
    return rows.map((r) => r.name).join(", ");
  }
  return `${rows.length} products`;
}
