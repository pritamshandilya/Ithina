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
  backroomStock: number | null;
  price: number | null;
  salesVelocityPerDay: number | null;
  margin: number | null;
  expirySensitive: boolean;
  planogramRole: string | null;
  isOnPromotion: boolean;
}

export interface PlanogramShelfDef {
  shelfId: string;
  shelfNumber: number;
  name: string;
  verticalPosition: number;
  height: number;
  /** Optional per-shelf dimensions from payloads that provide them */
  width?: number;
  depth?: number;
  products: PlanogramProduct[];
}

export interface PlanogramFixture {
  fixtureId: string;
  type: string;
  width: number;
  height: number;
  depth: number;
  units?: string;
  shelfCount?: number;
  shelves: PlanogramShelfDef[];
}

export interface PlanogramPhysicalLocation {
  storeId: string;
  zone: string;
  aisle: string;
  bay: string;
  side: string;
  section: string;
  fixtureIndexInBay: number;
}
export interface PlanogramDefinition {
  id: string;
  name: string;
  version: string;
  createdDate: string;
  location: string;
  status: string;
  storeConfig?: {
    units: string;
    currency: string;
  };
  physicalLocation: PlanogramPhysicalLocation;
  metadata?: PlanogramMetadata;
  fixture: PlanogramFixture;
}

export interface StockingRules {
  highDemandProducts: string[];
  restockThreshold: number;
  notes: string;
}

export interface PlanogramMetadata {
  createdBy: string;
  updatedBy: string;
  sourceSystem: string;
  tags: string[];
  auditTrailId: string;
  syncStatus: string;
  location?: string;
  lastUpdated?: string;
  stockingRules: StockingRules;
  status?: string;
  totalSKUs?: number;
  totalProducts?: number;
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
  /** From physicalLocation */
  zone?: string;
  aisle?: string;
  bay?: string;
  section?: string;
  /** From fixture */
  fixtureType?: string;
  fixtureId?: string;
  /** W×H×D in store units */
  width?: number;
  height?: number;
  depth?: number;
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
