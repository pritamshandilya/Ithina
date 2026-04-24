/**
 * Fixture Audit – Image Upload & Analysis
 *
 * Shared for adhoc and planogram-based flows.
 * Three states: Before Upload, Processing, Results.
 *
 * Maker-focused: no AI pipeline details, simple operational language.
 */

import { Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ImageIcon,
  Upload,
} from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { ReportSnippetsView } from "@/components/maker";
import { AnalysisProcessingOverlay } from "@/components/maker/analysis-processing-overlay";
import { Modal } from "@/components/ui/modal";
import { PlanogramRenderedPreview } from "@/features/planogram-library/planogram-rendered-preview";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  type ReportSnippet,
  getAnnotatedImagePreview,
  mapAnalysisResultToReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";
import {
  runFixtureAnalysis,
} from "@/queries/maker/api/analysis";
import { useStoreFixtures } from "@/queries/maker";
import { useStore } from "@/providers/store";
import { useToast } from "@/hooks/use-toast";
import type { PlanogramPayload } from "@/types/planogram";
import type { AnalysisType } from "@/models/response/analysis";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface AnalysisFlowPageProps {
  /** Page title */
  title: string;
  /** Route to navigate back to */
  backTo: string;
  /** Fixture name (planogram flow) */
  shelfName?: string;
  /** Planogram name (planogram flow) */
  planogramName?: string;
  /** Task context (e.g. "Weekly Compliance Audit") */
  taskContext?: string;
  /** Optional expected layout preview – React node or null (legacy) */
  expectedLayoutPreview?: React.ReactNode;
  /** Full planogram payload shown as expected layout (planogram flow). */
  planogramPayload?: PlanogramPayload | null;
  /** Whether to show a fixture selection dropdown */
  showShelfSelection?: boolean;
  /** Currently selected fixture id */
  selectedShelfId?: string;
  /** Callback when fixture changes */
  onShelfSelect?: (id: string) => void;
  /** Available fixtures for selection */
  shelves?: Array<{ id: string; shelfName: string }>;
  /** Lock fixture selection (e.g. preselected from fixture actions) */
  isShelfSelectionLocked?: boolean;
  /** Force fixture for analysis submit (planogram flow). */
  fixedFixtureId?: string;
  /** Force planogram for analysis submit (planogram flow). */
  fixedPlanogramId?: string;
  /** Optional override for compliance rule set id. */
  complianceRuleSetId?: string | null;
  /** Backend analysis mode to execute. */
  analysisType?: AnalysisType;
}

export function AnalysisFlowPage({
  title,
  backTo,
  planogramPayload,
  showShelfSelection,
  selectedShelfId,
  onShelfSelect,
  shelves,
  isShelfSelectionLocked = false,
  fixedFixtureId,
  fixedPlanogramId,
  complianceRuleSetId,
  analysisType = "ADHOC",
}: AnalysisFlowPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedStore } = useStore();
  const { toast } = useToast();
  const { data: fixtures = [] } = useStoreFixtures();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [highlightedIssueIndex, setHighlightedIssueIndex] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [report, setReport] = useState<ReportSnippet | null>(null);
  const [analysisPlanogramId, setAnalysisPlanogramId] = useState<string | null>(null);

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
        `File must be under ${MAX_SIZE_MB}MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`
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
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleRunAnalysis = useCallback(async () => {
    if (!imageFile) {
      setUploadError("Please upload an image before running analysis.");
      return;
    }

    const fixtureId = fixedFixtureId ?? selectedShelfId;
    if (!fixtureId) {
      setUploadError("Please select a fixture.");
      return;
    }

    const fixture = fixtures.find((item) => item.id === fixtureId);
    const planogramId =
      fixedPlanogramId ??
      (fixture?.planogram_id ?? null);
    const ruleSetId =
      complianceRuleSetId ?? selectedStore?.default_compliance_rule_set_id ?? null;

    if (!ruleSetId) {
      setUploadError("No compliance rule set is configured for this store.");
      return;
    }

    try {
      setAnalysisPlanogramId(planogramId);
      setUploadError(null);
      setIsAnalyzing(true);
      setAnalysisComplete(false);
      setProgressPercent(5);
      setProgressMessage("Analysis started");

      const currentJob = await runFixtureAnalysis(
        {
          fixtureId,
          image: imageFile,
          analysisType,
          complianceRuleSetId: ruleSetId,
        },
        {
          onProgress: (update) => {
            if (update.progressMessage) {
              setProgressMessage(update.progressMessage);
            }
            if (typeof update.progressPercent === "number") {
              setProgressPercent(
                Math.max(0, Math.min(100, Math.round(update.progressPercent))),
              );
            }
          },
        },
      );

      setProgressMessage(currentJob.progress_message ?? null);
      if (typeof currentJob.progress_pct === "number") {
        setProgressPercent(Math.max(0, Math.min(100, Math.round(currentJob.progress_pct))));
      }

      if (currentJob.status === "FAILED") {
        throw new Error(currentJob.error_message ?? "Analysis job failed.");
      }

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
      setAnalysisComplete(true);
      toast({
        title: "Analysis completed",
        description: "Latest analysis result has been loaded.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to run analysis.";
      setUploadError(message);
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
    selectedShelfId,
    fixtures,
    fixedPlanogramId,
    complianceRuleSetId,
    analysisType,
    selectedStore?.default_compliance_rule_set_id,
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
      <div className="flex min-h-full flex-col bg-primary pt-2 px-2 pb-2 sm:pt-3 sm:px-2 sm:pb-3 lg:pt-4 lg:px-2 lg:pb-4">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-2 lg:gap-3">
          <header className="flex shrink-0 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to={backTo}>
                  <ArrowLeft className="size-4" aria-hidden />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <div className="space-y-0.5">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
                <p className="text-xs text-muted-foreground">
                  Upload your fixture image to begin analysis
                </p>
              </div>
            </div>
            {showShelfSelection && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Select Fixture:</span>
                <Select
                  className="w-[200px] h-9"
                  value={selectedShelfId || ""}
                  onChange={(e) => onShelfSelect?.(e.target.value)}
                  aria-label="Select fixture"
                  disabled={isShelfSelectionLocked}
                >
                  <option value="">No fixture selected</option>
                  {shelves?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shelfName}
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
              viewFullReportState={{
                imageUrl: imagePreview ?? undefined,
                report,
                planogramId: analysisPlanogramId ?? undefined,
                backTo,
              }}
            />
          ) : (
            <div
              className={cn(
                "grid min-h-0 flex-1 gap-4 lg:grid-cols-1"
              )}
            >
              {/* Fixture View (left) */}
              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                  <h2 className="text-sm font-semibold text-foreground">Fixture image</h2>
                  {state === "processing" && (
                    <span className="text-xs text-muted-foreground">Analyzing…</span>
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
                  <div className="relative flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 w-full overflow-hidden bg-muted/50 flex items-center justify-center">
                      <img src={imagePreview} alt="Fixture preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    {(state === "before" || state === "ready") && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={triggerFileInput}>
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
                    className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-b-xl border-2 border-dashed border-border px-4 py-6 transition-all hover:border-accent/50 hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <div className="mb-2 rounded-full bg-accent/10 p-3">
                      <ImageIcon className="h-8 w-8 text-accent" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Drop your fixture image here
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      PNG, JPG, WebP · max {MAX_SIZE_MB}MB
                    </p>
                  </button>
                )}
                {uploadError && (
                  <p className="px-4 py-2 text-sm text-destructive shrink-0">{uploadError}</p>
                )}
              </section>

              {/* Expected planogram view shown below upload panel. */}
              {planogramPayload && (
                <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm">
                  <div className="shrink-0 border-b border-border px-3 py-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      Associated Planogram
                    </h2>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto p-3">
                    <PlanogramRenderedPreview payload={planogramPayload} embedded />
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
