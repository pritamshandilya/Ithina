/**
 * Planogram Expected Panel
 *
 * Reusable visual representation of the expected planogram layout.
 * Used in Image Comparison tab and shelf image upload flow.
 */

import { FileText, Star } from "lucide-react";
import {
  BottleSVG,
  CanSVG,
  ChipBagSVG,
  LargeBottleSVG,
} from "@/components/planogram/product-svgs";
import type {
  ImageComparisonData,
  PlanogramSlot,
  PlanogramSlotStatus,
} from "@/lib/analysis/image-comparison-types";
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
  const shared = cn("size-9 sm:size-10", className);
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

function PlanogramSlotCard({
  slot,
  variant,
}: {
  slot: PlanogramSlot;
  variant: "preview" | "comparison";
}) {
  const isPreview = variant === "preview";

  const borderByStatus: Record<PlanogramSlotStatus, string> = isPreview
    ? {
        matched: "border border-border",
        missing: "border border-border",
        misplaced: "border border-border",
      }
    : {
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
        "relative flex min-h-[72px] flex-col items-center rounded-lg bg-card/80 p-2",
        borderByStatus[slot.status]
      )}
    >
      {!isPreview && slot.severity === "HIGH" && (
        <span className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-destructive/90 text-white uppercase">
          HIGH
        </span>
      )}
      {!isPreview && slot.highDemand && slot.status !== "missing" && slot.severity !== "HIGH" && (
        <Star className="absolute top-1.5 left-1.5 size-3.5 fill-amber-500 text-amber-500" aria-hidden />
      )}
      {!isPreview ? (
        <span
          className={cn(
            "absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
            badgeByStatus[slot.status]
          )}
        >
          {slot.detectedFacings}/{slot.expectedFacings}
        </span>
      ) : (
        <span className="absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {slot.expectedFacings} facings
        </span>
      )}
      <div className="mt-1 flex flex-1 items-center justify-center">
        <ProductIcon shape={slot.shape} color={slot.color} />
      </div>
      <p className="mt-0.5 w-full truncate text-center text-xs font-medium text-foreground">
        {slot.shortName}
      </p>
      <p
        className={cn(
          "text-[10px] font-mono",
          isPreview
            ? "text-muted-foreground"
            : slot.status === "matched"
              ? "text-chart-2"
              : slot.status === "misplaced" && slot.totalDetectedUnits > 0
                ? "text-action-warning"
                : "text-destructive"
        )}
      >
        {isPreview
          ? `D${slot.depth} · ${slot.totalExpectedUnits} units`
          : `D${slot.depth} - ${slot.totalDetectedUnits}/${slot.totalExpectedUnits}`}
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

export interface PlanogramExpectedPanelProps {
  /** Planogram layout data */
  data: ImageComparisonData;
  /** "preview" = upload screen, layout only, no compliance metrics. "comparison" = report, full metrics. */
  variant?: "preview" | "comparison";
  /** Show legend and helper text */
  showLegend?: boolean;
  /** Additional class names */
  className?: string;
}

export function PlanogramExpectedPanel({
  data,
  variant = "comparison",
  showLegend = true,
  className,
}: PlanogramExpectedPanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card/60 overflow-hidden flex flex-col min-h-0",
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <FileText className="size-4 text-accent shrink-0" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">
          Planogram (Expected)
        </h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
        {data.planogramShelves.map((shelf) => (
          <div key={shelf.shelfName} className="space-y-1.5">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {shelf.shelfName}: {shelf.shelfLabel} — {shelf.units} units
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shelf.slots.map((slot) => (
                <PlanogramSlotCard key={slot.id} slot={slot} variant={variant} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {showLegend && (
        <div className="flex shrink-0 flex-wrap gap-3 border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
          {variant === "comparison" ? (
            <>
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
            </>
          ) : (
            <span className="text-muted-foreground/80">
              Expected layout · D = depth · facings and units per product
            </span>
          )}
        </div>
      )}
    </section>
  );
}
