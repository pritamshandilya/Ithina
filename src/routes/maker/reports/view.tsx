/**
 * Full Compliance Report View
 *
 * Displayed when user clicks "View Full Report" from analysis results.
 * Uses MOCK_REPORT_SNIPPET for now; will be wired to dynamic data later.
 */

import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ComplianceReportFull } from "@/components/shared/compliance-report";
import { MOCK_REPORT_SNIPPET } from "@/features/maker/analysis";

export const Route = createFileRoute("/maker/reports/view")({
  component: FullReportPage,
});

function FullReportPage() {
  const handleExportPdf = () => {
    // TODO: Implement PDF export
    console.log("Export PDF clicked");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <ComplianceReportFull
            report={MOCK_REPORT_SNIPPET}
            backTo="/maker/audits/planogram"
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>
    </MainLayout>
  );
}
