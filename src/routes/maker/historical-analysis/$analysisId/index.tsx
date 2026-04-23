/**
 * Historical Analysis Detail
 *
 * Shows the analysis results (summary view) for a past adhoc or planogram run.
 * Replace and Send for Approval are hidden for historical runs.
 */

import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { ReportSnippetsView } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAnnotatedImagePreview,
  mapAnalysisResultToReportSnippet,
  type ReportSnippet,
} from "@/lib/analysis";
import { fetchAnalysisJob } from "@/queries/maker/api/analysis";
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
  const { type, backTo: backToSearch } = Route.useSearch();
  const backTo = getRelativePath(backToSearch ?? "/maker/historical-analysis");
  const { data: analyses } = useHistoricalAnalyses();
  const detailQuery = new URLSearchParams();
  if (type) detailQuery.set("type", type);
  if (backToSearch) detailQuery.set("backTo", backToSearch);
  const detailBackTo = `${getRelativePath(location.pathname)}${
    detailQuery.toString() ? `?${detailQuery.toString()}` : ""
  }`;

  const analysis = useMemo(() => {
    return analyses.find((a) => a.id === analysisId) ?? null;
  }, [analyses, analysisId]);

  const [report, setReport] = useState<ReportSnippet | null>(null);
  const [imageUrl, setImageUrl] = useState(analysis?.imageUrl ?? placeholderShelf);
  const [planogramId, setPlanogramId] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportLoadError, setReportLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysis || analysis.type !== "adhoc") {
      setIsReportLoading(false);
      setReportLoadError(null);
      setReport(null);
      setImageUrl(analysis?.imageUrl ?? placeholderShelf);
      setPlanogramId(null);
      return;
    }

    let isMounted = true;
    const loadAnalysisResult = async () => {
      setIsReportLoading(true);
      setReportLoadError(null);
      try {
        const job = await fetchAnalysisJob(analysis.id);
        if (!isMounted) return;
        setReport(mapAnalysisResultToReportSnippet(job.result));
        setPlanogramId(job.planogram_id);
        const annotated = getAnnotatedImagePreview(job.result, job.image_mime_type);
        setImageUrl(annotated ?? analysis.imageUrl ?? placeholderShelf);
      } catch {
        if (!isMounted) return;
        setReport(null);
        setReportLoadError("Unable to load this historical report.");
        setImageUrl(analysis.imageUrl ?? placeholderShelf);
        setPlanogramId(null);
      } finally {
        if (isMounted) {
          setIsReportLoading(false);
        }
      }
    };

    void loadAnalysisResult();
    return () => {
      isMounted = false;
    };
  }, [analysis]);

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

  const subtitle = report
    ? analysis.planogramName
      ? `Planogram "${analysis.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
      : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : analysis.planogramName
      ? `Planogram "${analysis.planogramName}" • report details unavailable`
      : "Report details unavailable";

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
            {isReportLoading ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-9 w-36" />
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr]">
                  <section className="rounded-xl border border-border bg-card/80 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-4 h-[320px] w-full" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-card/80 p-4">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-14 w-20" />
                      <Skeleton className="h-14 w-20" />
                      <Skeleton className="h-14 w-20" />
                      <Skeleton className="h-14 w-20" />
                    </div>
                    <Skeleton className="mt-4 h-24 w-full" />
                    <Skeleton className="mt-3 h-20 w-full" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-7 w-24" />
                    </div>
                  </section>
                </div>
              </div>
            ) : report ? (
              <ReportSnippetsView
                imagePreview={imageUrl}
                report={report}
                isHistorical
                viewFullReportTo="/maker/reports/view"
                viewFullReportState={{
                  imageUrl,
                  analysisId,
                  backTo: detailBackTo,
                  report,
                  planogramId: planogramId ?? undefined,
                }}
              />
            ) : (
              <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <p className="text-sm">
                  {reportLoadError ?? "Detailed report is unavailable for this historical analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
