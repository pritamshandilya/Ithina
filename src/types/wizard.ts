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
