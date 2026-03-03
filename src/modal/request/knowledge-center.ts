/**
 * API Payload Types – Knowledge Center
 *
 * Request bodies for compliance rule and reference document management.
 */

export type RuleTypePayload =
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

export type RuleSeverityPayload = "Low" | "Medium" | "High";

export interface CreateRulePayload {
  ruleName: string;
  ruleType: RuleTypePayload;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverityPayload;
  description?: string;
  ruleSetId?: string;
  ruleSetName?: string;
}

export interface UpdateRulePayload {
  ruleName: string;
  ruleType: RuleTypePayload;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverityPayload;
  changeSummary?: string;
}

export interface UpdateDocumentLinksPayload {
  linkedDocumentIds: string[];
}
