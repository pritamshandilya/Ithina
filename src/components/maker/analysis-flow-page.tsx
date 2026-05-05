/**
 * Fixture Audit – Image Upload & Analysis
 *
 * Shared for adhoc and planogram-based flows.
 * Three states: Before Upload, Processing, Results.
 *
 * Maker-focused: no AI pipeline details, simple operational language.
 */
import { Camera, ImageIcon, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { DetailBackButton } from "@/components/shared/detail-back-button";
import { ReportSnippetsView } from "@/components/maker";
import { AnalysisProcessingOverlay } from "@/components/maker/analysis-processing-overlay";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { PlanogramRenderedPreview } from "@/features/planogram-library/planogram-rendered-preview";
import { useToast } from "@/hooks/use-toast";
import {
  type ReportSnippet,
  getAnnotatedImagePreview,
  mapAnalysisResultToReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";
import type { AnalysisType } from "@/models/response/analysis";
import { useStoreFixtures } from "@/queries/maker";
import { runFixtureAnalysis } from "@/queries/maker/api/analysis";
import type { PlanogramPayload } from "@/types/planogram";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface AnalysisFlowPageProps {
  /** Page title */
  title: string;
  /** Route to navigate back to */
  backTo: string;
  /** Fixture name (planogram flow) */
  fixtureName?: string;
  /** Planogram name (planogram flow) */
  planogramName?: string;
  /** Task context (e.g. "Weekly Compliance Audit") */
  taskContext?: string;
  /** Optional expected layout preview – React node or null (legacy) */
  expectedLayoutPreview?: React.ReactNode;
  /** Full planogram payload shown as expected layout (planogram flow). */
  planogramPayload?: PlanogramPayload | null;
  /** Whether to show a fixture selection dropdown */
  showFixtureSelection?: boolean;
  /** Currently selected fixture id */
  selectedFixtureId?: string;
  /** Callback when fixture changes */
  onFixtureSelect?: (id: string) => void;
  /** Available fixtures for selection */
  fixtures?: Array<{ id: string; code: string; fixtureName: string }>;
  /** Lock fixture selection (e.g. preselected from fixture actions) */
  isFixtureSelectionLocked?: boolean;
  /** Force fixture for analysis submit (planogram flow). */
  fixedFixtureId?: string;
  /** Force planogram for analysis submit (planogram flow). */
  fixedPlanogramId?: string;
  /** Backend analysis mode to execute. */
  analysisType?: AnalysisType;
}

export function AnalysisFlowPage({
  title,
  backTo,
  fixtureName: _fixtureName,
  planogramName: _planogramName,
  planogramPayload,
  showFixtureSelection,
  selectedFixtureId,
  onFixtureSelect,
  fixtures: fixtureOptions,
  isFixtureSelectionLocked = false,
  fixedFixtureId,
  fixedPlanogramId,
  analysisType = "ADHOC",
}: AnalysisFlowPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: storeFixtures = [] } = useStoreFixtures();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [highlightedIssueIndex, setHighlightedIssueIndex] = useState<
    number | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [report, setReport] = useState<ReportSnippet | null>(null);
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const [analysisPlanogramId, setAnalysisPlanogramId] = useState<string | null>(
    null,
  );
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleReplaceImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    setHighlightedIssueIndex(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setProgressPercent(0);
    setProgressMessage(null);
    setReport(null);
    setAnalysisJobId(null);
    setAnalysisPlanogramId(null);
    // Open file picker so user can immediately select a new image
    requestAnimationFrame(() => fileInputRef.current?.click());
  }, []);

  const processFile = useCallback((file: File) => {
    setUploadError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(`Please use PNG, JPG, or WebP. Got: ${file.type}`);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(
        `File must be under ${MAX_SIZE_MB}MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      );
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    [],
  );

  const handleRunAnalysis = useCallback(async () => {
    if (!imageFile) {
      setUploadError("Please upload an image before running analysis.");
      return;
    }

    const fixtureId = fixedFixtureId ?? selectedFixtureId;
    if (!fixtureId) {
      setUploadError("Please select a fixture.");
      return;
    }

    const fixture = storeFixtures.find((item) => item.id === fixtureId);
    const planogramId = fixedPlanogramId ?? fixture?.planogram_id ?? null;

    try {
      setUploadError(null);
      setIsAnalyzing(true);
      setAnalysisComplete(false);
      setProgressPercent(5);
      setProgressMessage("Submitting analysis job...");

      const currentJob = await runFixtureAnalysis(
        {
          fixtureId,
          image: imageFile,
          analysisType,
          planogramId,
        },
        {
          onProgress: (update) => {
            if (typeof update.progressPercent === "number") {
              setProgressPercent(
                Math.max(0, Math.min(100, Math.round(update.progressPercent))),
              );
            }
            if (typeof update.progressMessage === "string") {
              setProgressMessage(update.progressMessage);
            }
          },
        },
      );
      if (typeof currentJob.progress_pct === "number") {
        setProgressPercent(
          Math.max(0, Math.min(100, Math.round(currentJob.progress_pct))),
        );
      }

      if (currentJob.status === "FAILED") {
        throw new Error(currentJob.error_message ?? "Analysis job failed.");
      }

      setAnalysisJobId(currentJob.id);
      setAnalysisPlanogramId(currentJob.planogram_id ?? planogramId);
      const mappedResult = mapAnalysisResultToReportSnippet(currentJob.result);
      setReport(mappedResult);
      const annotatedImagePreview = getAnnotatedImagePreview(
        currentJob.result,
        currentJob.image_mime_type,
      );
      if (annotatedImagePreview) {
        setImagePreview(annotatedImagePreview);
      }
      setProgressPercent(100);
      setProgressMessage("Analysis completed. Preparing results...");
      setAnalysisComplete(true);
      toast({
        title: "Analysis completed",
        description: "Latest analysis result has been loaded.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to run analysis.";
      setUploadError(message);
      setProgressMessage(null);
      toast({
        title: "Analysis failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    imageFile,
    fixedFixtureId,
    selectedFixtureId,
    storeFixtures,
    fixedPlanogramId,
    analysisType,
    toast,
  ]);

  const state = !imageFile
    ? "before"
    : analysisComplete
      ? "results"
      : isAnalyzing
        ? "processing"
        : "ready";
  const hasResults = state === "results" && report !== null;

  return (
    <MainLayout>
      <div className="bg-primary flex min-h-full flex-col px-2 pt-2 pb-2 sm:px-2 sm:pt-3 sm:pb-3 lg:px-2 lg:pt-4 lg:pb-4">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-2 lg:gap-3">
          <header className="flex shrink-0 items-center justify-between gap-4">
            <div className="flex w-full items-center gap-2">
              <DetailBackButton to={backTo} />
              <div className="flex w-full items-center justify-between space-y-0.5">
                <div>
                  <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                    {title}
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    Upload your fixture image to begin analysis
                  </p>
                </div>
              </div>
            </div>
            {showFixtureSelection && (
              <div className="flex items-center gap-2">
                <span className="text-foreground shrink-0 whitespace-nowrap text-sm font-medium">
                  Select Fixture:
                </span>
                <Select
                  className="h-9 w-[200px]"
                  value={selectedFixtureId || ""}
                  onChange={(e) => onFixtureSelect?.(e.target.value)}
                  aria-label="Select fixture"
                  disabled={isFixtureSelectionLocked}
                >
                  <option value="">No fixture selected</option>
                  {fixtureOptions?.map((fixture) => (
                    <option key={fixture.id} value={fixture.id}>
                      {`${fixture.code.trim()} (${fixture.fixtureName.trim()})`}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </header>

          {hasResults ? (
            <ReportSnippetsView
              imagePreview={imagePreview}
              report={report}
              onReplaceImage={handleReplaceImage}
              highlightedIssueIndex={highlightedIssueIndex}
              onIssueClick={setHighlightedIssueIndex}
              viewFullReportTo={
                analysisJobId
                  ? `/maker/reports/view/${analysisJobId}`
                  : "/maker/reports/view"
              }
              viewFullReportState={{
                imageUrl: imagePreview ?? undefined,
                report,
                planogramId: analysisPlanogramId ?? undefined,
                backTo,
              }}
            />
          ) : (
            <div className={cn("grid min-h-0 flex-1 gap-4 lg:grid-cols-1")}>
              {/* Fixture View (left) */}
              <section className="border-border bg-card/80 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm">
                <div className="border-border flex shrink-0 items-center justify-between border-b px-3 py-2">
                  <h2 className="text-foreground text-sm font-semibold">
                    Fixture image
                  </h2>
                  {state === "processing" && (
                    <span className="text-muted-foreground text-xs">
                      Analyzing…
                    </span>
                  )}
                  {state === "ready" && (
                    <Button
                      size="sm"
                      onClick={handleRunAnalysis}
                      variant="success"
                    >
                      Run Analysis
                    </Button>
                  )}
                  {state === "before" && (
                    <Button
                      size="sm"
                      onClick={triggerFileInput}
                      variant="success"
                    >
                      <Camera className="size-4" aria-hidden />
                      Capture or Upload Fixture Image
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleFileSelect}
                  className="sr-only"
                  aria-label="Upload fixture image"
                />

                {imagePreview ? (
                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <div className="bg-muted/50 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Fixture preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {(state === "before" || state === "ready") && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={triggerFileInput}
                        >
                          <Upload className="size-4" aria-hidden />
                          Replace image
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-border hover:border-accent/50 hover:bg-accent/5 focus:ring-ring flex min-h-0 flex-1 flex-col items-center justify-center rounded-b-xl border-2 border-dashed px-4 py-6 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    <div className="bg-accent/10 mb-2 rounded-full p-3">
                      <ImageIcon className="text-accent h-8 w-8" aria-hidden />
                    </div>
                    <p className="text-foreground text-sm font-medium">
                      Drop your fixture image here
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      or click to browse
                    </p>
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      PNG, JPG, WebP · max {MAX_SIZE_MB}MB
                    </p>
                  </button>
                )}
                {uploadError && (
                  <p className="text-destructive shrink-0 px-4 py-2 text-sm">
                    {uploadError}
                  </p>
                )}
              </section>

              {/* Expected planogram view shown below upload panel. */}
              {planogramPayload && (
                <section className="border-border bg-card/80 flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm">
                  <div className="border-border shrink-0 border-b px-3 py-2">
                    <h2 className="text-foreground text-sm font-semibold">
                      Associated Planogram
                    </h2>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto p-3">
                    <PlanogramRenderedPreview
                      payload={planogramPayload}
                      embedded
                    />
                  </div>
                </section>
              )}
              {/* Legacy: custom expected layout preview */}
              {/* {!planogramPayload && expectedLayoutPreview && (
                <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm">
                  <div className="border-b border-border px-3 py-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      Legacy Expected Layout
                    </h2>
                  </div>
                  <div className="min-h-[280px] overflow-auto p-4">
                    {expectedLayoutPreview}
                  </div>
                </section>
              )} */}
            </div>
          )}
          <Modal
            isOpen={state === "processing"}
            // isOpen={true}
            onClose={() => undefined}
            className="max-w-3xl"
            overlayClassName="bg-black/55 backdrop-blur-[2px]"
          >
            <AnalysisProcessingOverlay
              progressPercent={progressPercent}
              progressMessage={progressMessage}
            />
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
}
