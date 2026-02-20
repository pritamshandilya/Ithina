/**
 * Full Compliance Report View (Checker Side)
 *
 * Displayed when user clicks on an analysis from shelf-level or store-level reports.
 * Uses MOCK_REPORT_SNIPPET for now; will be wired to dynamic data later.
 */

import { createFileRoute, useLocation } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ComplianceReportFull } from "@/components/shared/compliance-report";
import { MOCK_REPORT_SNIPPET } from "@/features/maker/analysis";

export const Route = createFileRoute("/checker/reports/view")({
  component: CheckerFullReportPage,
});

function CheckerFullReportPage() {
  const location = useLocation();
  const imageUrl = (location.state as { imageUrl?: string } | undefined)?.imageUrl;

  const handleExportPdf = () => {
    // TODO: Implement PDF export
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <ComplianceReportFull
            report={MOCK_REPORT_SNIPPET}
            imageUrl={imageUrl}
            // backTo="/checker/reports/shelf-level"
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>
    </MainLayout>
  );
}
