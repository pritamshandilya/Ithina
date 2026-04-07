/**
 * TypeScript mirrors of the FastAPI Pydantic DTOs for campaigns.
 * Keep in sync with: dd_promo_api_v1/app/io/request/campaigns.py
 *                    dd_promo_api_v1/app/io/response/campaigns.py
 */

// ─── Backend status enum ────────────────────────────────────────────────────
export type ApiCampaignStatus =
  | "draft"
  | "generating"
  | "pending_approval"
  | "approved"
  | "scheduled"
  | "publishing"
  | "active"
  | "rejected";

// ─── Guardrails result ───────────────────────────────────────────────────────
export type ApiGuardrailsStatus = "pass" | "warn" | "fail";

// ─── SKU inside a campaign ───────────────────────────────────────────────────
export interface ApiCampaignSKU {
  id: string;
  sku: string;
  product_name: string;
  name?: string;
  current_price: number;
  proposed_price: number;
  base_cost: number;
  margin_pct: number;
  is_safe: boolean;
  violation_reason: string | null;
}

// ─── Full campaign response ──────────────────────────────────────────────────
export interface ApiCampaignResponse {
  id: string;
  store_id: string;
  initiator_id: string;
  initiator_name: string;
  approver_id: string | null;
  approver_name: string | null;
  name: string;
  ai_prompt: string | null;
  status: ApiCampaignStatus;
  source_type: string;
  hardware_targets: string[] | null;
  guardrails_status: ApiGuardrailsStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  scheduled_time: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  skus: ApiCampaignSKU[];
}

// ─── Draft (Phase 1) ─────────────────────────────────────────────────────────
export interface ApiCampaignDraftRequest {
  prompt: string;
  source_type?: "nl" | "manual";
  session_id?: string | null;
}

export interface ApiCampaignDraftResponse {
  status: "draft_staged";
  session_id: string;
  message: string;
  skus: ApiCampaignSKU[];
}

// ─── Generate / save (Phase 2) ───────────────────────────────────────────────
export interface ApiCampaignGenerateRequest {
  session_id: string;
  name: string;
  hardware_targets: string[];
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  scheduled_time?: string | null;
}

// ─── Campaign Init (creates DB row + LangGraph thread) ──────────────────────
export interface ApiCampaignInitRequest {
  source_type?: "nl" | "manual";
  hardware_targets?: string[];
}

export interface ApiCampaignInitResponse {
  campaign_id: string;
  langgraph_thread_id: string;
  status: string;
}

// ─── Campaign Chat (LangGraph conversational turn) ──────────────────────────
export interface ApiCampaignChatRequest {
  message: string;
}

export interface ApiCampaignChatSKU {
  sku: string;
  product_name: string;
  name?: string;
  current_price: number;
  proposed_price: number;
  base_cost: number;
  margin_pct: number;
  is_safe: boolean;
  violation_reason?: string | null;
}

export interface ApiCampaignChatResponse {
  reply: string;
  staged_skus: ApiCampaignChatSKU[];
}

// ─── Campaign Event (timeline / chat history) ────────────────────────────────
export interface ApiCampaignEventResponse {
  id: string;
  campaign_id: string;
  actor_type: string;
  user_id: string | null;
  event_type: string;
  message: string;
  variant_id: string | null;
  payload_snapshot: Record<string, unknown> | null;
  is_visible_to_user: boolean;
  created_at: string;
}

// ─── Campaign Chat Message (POST /campaigns/{id}/chat for studio) ────────────
export interface ApiCampaignChatMessageRequest {
  message: string;
  variant_id?: string | null;
}
