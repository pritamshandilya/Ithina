import {
  MOCK_BRAND_TONE,
  MOCK_COMPLIANCE_RULES,
  MOCK_GLOBAL_RULES,
  MOCK_HW_PALETTES,
  MOCK_LCD_RULES,
} from "@/mocks/admin";
import type {
  BrandToneConfig,
  ComplianceRule,
  GlobalDisplayRules,
  HwPalette,
  LcdRule,
  NewRuleForm,
} from "@/types/admin";

export async function getHwPalettes(): Promise<HwPalette[]> {
  return MOCK_HW_PALETTES;
}

export async function getLcdRules(): Promise<LcdRule[]> {
  return MOCK_LCD_RULES;
}

export async function getComplianceRules(): Promise<ComplianceRule[]> {
  return MOCK_COMPLIANCE_RULES;
}

export async function getBrandTone(): Promise<BrandToneConfig> {
  return MOCK_BRAND_TONE;
}

export async function getGlobalDisplayRules(): Promise<GlobalDisplayRules> {
  return MOCK_GLOBAL_RULES;
}

export async function addComplianceRule(form: NewRuleForm): Promise<ComplianceRule> {
  return { ...form };
}

export async function saveProfileJson(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
