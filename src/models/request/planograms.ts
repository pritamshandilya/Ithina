/**
 * API Payload Types - Planograms
 *
 * Request bodies sent to planogram endpoints.
 * The backend accepts the raw planogram schema as-is.
 */

import type { PlanogramPayload } from "@/types/planogram";

export type PlanogramApiStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type CreatePlanogramPayload = PlanogramPayload;

export type UpdatePlanogramPayload = PlanogramPayload;
