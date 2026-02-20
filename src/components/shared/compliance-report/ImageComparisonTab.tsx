/**
 * Image Comparison Tab
 *
 * Side-by-side: Planogram (expected layout) vs Real Shelf (captured image).
 * Non-compliant items are highlighted with color-coded borders.
 */

import { FileText, ImageIcon, Star } from "lucide-react";
import {
  BottleSVG,
  CanSVG,
  ChipBagSVG,
  LargeBottleSVG,
} from "@/components/planogram/product-svgs";
import { MOCK_IMAGE_COMPARISON } from "@/features/maker/analysis/mock-image-comparison";
import type {
  ImageComparisonData,
  PlanogramSlot,
  PlanogramSlotStatus,
  DetectionOverlay,
  DetectionOverlayStatus,
} from "@/features/maker/analysis/image-comparison-types";
import { Fragment } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, { fill: string; accent: string }> = {
  red: { fill: "#dc2626", accent: "#b91c1c" },
  yellow: { fill: "#eab308", accent: "#ca8a04" },
  orange: { fill: "#ea580c", accent: "#c2410c" },
  blue: { fill: "#2563eb", accent: "#1d4ed8" },
  green: { fill: "#16a34a", accent: "#15803d" },
  amber: { fill: "#d97706", accent: "#b45309" },
  slate: { fill: "#64748b", accent: "#475569" },
};

function ProductIcon({
  shape,
  color,
  className,
}: {
  shape?: PlanogramSlot["shape"];
  color?: string;
  className?: string;
}) {
  const { fill, accent } = COLOR_MAP[color ?? "slate"] ?? COLOR_MAP.slate;
  const shared = cn("size-12 sm:size-14", className);
  switch (shape) {
    case "bottle":
      return <BottleSVG fill={fill} accent={accent} className={shared} />;
    case "can":
      return <CanSVG fill={fill} accent={accent} className={shared} />;
    case "bag":
      return <ChipBagSVG fill={fill} accent={accent} className={shared} />;
    case "carton":
      return <LargeBottleSVG fill={fill} accent={accent} className={shared} />;
    default:
      return <BottleSVG fill={fill} accent={accent} className={shared} />;
  }
}

function PlanogramSlotCard({ slot }: { slot: PlanogramSlot }) {
  const borderByStatus: Record<PlanogramSlotStatus, string> = {
    matched: slot.highDemand ? "border-2 border-amber-500" : "border-2 border-chart-2",
    missing: "border-2 border-destructive",
    misplaced: slot.highDemand ? "border-2 border-amber-500" : "border-2 border-action-warning",
  };
  const facingsMatch = slot.detectedFacings === slot.expectedFacings;
  const badgeByStatus: Record<PlanogramSlotStatus, string> = {
    matched: "bg-chart-2/20 text-chart-2",
    missing: "bg-destructive/20 text-destructive",
    misplaced: facingsMatch ? "bg-chart-2/20 text-chart-2" : "bg-action-warning/20 text-action-warning",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg p-3 bg-card/80 flex flex-col items-center min-h-[100px]",
        borderByStatus[slot.status]
      )}
    >
      {slot.severity === "HIGH" && (
        <span className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-destructive/90 text-white uppercase">
          HIGH
        </span>
      )}
      {slot.highDemand && slot.status !== "missing" && slot.severity !== "HIGH" && (
        <Star className="absolute top-1.5 left-1.5 size-3.5 fill-amber-500 text-amber-500" aria-hidden />
      )}
      <span
        className={cn(
          "absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          badgeByStatus[slot.status]
        )}
      >
        {slot.detectedFacings}/{slot.expectedFacings}
      </span>
      <div className="flex-1 flex items-center justify-center mt-4">
        <ProductIcon shape={slot.shape} color={slot.color} />
      </div>
      <p className="text-xs font-medium text-foreground truncate w-full text-center mt-1">
        {slot.shortName}
      </p>
      <p
        className={cn(
          "text-[10px] font-mono",
          slot.status === "matched"
            ? "text-chart-2"
            : slot.status === "misplaced" && slot.totalDetectedUnits > 0
              ? "text-action-warning"
              : "text-destructive"
        )}
      >
        D{slot.depth} - {slot.totalDetectedUnits}/{slot.totalExpectedUnits}
      </p>
    </div>
  );
}

const PLANOGRAM_LEGEND = [
  { color: "bg-chart-2", label: "Matched" },
  { color: "bg-action-warning", label: "Misplaced" },
  { color: "bg-destructive", label: "Missing" },
  { color: "bg-amber-500", label: "High Demand", icon: "star" as const },
];

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
    <div className={cn("space-y-4", className)}>
      <p className="text-sm text-muted-foreground">
        Side-by-side comparison: Planogram (expected layout) vs Real Shelf
        (captured image). Non-compliant items are highlighted.
      </p>

      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-14rem)] min-h-[480px] overflow-hidden">
        {/* Left: Planogram (Expected) */}
        <section className="rounded-xl border border-border bg-card/60 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
            <FileText className="size-4 text-accent shrink-0" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Planogram (Expected)
            </h3>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
            {data.planogramShelves.map((shelf) => (
              <div key={shelf.shelfName} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {shelf.shelfName}: {shelf.shelfLabel} — {shelf.units} units
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {shelf.slots.map((slot) => (
                    <PlanogramSlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-border flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            {PLANOGRAM_LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                {"icon" in item && item.icon === "star" ? (
                  <Star className="size-3 fill-amber-500 text-amber-500 shrink-0" aria-hidden />
                ) : (
                  <span
                    className={cn("size-2 rounded-full shrink-0", item.color)}
                    aria-hidden
                  />
                )}
                {item.label}
              </span>
            ))}
            <span className="text-muted-foreground/80">
              Top-right: detected/expected facings · D = depth · Bottom: units
            </span>
          </div>
        </section>

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
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center gap-4 p-8 text-center">
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
