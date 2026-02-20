/**
 * All Items Report – types for All Planogram Items and SKU Facings & Depth Summary.
 * Replace mock data source with API when available.
 */

export type PlanogramItemStatus = "matched" | "misplaced" | "missing" | "extra";
export type ComplianceLevel = "LOW" | "MEDIUM" | "HIGH";

/** Row for All Planogram Items table */
export interface PlanogramItemRow {
  id: string;
  productName: string;
  sku: string;
  shelf: string;
  status: PlanogramItemStatus;
  complianceLevel: ComplianceLevel;
  issueDescription?: string;
}

/** Row for SKU Facings & Depth Summary table */
export interface SkuFacingRow {
  id: string;
  productName: string;
  sku: string;
  frontFacings: number;
  detected: number;
  depth: number;
  totalExpected: number;
  /** e.g. "-6 short (18 units)" or "OK" or "+13 extra" */
  facingDiffText: string;
  /** "ok" | "short" | "extra" for styling */
  facingDiffVariant: "ok" | "short" | "extra";
}

/** Combined payload for All Items tab – replace with API response shape later */
export interface AllItemsReportData {
  planogramItems: PlanogramItemRow[];
  skuFacings: SkuFacingRow[];
}
