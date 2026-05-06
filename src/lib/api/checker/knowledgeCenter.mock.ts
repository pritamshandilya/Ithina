import type { ComplianceRule, ReferenceDocument } from "@/types/checker";

export const KNOWLEDGE_SHELF_TYPES = [
  "Beverages",
  "Snacks",
  "Dairy",
  "Produce",
  "Frozen",
  "Household",
] as const;

const DEFAULT_USER = "checker@displaydata.com";

export let ruleCounter = 4;
export let versionCounter = 5;
export let documentCounter = 2;

const now = new Date();

export const mockRules: ComplianceRule[] = [
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

export const mockDocuments: ReferenceDocument[] = [
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

export function nextRuleId(): string {
  ruleCounter += 1;
  return `RULE-${String(ruleCounter).padStart(3, "0")}`;
}

export function nextVersionId(): string {
  versionCounter += 1;
  return `VER-${String(versionCounter).padStart(3, "0")}`;
}

export function nextDocumentId(): string {
  documentCounter += 1;
  return `DOC-${String(documentCounter).padStart(3, "0")}`;
}
