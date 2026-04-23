import type { PlanogramApiStatus } from "@/models/request/planograms";

export interface PlanogramDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface PlanogramProduct {
  sku?: string;
  barcode?: string;
  name: string;
  brand: string;
  category?: string;
  price?: number;
  size: PlanogramDimensions;
  x_position: number;
  facings: number;
  depth_count: number;
  velocity?: number;
  expiry_sensitive: boolean;
}

export interface PlanogramShelfDef {
  id: string;
  y_position: number;
  height: number;
  width: number;
  products: PlanogramProduct[];
}

export interface PlanogramFixture extends PlanogramDimensions {}

export interface PlanogramPayload {
  name: string;
  description?: string;
  version: string | null;
  status: PlanogramApiStatus;
  fixture: PlanogramFixture;
  shelves: PlanogramShelfDef[];
}

export interface PlanogramSummary {
  id: string;
  name: string;
  status: PlanogramApiStatus;
  version: string | null;
  description?: string;
  shelfCount: number;
  productCount: number;
  dimensions?: string;
  width?: number;
  height?: number;
  depth?: number;
}

export interface PlanogramArrangement {
  planogramId?: string;
  shelfOrder: { shelfId: string; productIds: string[] }[];
  removedProductIds?: string[];
  productEdits?: Record<
    string,
    { name?: string; category?: string; facings?: number; depthCount?: number }
  >;
}
