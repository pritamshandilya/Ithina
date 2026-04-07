/**
 * Guardrails service.
 *
 * Talks to the real FastAPI backend:
 *   GET  /api/v1/guardrails          – list (any authenticated user)
 *   POST /api/v1/guardrails          – create (admin only)
 *
 * NOTE: The backend does not yet expose PATCH / DELETE endpoints for
 * guardrails. Those operations are currently no-ops that throw a
 * "not_implemented" error. The Admin UI should disable or hide those
 * actions until the backend is ready.
 *
 * Severity mapping:
 *   Backend  → Frontend
 *   "hard"   → "Hard"
 *   "soft"   → "Soft"
 */

import { promoApiClient } from "@/lib/promo-api-client";
import type {
  ApiGuardrailCreateRequest,
  ApiGuardrailResponse,
} from "@/types/api/guardrails";
import type { GuardRailCategory, GuardRailRule, GuardRailSeverity } from "@/mocks/guard-rails";

const API_PREFIX = "/api/v1";

// ─── Adapters ────────────────────────────────────────────────────────────────

function mapSeverityToUi(apiSeverity: string): GuardRailSeverity {
  return apiSeverity === "hard" ? "Hard" : "Soft";
}

function mapSeverityToApi(uiSeverity: GuardRailSeverity): "hard" | "soft" {
  return uiSeverity === "Hard" ? "hard" : "soft";
}

function adaptApiGuardrail(api: ApiGuardrailResponse): GuardRailRule {
  return {
    id: api.id,
    name: api.name,
    category: api.category as GuardRailCategory,
    severity: mapSeverityToUi(api.severity),
    description: api.description ?? "",
    active: api.is_active,
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function listGuardrails(): Promise<GuardRailRule[]> {
  const { data } = await promoApiClient.get<ApiGuardrailResponse[]>(
    `${API_PREFIX}/guardrails`,
  );
  return data.map(adaptApiGuardrail);
}

export interface CreateGuardrailPayload {
  name: string;
  category: GuardRailCategory;
  severity: GuardRailSeverity;
  description: string;
  active: boolean;
  thresholdValue?: number | null;
}

export async function createGuardrail(
  payload: CreateGuardrailPayload,
): Promise<GuardRailRule> {
  const body: ApiGuardrailCreateRequest = {
    name: payload.name,
    category: payload.category,
    severity: mapSeverityToApi(payload.severity),
    description: payload.description || null,
    is_active: payload.active,
    threshold_value: payload.thresholdValue ?? null,
  };
  const { data } = await promoApiClient.post<ApiGuardrailResponse>(
    `${API_PREFIX}/guardrails`,
    body,
  );
  return adaptApiGuardrail(data);
}

/**
 * Toggle / update guardrail — no backend endpoint yet.
 * TODO: replace with PATCH /guardrails/{id} once available.
 */
export async function updateGuardrail(
  _id: string,
  _patch: Partial<CreateGuardrailPayload>,
): Promise<GuardRailRule> {
  throw new Error("update_guardrail_not_implemented");
}

/**
 * Delete guardrail — no backend endpoint yet.
 * TODO: replace with DELETE /guardrails/{id} once available.
 */
export async function deleteGuardrail(_id: string): Promise<void> {
  throw new Error("delete_guardrail_not_implemented");
}
