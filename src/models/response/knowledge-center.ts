/**
 * API Response Types – Knowledge Center
 *
 * Shapes returned by compliance rule and reference document endpoints.
 */

export type RuleTypeResponse =
  | "Facings"
  | "Spacing"
  | "Product Position"
  | "Margin"
  | "OOS"
  | "Labeling"
  | "VISUAL"
  | "SAFETY"
  | "PROFITABILITY"
  | "EFFICIENCY";

export type RuleSeverityResponse = "Low" | "Medium" | "High";
export type RuleStatusResponse = "Draft" | "Active" | "Retired";
export type RuleVersionStatusResponse =
  | "Draft"
  | "Active"
  | "Archived"
  | "Retired";

export interface RuleVersionResponse {
  id: string;
  ruleId: string;
  version: number;
  status: RuleVersionStatusResponse;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverityResponse;
  effectiveDate?: string; // ISO date string
  createdDate: string; // ISO date string
  createdBy: string;
  changeSummary?: string;
}

export interface ComplianceRuleResponse {
  ruleId: string;
  ruleName: string;
  ruleType: RuleTypeResponse;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverityResponse;
  status: RuleStatusResponse;
  currentVersion: number;
  createdBy: string;
  createdDate: string; // ISO date string
  lastUpdated: string; // ISO date string
  versions: RuleVersionResponse[];
  linkedDocumentIds: string[];
  description?: string;
  ruleSetId?: string;
  ruleSetName?: string;
  enabled?: boolean;
}

export interface ComplianceRuleListResponse {
  rules: ComplianceRuleResponse[];
  total: number;
}

export interface ReferenceDocumentResponse {
  id: string;
  name: string;
  uploadedDate: string; // ISO date string
  uploadedBy: string;
  linkedRuleIds: string[];
  downloadUrl?: string;
}

export interface ReferenceDocumentListResponse {
  documents: ReferenceDocumentResponse[];
  total: number;
}

export interface RuleValidationResponse {
  valid: boolean;
  errors: string[];
}

export interface CreateRuleResponse {
  rule: ComplianceRuleResponse;
}

export interface UpdateRuleResponse {
  rule: ComplianceRuleResponse;
}
