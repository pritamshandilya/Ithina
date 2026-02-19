/**
 * Shared analysis pipeline for adhoc and planogram-based flows
 */

export { PIPELINE_STEPS, SIMPLE_PROGRESS_STEPS } from "./constants";
export type { PipelineStepDef } from "./constants";
export { MOCK_SKU_ENRICHMENT_ITEMS } from "./mock-sku-data";
export { MOCK_ANALYSIS_RESULT } from "./mock-analysis-result";
export { MOCK_REPORT_SNIPPET } from "./mock-report-snippets";
export type { AnalysisResult, AnalysisIssue } from "./analysis-result-types";
export type {
  ReportSnippet,
  ReportKeyFinding,
  ReportShelfCompliance,
  ReportIssueDistribution,
  ReportIssueCategory,
} from "./report-snippet-types";
export type {
  SkuEnrichmentItem,
  SkuIssueDetail,
  PipelineStepId,
} from "./types";
export { useAnalysisPipeline } from "./useAnalysisPipeline";
export type {
  UseAnalysisPipelineOptions,
  UseAnalysisPipelineReturn,
} from "./useAnalysisPipeline";
