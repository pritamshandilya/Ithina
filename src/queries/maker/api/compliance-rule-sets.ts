import { apiClient } from "@/queries/shared";
import type { ComplianceRule } from "@/types/checker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { ComplianceRuleCategory, ComplianceRuleSetStatus } from "./types";

export const COMPLIANCE_RULE_SET_NAME_MAX_LENGTH = 120;

export type {
  ComplianceRuleCategory,
  ComplianceRuleSetStatus,
} from "./types";

export type CreateComplianceRuleSetInput = {
  name: string;
  status: ComplianceRuleSetStatus;
  reference_document_id?: string | null;
  rules: Array<{
    name: string;
    description: string;
    category: ComplianceRuleCategory;
    threshold: number;
    is_active: boolean;
  }>;
};

export type UpdateComplianceRuleSetInput = Partial<Omit<CreateComplianceRuleSetInput, "rules">> & {
  rules?: CreateComplianceRuleSetInput["rules"];
};

type ComplianceRuleRequestResponse = {
  id: string;
  sort_order: number;
  name: string;
  description: string;
  category: ComplianceRuleCategory;
  threshold: number;
  is_active: boolean;
};

type ComplianceRuleSetRequestResponse = {
  id: string;
  store_id: string;
  name: string;
  status: ComplianceRuleSetStatus;
  reference_document_id: string | null;
  is_default: boolean;
  rules: ComplianceRuleRequestResponse[];
  created_at: string;
  updated_at: string;
};

export function formatDefaultOnboardingComplianceRuleSetName(storeName: string): string {
  const trimmed = storeName.trim();
  const base = trimmed ? `${trimmed} Default Rules` : "Default Rules";
  return base.slice(0, COMPLIANCE_RULE_SET_NAME_MAX_LENGTH);
}

function mapRuleSetToSummary(
  ruleSet: ComplianceRuleSetRequestResponse,
): ComplianceRuleSetSummary {
  const rulesCount = ruleSet.rules.length;
  const enabledCount = ruleSet.rules.filter((r) => r.is_active).length;
  return {
    id: ruleSet.id,
    name: ruleSet.name,
    rulesCount,
    enabledCount,
    isDefault: ruleSet.is_default,
  };
}

function toRuleStatusFrom(ruleSetStatus: ComplianceRuleSetStatus, isActive: boolean): ComplianceRule["status"] {
  if (ruleSetStatus === "RETIRED") return "Retired";
  if (ruleSetStatus === "ACTIVE" && isActive) return "Active";
  if (isActive) return "Draft";
  return "Draft";
}

function mapRuleSetRuleToComplianceRule(
  ruleSet: ComplianceRuleSetRequestResponse,
  rule: ComplianceRuleRequestResponse,
): ComplianceRule {
  const createdDate = new Date(ruleSet.created_at);
  const lastUpdated = new Date(ruleSet.updated_at);

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    ruleType: rule.category,
    shelfType: "General",
    expectedValue: String(rule.threshold),
    tolerance: undefined,
    severity: "Low",
    status: toRuleStatusFrom(ruleSet.status, rule.is_active),
    currentVersion: 1,
    createdBy: "system",
    createdDate,
    lastUpdated,
    versions: [],
    linkedDocumentIds: [],
    description: rule.description,
    ruleSetId: ruleSet.id,
    ruleSetName: ruleSet.name,
    enabled: rule.is_active,
  };
}

/**
 * Lists rule sets for the scoped store. `isDefault` comes from the API (`is_default`),
 * comparing each set id to the store's `default_compliance_rule_set_id`.
 */
export async function fetchComplianceRuleSetsForAnalysis(): Promise<ComplianceRuleSetSummary[]> {
  const sets = await apiClient.get<ComplianceRuleSetRequestResponse[]>("/compliance-rule-sets");
  return sets.map(mapRuleSetToSummary).sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * All rules from every compliance rule set for the scoped store (one GET).
 * Used by Knowledge Center so checkers see the same live rules as admin rule-set management.
 */
export async function fetchAggregatedComplianceRulesFromRuleSets(): Promise<ComplianceRule[]> {
  const sets = await apiClient.get<ComplianceRuleSetRequestResponse[]>("/compliance-rule-sets");
  const out: ComplianceRule[] = [];
  for (const ruleSet of sets) {
    const sorted = ruleSet.rules.slice().sort((a, b) => a.sort_order - b.sort_order);
    for (const r of sorted) {
      out.push(mapRuleSetRuleToComplianceRule(ruleSet, r));
    }
  }
  return out;
}

export async function fetchRulesByRuleSetId(ruleSetId: string): Promise<ComplianceRule[]> {
  const ruleSet = await apiClient.get<ComplianceRuleSetRequestResponse>(
    `/compliance-rule-sets/${ruleSetId}`,
  );
  return ruleSet.rules
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => mapRuleSetRuleToComplianceRule(ruleSet, r));
}

export async function fetchComplianceRuleSetById(
  ruleSetId: string,
): Promise<ComplianceRuleSetRequestResponse> {
  return apiClient.get<ComplianceRuleSetRequestResponse>(
    `/compliance-rule-sets/${ruleSetId}`,
  );
}

export async function createComplianceRuleSet(
  payload: CreateComplianceRuleSetInput,
): Promise<ComplianceRuleSetRequestResponse> {
  return apiClient.post<ComplianceRuleSetRequestResponse>(
    "/compliance-rule-sets",
    {
      name: payload.name,
      status: payload.status,
      reference_document_id: payload.reference_document_id ?? null,
      rules: payload.rules.map((r) => ({
        name: r.name,
        description: r.description,
        category: r.category,
        threshold: r.threshold,
        is_active: r.is_active,
      })),
    },
  );
}

export async function createComplianceRuleSetForStore(
  storeId: string,
  payload: CreateComplianceRuleSetInput,
): Promise<ComplianceRuleSetRequestResponse> {
  return apiClient.post<ComplianceRuleSetRequestResponse>(
    "/compliance-rule-sets",
    {
      name: payload.name,
      status: payload.status,
      reference_document_id: payload.reference_document_id ?? null,
      rules: payload.rules.map((r) => ({
        name: r.name,
        description: r.description,
        category: r.category,
        threshold: r.threshold,
        is_active: r.is_active,
      })),
    },
    { headers: { "X-Store-Id": storeId } },
  );
}

export async function updateComplianceRuleSet(
  ruleSetId: string,
  payload: UpdateComplianceRuleSetInput,
): Promise<ComplianceRuleSetRequestResponse> {
  return apiClient.put<ComplianceRuleSetRequestResponse>(
    `/compliance-rule-sets/${ruleSetId}`,
    {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.reference_document_id !== undefined
        ? { reference_document_id: payload.reference_document_id ?? null }
        : {}),
      ...(payload.rules ? { rules: payload.rules } : {}),
    },
  );
}

export async function deleteComplianceRuleSet(
  ruleSetId: string,
): Promise<void> {
  return apiClient.delete<void>(`/compliance-rule-sets/${ruleSetId}`);
}

