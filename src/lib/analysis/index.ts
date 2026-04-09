/**
 * Shared analysis pipeline for adhoc and planogram-based flows
 */

export { PIPELINE_STEPS, SIMPLE_PROGRESS_STEPS } from "./constants";
export type { PipelineStepDef } from "./constants";
export { MOCK_SKU_ENRICHMENT_ITEMS } from "./mock-sku-data";
export { MOCK_ANALYSIS_RESULT } from "./mock-analysis-result";
export { MOCK_REPORT_SNIPPET } from "./mock-report-snippets";
export { MOCK_ALL_ITEMS_REPORT } from "./mock-all-items-report";
export { MOCK_ALL_ISSUES_REPORT } from "./mock-all-issues-report";
export { MOCK_IMAGE_COMPARISON } from "./mock-image-comparison";
export type { AnalysisResult, AnalysisIssue } from "./analysis-result-types";
export type {
  ReportSnippet,
  ReportKeyFinding,
  ReportShelfCompliance,
  ReportIssueDistribution,
  ReportIssueCategory,
} from "./report-snippet-types";
export type {
  PlanogramItemRow,
  SkuFacingRow,
  AllItemsReportData,
} from "./all-items-report-types";
export type {
  IssueEntry,
  IssueCategoryGroup,
  AllIssuesReportData,
} from "./all-issues-report-types";
export type {
  SkuEnrichmentItem,
  SkuIssueDetail,
  PipelineStepId,
} from "./types";
export type {
  ImageComparisonData,
  PlanogramSlot,
  PlanogramShelfRow,
  PlanogramSlotStatus,
  DetectionOverlay,
  DetectionOverlayStatus,
} from "./image-comparison-types";
