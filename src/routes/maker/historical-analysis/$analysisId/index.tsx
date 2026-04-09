/**
 * Historical Analysis Detail
 *
 * Shows the analysis results (summary view) for a past adhoc or planogram run.
 * Replace and Send for Approval are hidden for historical runs.
 */

import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import MainLayout from "@/components/layouts/main";
import { ReportSnippetsView } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { MOCK_REPORT_SNIPPET } from "@/lib/analysis";
import { useHistoricalAnalyses } from "@/queries/maker";
import { getRelativePath } from "@/lib/utils";

import placeholderShelf from "@/assets/placeholder-shelf.jpg";

export const Route = createFileRoute("/maker/historical-analysis/$analysisId/")({
  component: HistoricalAnalysisDetailPage,
  validateSearch: (
    search: Record<string, unknown>
  ): { type?: "adhoc" | "planogram"; backTo?: string } => ({
    type: search.type === "adhoc" || search.type === "planogram" ? search.type : undefined,
    backTo: typeof search.backTo === "string" ? search.backTo : undefined,
  }),
});

function HistoricalAnalysisDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisId } = Route.useParams();
  const { backTo: backToSearch } = Route.useSearch();
  const backTo = getRelativePath(backToSearch ?? "/maker/historical-analysis");
  const { data: analyses } = useHistoricalAnalyses();

  const analysis = useMemo(() => {
    return analyses.find((a) => a.id === analysisId) ?? null;
  }, [analyses, analysisId]);

  const imageUrl = analysis?.imageUrl ?? placeholderShelf;
  const report = MOCK_REPORT_SNIPPET;

  if (!analysis) {
    return (
      <MainLayout>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="text-muted-foreground">Analysis not found</p>
          <Button variant="outline" asChild>
            <Link to="/maker/historical-analysis">Back to Historical Analysis</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const subtitle = analysis.planogramName
    ? `Planogram "${analysis.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  return (
    <MainLayout>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center gap-2 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: backTo })}
              aria-label="Back"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Combined Compliance & Analysis Report
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-auto">
            <ReportSnippetsView
              imagePreview={imageUrl}
              report={report}
              isHistorical
              viewFullReportTo="/maker/reports/view"
              viewFullReportState={{
                imageUrl,
                analysisId,
                backTo: `${getRelativePath(location.pathname)}${location.search}`,
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
