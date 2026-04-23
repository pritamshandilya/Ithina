/**
 * API Response Types - Planograms
 *
 * Planogram reads may return either an envelope with `planogram_data`
 * or a flattened payload with response metadata alongside schema fields.
 */

import type { PlanogramApiStatus } from "@/models/request/planograms";
import type { PlanogramPayload } from "@/types/planogram";

export interface PlanogramEnvelopeResponse {
  id: string;
  store_id?: string;
  name?: string | null;
  version?: string | null;
  description?: string | null;
  status?: PlanogramApiStatus;
  planogram_data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export type PlanogramFlatResponse = PlanogramPayload & {
  id?: string;
  store_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PlanogramResponse = PlanogramEnvelopeResponse | PlanogramFlatResponse;
