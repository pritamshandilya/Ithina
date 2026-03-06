/**
 * Full Compliance Report View (Checker Side)
 *
 * Displayed when user clicks on an analysis from shelf-level or store-level reports.
 * Uses MOCK_REPORT_SNIPPET for now; will be wired to dynamic data later.
 */

import { createFileRoute, useLocation } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ComplianceReportFull } from "@/components/shared/compliance-report";
import { MOCK_REPORT_SNIPPET } from "@/lib/analysis";

export const Route = createFileRoute("/checker/reports/view/")({
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
          <ComplianceReportFull
            report={MOCK_REPORT_SNIPPET}
            imageUrl={imageUrl}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>
    </MainLayout>
  );
}
