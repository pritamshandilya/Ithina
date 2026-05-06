/**
 * Full Compliance Report View
 *
 * Displayed when user clicks "View Full Report" from analysis results.
 * Uses mapped report payload from navigation state when available.
 */
import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { ComplianceReportFull } from "@/components/shared/complianceReport";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { type ReportSnippet } from "@/lib/analysis";
import { exportReportToPdf } from "@/lib/reports/PdfExport";
import { getRelativePath } from "@/lib/utils";
import { usePlanogramById } from "@/queries/maker";

export const Route = createFileRoute("/maker/reports/view/")({
  component: FullReportPage,
  meta: {
    layoutMode: "fullReport",
  },
});

function FullReportPage() {
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as
    | {
        imageUrl?: string;
        backTo?: string;
        report?: ReportSnippet;
        planogramId?: string;
      }
    | undefined;
  const imageUrl = state?.imageUrl;
  const report = state?.report;
  const backTo = getRelativePath(state?.backTo ?? "/maker/audits/planogram");
  const planogramId = state?.planogramId ?? null;
  const { data: planogramPayload } = usePlanogramById(planogramId);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!report) {
      toast({
        title: "Report unavailable",
        description: "No report payload found for export.",
        variant: "destructive",
      });
      return;
    }
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        data: {
          report,
          imageUrl: imageUrl ?? null,
        },
        filename: "compliance-report.pdf",
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

  if (!report) {
    return (
      <MainLayout>
        <div className="bg-primary flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-foreground text-base font-semibold">
            Full report is unavailable
          </p>
          <p className="text-muted-foreground max-w-md text-sm">
            Open this page from a report entry that includes analysis data.
          </p>
          <Button asChild variant="outline">
            <Link to={backTo}>Back</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-primary flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
          <ComplianceReportFull
            report={report}
            imageUrl={imageUrl}
            planogramPayload={planogramPayload ?? null}
            backTo={backTo}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExporting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
