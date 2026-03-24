export type ComplianceRuleSetStatus = "DRAFT" | "ACTIVE" | "RETIRED";

/** Rule set summary for analysis selection (maker + checker read access). */
export interface ComplianceRuleSetSummary {
  id: string;
  name: string;
  rulesCount: number;
  enabledCount: number;
  description?: string;
  isDefault?: boolean;
}

