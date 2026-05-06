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

import MainLayout from "@/components/layouts/main";
import { ComplianceReportFull } from "@/components/shared/complianceReport";
import { useStoreScopedCheckerRoutes } from "@/hooks/useStoreScopedCheckerRoutes";
import { useToast } from "@/hooks/useToast";
import type { ReportSnippet } from "@/lib/analysis";
import { exportReportToPdf } from "@/lib/reports/PdfExport";
import { useAuditDetail, useAuditViolations } from "@/queries/checker";

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
  const { data: audit } = useAuditDetail(auditId ?? "");
  const { data: violations = [] } = useAuditViolations(auditId ?? "");
  const [isExporting, setIsExporting] = useState(false);

  const backTo = auditId
    ? routes.reviewAuditHref(auditId)
    : "/checker/audit-review";
  const report: ReportSnippet | null = audit
    ? {
        planogramName: audit.shelfInfo.shelfName,
        productsDetected: 0,
        analysisIssues: violations.length,
        complianceScore: audit.complianceScore ?? 0,
        matched: 0,
        misplaced: violations.filter((v) => v.severity === "warning").length,
        missing: violations.filter((v) => v.severity === "critical").length,
        extra: violations.filter((v) => v.severity === "info").length,
        issues: violations.length,
        facings: 0,
        units: 0,
        detected: 0,
        gap: 0,
        executiveSummary:
          violations.length > 0
            ? `Checker review found ${violations.length} violation${violations.length === 1 ? "" : "s"} for this audit.`
            : "No violations found in this checker review.",
        keyFindings: [],
        aiRecommendations: [],
        shelfCompliance: [],
        issueDistribution: {
          matched: 0,
          misplaced: violations.filter((v) => v.severity === "warning").length,
          missing: violations.filter((v) => v.severity === "critical").length,
          extra: violations.filter((v) => v.severity === "info").length,
        },
        issueCategories: [
          {
            id: "critical",
            title: "Critical",
            count: violations.filter((v) => v.severity === "critical").length,
            description: "Critical violations requiring immediate correction.",
            variant: "missing",
          },
          {
            id: "warning",
            title: "Warnings",
            count: violations.filter((v) => v.severity === "warning").length,
            description: "Warning-level violations to be addressed.",
            variant: "misplaced",
          },
          {
            id: "info",
            title: "Info",
            count: violations.filter((v) => v.severity === "info").length,
            description: "Informational findings from checker review.",
            variant: "analysis",
          },
        ],
        issuesToReview: violations.slice(0, 10).map((v) => ({
          id: v.id,
          skuName: v.ruleName,
          description: v.description,
          type: v.severity.toUpperCase(),
          location: undefined,
        })),
      }
    : null;

  const handleExportPdf = async () => {
    if (!report) return;
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        data: {
          report,
          imageUrl: null,
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
      <div className="bg-primary flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
          {report ? (
            <ComplianceReportFull
              report={report}
              imageUrl={null}
              backTo={backTo}
              onExportPdf={handleExportPdf}
              isExportingPdf={isExporting}
            />
          ) : (
            <div className="flex h-full min-h-0 flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Unable to load checker report details.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
