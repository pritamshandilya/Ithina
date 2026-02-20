/**
 * All Issues Report – types for collapsible issue categories.
 * Replace mock data source with API when available.
 */

export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH";
export type IssueCategoryVariant =
  | "misplaced"
  | "missing"
  | "extra"
  | "depth"
  | "analysis";

/** Individual issue entry within a category */
export interface IssueEntry {
  id: string;
  productName: string;
  sku?: string;
  /** Main issue description */
  description: string;
  /** Optional detail line (e.g. "Expected Shelf 4 → Actual Shelf 1") */
  detail?: string;
  /** Optional metrics (e.g. "Shelf 2 Front: 0/6 Depth: 3 Missing Units: 18") */
  metrics?: string;
  /** Optional "Why" explanation for analysis issues */
  why?: string;
  severity: IssueSeverity;
}

/** Issue category with collapsible list of issues */
export interface IssueCategoryGroup {
  id: string;
  title: string;
  count: number;
  description: string;
  variant: IssueCategoryVariant;
  issues: IssueEntry[];
}

/** Combined payload for All Issues tab */
export interface AllIssuesReportData {
  categories: IssueCategoryGroup[];
}
