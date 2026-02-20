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
import type { ReportSnippet } from "@/features/maker/analysis";
import type { ReportTabId } from "./ComplianceReportTabs";
import { cn } from "@/lib/utils";

export interface ComplianceReportFullProps {
  /** Report data */
  report: ReportSnippet;
  /** Back navigation target */
  backTo?: string;
  /** Callback when Export PDF is clicked */
  onExportPdf?: () => void;
  /** Additional class names */
  className?: string;
}

export function ComplianceReportFull({
  report,
  backTo = "/maker/audits/planogram",
  onExportPdf,
  className,
}: ComplianceReportFullProps) {
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");

  const subtitle = report.planogramName
    ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  return (
    <div
      className={cn(
        "compliance-report-full print-report flex flex-col gap-6",
        className
      )}
    >
      <ComplianceReportHeader
        title="Combined Compliance & Analysis Report"
        subtitle={subtitle}
        backTo={backTo}
        onExportPdf={onExportPdf}
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

      {activeTab === "overview" && (
        <OverviewChartsTab report={report} />
      )}

      {activeTab === "image-comparison" && (
        <div className="rounded-xl border border-border bg-card/60 p-8 text-center text-muted-foreground">
          <p className="text-sm">Image Comparison tab — placeholder (coming soon)</p>
        </div>
      )}

      {activeTab === "issues" && <AllIssuesTab />}

      {activeTab === "items" && <AllItemsTab />}
    </div>
  );
}
