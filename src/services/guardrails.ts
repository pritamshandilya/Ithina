/**
 * Guardrails service.
 *
 * Talks to the real FastAPI backend:
 *   GET    /api/v1/guardrails              – list (any authenticated user)
 *   POST   /api/v1/guardrails              – create (admin only)
 *   PUT    /api/v1/guardrails/{id}         – update (admin only)
 *   DELETE /api/v1/guardrails/{id}         – delete (admin only)
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
  ApiGuardrailUpdateRequest,
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

export async function updateGuardrail(
  id: string,
  patch: Partial<CreateGuardrailPayload>,
): Promise<GuardRailRule> {
  const body: ApiGuardrailUpdateRequest = {
    name: patch.name ?? null,
    category: patch.category ?? null,
    severity: patch.severity != null ? mapSeverityToApi(patch.severity) : null,
    description: patch.description ?? null,
    is_active: patch.active ?? null,
    threshold_value: patch.thresholdValue ?? null,
  };
  const { data } = await promoApiClient.put<ApiGuardrailResponse>(
    `${API_PREFIX}/guardrails/${id}`,
    body,
  );
  return adaptApiGuardrail(data);
}

export async function deleteGuardrail(id: string): Promise<void> {
  await promoApiClient.delete(`${API_PREFIX}/guardrails/${id}`);
}
