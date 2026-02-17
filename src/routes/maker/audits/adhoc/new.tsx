import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  Upload,
  ImageIcon,
  Box,
  Rows3,
  Database,
  PenLine,
  GitBranch,
  FileText,
  Sparkles,
} from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { SelectRuleSetModal } from "@/components/maker/select-rule-set-modal";
import { Button } from "@/components/ui/button";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";
import type { ComplianceRuleSetSummary } from "@/features/checker/api/knowledge-center";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/maker/audits/adhoc/new")({
  component: NewAdhocAnalysisPage,
});

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const PIPELINE_STEPS = [
  { id: "detection", label: "Product Detection", sub: "YOLOv8 + SAHI identify items", icon: Box },
  { id: "rows", label: "Shelf Rows", sub: "Deep Hough detects row boundaries", icon: Rows3 },
  { id: "recogn", label: "Recognition", sub: "CLIP embeddings match products", icon: Database },
  { id: "input", label: "Data Enrichment", sub: "User input refines matches", icon: PenLine },
  { id: "mapping", label: "Geometric Mapping", sub: "Logic maps layout & positions", icon: GitBranch },
  { id: "report", label: "Compliance Report", sub: "Planogram engine generates results", icon: FileText },
] as const;

type PipelineStepId = (typeof PIPELINE_STEPS)[number]["id"];

function NewAdhocAnalysisPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ruleSetModalOpen, setRuleSetModalOpen] = useState(false);
  const [selectedRuleSet, setSelectedRuleSet] = useState<ComplianceRuleSetSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStepId | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

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
      setUploadError(`File must be under ${MAX_SIZE_MB}MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
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

  const handleRunAnalysis = () => setRuleSetModalOpen(true);

  const handleRuleSetConfirm = () => {
    if (!selectedRuleSet) return;
    setRuleSetModalOpen(false);
    setIsAnalyzing(true);
    setCurrentStep("detection");
    setElapsedSeconds(0);

    const stepIds = PIPELINE_STEPS.map((s) => s.id);
    let stepIndex = 0;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      stepIndex += 1;
      if (stepIndex < stepIds.length) {
        setCurrentStep(stepIds[stepIndex]!);
      } else {
        clearInterval(interval);
        setAnalysisComplete(true);
        setIsAnalyzing(false);
        setCurrentStep(null);
        setTimeout(() => navigate({ to: "/maker/audits/adhoc" }), 1500);
      }
    }, 1500);
  };

  const progressPercent = currentStep
    ? ((PIPELINE_STEPS.findIndex((s) => s.id === currentStep) + 1) / PIPELINE_STEPS.length) * 100
    : analysisComplete
      ? 100
      : 0;

  const currentStepIndex = currentStep ? PIPELINE_STEPS.findIndex((s) => s.id === currentStep) : -1;
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll active step into view when analyzing
  useEffect(() => {
    if (isAnalyzing && currentStepIndex >= 0 && stepRefs.current[currentStepIndex]) {
      stepRefs.current[currentStepIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [isAnalyzing, currentStepIndex]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/maker/audits/adhoc">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">New Adhoc Analysis</h1>
              <p className="text-sm text-muted-foreground">
                {stores?.find((s) => s.id === selectedStoreId)?.name ?? "Select a store"}
              </p>
            </div>
          </header>

          {/* Pipeline: Horizontal stepper */}
          <section className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-1">How your image will be analyzed</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Six steps from upload to compliance report
            </p>
            <div
              ref={scrollContainerRef}
              className="flex gap-0 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 scroll-smooth"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "var(--border) transparent",
              }}
            >
              {PIPELINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone = currentStepIndex > idx || analysisComplete;
                const isPending = !isActive && !isDone;
                const isLast = idx === PIPELINE_STEPS.length - 1;
                const segmentProgress = currentStepIndex > idx ? 100 : 0;

                return (
                  <div
                    key={step.id}
                    ref={(el) => { stepRefs.current[idx] = el; }}
                    className="flex shrink-0 items-start"
                  >
                    <div className="flex flex-col items-center min-w-[88px] sm:min-w-[110px]">
                      <div
                        className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isDone && "border-chart-2 bg-chart-2 text-white",
                          isActive && "border-accent bg-accent text-accent-foreground ring-4 ring-accent/20",
                          isPending && "border-border bg-card text-muted-foreground"
                        )}
                      >
                        {isDone ? <Check className="size-3.5" strokeWidth={2.5} /> : <Icon className="size-3.5" />}
                      </div>
                      <p className={cn(
                        "mt-1.5 text-center text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 max-w-[88px] sm:max-w-[110px] px-0.5",
                        isActive ? "text-accent" : "text-foreground"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground text-center line-clamp-1 max-w-[88px] sm:max-w-[110px] px-0.5 mt-0.5" title={step.sub}>
                        {step.sub}
                      </p>
                    </div>
                    {!isLast && (
                      <div
                        className="flex-1 min-w-[16px] sm:min-w-[24px] h-0.5 mx-0.5 sm:mx-1 mt-4 relative bg-border rounded-full overflow-hidden shrink"
                        aria-hidden
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-chart-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${segmentProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Shelf View: Unified upload card */}
            <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm">
              <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Shelf image</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-muted-foreground cursor-not-allowed"
                  >
                    <Camera className="size-4" aria-hidden />
                    Take pic
                    <span className="ml-1 rounded bg-muted/80 px-1.5 py-0.5 text-[10px]">Phase 2</span>
                  </Button>
                  {imageFile && !isAnalyzing && (
                    <Button size="sm" onClick={handleRunAnalysis} className="bg-chart-2 text-white hover:opacity-90">
                      <Sparkles className="size-4" aria-hidden />
                      Run Analysis
                    </Button>
                  )}
                </div>
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
                <div className="relative group">
                  <div className="aspect-video w-full overflow-hidden bg-muted/50">
                    <img src={imagePreview} alt="Shelf preview" className="h-full w-full object-contain" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" onClick={triggerFileInput}>
                      <Upload className="size-4" aria-hidden />
                      Replace image
                    </Button>
                  </div>
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
                  <p className="text-sm font-medium text-foreground">Drop your shelf image here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  <p className="text-xs text-muted-foreground/80 mt-2">PNG, JPG, WebP · max {MAX_SIZE_MB}MB</p>
                </button>
              )}
              {uploadError && <p className="px-4 py-2 text-sm text-destructive">{uploadError}</p>}
            </section>

            {/* Analysis Status: Contextual panel */}
            <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
              </div>
              <div className="p-6 min-h-[280px] flex flex-col">
                {!imageFile ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted/80 p-5 mb-4">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="font-medium text-foreground">Upload to get started</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
                      Add a shelf photo and we&apos;ll run it through our AI pipeline to detect products, map layout, and check compliance.
                    </p>
                  </div>
                ) : isAnalyzing || analysisComplete ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {isAnalyzing ? (
                      <>
                        <div className="rounded-full bg-accent/20 p-4 mb-4">
                          <Loader2 className="h-10 w-10 animate-spin text-accent" aria-hidden />
                        </div>
                        <p className="font-medium text-foreground">Analyzing with AI</p>
                        <p className="text-sm text-muted-foreground mt-1">{elapsedSeconds}s elapsed</p>
                        <div className="mt-6 w-full max-w-[200px]">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Step {currentStepIndex + 1} of {PIPELINE_STEPS.length}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full bg-chart-2/20 p-4 mb-4">
                          <Check className="h-10 w-10 text-chart-2" strokeWidth={2} aria-hidden />
                        </div>
                        <p className="font-medium text-foreground">All done</p>
                        <p className="text-sm text-muted-foreground mt-1">Redirecting to your analyses...</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-chart-2/10 p-4 mb-4">
                      <Sparkles className="h-10 w-10 text-chart-2" aria-hidden />
                    </div>
                    <p className="font-medium text-foreground">Ready to analyze</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[260px]">
                      Click &quot;Run Analysis&quot; above, pick a compliance rule set, and we&apos;ll process your image through the pipeline.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <SelectRuleSetModal
        isOpen={ruleSetModalOpen}
        onClose={() => setRuleSetModalOpen(false)}
        selectedId={selectedRuleSet?.id ?? null}
        onSelect={setSelectedRuleSet}
        onConfirm={handleRuleSetConfirm}
        isRunning={false}
        autoSelectDefault
      />
    </MainLayout>
  );
}
