import {
  MOCK_BUILTIN_TEMPLATES,
  MOCK_TEMPLATE_HW_FILTERS,
  MOCK_TEMPLATE_TAGS,
  MOCK_TEMPLATES,
} from "@/mocks/templates";
import { apiDelay } from "@/lib/api-delay";
import type { BuiltinTemplate, HwFilterOption, TemplateItem } from "@/types/templates";

// TODO (backend): replace with axios.get("/api/templates")
export async function getTemplates(): Promise<TemplateItem[]> {
  await apiDelay(400);
  return MOCK_TEMPLATES;
}

// TODO (backend): replace with axios.get("/api/templates/builtin")
export async function getBuiltinTemplates(): Promise<BuiltinTemplate[]> {
  await apiDelay(300);
  return MOCK_BUILTIN_TEMPLATES;
}

// TODO (backend): replace with axios.get("/api/templates/hw-filters")
export async function getTemplateHwFilters(): Promise<HwFilterOption[]> {
  await apiDelay(200);
  return MOCK_TEMPLATE_HW_FILTERS;
}

// TODO (backend): replace with axios.get("/api/templates/tags")
export async function getTemplateTags(): Promise<string[]> {
  await apiDelay(200);
  return MOCK_TEMPLATE_TAGS;
}
