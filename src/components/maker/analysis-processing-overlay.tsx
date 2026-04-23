import { Circle, Check, Loader2 } from "lucide-react";

import { PIPELINE_STEPS, SIMPLE_PROGRESS_STEPS } from "@/lib/analysis";
import { cn } from "@/lib/utils";

interface AnalysisProcessingOverlayProps {
  progressPercent: number;
  progressMessage?: string | null;
}

export function AnalysisProcessingOverlay({
  progressPercent,
  progressMessage,
}: AnalysisProcessingOverlayProps) {
  const simpleStepIndex = Math.min(
    SIMPLE_PROGRESS_STEPS.length - 1,
    Math.floor((progressPercent / 100) * SIMPLE_PROGRESS_STEPS.length),
  );
  const currentStepLabel = SIMPLE_PROGRESS_STEPS[simpleStepIndex] ?? "Processing";
  const pipelineStepIndex = Math.min(
    PIPELINE_STEPS.length - 1,
    Math.floor((progressPercent / 100) * PIPELINE_STEPS.length),
  );

  return (
    <div className="w-full max-w-2xl space-y-4 rounded-xl border border-border/60 bg-card/95 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Analyzing Fixture
          </p>
          <p className="text-base font-semibold text-foreground">{currentStepLabel}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          {progressPercent}%
        </div>
      </div>

      {progressMessage && (
        <p className="rounded-md border border-border/50 bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
          {progressMessage}
        </p>
      )}

      <div className="space-y-2">
        {SIMPLE_PROGRESS_STEPS.map((label, idx) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-md border px-2.5 py-2.5 text-sm transition-colors",
              idx < simpleStepIndex && "border-accent/30 bg-accent/10 text-foreground",
              idx === simpleStepIndex && "border-accent/40 bg-accent/15 text-foreground",
              idx > simpleStepIndex && "border-border/60 bg-muted/50 text-muted-foreground",
            )}
          >
            {idx < simpleStepIndex ? (
              <Check className="size-4 text-accent" aria-hidden />
            ) : idx === simpleStepIndex ? (
              <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
            ) : (
              <Circle className="size-3.5 text-muted-foreground/70" aria-hidden />
            )}
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-md border border-border/60 bg-muted/35 p-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Detailed Pipeline
        </p>
        <div className="grid gap-1.5">
          {PIPELINE_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-2 py-1.5 transition-colors",
                  idx < pipelineStepIndex && "border-accent/30 bg-accent/10",
                  idx === pipelineStepIndex && "border-accent/40 bg-accent/15",
                  idx > pipelineStepIndex && "border-border/50 bg-background/60",
                )}
              >
                <StepIcon
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    idx <= pipelineStepIndex
                      ? "text-accent"
                      : "text-muted-foreground/70",
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-xs font-medium",
                      idx <= pipelineStepIndex
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground/90">
                    {step.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <progress
        className="h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted/70 [&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent"
        value={progressPercent}
        max={100}
        aria-label="Analysis progress"
      />
    </div>
  );
}
