/**
 * Image Comparison Tab
 *
 * Side-by-side: Planogram (expected layout) vs Real Shelf (captured image).
 * Non-compliant items are highlighted with color-coded borders.
 */
import { ImageIcon, ListFilter } from "lucide-react";

import { PlanogramExpectedPanel } from "./PlanogramExpectedPanel";
import {
  ImageViewer,
  type ImageViewerOverlay,
} from "@/components/shared/imageViewer/ImageViewer";
import { mapPlanogramPayloadToImageComparisonData } from "@/lib/analysis";
import type { SkuFacingRow } from "@/lib/analysis/allItemsReportTypes";
import type { ImageComparisonData } from "@/lib/analysis/imageComparisonTypes";
import { cn } from "@/lib/utils";
import type { PlanogramPayload } from "@/types/planogram";

const DETECTION_LEGEND: { color: string; label: string }[] = [
  { color: "bg-chart-2", label: "Compliant" },
  { color: "bg-action-warning", label: "Misplaced" },
  { color: "bg-destructive", label: "Issue / Missing" },
  { color: "bg-blue-500", label: "Extra" },
];

export interface ImageComparisonTabProps {
  /** Report data */
  data?: ImageComparisonData | null;
  /** Associated planogram payload for expected panel */
  planogramPayload?: PlanogramPayload | null;
  /** Captured shelf image URL – from analysis flow */
  imageUrl?: string | null;
  /** Whether expected planogram panel should be shown */
  showPlanogramPanel?: boolean;
  /** Optional SKU list for right side table */
  skuFacings?: SkuFacingRow[] | null;
  className?: string;
}

export function ImageComparisonTab({
  data = null,
  planogramPayload = null,
  imageUrl = null,
  showPlanogramPanel = true,
  skuFacings = null,
  className,
}: ImageComparisonTabProps) {
  const comparisonData = planogramPayload
    ? mapPlanogramPayloadToImageComparisonData(planogramPayload)
    : data;
  const overlays = comparisonData?.detectionOverlays ?? [];
  const viewerOverlays: ImageViewerOverlay[] = overlays.map((overlay) => ({
    id: overlay.id,
    xPercent: overlay.xPercent,
    yPercent: overlay.yPercent,
    widthPercent: overlay.widthPercent,
    heightPercent: overlay.heightPercent,
    label: overlay.label,
    color:
      overlay.status === "compliant"
        ? "var(--chart-2)"
        : overlay.status === "misplaced"
          ? "var(--action-warning)"
          : overlay.status === "extra"
            ? "var(--chart-1)"
            : "var(--destructive)",
  }));

  const rows = skuFacings ?? [];
  const mappedRows = rows.map((row) => {
    const brand = row.productName.trim().split(" ")[0] ?? "-";
    const shelfMatch = row.sku.match(/-(\d+)$/);
    const shelf = shelfMatch ? `Shelf ${shelfMatch[1]}` : "-";
    const status =
      row.facingDiffVariant === "ok"
        ? "Matched"
        : row.facingDiffVariant === "short"
          ? "Missing"
          : "Extra";
    return {
      ...row,
      brand,
      shelf,
      status,
      expectedSlot: `D${row.depth} · ${row.frontFacings} facings`,
      comment: row.facingDiffText || "-",
    };
  });

  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      <p className="text-muted-foreground text-sm">
        {showPlanogramPanel
          ? "Side-by-side comparison: Planogram (expected layout) vs Real Shelf (captured image). Non-compliant items are highlighted."
          : "Observed Display Unit image with detected overlays from the analysis run."}
      </p>

      <div
        className={cn(
          "min-h-[440px] gap-4 overflow-hidden",
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
            className="min-h-[440px]"
          />
        )}

        {/* Right: Real Shelf (Captured) */}
        <section className="border-border bg-card/60 flex min-h-[440px] flex-col overflow-hidden rounded-xl border">
          <div className="border-border flex shrink-0 items-center gap-2 border-b px-4 py-3">
            <ImageIcon className="text-accent size-4 shrink-0" aria-hidden />
            <h3 className="text-foreground text-sm font-semibold">
              Real Shelf (Captured)
            </h3>
            {overlays.length > 0 ? (
              <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium">
                {overlays.length} detections
              </span>
            ) : null}
          </div>
          <div className="bg-muted/20 min-h-0 flex-1 overflow-y-auto">
            {imageUrl ? (
              <ImageViewer
                imageUrl={imageUrl}
                overlays={viewerOverlays}
                className="p-3"
              />
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

      {rows.length > 0 && (
        <section className="border-border bg-card/60 overflow-hidden rounded-xl border">
          <div className="border-border flex items-center justify-between border-b px-4 py-2.5">
            <div className="flex items-center gap-2">
              <ListFilter className="text-accent size-4 shrink-0" aria-hidden />
              <h3 className="text-foreground text-sm font-semibold">
                SKU Compliance List
              </h3>
            </div>
            <span className="text-muted-foreground text-xs">
              {mappedRows.length} items
            </span>
          </div>
          <div className="max-h-[360px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 sticky top-0 z-10">
                <tr>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    SKU
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Brand
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Product Name
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Status
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Expected Slot
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Comment
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Shelf
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-border/60 hover:bg-muted/20 border-t transition-colors"
                  >
                    <td className="text-foreground max-w-[180px] truncate px-3 py-2 font-medium">
                      {row.sku}
                    </td>
                    <td className="text-muted-foreground max-w-[120px] truncate px-3 py-2">
                      {row.brand}
                    </td>
                    <td className="text-foreground max-w-[220px] truncate px-3 py-2">
                      {row.productName}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          row.status === "Matched" &&
                            "bg-chart-2/20 text-chart-2",
                          row.status === "Missing" &&
                            "bg-destructive/20 text-destructive",
                          row.status === "Extra" &&
                            "bg-action-warning/20 text-action-warning",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-3 py-2">
                      {row.expectedSlot}
                    </td>
                    <td className="text-muted-foreground max-w-[220px] truncate px-3 py-2">
                      {row.comment}
                    </td>
                    <td className="text-muted-foreground px-3 py-2">
                      {row.shelf}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
