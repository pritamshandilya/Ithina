export type AdminTab = "assets" | "ai" | "compliance";

export interface HwPalette {
  name: string;
  hex: string;
  active: boolean;
  highlight?: boolean;
}

export interface LcdRule {
  label: string;
  key: string;
  enabled: boolean;
  locked?: boolean;
}

export interface ComplianceRule {
  category: string;
  badge: boolean;
  priceDisplay: string;
  colorRestrict: string;
  special: string;
  disclaimer: string;
}

export interface NewRuleForm {
  category: string;
  badge: boolean;
  priceDisplay: string;
  colorRestrict: string;
  special: string;
  disclaimer: string;
}

export interface BrandToneConfig {
  tonePrompt: string;
  forbiddenTerms: string;
}

export interface GlobalDisplayRules {
  minMarginFloor: number;
  minFontSize: number;
  discountVisible: boolean;
}
