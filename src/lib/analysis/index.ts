/**
 * Shared analysis pipeline for adhoc and planogram-based flows
 */

export { PIPELINE_STEPS, SIMPLE_PROGRESS_STEPS } from "./constants";
export type { PipelineStepDef } from "./constants";
export { MOCK_SKU_ENRICHMENT_ITEMS } from "./mockSkuData";
export { MOCK_ANALYSIS_RESULT } from "./mockAnalysisResult";
export { MOCK_REPORT_SNIPPET } from "./mockReportSnippets";
export {
  mapAnalysisResultToReportSnippet,
  getAnnotatedImagePreview,
  mapAnalysisResultToAllItemsReportData,
  mapAnalysisResultToAllIssuesReportData,
  mapPlanogramPayloadToAllItemsReportData,
} from "./reportMapper";
export { MOCK_ALL_ITEMS_REPORT } from "./mockAllItemsReport";
export { MOCK_ALL_ISSUES_REPORT } from "./mockAllIssuesReport";
export { MOCK_IMAGE_COMPARISON } from "./mockImageComparison";
export { mapPlanogramPayloadToImageComparisonData } from "./imageComparisonMapper";
export type { AnalysisResult, AnalysisIssue } from "./analysisResultTypes";
export type {
  ReportSnippet,
  ReportKeyFinding,
  ReportShelfCompliance,
  ReportIssueDistribution,
  ReportIssueCategory,
} from "./reportSnippetTypes";
export type {
  PlanogramItemRow,
  SkuFacingRow,
  AllItemsReportData,
} from "./allItemsReportTypes";
export type {
  IssueEntry,
  IssueCategoryGroup,
  AllIssuesReportData,
} from "./allIssuesReportTypes";
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
} from "./imageComparisonTypes";
