/**
 * Planogram types – structure from third-party planogram API
 * Matches prod_dd.json payload format
 */

export interface PlanogramProduct {
  sku: string;
  brand: string;
  name: string;
  category: string;
  xPosition: number;
  facings: number;
  depthCount: number;
  width: number;
  height: number;
  depth: number;
  optimalStock: number;
  currentStock: number;
}

export interface PlanogramShelfDef {
  shelfNumber: number;
  name: string;
  verticalPosition: number;
  height: number;
  products: PlanogramProduct[];
}

export interface PlanogramFixture {
  type: string;
  width: number;
  height: number;
  depth: number;
  units: string;
  shelfCount: number;
  shelves: PlanogramShelfDef[];
}

export interface PlanogramDefinition {
  id: string;
  name: string;
  version: string;
  createdDate: string;
  fixture: PlanogramFixture;
}

export interface StockingRules {
  highDemandProducts: string[];
  restockThreshold: number;
  notes: string;
}

export interface PlanogramMetadata {
  location: string;
  lastUpdated: string;
  status: string;
  totalSKUs: number;
  totalProducts: number;
}

/** Full payload from third-party planogram API */
export interface PlanogramPayload {
  planogram: PlanogramDefinition;
  stockingRules?: StockingRules;
  metadata?: PlanogramMetadata;
}

/** Summary for planogram list/dropdown */
export interface PlanogramSummary {
  id: string;
  name: string;
  shelfCount: number;
  productCount: number;
  dimensions?: string;
  location?: string;
}

/** User's edited arrangement (what gets saved) */
export interface PlanogramArrangement {
  planogramId?: string;
  shelfOrder: { shelfId: string; productIds: string[] }[];
  /** SKUs removed from the planogram (moved to Removed Items) */
  removedProductIds?: string[];
  /** Product-level edits: sku -> { name?, category?, facings?, depthCount? } */
  productEdits?: Record<
    string,
    { name?: string; category?: string; facings?: number; depthCount?: number }
  >;
}
