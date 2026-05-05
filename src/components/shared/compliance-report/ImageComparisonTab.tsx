/**
 * Image Comparison Tab
 *
 * Side-by-side: Planogram (expected layout) vs Real Shelf (captured image).
 * Non-compliant items are highlighted with color-coded borders.
 */
import { ImageIcon } from "lucide-react";
import { Fragment } from "react";

import { PlanogramExpectedPanel } from "./PlanogramExpectedPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mapPlanogramPayloadToImageComparisonData } from "@/lib/analysis";
import type {
  DetectionOverlay,
  DetectionOverlayStatus,
  ImageComparisonData,
} from "@/lib/analysis/image-comparison-types";
import { cn } from "@/lib/utils";
import type { PlanogramPayload } from "@/types/planogram";

const DETECTION_LEGEND: { color: string; label: string }[] = [
  { color: "bg-chart-2", label: "Compliant" },
  { color: "bg-action-warning", label: "Misplaced" },
  { color: "bg-destructive", label: "Issue / Missing" },
  { color: "bg-blue-500", label: "Extra" },
];

const OVERLAY_BORDER: Record<DetectionOverlayStatus, string> = {
  compliant: "border-chart-2",
  misplaced: "border-action-warning",
  missing: "border-destructive",
  extra: "border-blue-500",
};

function RealShelfWithOverlays({
  imageUrl,
  overlays = [],
}: {
  imageUrl: string;
  overlays?: DetectionOverlay[];
}) {
  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="relative mx-auto w-fit max-w-full">
        <img
          src={imageUrl}
          alt="Captured shelf"
          className="block h-auto max-w-full object-contain"
        />
        {overlays.length > 0 && (
          <div className="absolute inset-0" aria-hidden>
            {overlays.map((o) => {
              const box = (
                <div
                  className={cn(
                    "absolute flex flex-col justify-end border-2 bg-black/5 p-0.5",
                    OVERLAY_BORDER[o.status],
                  )}
                  style={{
                    left: `${o.xPercent}%`,
                    top: `${o.yPercent}%`,
                    width: `${o.widthPercent}%`,
                    height: `${o.heightPercent}%`,
                  }}
                >
                  <span className="text-foreground truncate text-[10px] leading-tight font-medium">
                    {o.label}
                  </span>
                </div>
              );
              return o.tooltip ? (
                <Tooltip key={o.id}>
                  <TooltipTrigger asChild>{box}</TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px]">
                    <p className="text-xs">{o.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Fragment key={o.id}>{box}</Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ImageComparisonTabProps {
  /** Report data */
  data?: ImageComparisonData | null;
  /** Associated planogram payload for expected panel */
  planogramPayload?: PlanogramPayload | null;
  /** Captured shelf image URL – from analysis flow */
  imageUrl?: string | null;
  /** Whether expected planogram panel should be shown */
  showPlanogramPanel?: boolean;
  className?: string;
}

export function ImageComparisonTab({
  data = null,
  planogramPayload = null,
  imageUrl = null,
  showPlanogramPanel = true,
  className,
}: ImageComparisonTabProps) {
  const comparisonData = planogramPayload
    ? mapPlanogramPayloadToImageComparisonData(planogramPayload)
    : data;
  const overlays = comparisonData?.detectionOverlays ?? [];

  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      <p className="text-muted-foreground text-sm">
        {showPlanogramPanel
          ? "Side-by-side comparison: Planogram (expected layout) vs Real Shelf (captured image). Non-compliant items are highlighted."
          : "Observed Display Unit image with detected overlays from the analysis run."}
      </p>

      <div
        className={cn(
          "h-[calc(100vh-14rem)] min-h-[480px] gap-4 overflow-hidden",
          showPlanogramPanel ? "grid lg:grid-cols-2" : "grid grid-cols-1",
        )}
      >
        {showPlanogramPanel && (
          <PlanogramExpectedPanel
            data={
              comparisonData ?? {
                planogramShelves: [],
                detectionOverlays: [],
              }
            }
            className="min-h-0"
          />
        )}

        {/* Right: Real Shelf (Captured) */}
        <section className="border-border bg-card/60 flex min-h-0 flex-col overflow-hidden rounded-xl border">
          <div className="border-border flex shrink-0 items-center gap-2 border-b px-4 py-3">
            <ImageIcon className="text-accent size-4 shrink-0" aria-hidden />
            <h3 className="text-foreground text-sm font-semibold">
              Real Shelf (Captured)
            </h3>
          </div>
          <div className="bg-muted/20 min-h-0 flex-1 overflow-y-auto">
            {imageUrl ? (
              <RealShelfWithOverlays imageUrl={imageUrl} overlays={overlays} />
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="bg-muted/50 rounded-full p-4">
                  <ImageIcon
                    className="text-muted-foreground size-12"
                    aria-hidden
                  />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    No shelf image available
                  </p>
                  <p className="text-muted-foreground mt-1 max-w-[240px] text-xs">
                    Capture or upload a shelf image during analysis to see the
                    side-by-side comparison here.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="border-border text-muted-foreground flex flex-wrap gap-4 border-t px-4 py-2 text-[10px]">
            {DETECTION_LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className={cn("size-2 shrink-0 rounded-full", item.color)}
                  aria-hidden
                />
                {item.label}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
