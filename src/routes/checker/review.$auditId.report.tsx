/**
 * Full Compliance Report for Audit Review
 *
 * When checker clicks "View Full Report" from the audit review page,
 * they see the full compliance report (same as maker report view).
 * Back button returns to the audit review workspace.
 *
 * Access at: /checker/review/:auditId/report
 */

import { createFileRoute } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import MainLayout from "@/components/layouts/main";
import { useToast } from "@/hooks/use-toast";
import {
  ComplianceReportFull,
  ComplianceReportPdfContent,
} from "@/components/shared/compliance-report";
import { MOCK_REPORT_SNIPPET } from "@/features/maker/analysis";
import { exportReportToPdf } from "@/lib/pdf/export-report-pdf";

export const Route = createFileRoute("/checker/review/$auditId/report")({
  component: AuditReportPage,
});

function AuditReportPage() {
  const { auditId } = Route.useParams();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const backTo = `/checker/review/${auditId}`;

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        renderContent: (container) => {
          const root = createRoot(container);
          root.render(
            <ComplianceReportPdfContent report={MOCK_REPORT_SNIPPET} />
          );
          return () => root.unmount();
        },
        filename: `compliance-report-audit-${auditId}.pdf`,
      });
      toast({
        title: "PDF exported",
        description:
          "The report has been exported. A preview opened in a new tab and the file was downloaded.",
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
            imageUrl={null}
            backTo={backTo}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExporting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
