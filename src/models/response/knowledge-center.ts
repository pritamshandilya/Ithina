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

export type DocumentTypeResponse = "COMPLIANCE_REFERENCE" | "SHELF_IMAGE";
export type DocumentProcessingStatusResponse =
  | "PENDING"
  | "EXTRACTING"
  | "COMPLETED"
  | "FAILED";

export interface DocumentApiResponse {
  id: string;
  store_id: string;
  uploaded_by: string | null;
  document_type: DocumentTypeResponse;
  name: string | null;
  mime_type: string | null;
  extension: string | null;
  size: number | null;
  path: string;
  hash: string | null;
  data: Record<string, unknown>;
  uploaded_at: string | null;
  processing_status: DocumentProcessingStatusResponse;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
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
