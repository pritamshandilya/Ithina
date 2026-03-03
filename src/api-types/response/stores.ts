/**
 * API Response Types – Stores
 *
 * Shapes returned by store-related endpoints.
 */

export interface StoreResponse {
  id: string;
  name: string;
  address: string;
  region?: string;
  status: "Active" | "Inactive";
  pendingAuditCount?: number;
  created?: string; // ISO date string
}

export interface StoreListResponse {
  stores: StoreResponse[];
  total: number;
}
