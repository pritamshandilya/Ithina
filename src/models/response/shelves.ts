/**
 * API Response Types – Shelves
 *
 * Shapes returned by shelf-related endpoints.
 */

export type ShelfStatusResponse =
  | "never-audited"
  | "draft"
  | "pending"
  | "approved"
  | "returned";

export interface ShelfResponse {
  id: string;
  aisleNumber: number;
  bayNumber: number;
  shelfName: string;
  description?: string;
  status: ShelfStatusResponse;
  lastAuditDate?: string; // ISO date string
  complianceScore?: number;
  assignedTo?: string;
  elevation?: "Bottom" | "Middle" | "Top" | "Eye Level";
  notes?: string;
  planogramId?: string;
  zone?: string;
  section?: string;
  fixtureType?: string;
  dimensions?: string;
}

export interface ShelfListResponse {
  shelves: ShelfResponse[];
  total: number;
}

export interface CreateShelfResponse {
  shelf: ShelfResponse;
}
