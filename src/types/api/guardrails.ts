/**
 * TypeScript mirrors of the FastAPI Pydantic DTOs for guardrails.
 * Keep in sync with: dd_promo_api_v1/app/io/request/guardrails.py
 *                    dd_promo_api_v1/app/io/response/guardrails.py
 */

// Backend uses lowercase severity
export type ApiGuardrailSeverity = "hard" | "soft";

export interface ApiGuardrailResponse {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  severity: ApiGuardrailSeverity;
  description: string | null;
  is_active: boolean;
  threshold_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiGuardrailCreateRequest {
  name: string;
  category: string;
  severity: ApiGuardrailSeverity;
  description?: string | null;
  is_active?: boolean;
  threshold_value?: number | null;
}

export interface ApiGuardrailUpdateRequest {
  name?: string | null;
  category?: string | null;
  severity?: ApiGuardrailSeverity | null;
  description?: string | null;
  is_active?: boolean | null;
  threshold_value?: number | null;
}
