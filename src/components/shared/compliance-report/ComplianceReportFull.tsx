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
import { ComplianceReportHeader } from "./ComplianceReportHeader";
import { ComplianceReportMetrics } from "./ComplianceReportMetrics";
import { ComplianceReportTabs } from "./ComplianceReportTabs";
import { OverviewChartsTab } from "./OverviewChartsTab";
import { AllItemsTab } from "./AllItemsTab";
import { AllIssuesTab } from "./AllIssuesTab";
import { ImageComparisonTab } from "./ImageComparisonTab";
import type { ReportSnippet } from "@/lib/analysis";
import type { ReportTabId } from "./ComplianceReportTabs";
import { cn } from "@/lib/utils";

export interface ComplianceReportFullProps {
  /** Report data */
  report: ReportSnippet;
  /** Captured shelf image URL – from analysis flow */
  imageUrl?: string | null;
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
  backTo,
  onExportPdf,
  isExportingPdf = false,
  className,
}: ComplianceReportFullProps) {
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");

  const subtitle = report.planogramName
    ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  return (
    <div
      className={cn(
        "compliance-report-full print-report flex min-h-0 flex-1 flex-col",
        className
      )}
    >
      {/* Static section: header, metrics, tabs - stays fixed when tab content scrolls */}
      <div className="sticky top-0 z-10 shrink-0 space-y-4 bg-primary pb-4">
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
          issuesCount={
            report.issuesToReview.length +
            report.issueCategories.reduce((a, c) => a + c.count, 0)
          }
          itemsCount={report.detected + report.extra}
        />
      </div>

      {/* Scrollable tab content - fixed width; overflow-x-hidden keeps width consistent; scrollbar-gutter prevents layout shift */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
        <div className="w-full min-w-0 max-w-full">
          {activeTab === "overview" && (
            <OverviewChartsTab report={report} />
          )}

          {activeTab === "image-comparison" && (
            <ImageComparisonTab imageUrl={imageUrl} />
          )}

          {activeTab === "issues" && <AllIssuesTab />}

          {activeTab === "items" && <AllItemsTab />}
        </div>
      </div>
    </div>
  );
}
