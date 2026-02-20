/**
 * Analysis result structure – populated from JSON snippets.
 * Used to display compliance summary and issues in the results view.
 */

export interface AnalysisIssue {
  id?: string;
  skuName?: string;
  description: string;
  type: string;
  location?: string;
}

export interface AnalysisResult {
  complianceScore: number;
  totalIssues: number;
  missingSkus: number;
  misplacedSkus: number;
  emptySpaces: number;
  issues: AnalysisIssue[];
}
