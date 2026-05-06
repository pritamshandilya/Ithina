import { useState } from "react";

import { AllIssuesTab } from "./AllIssuesTab";
import { AllItemsTab } from "./AllItemsTab";
import { ComplianceReportHeader } from "./ComplianceReportHeader";
import { ComplianceReportMetrics } from "./ComplianceReportMetrics";
import { ComplianceReportTabs, type ReportTabId } from "./ComplianceReportTabs";
import { ImageComparisonTab } from "./ImageComparisonTab";
import { OverviewChartsTab } from "./OverviewChartsTab";
import type {
  AllIssuesReportData,
  AllItemsReportData,
  ImageComparisonData,
  ReportSnippet,
} from "@/lib/analysis";

export interface AdhocComplianceReportPageProps {
  report: ReportSnippet;
  imageUrl?: string | null;
  imageComparison?: ImageComparisonData | null;
  allItems?: AllItemsReportData | null;
  allIssues?: AllIssuesReportData | null;
  backTo?: string;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

export function AdhocComplianceReportPage({
  report,
  imageUrl = null,
  imageComparison = null,
  allItems = null,
  allIssues = null,
  backTo,
  onExportPdf,
  isExportingPdf = false,
}: AdhocComplianceReportPageProps) {
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");
  const subtitle = `${report.productsDetected} products detected • ${report.analysisIssues} issues`;
  const issuesCount = (allIssues?.categories ?? []).reduce(
    (sum, category) => sum + category.issues.length,
    0,
  );
  const itemsCount = allItems?.skuFacings.length ?? 0;

  return (
    <div className="compliance-report-full flex min-h-0 flex-1 flex-col">
      <div className="bg-primary sticky top-0 z-10 shrink-0 space-y-2 pb-2">
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
          gap={report.gap}
        />
        <ComplianceReportTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          imageTabLabel="Observed Display Unit"
          issuesCount={issuesCount}
          itemsCount={itemsCount}
        />
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-0.5 [scrollbar-gutter:stable]">
        <div className="w-full max-w-full min-w-0">
          {activeTab === "overview" && (
            <OverviewChartsTab report={report} allItems={allItems} />
          )}
          {activeTab === "image-comparison" && (
            <ImageComparisonTab
              data={imageComparison}
              imageUrl={imageUrl}
              showPlanogramPanel={false}
              skuFacings={allItems?.skuFacings ?? []}
            />
          )}
          {activeTab === "issues" && <AllIssuesTab data={allIssues} />}
          {activeTab === "items" && (
            <AllItemsTab data={allItems} showPlanogramItems={false} />
          )}
        </div>
      </div>
    </div>
  );
}
