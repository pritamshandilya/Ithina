import type {
  AdminTabDefinition,
  BrandToneConfig,
  ComplianceRule,
  GlobalDisplayRules,
  HwPalette,
  LcdRule,
  NewRuleForm,
} from "@/types/admin";

export const MOCK_HW_PALETTES: HwPalette[] = [
  { name: "Pure Black", hex: "#000000", active: true },
  { name: "Pure White", hex: "#FFFFFF", active: true },
  { name: "Chroma Red", hex: "#FF0000", active: true, highlight: true },
  { name: "Chroma Yellow", hex: "#FFFF00", active: false },
];

export const MOCK_LCD_RULES: LcdRule[] = [
  { label: "No People Consuming", key: "no_people_consuming", enabled: true },
  { label: "No Lifestyle Imagery", key: "no_lifestyle", enabled: true },
  { label: "No Text Generation", key: "no_text_in_bg (Strict)", enabled: true, locked: true },
];

export const MOCK_COMPLIANCE_RULES: ComplianceRule[] = [
  { category: "Tobacco", badge: false, priceDisplay: "FULL (Text Only)", colorRestrict: "B&W Only", special: "FDA: No promo imagery", disclaimer: "" },
  { category: "Alcohol", badge: true, priceDisplay: "FULL", colorRestrict: "State-specific", special: "", disclaimer: "Must be 21+" },
  { category: "Pharmacy", badge: false, priceDisplay: "FULL (OTC)", colorRestrict: "None", special: "DEA items: No marketing", disclaimer: "" },
];

export const MOCK_BRAND_TONE: BrandToneConfig = {
  tonePrompt: "Premium, urgent but not aggressive. Use short, punchy copy suitable for small e-ink displays. Do not use exclamation marks.",
  forbiddenTerms: "Cheap, Bargain, Blowout, Trash",
};

export const MOCK_GLOBAL_RULES: GlobalDisplayRules = {
  minMarginFloor: 15,
  minFontSize: 12,
  discountVisible: true,
};

export const MOCK_ADMIN_TABS: AdminTabDefinition[] = [
  { id: "assets", label: "Brand & Assets", iconName: "Image" },
  { id: "ai", label: "AI Calibration", iconName: "Zap" },
  { id: "compliance", label: "Compliance Rules", iconName: "CheckCircle" },
];

export const MOCK_EMPTY_RULE: NewRuleForm = {
  category: "",
  badge: true,
  priceDisplay: "FULL",
  colorRestrict: "None",
  special: "",
  disclaimer: "",
};
