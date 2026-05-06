/**
 * Compliance Report PDF Content
 *
 * Renders the full Combined Compliance & Analysis Report for PDF export.
 * All tabs content stacked vertically, no interactive elements (buttons, search, etc.).
 */
import { AllIssuesTab } from "./AllIssuesTab";
import { AllItemsTab } from "./AllItemsTab";
import { ComplianceReportMetrics } from "./ComplianceReportMetrics";
import { ImageComparisonTab } from "./ImageComparisonTab";
import { OverviewChartsTab } from "./OverviewChartsTab";
import type { ReportSnippet } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export interface ComplianceReportPdfContentProps {
  report: ReportSnippet;
  imageUrl?: string | null;
  className?: string;
}

export function ComplianceReportPdfContent({
  report,
  imageUrl = null,
  className,
}: ComplianceReportPdfContentProps) {
  const subtitle = report.planogramName
    ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  return (
    <div
      className={cn(
        "compliance-report-pdf space-y-8 bg-white p-6 text-[#1a1a1a]",
        "[&_.text-muted-foreground]:text-[#6b7280]!",
        "[&_.text-foreground]:text-[#1a1a1a]!",
        "[&_.border-border]:border-[#e5e7eb]!",
        "[&_.bg-card]:bg-[#f9fafb]!",
        "[&_.bg-muted]:bg-[#f3f4f6]!",
        className,
      )}
    >
      {/* Header – title and subtitle only, no buttons */}
      <header>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">
          Combined Compliance & Analysis Report
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">{subtitle}</p>
      </header>

      {/* Metrics */}
      <ComplianceReportMetrics
        complianceScore={report.complianceScore}
        matched={report.matched}
        misplaced={report.misplaced}
        missing={report.missing}
        extra={report.extra}
        issues={report.issues}
        gap={report.gap}
      />

      {/* Overview & Charts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-wider text-[#1a1a1a] uppercase">
          Overview & Charts
        </h2>
        <OverviewChartsTab report={report} />
      </section>

      {/* Image Comparison */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-wider text-[#1a1a1a] uppercase">
          Image Comparison
        </h2>
        <ImageComparisonTab imageUrl={imageUrl} />
      </section>

      {/* All Issues */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-wider text-[#1a1a1a] uppercase">
          All Issues
        </h2>
        <AllIssuesTab pdfMode />
      </section>

      {/* All Items */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-wider text-[#1a1a1a] uppercase">
          All Items
        </h2>
        <AllItemsTab pdfMode />
      </section>
    </div>
  );
}
