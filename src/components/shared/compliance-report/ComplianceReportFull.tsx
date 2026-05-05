/**
 * Full Compliance Report
 *
 * Main wrapper for the Combined Compliance & Analysis Report.
 * Used when user clicks "View Full Report" from analysis results.
 * Structure is PDF-export friendly (print-report class).
 *
 * Shared between Maker and Checker flows.
 */
import { useState } from "react";

import { AllIssuesTab } from "./AllIssuesTab";
import { AllItemsTab } from "./AllItemsTab";
import { ComplianceReportHeader } from "./ComplianceReportHeader";
import { ComplianceReportMetrics } from "./ComplianceReportMetrics";
import { ComplianceReportTabs } from "./ComplianceReportTabs";
import type { ReportTabId } from "./ComplianceReportTabs";
import { ImageComparisonTab } from "./ImageComparisonTab";
import { OverviewChartsTab } from "./OverviewChartsTab";
import type {
  AllIssuesReportData,
  AllItemsReportData,
  ImageComparisonData,
  ReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";
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
  className,
}: ComplianceReportFullProps) {
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");
  const isAdhoc = analysisType === "ADHOC";

  const subtitle = report.planogramName
    ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  return (
    <div
      className={cn(
        "compliance-report-full print-report flex min-h-0 flex-1 flex-col",
        className,
      )}
    >
      {/* Static section: header, metrics, tabs - stays fixed when tab content scrolls */}
      <div className="bg-primary sticky top-0 z-10 shrink-0 space-y-4 pb-4">
        <ComplianceReportHeader
          title="Combined Compliance & Analysis Report"
          subtitle={subtitle}
          backTo={backTo}
          onExportPdf={onExportPdf}
          isExporting={isExportingPdf}
        />

        <ComplianceReportMetrics
          complianceScore={report.complianceScore}
          matched={report.matched}
          misplaced={report.misplaced}
          missing={report.missing}
          extra={report.extra}
          issues={report.issues}
          facings={report.facings}
          units={report.units}
          detected={report.detected}
          gap={report.gap}
        />

        <ComplianceReportTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          imageTabLabel={isAdhoc ? "Observed Display Unit" : undefined}
        />
      </div>

      {/* Scrollable tab content - fixed width; overflow-x-hidden keeps width consistent; scrollbar-gutter prevents layout shift */}
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
        <div className="w-full max-w-full min-w-0">
          {activeTab === "overview" && <OverviewChartsTab report={report} />}

          {activeTab === "image-comparison" && (
            <ImageComparisonTab
              data={imageComparison}
              imageUrl={imageUrl}
              planogramPayload={planogramPayload}
              showPlanogramPanel={!isAdhoc}
            />
          )}

          {activeTab === "issues" && <AllIssuesTab data={allIssues} />}

          {activeTab === "items" && (
            <AllItemsTab data={allItems} showPlanogramItems={!isAdhoc} />
          )}
        </div>
      </div>
    </div>
  );
}
