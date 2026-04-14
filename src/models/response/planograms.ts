/**
 * API Response Types - Planograms
 *
 * Shapes returned by planogram-related endpoints.
 * Matches backend PlanogramResponse DTO.
 */

import type { PlanogramApiStatus } from "@/models/request/planograms";

export interface PlanogramResponse {
  id: string;
  store_id: string;
  name: string;
  version: string | null;
  description: string | null;
  status: PlanogramApiStatus;
  planogram_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
