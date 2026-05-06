import type { StagedSku } from "@/types/wizard";

/** Post-offer margin strictly below zero — the only condition that defaults a row to unchecked. */
export function stagedSkuViolatesMarginPolicy(
  row: Pick<StagedSku, "safe" | "marginPct">,
): boolean {
  const m = row.marginPct;
  return typeof m === "number" && !Number.isNaN(m) && m < 0;
}

export function defaultIncludedForStagedSku(
  row: Pick<StagedSku, "safe" | "marginPct">,
): boolean {
  return !stagedSkuViolatesMarginPolicy(row);
}
