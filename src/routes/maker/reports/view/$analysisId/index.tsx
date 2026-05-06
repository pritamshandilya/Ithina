import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { ComplianceReportFull } from "@/components/shared/complianceReport";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
  getAnnotatedImagePreview,
  mapAnalysisResultToAllIssuesReportData,
  mapAnalysisResultToAllItemsReportData,
  mapAnalysisResultToReportSnippet,
  mapPlanogramPayloadToAllItemsReportData,
} from "@/lib/analysis";
import { exportReportToPdf } from "@/lib/reports/PdfExport";
import { getRelativePath } from "@/lib/utils";
import { usePlanogramById } from "@/queries/maker";
import { fetchAnalysisJob } from "@/lib/api/maker/analysis";

export const Route = createFileRoute("/maker/reports/view/$analysisId/")({
  component: FullReportByAnalysisPage,
  meta: {
    layoutMode: "fullReport",
  },
});

function FullReportByAnalysisPage() {
  const { analysisId } = Route.useParams();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as
    | {
        imageUrl?: string;
        backTo?: string;
        planogramId?: string;
      }
    | undefined;

  const backTo = getRelativePath(state?.backTo ?? "/maker/historical-analysis");
  const [report, setReport] = useState<ReturnType<
    typeof mapAnalysisResultToReportSnippet
  > | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    state?.imageUrl ?? null,
  );
  const [planogramId, setPlanogramId] = useState<string | null>(
    state?.planogramId ?? null,
  );
  const [allItems, setAllItems] = useState<ReturnType<
    typeof mapAnalysisResultToAllItemsReportData
  > | null>(null);
  const [allIssues, setAllIssues] = useState<ReturnType<
    typeof mapAnalysisResultToAllIssuesReportData
  > | null>(null);
  const [analysisResult, setAnalysisResult] = useState<
    Awaited<ReturnType<typeof fetchAnalysisJob>>["result"] | null
  >(null);
  const [analysisType, setAnalysisType] = useState<
    "PLANOGRAM" | "ADHOC" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { data: planogramPayload } = usePlanogramById(planogramId);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const job = await fetchAnalysisJob(analysisId);
        if (!isMounted) return;
        if (!job.result) {
          setReport(null);
          setImageUrl(null);
          setPlanogramId(job.planogram_id);
          setAnalysisResult(null);
          setAnalysisType(job.analysis_type);
          return;
        }

        setAnalysisResult(job.result);
        setAnalysisType(job.analysis_type);
        setReport(mapAnalysisResultToReportSnippet(job.result));
        setAllIssues(mapAnalysisResultToAllIssuesReportData(job.result));
        setImageUrl(getAnnotatedImagePreview(job.result, job.image_mime_type));
        setPlanogramId(job.planogram_id);
      } catch {
        if (!isMounted) return;
        setReport(null);
        setAllItems(null);
        setAllIssues(null);
        setAnalysisResult(null);
        setAnalysisType(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  useEffect(() => {
    if (!analysisResult) {
      setAllItems(null);
      return;
    }

    if (analysisType === "PLANOGRAM" && planogramPayload) {
      setAllItems(
        mapPlanogramPayloadToAllItemsReportData(
          planogramPayload,
          analysisResult,
        ),
      );
      return;
    }

    setAllItems(mapAnalysisResultToAllItemsReportData(analysisResult));
  }, [analysisResult, analysisType, planogramPayload]);

  const handleExportPdf = async () => {
    if (!report || isExporting) return;
    setIsExporting(true);
    try {
      await exportReportToPdf({
        data: {
          report,
          imageUrl: imageUrl ?? null,
          allItems: allItems ?? undefined,
          allIssues: allIssues ?? undefined,
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-primary flex h-full min-h-0 flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground text-sm">Loading report...</p>
        </div>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout>
        <div className="bg-primary flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-foreground text-base font-semibold">
            Full report is unavailable
          </p>
          <p className="text-muted-foreground max-w-md text-sm">
            No report payload is available for this analysis.
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
            allItems={allItems}
            allIssues={allIssues}
            analysisType={analysisType}
            backTo={backTo}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExporting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
