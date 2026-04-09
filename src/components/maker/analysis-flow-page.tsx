/**
 * Shelf Audit – Image Upload & Analysis
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
  Check,
  ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { ReportSnippetsView } from "@/components/maker";
import { PlanogramExpectedPanel } from "@/components/shared/compliance-report";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ImageComparisonData } from "@/lib/analysis/image-comparison-types";
import { MOCK_REPORT_SNIPPET, SIMPLE_PROGRESS_STEPS } from "@/lib/analysis";
import { useAnalysisPipeline } from "@/hooks/maker";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface AnalysisFlowPageProps {
  /** Page title */
  title: string;
  /** Route to navigate back to */
  backTo: string;
  /** Shelf name (planogram flow) */
  shelfName?: string;
  /** Planogram name (planogram flow) */
  planogramName?: string;
  /** Task context (e.g. "Weekly Compliance Audit") */
  taskContext?: string;
  /** Optional expected layout preview – React node or null (legacy) */
  expectedLayoutPreview?: React.ReactNode;
  /** Planogram expected data – planogram-based only. When provided, shows PlanogramExpectedPanel on the right. Not used in adhoc flow (upload stays full width). */
  planogramExpectedData?: ImageComparisonData;
  /** Whether to show a shelf selection dropdown */
  showShelfSelection?: boolean;
  /** Currently selected shelf id */
  selectedShelfId?: string;
  /** Callback when shelf changes */
  onShelfSelect?: (id: string) => void;
  /** Available shelves for selection */
  shelves?: Array<{ id: string; shelfName: string }>;
  /** Lock shelf selection (e.g. preselected from shelf actions) */
  isShelfSelectionLocked?: boolean;
}

export function AnalysisFlowPage({
  title,
  backTo,
  expectedLayoutPreview,
  planogramExpectedData,
  showShelfSelection,
  selectedShelfId,
  onShelfSelect,
  shelves,
  isShelfSelectionLocked = false,
}: AnalysisFlowPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [highlightedIssueIndex, setHighlightedIssueIndex] = useState<number | null>(null);

  const {
    isAnalyzing,
    currentStepIndex,
    analysisComplete,
    progressPercent,
    startAnalysis,
    resetAnalysis,
  } = useAnalysisPipeline({
    stepIntervalMs: 1500,
  });

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleReplaceImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    setHighlightedIssueIndex(null);
    resetAnalysis();
    // Open file picker so user can immediately select a new image
    requestAnimationFrame(() => fileInputRef.current?.click());
  }, [resetAnalysis]);

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

  const handleRunAnalysis = () => startAnalysis();

  const simpleStepIndex =
    currentStepIndex >= 0
      ? Math.min(Math.floor(currentStepIndex / 2), SIMPLE_PROGRESS_STEPS.length - 1)
      : 0;

  const state = !imageFile
    ? "before"
    : analysisComplete
      ? "results"
      : isAnalyzing
        ? "processing"
        : "ready";

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
                  Upload your shelf image to begin analysis
                </p>
              </div>
            </div>
            {showShelfSelection && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Select Shelf:</span>
                <Select
                  className="w-[200px] h-9"
                  value={selectedShelfId || ""}
                  onChange={(e) => onShelfSelect?.(e.target.value)}
                  aria-label="Select shelf"
                  disabled={isShelfSelectionLocked}
                >
                  <option value="">No shelf selected (Adhoc)</option>
                  {shelves?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shelfName}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </header>

          {state === "results" ? (
            <ReportSnippetsView
              imagePreview={imagePreview}
              report={MOCK_REPORT_SNIPPET}
              onReplaceImage={handleReplaceImage}
              highlightedIssueIndex={highlightedIssueIndex}
              onIssueClick={setHighlightedIssueIndex}
            />
          ) : (
            <div
              className={cn(
                "grid min-h-0 flex-1 gap-4",
                /* Planogram-based only: two columns (upload left, planogram right). Adhoc: single column, full width. */
                (planogramExpectedData ?? expectedLayoutPreview)
                  ? "lg:grid-cols-2 lg:min-h-0"
                  : "lg:grid-cols-1"
              )}
            >
              {/* Shelf View (left) */}
              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                  <h2 className="text-sm font-semibold text-foreground">Shelf image</h2>
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
                      Capture or Upload Shelf Image
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleFileSelect}
                  className="sr-only"
                  aria-label="Upload shelf image"
                />

                {imagePreview ? (
                  <div className="relative flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 w-full overflow-hidden bg-muted/50 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Shelf preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {state === "processing" && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="size-12 animate-spin text-white" aria-hidden />
                        <div className="space-y-2 text-center">
                          {SIMPLE_PROGRESS_STEPS.map((label, idx) => (
                            <p
                              key={label}
                              className={cn(
                                "text-sm font-medium",
                                idx <= simpleStepIndex ? "text-white" : "text-white/60"
                              )}
                            >
                              {idx < simpleStepIndex ? (
                                <Check className="inline size-4 mr-2" aria-hidden />
                              ) : idx === simpleStepIndex ? (
                                <Loader2 className="inline size-4 mr-2 animate-spin" aria-hidden />
                              ) : (
                                <span className="inline-block w-3 h-3 mr-2" aria-hidden />
                              )}
                              {label}
                            </p>
                          ))}
                        </div>
                        <div className="w-48 h-1.5 rounded-full bg-white/30 overflow-hidden">
                          <div
                            className="h-full bg-chart-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
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
                      Drop your shelf image here
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

              {/* Right panel: Planogram (Expected) – same as Image Comparison tab */}
              {planogramExpectedData && (
                <PlanogramExpectedPanel
                  data={planogramExpectedData}
                  variant="preview"
                  className="min-h-0"
                />
              )}
              {/* Legacy: custom expected layout preview */}
              {!planogramExpectedData && expectedLayoutPreview && (
                <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm">
                  <div className="border-b border-border px-3 py-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      Expected Layout
                    </h2>
                  </div>
                  <div className="min-h-[280px] overflow-auto p-4">
                    {expectedLayoutPreview}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
