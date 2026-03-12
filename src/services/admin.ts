import {
  MOCK_ADMIN_TABS,
  MOCK_BRAND_TONE,
  MOCK_COMPLIANCE_RULES,
  MOCK_EMPTY_RULE,
  MOCK_GLOBAL_RULES,
  MOCK_HW_PALETTES,
  MOCK_LCD_RULES,
} from "@/mocks/admin";
import { apiDelay } from "@/lib/api-delay";
import type {
  AdminTabDefinition,
  BrandToneConfig,
  ComplianceRule,
  GlobalDisplayRules,
  HwPalette,
  LcdRule,
  NewRuleForm,
} from "@/types/admin";

// TODO (backend): replace with axios.get("/api/admin/hw-palettes")
export async function getHwPalettes(): Promise<HwPalette[]> {
  await apiDelay(300);
  return MOCK_HW_PALETTES;
}

// TODO (backend): replace with axios.get("/api/admin/lcd-rules")
export async function getLcdRules(): Promise<LcdRule[]> {
  await apiDelay(300);
  return MOCK_LCD_RULES;
}

// TODO (backend): replace with axios.get("/api/admin/compliance-rules")
export async function getComplianceRules(): Promise<ComplianceRule[]> {
  await apiDelay(300);
  return MOCK_COMPLIANCE_RULES;
}

// TODO (backend): replace with axios.get("/api/admin/brand-tone")
export async function getBrandTone(): Promise<BrandToneConfig> {
  await apiDelay(300);
  return MOCK_BRAND_TONE;
}

// TODO (backend): replace with axios.get("/api/admin/global-rules")
export async function getGlobalDisplayRules(): Promise<GlobalDisplayRules> {
  await apiDelay(300);
  return MOCK_GLOBAL_RULES;
}

// TODO (backend): replace with axios.post("/api/admin/compliance-rules")
export async function addComplianceRule(form: NewRuleForm): Promise<ComplianceRule> {
  await apiDelay(500);
  return { ...form, id: `rule-${Date.now()}` };
}

// TODO (backend): replace with axios.post("/api/admin/save-profile")
export async function saveProfileJson(): Promise<void> {
  await apiDelay(1200);
}

// TODO (backend): replace with axios.get("/api/admin/tabs")
export async function getAdminTabs(): Promise<AdminTabDefinition[]> {
  await apiDelay(200);
  return MOCK_ADMIN_TABS;
}

// TODO (backend): replace with axios.get("/api/admin/empty-rule-template")
export async function getEmptyRuleTemplate(): Promise<NewRuleForm> {
  await apiDelay(100);
  return MOCK_EMPTY_RULE;
}
