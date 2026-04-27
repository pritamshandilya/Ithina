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
  esl_id?: string | null;
  ESL_ID?: string | null;
  score?: number | null;
  /** Promo mechanics from NL draft (bundle primary, free reward, etc.). */
  offer_type?: string | null;
  offer_label?: string | null;
  /** Some gateways serialize snake_case keys as camelCase. */
  offerType?: string | null;
  offerLabel?: string | null;
  stock_qty?: number | null;
  stockQty?: number | null;
  is_free?: boolean | null;
  isFree?: boolean | null;
  /** Human-readable schedule suggestion for this SKU (shown in the staging grid). */
  agent_suggest_schedule?: string | null;
  suggested_schedule_label?: string | null;
  schedule_hint?: string | null;
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

/** Nested campaign hints from LangGraph draft (preferred by some backends). */
export interface ApiCampaignDraftMeta {
  campaign_name?: string | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  schedule_notes?: string | null;
}

export interface ApiCampaignDraftResponse {
  status: "draft_staged";
  session_id: string;
  message: string;
  suggestions?: string[];
  skus: ApiCampaignSKU[];
  campaign_theme_name?: string | null;
  recommended_campaign_name?: string | null;
  recommended_schedule_start?: string | null;
  recommended_schedule_end?: string | null;
  suggested_schedule_start?: string | null;
  suggested_schedule_end?: string | null;
  campaign_meta?: ApiCampaignDraftMeta | null;
}

// ─── Generate / save (Phase 2) ───────────────────────────────────────────────
export interface ApiCampaignGenerateRequest {
  session_id: string;
  name?: string | null;
  hardware_targets: string[];
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  scheduled_time?: string | null;
}

// ─── Submit for approval (Maker sends selected variant) ─────────────────────
export interface ApiCampaignSubmitRequest {
  selected_variant_id: string;
  schedule_type?: string;
  /** Shown in review step; sent so the server saves the final title (not in DB until submit). */
  name?: string | null;
}

// ─── Approve (Checker confirms variant + triggers batch render) ─────────────
export interface ApiCampaignApproveRequest {
  selected_variant_id: string;
  schedule_type?: string;
}

// ─── ESL layout elements (drawing commands from payload_snapshot) ─────────────
export interface EslRectElement {
  type: "rect";
  x: number;
  y: number;
  x2: number;
  y2: number;
  color: string;
  rounded?: boolean;
}

export interface EslTextElement {
  type: "text";
  x: number;
  y: number;
  content: string;
  font_size: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
  color: string;
  strike?: boolean;
}

export type EslLayoutElement = EslRectElement | EslTextElement;

// ─── Layout variant from pipeline events ────────────────────────────────────
export interface LayoutVariant {
  variant_id: string;
  hardware_type: string;
  image_url?: string;
  elements?: EslLayoutElement[];
  background_candidates?: string[];
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
