/**
 * Image Comparison Tab
 *
 * Side-by-side: Planogram (expected layout) vs Real Shelf (captured image).
 * Non-compliant items are highlighted with color-coded borders.
 */

import { ImageIcon } from "lucide-react";
import { MOCK_IMAGE_COMPARISON } from "@/lib/analysis/mock-image-comparison";
import type {
  ImageComparisonData,
  DetectionOverlay,
  DetectionOverlayStatus,
} from "@/lib/analysis/image-comparison-types";
import { Fragment } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlanogramExpectedPanel } from "./PlanogramExpectedPanel";
import { cn } from "@/lib/utils";

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
    <div className="relative w-full overflow-y-auto">
      <div className="relative inline-block min-w-full">
        <img
          src={imageUrl}
          alt="Captured shelf"
          className="block w-full h-auto"
        />
        {overlays.length > 0 && (
          <div className="absolute inset-0" aria-hidden>
            {overlays.map((o) => {
              const box = (
                <div
                  className={cn(
                    "absolute border-2 bg-black/5 flex flex-col justify-end p-0.5",
                    OVERLAY_BORDER[o.status]
                  )}
                  style={{
                    left: `${o.xPercent}%`,
                    top: `${o.yPercent}%`,
                    width: `${o.widthPercent}%`,
                    height: `${o.heightPercent}%`,
                  }}
                >
                  <span className="text-[10px] font-medium text-foreground truncate leading-tight">
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
  /** Report data – defaults to mock */
  data?: ImageComparisonData;
  /** Captured shelf image URL – from analysis flow */
  imageUrl?: string | null;
  className?: string;
}

export function ImageComparisonTab({
  data = MOCK_IMAGE_COMPARISON,
  imageUrl = null,
  className,
}: ImageComparisonTabProps) {
  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      <p className="text-sm text-muted-foreground">
        Side-by-side comparison: Planogram (expected layout) vs Real Shelf
        (captured image). Non-compliant items are highlighted.
      </p>

      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-14rem)] min-h-[480px] overflow-hidden">
        {/* Left: Planogram (Expected) */}
        <PlanogramExpectedPanel data={data} className="min-h-0" />

        {/* Right: Real Shelf (Captured) */}
        <section className="rounded-xl border border-border bg-card/60 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
            <ImageIcon className="size-4 text-accent shrink-0" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Real Shelf (Captured)
            </h3>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20">
            {imageUrl ? (
              <RealShelfWithOverlays
                imageUrl={imageUrl}
                overlays={data.detectionOverlays}
              />
            ) : (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="rounded-full bg-muted/50 p-4">
                  <ImageIcon className="size-12 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No shelf image available
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                    Capture or upload a shelf image during analysis to see the
                    side-by-side comparison here.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-border flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            {DETECTION_LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className={cn("size-2 rounded-full shrink-0", item.color)}
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
