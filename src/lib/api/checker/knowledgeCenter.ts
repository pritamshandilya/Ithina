import {
  KNOWLEDGE_SHELF_TYPES,
  mockRules,
  nextRuleId,
  nextVersionId,
} from "./knowledgeCenter.mock";
import { axiosClient } from "@/lib/api/axiosClient";
import { AuthSessionService } from "@/lib/auth/session";
import type {
  DocumentTypePayload,
  UploadDocumentPayload,
} from "@/models/request/knowledgeCenter";
import type { DocumentApiResponse } from "@/models/response/knowledgeCenter";
import { fetchAggregatedComplianceRulesFromRuleSets } from "@/lib/api/maker/complianceRuleSets";
import store from "@/store";
import { selectSelectedStore } from "@/store/selectors";
import type {
  ComplianceRule,
  CreateRuleInput,
  ReferenceDocument,
  RuleFilters,
  RuleStatus,
  RuleValidationResult,
  RuleVersion,
  RuleVersionStatus,
  UpdateRuleInput,
} from "@/types/checker";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const documentLinksById = new Map<string, string[]>();

function mapDocumentResponseToReferenceDocument(
  document: DocumentApiResponse,
): ReferenceDocument {
  const linkedRuleIds = documentLinksById.get(document.id) ?? [];
  return {
    id: document.id,
    name: document.name || "Untitled document",
    uploadedDate: new Date(document.uploaded_at ?? document.created_at),
    uploadedBy: document.uploaded_by ?? "Unknown",
    linkedRuleIds: [...linkedRuleIds],
    processingStatus: document.processing_status,
  };
}

async function uploadReferenceDocumentMultipart(
  payload: UploadDocumentPayload,
): Promise<DocumentApiResponse> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("document_type", payload.document_type);
  const response = await axiosClient.post<DocumentApiResponse>(
    "/documents",
    formData,
  );
  return response.data;
}

function getSelectedStoreIdFromState(): string | null {
  try {
    return selectSelectedStore(store.getState())?.id ?? null;
  } catch {
    return null;
  }
}

/** Knowledge Center is shared by checker + admin (store context); same data as compliance rule sets API. */
function ensureKnowledgeCenterAccess() {
  const user = AuthSessionService.getCurrentUser();
  if (!user || (user.role !== "checker" && user.role !== "admin")) {
    throw new Error("Unauthorized: Knowledge Center access denied");
  }
}

function ensureCheckerAccess() {
  ensureKnowledgeCenterAccess();
}

function ruleStatusToVersionStatus(
  status: ComplianceRule["status"],
): RuleVersionStatus {
  if (status === "Retired") return "Retired";
  if (status === "Active") return "Active";
  return "Draft";
}

/** One row per API rule so Rule Versions matches live rule-set data (no separate version history API yet). */
function withSyntheticVersions(rule: ComplianceRule): ComplianceRule {
  const vStatus = ruleStatusToVersionStatus(rule.status);
  const version: RuleVersion = {
    id: `${rule.ruleId}-v1`,
    ruleId: rule.ruleId,
    version: 1,
    status: vStatus,
    shelfType: rule.shelfType,
    expectedValue: rule.expectedValue,
    tolerance: rule.tolerance,
    severity: rule.severity,
    createdDate: rule.lastUpdated,
    createdBy: rule.createdBy,
    changeSummary:
      rule.description ||
      (rule.ruleSetName ? `From set: ${rule.ruleSetName}` : undefined),
    ...(rule.status === "Active" ? { effectiveDate: rule.lastUpdated } : {}),
  };
  return { ...rule, versions: [version], currentVersion: 1 };
}

async function tryLoadComplianceRulesFromApi(
  filters?: RuleFilters,
): Promise<ComplianceRule[] | null> {
  if (!getSelectedStoreIdFromState()) return null;
  try {
    const aggregated = await fetchAggregatedComplianceRulesFromRuleSets();
    let rules = aggregated.map(withSyntheticVersions);
    if (filters?.shelfType)
      rules = rules.filter((rule) => rule.shelfType === filters.shelfType);
    if (filters?.severity)
      rules = rules.filter((rule) => rule.severity === filters.severity);
    if (filters?.status)
      rules = rules.filter((rule) => rule.status === filters.status);
    return rules.sort(
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
    );
  } catch {
    return null;
  }
}

function getActiveVersion(rule: ComplianceRule): RuleVersion | undefined {
  return rule.versions.find((version) => version.status === "Active");
}

function getCurrentVersion(rule: ComplianceRule): RuleVersion | undefined {
  return rule.versions.find(
    (version) => version.version === rule.currentVersion,
  );
}

function toRuleStatus(versionStatus: RuleVersionStatus): RuleStatus {
  if (versionStatus === "Retired") return "Retired";
  if (versionStatus === "Active") return "Active";
  return "Draft";
}

function validateRuleValues(
  input: Pick<
    ComplianceRule,
    "ruleName" | "ruleType" | "shelfType" | "expectedValue" | "severity"
  > & {
    tolerance?: number;
    ruleId?: string;
  },
  allRules: ComplianceRule[] = mockRules,
): RuleValidationResult {
  const errors: string[] = [];

  if (!input.ruleName.trim()) errors.push("Rule name is required.");
  if (!input.expectedValue.trim()) errors.push("Expected value is required.");
  const shelfOk =
    KNOWLEDGE_SHELF_TYPES.includes(
      input.shelfType as (typeof KNOWLEDGE_SHELF_TYPES)[number],
    ) || input.shelfType === "General";
  if (!shelfOk) {
    errors.push("Selected shelf type is invalid.");
  }
  if (input.tolerance !== undefined && Number.isNaN(input.tolerance)) {
    errors.push("Tolerance must be a valid number.");
  }
  if (input.tolerance !== undefined && input.tolerance < 0) {
    errors.push("Tolerance cannot be negative.");
  }

  const newCategories = [
    "VISUAL",
    "SAFETY",
    "PROFITABILITY",
    "EFFICIENCY",
  ] as const;
  const isNewCategory = newCategories.includes(
    input.ruleType as (typeof newCategories)[number],
  );
  if (!isNewCategory) {
    const conflictingRule = allRules.find(
      (rule) =>
        rule.status === "Active" &&
        rule.ruleType === input.ruleType &&
        rule.shelfType === input.shelfType &&
        rule.ruleId !== input.ruleId,
    );
    if (conflictingRule) {
      errors.push(
        "An active rule with the same type and shelf type already exists.",
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function fetchComplianceRules(
  filters?: RuleFilters,
): Promise<ComplianceRule[]> {
  ensureKnowledgeCenterAccess();

  const fromApi = await tryLoadComplianceRulesFromApi(filters);
  if (fromApi) return fromApi;

  await delay(250);
  let rules = [...mockRules];

  if (filters?.shelfType)
    rules = rules.filter((rule) => rule.shelfType === filters.shelfType);
  if (filters?.severity)
    rules = rules.filter((rule) => rule.severity === filters.severity);
  if (filters?.status)
    rules = rules.filter((rule) => rule.status === filters.status);

  return rules.sort(
    (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
  );
}

/** @deprecated Prefer deriving versions from `fetchComplianceRules` via hooks (single request). */
export async function fetchRuleVersions(
  ruleId?: string,
): Promise<RuleVersion[]> {
  ensureKnowledgeCenterAccess();
  const rules = await fetchComplianceRules();
  const versions = rules.flatMap((rule) => rule.versions);
  const filtered = ruleId
    ? versions.filter((version) => version.ruleId === ruleId)
    : versions;
  return filtered.sort(
    (a, b) => b.createdDate.getTime() - a.createdDate.getTime(),
  );
}

export async function fetchReferenceDocuments(
  documentType: DocumentTypePayload = "COMPLIANCE_REFERENCE",
): Promise<ReferenceDocument[]> {
  ensureCheckerAccess();
  const { data: documents } = await axiosClient.get<DocumentApiResponse[]>(
    "/documents",
    {
      params: { document_type: documentType },
    },
  );
  const mapped = documents
    .map(mapDocumentResponseToReferenceDocument)
    .sort((a, b) => b.uploadedDate.getTime() - a.uploadedDate.getTime());
  return mapped;
}

export async function fetchReferenceDocumentById(
  documentId: string,
): Promise<ReferenceDocument> {
  ensureCheckerAccess();
  const { data: document } = await axiosClient.get<DocumentApiResponse>(
    `/documents/${documentId}`,
  );
  return mapDocumentResponseToReferenceDocument(document);
}

export async function validateRuleForActivation(
  ruleId: string,
): Promise<RuleValidationResult> {
  ensureKnowledgeCenterAccess();
  await delay(120);

  const rules = await fetchComplianceRules();
  const rule = rules.find((item) => item.ruleId === ruleId);
  if (!rule) return { valid: false, errors: ["Rule was not found."] };
  if (rule.status === "Retired")
    return { valid: false, errors: ["Retired rules cannot be activated."] };

  return validateRuleValues(
    {
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      shelfType: rule.shelfType,
      expectedValue: rule.expectedValue,
      tolerance: rule.tolerance,
      severity: rule.severity,
    },
    rules,
  );
}

export async function createComplianceRule(
  input: CreateRuleInput,
): Promise<ComplianceRule> {
  ensureKnowledgeCenterAccess();
  await delay(300);

  const baseValidation = validateRuleValues({
    ruleName: input.ruleName,
    ruleType: input.ruleType,
    shelfType: input.shelfType,
    expectedValue: input.expectedValue,
    tolerance: input.tolerance,
    severity: input.severity,
  });
  if (!baseValidation.valid) throw new Error(baseValidation.errors.join(" "));

  const createdDate = new Date();
  const ruleId = nextRuleId();
  const firstVersion: RuleVersion = {
    id: nextVersionId(),
    ruleId,
    version: 1,
    status: "Draft",
    shelfType: input.shelfType,
    expectedValue: input.expectedValue,
    tolerance: input.tolerance,
    severity: input.severity,
    createdDate,
    createdBy: input.createdBy,
    changeSummary: "Initial draft",
  };

  const rule: ComplianceRule = {
    ruleId,
    ruleName: input.ruleName.trim(),
    ruleType: input.ruleType,
    shelfType: input.shelfType,
    expectedValue: input.expectedValue.trim(),
    tolerance: input.tolerance,
    severity: input.severity,
    status: "Draft",
    currentVersion: 1,
    createdBy: input.createdBy,
    createdDate,
    lastUpdated: createdDate,
    versions: [firstVersion],
    linkedDocumentIds: [],
    description: input.description?.trim(),
    ruleSetId: input.ruleSetId,
    ruleSetName: input.ruleSetName,
    enabled: input.enabled ?? true,
  };

  mockRules.unshift(rule);
  return rule;
}

export async function updateComplianceRule(
  ruleId: string,
  input: UpdateRuleInput,
): Promise<ComplianceRule> {
  ensureKnowledgeCenterAccess();
  await delay(350);

  const index = mockRules.findIndex((rule) => rule.ruleId === ruleId);
  if (index < 0) throw new Error("Rule was not found.");

  const current = mockRules[index];
  if (current.status === "Retired")
    throw new Error("Retired rules cannot be edited.");

  const validation = validateRuleValues({
    ruleId,
    ruleName: input.ruleName,
    ruleType: input.ruleType,
    shelfType: input.shelfType,
    expectedValue: input.expectedValue,
    tolerance: input.tolerance,
    severity: input.severity,
  });
  if (!validation.valid) throw new Error(validation.errors.join(" "));

  const nextVersionNumber = current.currentVersion + 1;
  const updatedVersion: RuleVersion = {
    id: nextVersionId(),
    ruleId,
    version: nextVersionNumber,
    status: "Draft",
    shelfType: input.shelfType,
    expectedValue: input.expectedValue,
    tolerance: input.tolerance,
    severity: input.severity,
    createdDate: new Date(),
    createdBy: input.updatedBy,
    changeSummary: input.changeSummary?.trim() || "Rule updated",
  };

  const updatedVersions = current.versions.map((version) => {
    if (version.status === "Active") {
      return { ...version, status: "Archived" as RuleVersionStatus };
    }
    return version;
  });
  updatedVersions.push(updatedVersion);

  const nextRule: ComplianceRule = {
    ...current,
    ruleName: input.ruleName.trim(),
    ruleType: input.ruleType,
    shelfType: input.shelfType,
    expectedValue: input.expectedValue.trim(),
    tolerance: input.tolerance,
    severity: input.severity,
    currentVersion: nextVersionNumber,
    status: toRuleStatus(updatedVersion.status),
    lastUpdated: new Date(),
    versions: updatedVersions,
  };

  mockRules[index] = nextRule;
  return nextRule;
}

export async function activateComplianceRule(
  ruleId: string,
): Promise<ComplianceRule> {
  ensureKnowledgeCenterAccess();
  await delay(250);

  const index = mockRules.findIndex((rule) => rule.ruleId === ruleId);
  if (index < 0) throw new Error("Rule was not found.");

  const validation = await validateRuleForActivation(ruleId);
  if (!validation.valid) throw new Error(validation.errors.join(" "));

  const rule = mockRules[index];
  const nowDate = new Date();
  const currentVersion = getCurrentVersion(rule);
  if (!currentVersion) throw new Error("Current version was not found.");

  const updatedVersions = rule.versions.map((version) => {
    if (version.id === currentVersion.id) {
      return {
        ...version,
        status: "Active" as RuleVersionStatus,
        effectiveDate: nowDate,
      };
    }
    if (version.status === "Active") {
      return { ...version, status: "Archived" as RuleVersionStatus };
    }
    return version;
  });

  const nextRule: ComplianceRule = {
    ...rule,
    status: "Active",
    lastUpdated: nowDate,
    versions: updatedVersions,
  };
  mockRules[index] = nextRule;
  return nextRule;
}

export async function retireComplianceRule(
  ruleId: string,
): Promise<ComplianceRule> {
  ensureKnowledgeCenterAccess();
  await delay(220);

  const index = mockRules.findIndex((rule) => rule.ruleId === ruleId);
  if (index < 0) throw new Error("Rule was not found.");

  const rule = mockRules[index];
  const nowDate = new Date();
  const activeVersion = getActiveVersion(rule);

  const updatedVersions = rule.versions.map((version) => {
    if (activeVersion && version.id === activeVersion.id) {
      return { ...version, status: "Retired" as RuleVersionStatus };
    }
    return version;
  });

  const nextRule: ComplianceRule = {
    ...rule,
    status: "Retired",
    lastUpdated: nowDate,
    versions: updatedVersions,
  };
  mockRules[index] = nextRule;
  return nextRule;
}

export async function cloneRetiredRule(
  ruleId: string,
  createdBy: string,
): Promise<ComplianceRule> {
  ensureKnowledgeCenterAccess();
  await delay(280);

  const sourceRule = mockRules.find((rule) => rule.ruleId === ruleId);
  if (!sourceRule) throw new Error("Rule was not found.");
  if (sourceRule.status !== "Retired")
    throw new Error("Only retired rules can be cloned.");

  return createComplianceRule({
    ruleName: `${sourceRule.ruleName} (Clone)`,
    ruleType: sourceRule.ruleType,
    shelfType: sourceRule.shelfType,
    expectedValue: sourceRule.expectedValue,
    tolerance: sourceRule.tolerance,
    severity: sourceRule.severity,
    createdBy,
  });
}

export async function uploadReferenceDocument(input: {
  file: File;
  documentType?: DocumentTypePayload;
}): Promise<ReferenceDocument> {
  ensureCheckerAccess();
  const loweredName = input.file.name.toLowerCase();
  if (!loweredName.endsWith(".pdf")) {
    throw new Error("Only PDF documents are supported in Phase 1.");
  }
  const document = await uploadReferenceDocumentMultipart({
    file: input.file,
    document_type: input.documentType ?? "COMPLIANCE_REFERENCE",
  });
  return mapDocumentResponseToReferenceDocument(document);
}

export async function generateRulesFromReferenceDocument(
  documentId: string,
): Promise<void> {
  ensureCheckerAccess();
  await axiosClient.post(`/documents/${documentId}/generate-rules`);
}

export async function deleteReferenceDocument(
  documentId: string,
): Promise<void> {
  ensureCheckerAccess();
  await axiosClient.delete(`/documents/${documentId}`);
  documentLinksById.delete(documentId);
}

export async function updateReferenceDocumentLinks(
  documentId: string,
  linkedRuleIds: string[],
): Promise<ReferenceDocument> {
  ensureKnowledgeCenterAccess();
  await delay(100);
  const document = await fetchReferenceDocumentById(documentId);
  const prevRuleIds = new Set(documentLinksById.get(documentId) ?? []);
  const nextRuleIds = new Set(linkedRuleIds);
  documentLinksById.set(documentId, [...linkedRuleIds]);

  prevRuleIds.forEach((ruleId) => {
    if (!nextRuleIds.has(ruleId)) {
      const rule = mockRules.find((r) => r.ruleId === ruleId);
      if (rule) {
        rule.linkedDocumentIds = rule.linkedDocumentIds.filter(
          (id) => id !== documentId,
        );
        rule.lastUpdated = new Date();
      }
    }
  });
  nextRuleIds.forEach((ruleId) => {
    if (!prevRuleIds.has(ruleId)) {
      const rule = mockRules.find((r) => r.ruleId === ruleId);
      if (rule && !rule.linkedDocumentIds.includes(documentId)) {
        rule.linkedDocumentIds.push(documentId);
        rule.lastUpdated = new Date();
      }
    }
  });

  return {
    ...document,
    linkedRuleIds: [...linkedRuleIds],
  };
}
