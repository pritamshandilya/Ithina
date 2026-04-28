import { Loader2, Sparkles } from "lucide-react";

interface AnalysisProcessingOverlayProps {
  progressPercent: number;
  progressMessage?: string | null;
  showMercureMessage?: boolean;
}

export function AnalysisProcessingOverlay({
  progressPercent,
  progressMessage,
  showMercureMessage = true,
}: AnalysisProcessingOverlayProps) {
  const clampedProgress = Math.max(
    0,
    Math.min(100, Math.round(progressPercent)),
  );

  return (
    <div className="border-border bg-card/95 w-full max-w-2xl rounded-2xl border p-6 shadow-[0_24px_55px_rgba(3,8,20,0.34)]">
      <div className="space-y-5">
        <div className="space-y-4 text-center">
          <div className="border-accent/35 bg-accent/12 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border">
            <Loader2 className="text-accent size-7 animate-spin" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
              Running AI Fixture Analysis
            </p>
            <p className="text-foreground text-lg font-semibold">
              {showMercureMessage && progressMessage
                ? progressMessage
                : "Waiting for stage update..."}
            </p>
          </div>
        </div>

        <div className="border-border/80 bg-secondary/70 space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-foreground text-sm font-semibold">
              Overall progress
            </p>
            <span className="border-accent/35 bg-accent/12 text-accent inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" aria-hidden />
              {clampedProgress}%
            </span>
          </div>
          <progress
            className="[&::-webkit-progress-bar]:bg-muted/70 [&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent h-2 w-full overflow-hidden rounded-full"
            value={clampedProgress}
            max={100}
            aria-label="Analysis progress"
          />
          <div className="text-muted-foreground flex items-center justify-between text-[11px]">
            <span>Submitted</span>
            <span>Processing</span>
            <span>{clampedProgress >= 100 ? "Completed" : "Finalizing"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
