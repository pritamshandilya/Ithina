/**
 * Historical Analysis Detail
 *
 * Shows the analysis results (summary view) for a past adhoc or planogram run.
 * Replace and Send for Approval are hidden for historical runs.
 */
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import placeholderShelf from "@/assets/placeholder-shelf.jpg";
import MainLayout from "@/components/layouts/main";
import { ReportSnippetsView } from "@/components/maker";
import { DetailBackButton } from "@/components/shared/detail-back-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ReportSnippet,
  mapAnalysisResultToReportSnippet,
} from "@/lib/analysis";
import { getRelativePath } from "@/lib/utils";
import { fetchAnalysisJob } from "@/queries/maker/api/analysis";

export const Route = createFileRoute("/maker/historical-analysis/$analysisId/")(
  {
    component: HistoricalAnalysisDetailPage,
    validateSearch: (
      search: Record<string, unknown>,
    ): { type?: "adhoc" | "planogram"; backTo?: string } => ({
      type:
        search.type === "adhoc" || search.type === "planogram"
          ? search.type
          : undefined,
      backTo: typeof search.backTo === "string" ? search.backTo : undefined,
    }),
  },
);

function HistoricalAnalysisDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisId } = Route.useParams();
  const { type, backTo: backToSearch } = Route.useSearch();
  const backTo = getRelativePath(backToSearch ?? "/maker/historical-analysis");
  const detailQuery = new URLSearchParams();
  if (type) detailQuery.set("type", type);
  if (backToSearch) detailQuery.set("backTo", backToSearch);
  const detailBackTo = `${getRelativePath(location.pathname)}${
    detailQuery.toString() ? `?${detailQuery.toString()}` : ""
  }`;

  const [report, setReport] = useState<ReportSnippet | null>(null);
  const [imageUrl, setImageUrl] = useState(placeholderShelf);
  const [planogramName, setPlanogramName] = useState<string | null>(null);
  const [planogramId, setPlanogramId] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [reportLoadError, setReportLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAnalysisResult = async () => {
      setIsReportLoading(true);
      setReportLoadError(null);
      try {
        const job = await fetchAnalysisJob(analysisId);
        if (!isMounted) return;
        if (!job.result) {
          setReport(null);
          setReportLoadError(
            "Detailed report is unavailable for this historical analysis.",
          );
          setImageUrl(placeholderShelf);
          setPlanogramId(job.planogram_id);
          setPlanogramName(null);
          return;
        }

        const mappedReport = mapAnalysisResultToReportSnippet(job.result);
        setReport(mappedReport);
        setPlanogramId(job.planogram_id);
        setPlanogramName(mappedReport.planogramName ?? null);
        setImageUrl(job?.result?.annotated_image ?? placeholderShelf);
      } catch {
        if (!isMounted) return;
        setReport(null);
        setReportLoadError("Unable to load this historical report.");
        setImageUrl(placeholderShelf);
        setPlanogramName(null);
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
  }, [analysisId]);

  const subtitle = report
    ? planogramName
      ? `Planogram "${planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
      : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : planogramName
      ? `Planogram "${planogramName}" • report details unavailable`
      : "Report details unavailable";

  return (
    <MainLayout>
      <div className="bg-primary flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center gap-2 pb-4">
            <DetailBackButton onClick={() => navigate({ to: backTo })} />
            <div className="space-y-0.5">
              <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                Combined Compliance & Analysis Report
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {subtitle}
              </p>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto">
            {isReportLoading ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-9 w-36" />
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr]">
                  <section className="border-border bg-card/80 rounded-xl border p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-4 h-[320px] w-full" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </section>
                  <section className="border-border bg-card/80 rounded-xl border p-4">
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
                viewFullReportTo={`/maker/reports/view/${analysisId}`}
                viewFullReportState={{
                  imageUrl,
                  analysisId,
                  backTo: detailBackTo,
                  report,
                  planogramId: planogramId ?? undefined,
                }}
              />
            ) : (
              <div className="text-muted-foreground flex h-full min-h-0 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm">
                  {reportLoadError ??
                    "Detailed report is unavailable for this historical analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
