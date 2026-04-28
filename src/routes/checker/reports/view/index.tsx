/**
 * Full Compliance Report View (Checker Side)
 *
 * Displayed when user clicks on an analysis from shelf-level or store-level reports.
 * Uses mapped report payload from navigation state when available.
 */

import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import MainLayout from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { ComplianceReportFull } from "@/components/shared/compliance-report";
import { type ReportSnippet } from "@/lib/analysis";
import { exportReportToPdf } from "@/lib/reports/pdf-export";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/checker/reports/view/")({
  component: CheckerFullReportPage,
});

function CheckerFullReportPage() {
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as {
    imageUrl?: string;
    report?: ReportSnippet;
    backTo?: string;
  } | undefined);
  const imageUrl = state?.imageUrl;
  const report = state?.report;
  const backTo = state?.backTo ?? "/checker/audit-review";
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!report || isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        data: {
          report,
          imageUrl: imageUrl ?? null,
        },
        filename: "checker-compliance-report.pdf",
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
        <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-primary p-6 text-center">
          <p className="text-foreground text-base font-semibold">Full report is unavailable</p>
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
          <ComplianceReportFull
            report={report}
            imageUrl={imageUrl}
            backTo={backTo}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExporting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
