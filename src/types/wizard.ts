export interface WizardStore {
  id: string;
  name: string;
  short: string;
  address: string;
  displays: number;
  activePromos: number;
}

export type MarginRisk = "Safe" | "Moderate" | "Strict";

export interface WizardMargin {
  value: string;
  risk: MarginRisk;
  desc: string;
  impact: string;
}

export interface WizardDuration {
  id: string;
  label: string;
  short: string;
  desc: string;
}

export interface WizardConstraints {
  store: string;
  marginFloor: string;
  duration: string;
}

export interface StagedSku {
  sku: string;
  name: string;
  current: number;
  proposed: number;
  safe: boolean;
  margin?: string;
  /** Base cost used for margin safety re-calculation when discount changes. */
  baseCost?: number;
  /** Discount percentage (0–100). Derived from current/proposed or set manually by user. */
  discount: number;
  /** When false, SKU stays in the grid but is excluded from counts and submission. Default: included. */
  included?: boolean;
  eslId?: string;
  rankingScore?: number;
  /** Per-SKU label from the promo assistant, e.g. "Oct 15 – Oct 20 (Soon)". */
  agentSuggestSchedule?: string;
  /** Draft API: e.g. bundle, bogof. */
  offerType?: string;
  /** Draft API: e.g. "Bundle Primary", "FREE ITEM (Bundle Reward)". */
  offerLabel?: string;
  /** On-hand stock from draft API. */
  stockQty?: number;
  /** True when this SKU is the free / reward line in a bundle or BOGO. */
  isFree?: boolean;
}

export type ChatRole = "user" | "ai";

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export type HardwareDeviceId = "chroma29" | "chroma42" | "lcd";

export interface HardwareDevice {
  id: HardwareDeviceId;
  name: string;
  resolution: string;
  track: string;
  aspectRatio: string;
}
