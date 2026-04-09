/**
 * Full Compliance Report for Audit Review
 *
 * When checker clicks "View Full Report" from the audit review page,
 * they see the full compliance report (same as maker report view).
 * Back button returns to the audit review workspace.
 *
 * Access at: /checker/audit-report/:auditId
 */

import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import MainLayout from "@/components/layouts/main";
import { useToast } from "@/hooks/use-toast";
import { ComplianceReportFull } from "@/components/shared/compliance-report";
import {
  MOCK_REPORT_SNIPPET,
  MOCK_ALL_ITEMS_REPORT,
  MOCK_ALL_ISSUES_REPORT,
  MOCK_IMAGE_COMPARISON,
} from "@/lib/analysis";
import { exportReportToPdf } from "@/lib/reports/pdf-export";

export const Route = createFileRoute("/checker/audit-report/$auditId/")({
  component: AuditReportPage,
  meta: {
    layoutMode: "fullReport",
  },
});

export function AuditReportPage() {
  const { auditId } = useParams({ strict: false });
  const routes = useStoreScopedCheckerRoutes();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const backTo = auditId ? routes.reviewAuditHref(auditId) : "/checker/audit-review";

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        data: {
          report: MOCK_REPORT_SNIPPET,
          imageUrl: null,
          allItems: MOCK_ALL_ITEMS_REPORT,
          allIssues: MOCK_ALL_ISSUES_REPORT,
          imageComparison: MOCK_IMAGE_COMPARISON,
        },
        filename: `compliance-report-audit-${auditId}.pdf`,
      });
      toast({
        title: "PDF exported",
        description:
          "The report has been exported. A preview opened in a new tab and the file was downloaded.",
      });
    } catch {
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
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
