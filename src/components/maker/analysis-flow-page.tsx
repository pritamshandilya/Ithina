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
import { HeaderContextBar, ReportSnippetsView } from "@/components/maker";
import { Button } from "@/components/ui/button";
import {
  useAnalysisPipeline,
  MOCK_REPORT_SNIPPET,
  SIMPLE_PROGRESS_STEPS,
} from "@/features/maker/analysis";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";
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
  /** Optional expected layout preview – React node or null */
  expectedLayoutPreview?: React.ReactNode;
}

export function AnalysisFlowPage({
  title,
  backTo,
  shelfName,
  planogramName,
  taskContext,
  expectedLayoutPreview,
}: AnalysisFlowPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

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
  } = useAnalysisPipeline({
    stepIntervalMs: 1500,
  });

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
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

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setHighlightedIssueIndex(null);
  }, []);

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
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={backTo}>
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {stores?.find((s) => s.id === selectedStoreId)?.name ?? "Select a store"}
              </p>
            </div>
          </header>

          {/* STATE 3: Results header */}
          {state === "results" && (shelfName || planogramName) && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {shelfName && <span>{shelfName}</span>}
              {shelfName && planogramName && <span>|</span>}
              {planogramName && <span>{planogramName}</span>}
              {taskContext && (
                <>
                  <span>|</span>
                  <span>{taskContext}</span>
                </>
              )}
            </div>
          )}

          {state === "results" ? (
            <ReportSnippetsView
              imagePreview={imagePreview}
              report={MOCK_REPORT_SNIPPET}
              onRetake={handleReset}
              onReplaceImage={triggerFileInput}
              onSubmitAudit={() => {
                /* TODO: submit audit */
              }}
              onSubmitAnyway={() => {
                /* TODO: submit anyway */
              }}
              highlightedIssueIndex={highlightedIssueIndex}
              onIssueClick={setHighlightedIssueIndex}
            />
          ) : (
            <div
              className={cn(
                "grid gap-6",
                expectedLayoutPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"
              )}
            >
              {/* Shelf View */}
              <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm">
                <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Shelf image</h2>
                  {state === "processing" && (
                    <span className="text-xs text-muted-foreground">Analyzing…</span>
                  )}
                  {state === "ready" && (
                    <Button
                      size="sm"
                      onClick={handleRunAnalysis}
                      className="bg-chart-2 text-white hover:opacity-90"
                    >
                      Run Analysis
                    </Button>
                  )}
                  {state === "before" && (
                    <Button
                      size="sm"
                      onClick={triggerFileInput}
                      className="bg-chart-2 text-white hover:opacity-90"
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
                  <div className="relative">
                    <div className="aspect-video w-full overflow-hidden bg-muted/50">
                      <img
                        src={imagePreview}
                        alt="Shelf preview"
                        className="h-full w-full object-contain"
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
                    className="w-full flex flex-col items-center justify-center py-20 px-6 transition-all hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-b-xl border-2 border-dashed border-border hover:border-accent/50"
                  >
                    <div className="rounded-full bg-accent/10 p-4 mb-4">
                      <ImageIcon className="h-10 w-10 text-accent" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Drop your shelf image here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                    <p className="text-xs text-muted-foreground/80 mt-2">
                      PNG, JPG, WebP · max {MAX_SIZE_MB}MB
                    </p>
                  </button>
                )}
                {uploadError && (
                  <p className="px-4 py-2 text-sm text-destructive">{uploadError}</p>
                )}
              </section>

              {/* Right panel: Planogram preview (planogram-based only) */}
              {expectedLayoutPreview && (
                <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Expected Layout
                    </h2>
                  </div>
                  <div className="p-6 min-h-[280px] overflow-auto">
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
