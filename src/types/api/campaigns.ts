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
  approver_id: string | null;
  name: string;
  ai_prompt: string | null;
  status: ApiCampaignStatus;
  source_type: string;
  hardware_targets: string[] | null;
  guardrails_status: ApiGuardrailsStatus;
  scheduled_start: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  skus: ApiCampaignSKU[];
}

// ─── Draft (Phase 1) ─────────────────────────────────────────────────────────
export interface ApiCampaignDraftRequest {
  prompt: string;
  source_type?: "nl" | "manual";
}

export interface ApiCampaignDraftResponse {
  status: "draft_staged";
  message: string;
  skus: ApiCampaignSKU[];
}

// ─── Generate / save (Phase 2) ───────────────────────────────────────────────
export interface ApiCampaignGenerateRequest {
  name: string;
  hardware_targets: string[];
  scheduled_start?: string | null;
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
