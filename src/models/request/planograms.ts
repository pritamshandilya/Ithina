/**
 * API Payload Types - Planograms
 *
 * Request bodies sent to planogram endpoints.
 * Matches backend PlanogramCreateRequest / PlanogramUpdateRequest DTOs.
 */

export type PlanogramApiStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface CreatePlanogramPayload {
  name: string;
  version?: string;
  description?: string;
  status?: PlanogramApiStatus;
  planogram_data: Record<string, unknown>;
}

export interface UpdatePlanogramPayload {
  name?: string;
  version?: string;
  description?: string;
  status?: PlanogramApiStatus;
  planogram_data?: Record<string, unknown>;
}
