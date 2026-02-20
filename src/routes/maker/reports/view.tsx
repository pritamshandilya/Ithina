/**
 * Full Compliance Report View
 *
 * Displayed when user clicks "View Full Report" from analysis results.
 * Uses MOCK_REPORT_SNIPPET for now; will be wired to dynamic data later.
 */

import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import MainLayout from "@/components/layouts/main";
import { useToast } from "@/hooks/use-toast";
import { ComplianceReportFull } from "@/components/shared/compliance-report";
import {
  MOCK_REPORT_SNIPPET,
  MOCK_ALL_ITEMS_REPORT,
  MOCK_ALL_ISSUES_REPORT,
  MOCK_IMAGE_COMPARISON,
} from "@/features/maker/analysis";
import { exportReportToPdf } from "@/features/reports/services/pdfExport";

export const Route = createFileRoute("/maker/reports/view")({
  component: FullReportPage,
});

function FullReportPage() {
  const location = useLocation();
  const { toast } = useToast();
  const imageUrl = (location.state as { imageUrl?: string } | undefined)?.imageUrl;
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        data: {
          report: MOCK_REPORT_SNIPPET,
          imageUrl: imageUrl ?? null,
          allItems: MOCK_ALL_ITEMS_REPORT,
          allIssues: MOCK_ALL_ISSUES_REPORT,
          imageComparison: MOCK_IMAGE_COMPARISON,
        },
        filename: "compliance-report.pdf",
      });
      toast({
        title: "PDF exported",
        description: "The report has been exported. A preview opened in a new tab and the file was downloaded.",
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      toast({
        title: "Export failed",
        description: "Could not generate the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <ComplianceReportFull
            report={MOCK_REPORT_SNIPPET}
            imageUrl={imageUrl}
            backTo="/maker/audits/planogram"
            onExportPdf={handleExportPdf}
            isExportingPdf={isExporting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
