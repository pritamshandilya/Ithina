import type { PlanogramShelfRow } from "@/types/maker";

/** Single-line display for shelf/fixture dimensions (W×H×D unit or legacy `dimensions` string). */
export function formatPlanogramShelfDimensionDisplay(
  row: PlanogramShelfRow,
): string {
  const fromDimensions = row.dimensions?.trim();
  if (fromDimensions) return fromDimensions;
  const u = row.dimensionUnit?.trim() ?? "";
  const w = row.width;
  const h = row.height;
  const d = row.depth;
  if (w != null && h != null && d != null) {
    return `${w}×${h}×${d}${u ? ` ${u}` : ""}`;
  }
  if (w != null && h != null) {
    return `${w}×${h}${u ? ` ${u}` : ""}`;
  }
  return "—";
}
