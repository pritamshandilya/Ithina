import type { ChatMessage, HardwareDeviceId } from "./wizard";

export type StudioState = "choose" | "refine";
export type VariantId = "A" | "B" | "C";

export interface HwOption {
  id: HardwareDeviceId;
  label: string;
  sub: string;
}

export interface LayoutVariant {
  id: VariantId;
  name: string;
  recommended?: boolean;
}

export interface ComplianceCheck {
  label: string;
  passed: boolean;
  eslOnly?: boolean;
}

export interface RendererSpec {
  targetDisplay: string;
  payloadFormat: string;
  palette?: string[];
  resolution?: string;
  colorSpace?: string;
}

export interface AssetInfo {
  name: string;
  sku: string;
  source: string;
  status: string;
  emoji: string;
}

export interface RecentCampaign {
  id: string;
  name: string;
  skus: number;
  hw: string;
  status: string;
  statusCls: string;
}

export type { ChatMessage, HardwareDeviceId };
