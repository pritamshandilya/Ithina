/**
 * Full Compliance Report
 *
 * Main wrapper for the Combined Compliance & Analysis Report.
 * Used when user clicks "View Full Report" from analysis results.
 * Structure is PDF-export friendly (print-report class).
 *
 * Shared between Maker and Checker flows.
 */
import { AdhocComplianceReportPage } from "./AdhocComplianceReportPage";
import { PlanogramComplianceReportPage } from "./PlanogramComplianceReportPage";
import type {
  AllIssuesReportData,
  AllItemsReportData,
  ImageComparisonData,
  ReportSnippet,
} from "@/lib/analysis";
import type { PlanogramPayload } from "@/types/planogram";

export interface ComplianceReportFullProps {
  /** Report data */
  report: ReportSnippet;
  /** Captured shelf image URL – from analysis flow */
  imageUrl?: string | null;
  /** Planogram associated with analyzed fixture */
  planogramPayload?: PlanogramPayload | null;
  /** Optional detailed items payload */
  allItems?: AllItemsReportData | null;
  /** Optional detailed issues payload */
  allIssues?: AllIssuesReportData | null;
  /** Optional image comparison payload */
  imageComparison?: ImageComparisonData | null;
  /** Source analysis type */
  analysisType?: "PLANOGRAM" | "ADHOC" | null;
  /** Back navigation target */
  backTo?: string;
  /** Callback when Export PDF is clicked */
  onExportPdf?: () => void;
  /** Whether PDF export is in progress */
  isExportingPdf?: boolean;
  /** Additional class names */
  className?: string;
}

export function ComplianceReportFull({
  report,
  imageUrl = null,
  planogramPayload = null,
  allItems = null,
  allIssues = null,
  imageComparison = null,
  analysisType = null,
  backTo,
  onExportPdf,
  isExportingPdf = false,
  className: _className,
}: ComplianceReportFullProps) {
  const isAdhoc = analysisType === "ADHOC";
  if (isAdhoc) {
    return (
      <AdhocComplianceReportPage
        report={report}
        imageUrl={imageUrl}
        imageComparison={imageComparison}
        allItems={allItems}
        allIssues={allIssues}
        backTo={backTo}
        onExportPdf={onExportPdf}
        isExportingPdf={isExportingPdf}
      />
    );
  }

  return (
    <PlanogramComplianceReportPage
      report={report}
      imageUrl={imageUrl}
      planogramPayload={planogramPayload}
      allItems={allItems}
      allIssues={allIssues}
      backTo={backTo}
      onExportPdf={onExportPdf}
      isExportingPdf={isExportingPdf}
    />
  );
}
