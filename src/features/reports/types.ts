/**
 * Report PDF export types.
 * Data structures passed to ReportPdfView for PDF-safe rendering.
 */

import type {
  ReportSnippet,
  AllItemsReportData,
  AllIssuesReportData,
  ImageComparisonData,
} from "@/features/maker/analysis";

export interface ReportPdfData {
  report: ReportSnippet;
  imageUrl?: string | null;
  allItems?: AllItemsReportData;
  allIssues?: AllIssuesReportData;
  imageComparison?: ImageComparisonData;
}
