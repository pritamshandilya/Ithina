/**
 * API Payload Types – Shelves
 *
 * Request bodies sent to shelf-related endpoints.
 */

export interface CreateShelfPayload {
  aisleNumber: number;
  bayNumber: number;
  shelfName: string;
  description?: string;
  elevation?: "Bottom" | "Middle" | "Top" | "Eye Level";
  notes?: string;
  planogramId?: string;
}

export interface UpdateShelfPayload {
  shelfName?: string;
  description?: string;
  elevation?: "Bottom" | "Middle" | "Top" | "Eye Level";
  notes?: string;
  planogramId?: string;
}

export interface AssignPlanogramPayload {
  planogramId: string;
  arrangement?: unknown;
}
