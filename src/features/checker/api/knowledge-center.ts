import { SimulatedAuthService } from "@/lib/auth/simulated-auth";
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

export const KNOWLEDGE_SHELF_TYPES = [
  "Beverages",
  "Snacks",
  "Dairy",
  "Produce",
  "Frozen",
  "Household",
] as const;

const DEFAULT_USER = "checker@displaydata.com";

let ruleCounter = 4;
let versionCounter = 5;
let documentCounter = 2;

const now = new Date();

const mockRules: ComplianceRule[] = [
  {
    ruleId: "RULE-001",
    ruleName: "Minimum Beverage Facings",
    ruleType: "Facings",
    shelfType: "Beverages",
    expectedValue: ">= 3",
    tolerance: 1,
    severity: "High",
    status: "Active",
    currentVersion: 2,
    createdBy: DEFAULT_USER,
    createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
    lastUpdated: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
    linkedDocumentIds: ["DOC-001"],
    versions: [
      {
        id: "VER-001",
        ruleId: "RULE-001",
        version: 1,
        status: "Archived",
        shelfType: "Beverages",
        expectedValue: ">= 2",
        tolerance: 1,
        severity: "High",
        createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
        createdBy: DEFAULT_USER,
        changeSummary: "Initial definition",
      },
      {
        id: "VER-002",
        ruleId: "RULE-001",
        version: 2,
        status: "Active",
        shelfType: "Beverages",
        expectedValue: ">= 3",
        tolerance: 1,
        severity: "High",
        effectiveDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
        createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
        createdBy: DEFAULT_USER,
        changeSummary: "Increased threshold for compliance",
      },
    ],
  },
  {
    ruleId: "RULE-002",
    ruleName: "Dairy Label Visibility",
    ruleType: "Labeling",
    shelfType: "Dairy",
    expectedValue: "All labels front-facing",
    severity: "Medium",
    status: "Draft",
    currentVersion: 1,
    createdBy: DEFAULT_USER,
    createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
    lastUpdated: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
    linkedDocumentIds: ["DOC-001"],
    versions: [
      {
        id: "VER-003",
        ruleId: "RULE-002",
        version: 1,
        status: "Draft",
        shelfType: "Dairy",
        expectedValue: "All labels front-facing",
        severity: "Medium",
        createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
        createdBy: DEFAULT_USER,
      },
    ],
  },
  {
    ruleId: "RULE-003",
    ruleName: "Frozen Spacing Margin",
    ruleType: "Spacing",
    shelfType: "Frozen",
    expectedValue: ">= 2 cm",
    tolerance: 0.5,
    severity: "Low",
    status: "Retired",
    currentVersion: 2,
    createdBy: DEFAULT_USER,
    createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60),
    lastUpdated: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15),
    linkedDocumentIds: [],
    versions: [
      {
        id: "VER-004",
        ruleId: "RULE-003",
        version: 1,
        status: "Archived",
        shelfType: "Frozen",
        expectedValue: ">= 1.5 cm",
        tolerance: 0.5,
        severity: "Low",
        createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60),
        createdBy: DEFAULT_USER,
      },
      {
        id: "VER-005",
        ruleId: "RULE-003",
        version: 2,
        status: "Retired",
        shelfType: "Frozen",
        expectedValue: ">= 2 cm",
        tolerance: 0.5,
        severity: "Low",
        createdDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 40),
        createdBy: DEFAULT_USER,
      },
    ],
  },
];

const mockDocuments: ReferenceDocument[] = [
  {
    id: "DOC-001",
    name: "Q1 Store Compliance Policy.pdf",
    uploadedDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20),
    uploadedBy: DEFAULT_USER,
    linkedRuleIds: ["RULE-001", "RULE-002"],
  },
  {
    id: "DOC-002",
    name: "Frozen Zone Guidelines.pdf",
    uploadedDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 50),
    uploadedBy: DEFAULT_USER,
    linkedRuleIds: ["RULE-003"],
  },
];

function ensureCheckerAccess() {
  const user = SimulatedAuthService.getCurrentUser();
  if (!user || user.role !== "checker" || !SimulatedAuthService.isAuthenticated()) {
    throw new Error("Unauthorized: Knowledge Center is checker-only");
  }
}

function getActiveVersion(rule: ComplianceRule): RuleVersion | undefined {
  return rule.versions.find((version) => version.status === "Active");
}

function getCurrentVersion(rule: ComplianceRule): RuleVersion | undefined {
  return rule.versions.find((version) => version.version === rule.currentVersion);
}

function toRuleStatus(versionStatus: RuleVersionStatus): RuleStatus {
  if (versionStatus === "Retired") return "Retired";
  if (versionStatus === "Active") return "Active";
  return "Draft";
}

function validateRuleValues(
  input: Pick<ComplianceRule, "ruleName" | "ruleType" | "shelfType" | "expectedValue" | "severity"> & {
    tolerance?: number;
    ruleId?: string;
  },
): RuleValidationResult {
  const errors: string[] = [];

  if (!input.ruleName.trim()) errors.push("Rule name is required.");
  if (!input.expectedValue.trim()) errors.push("Expected value is required.");
  if (!KNOWLEDGE_SHELF_TYPES.includes(input.shelfType as (typeof KNOWLEDGE_SHELF_TYPES)[number])) {
    errors.push("Selected shelf type is invalid.");
  }
  if (input.tolerance !== undefined && Number.isNaN(input.tolerance)) {
    errors.push("Tolerance must be a valid number.");
  }
  if (input.tolerance !== undefined && input.tolerance < 0) {
    errors.push("Tolerance cannot be negative.");
  }

  const newCategories = ["VISUAL", "SAFETY", "PROFITABILITY", "EFFICIENCY"] as const;
  const isNewCategory = newCategories.includes(input.ruleType as (typeof newCategories)[number]);
  if (!isNewCategory) {
    const conflictingRule = mockRules.find(
      (rule) =>
        rule.status === "Active" &&
        rule.ruleType === input.ruleType &&
        rule.shelfType === input.shelfType &&
        rule.ruleId !== input.ruleId,
    );
    if (conflictingRule) {
      errors.push("An active rule with the same type and shelf type already exists.");
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function fetchComplianceRules(filters?: RuleFilters): Promise<ComplianceRule[]> {
  ensureCheckerAccess();
  await delay(250);

  let rules = [...mockRules];

  if (filters?.shelfType) rules = rules.filter((rule) => rule.shelfType === filters.shelfType);
  if (filters?.severity) rules = rules.filter((rule) => rule.severity === filters.severity);
  if (filters?.status) rules = rules.filter((rule) => rule.status === filters.status);

  return rules.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
}

/** Rule set summary for adhoc analysis selection (maker + checker read access) */
export interface ComplianceRuleSetSummary {
  id: string;
  name: string;
  rulesCount: number;
  enabledCount: number;
  description?: string;
  isDefault?: boolean;
}

/**
 * Fetch compliance rule sets for analysis selection.
 * Available to both maker and checker (read-only).
 */
export async function fetchComplianceRuleSetsForAnalysis(): Promise<ComplianceRuleSetSummary[]> {
  await delay(200);

  const rules = [...mockRules];
  const seenSetIds = new Set<string>();
  const sets: ComplianceRuleSetSummary[] = [];

  for (const rule of rules) {
    if (rule.ruleSetId) {
      if (seenSetIds.has(rule.ruleSetId)) continue;
      seenSetIds.add(rule.ruleSetId);
      const setRules = rules.filter((r) => r.ruleSetId === rule.ruleSetId);
      const enabledCount = setRules.filter((r) => r.enabled !== false).length;
      sets.push({
        id: rule.ruleSetId,
        name: rule.ruleSetName ?? rule.ruleName,
        rulesCount: setRules.length,
        enabledCount,
        description: rule.description,
      });
    } else {
      sets.push({
        id: rule.ruleId,
        name: rule.ruleName,
        rulesCount: 1,
        enabledCount: 1,
        description: rule.description,
        isDefault: rule.ruleId === "RULE-001",
      });
    }
  }

  // Prepend built-in "Default Rules" set for adhoc analysis
  const defaultSet: ComplianceRuleSetSummary = {
    id: "default-rules",
    name: "Default Rules",
    rulesCount: 5,
    enabledCount: 5,
    description: "Built-in compliance checks",
    isDefault: true,
  };

  return [defaultSet, ...sets].sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : a.name.localeCompare(b.name)));
}

/**
 * Fetch rules in a rule set (read-only, for maker/checker view).
 * For "default-rules", returns rules without ruleSetId or matching default.
 */
export async function fetchRulesByRuleSetId(ruleSetId: string): Promise<ComplianceRule[]> {
  await delay(200);

  const rules = [...mockRules];

  if (ruleSetId === "default-rules") {
    return rules
      .filter((r) => !r.ruleSetId || r.ruleSetId === "default-rules")
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  return rules
    .filter((r) => r.ruleSetId === ruleSetId)
    .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
}

export async function fetchRuleVersions(ruleId?: string): Promise<RuleVersion[]> {
  ensureCheckerAccess();
  await delay(200);

  const versions = mockRules.flatMap((rule) => rule.versions);
  const filtered = ruleId ? versions.filter((version) => version.ruleId === ruleId) : versions;
  return filtered.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
}

export async function fetchReferenceDocuments(): Promise<ReferenceDocument[]> {
  ensureCheckerAccess();
  await delay(200);
  return [...mockDocuments].sort((a, b) => b.uploadedDate.getTime() - a.uploadedDate.getTime());
}

export async function validateRuleForActivation(ruleId: string): Promise<RuleValidationResult> {
  ensureCheckerAccess();
  await delay(120);

  const rule = mockRules.find((item) => item.ruleId === ruleId);
  if (!rule) return { valid: false, errors: ["Rule was not found."] };
  if (rule.status === "Retired") return { valid: false, errors: ["Retired rules cannot be activated."] };

  return validateRuleValues({
    ruleId: rule.ruleId,
    ruleName: rule.ruleName,
    ruleType: rule.ruleType,
    shelfType: rule.shelfType,
    expectedValue: rule.expectedValue,
    tolerance: rule.tolerance,
    severity: rule.severity,
  });
}

export async function createComplianceRule(input: CreateRuleInput): Promise<ComplianceRule> {
  ensureCheckerAccess();
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

  ruleCounter += 1;
  versionCounter += 1;

  const createdDate = new Date();
  const ruleId = `RULE-${String(ruleCounter).padStart(3, "0")}`;
  const firstVersion: RuleVersion = {
    id: `VER-${String(versionCounter).padStart(3, "0")}`,
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

export async function updateComplianceRule(ruleId: string, input: UpdateRuleInput): Promise<ComplianceRule> {
  ensureCheckerAccess();
  await delay(350);

  const index = mockRules.findIndex((rule) => rule.ruleId === ruleId);
  if (index < 0) throw new Error("Rule was not found.");

  const current = mockRules[index];
  if (current.status === "Retired") throw new Error("Retired rules cannot be edited.");

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
  versionCounter += 1;

  const updatedVersion: RuleVersion = {
    id: `VER-${String(versionCounter).padStart(3, "0")}`,
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

export async function activateComplianceRule(ruleId: string): Promise<ComplianceRule> {
  ensureCheckerAccess();
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

export async function retireComplianceRule(ruleId: string): Promise<ComplianceRule> {
  ensureCheckerAccess();
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

export async function cloneRetiredRule(ruleId: string, createdBy: string): Promise<ComplianceRule> {
  ensureCheckerAccess();
  await delay(280);

  const sourceRule = mockRules.find((rule) => rule.ruleId === ruleId);
  if (!sourceRule) throw new Error("Rule was not found.");
  if (sourceRule.status !== "Retired") throw new Error("Only retired rules can be cloned.");

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
  name: string;
  uploadedBy: string;
  linkedRuleIds: string[];
}): Promise<ReferenceDocument> {
  ensureCheckerAccess();
  await delay(300);

  if (!input.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF documents are supported in Phase 1.");
  }

  documentCounter += 1;
  const document: ReferenceDocument = {
    id: `DOC-${String(documentCounter).padStart(3, "0")}`,
    name: input.name,
    uploadedDate: new Date(),
    uploadedBy: input.uploadedBy,
    linkedRuleIds: input.linkedRuleIds,
  };

  mockDocuments.unshift(document);

  input.linkedRuleIds.forEach((ruleId) => {
    const rule = mockRules.find((item) => item.ruleId === ruleId);
    if (!rule) return;
    if (!rule.linkedDocumentIds.includes(document.id)) {
      rule.linkedDocumentIds.push(document.id);
      rule.lastUpdated = new Date();
    }
  });

  return document;
}

export async function updateReferenceDocumentLinks(
  documentId: string,
  linkedRuleIds: string[]
): Promise<ReferenceDocument> {
  ensureCheckerAccess();
  await delay(250);

  const doc = mockDocuments.find((d) => d.id === documentId);
  if (!doc) throw new Error("Document was not found.");

  const prevRuleIds = new Set(doc.linkedRuleIds);
  const nextRuleIds = new Set(linkedRuleIds);

  doc.linkedRuleIds = linkedRuleIds;

  prevRuleIds.forEach((ruleId) => {
    if (!nextRuleIds.has(ruleId)) {
      const rule = mockRules.find((r) => r.ruleId === ruleId);
      if (rule) {
        rule.linkedDocumentIds = rule.linkedDocumentIds.filter((id) => id !== documentId);
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

  return doc;
}
