/**
 * Report snippet types – structure for full report preview.
 * Used to display key sections, charts, and metrics after analysis.
 */

export interface ReportKeyFinding {
  type: "error" | "warning" | "info";
  text: string;
}

export interface ReportShelfCompliance {
  shelfName: string;
  shelfLabel?: string;
  compliance: number;
  units?: number;
  skuCount?: number;
}

export interface ReportIssueDistribution {
  matched: number;
  misplaced: number;
  missing: number;
  extra: number;
}

export interface ReportIssueCategory {
  id: string;
  title: string;
  count: number;
  description: string;
  variant?: "matched" | "misplaced" | "missing" | "extra" | "analysis" | "depth";
}

export interface ReportSnippet {
  planogramName?: string;
  productsDetected: number;
  analysisIssues: number;

  /** Key metrics row */
  complianceScore: number;
  matched: number;
  misplaced: number;
  missing: number;
  extra: number;
  issues: number;
  facings: number;
  units: number;
  detected: number;
  gap: number;

  /** Executive summary */
  executiveSummary: string;
  keyFindings: ReportKeyFinding[];

  /** AI recommendations */
  aiRecommendations: string[];

  /** Compliance by shelf (for chart) */
  shelfCompliance: ReportShelfCompliance[];

  /** Issue distribution (for donut chart) */
  issueDistribution: ReportIssueDistribution;

  /** Issue categories (for All Issues snippet) */
  issueCategories: ReportIssueCategory[];

  /** Individual issues to review */
  issuesToReview: Array<{
    id?: string;
    skuName?: string;
    description: string;
    type: string;
    location?: string;
  }>;
}
