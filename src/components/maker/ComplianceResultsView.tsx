/**
 * Compliance Results View
 *
 * Simplified two-column layout for Maker results:
 * - Left: Observed Fixture image with highlights, zoom, retake, replace
 * - Right: Compliance summary (score, counts, issues) and actions
 *
 * No tabs, no SKU list, no strategy section.
 */
import { Camera, Check, Minus, Plus, RefreshCw, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export interface ComplianceResultsViewProps {
  /** Shelf image preview URL */
  imagePreview: string | null;
  /** Analysis result from JSON snippet */
  analysisResult: AnalysisResult;
  /** Callback when user wants to retake/replace image */
  onRetake?: () => void;
  /** Callback when user wants to replace image (upload new) */
  onReplaceImage?: () => void;
  /** Callback when user submits audit */
  onSubmitAudit?: () => void;
  /** Callback when user submits anyway (with issues) */
  onSubmitAnyway?: () => void;
  /** Index of issue to highlight on image (clickable issues) */
  highlightedIssueIndex?: number | null;
  /** Callback when user clicks an issue */
  onIssueClick?: (index: number) => void;
}

export function ComplianceResultsView({
  imagePreview,
  analysisResult,
  onRetake,
  onReplaceImage,
  onSubmitAudit,
  onSubmitAnyway,
  highlightedIssueIndex: _highlightedIssueIndex = null,
  onIssueClick: _onIssueClick,
}: ComplianceResultsViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const hasIssues = analysisResult.totalIssues > 0;
  const isCompliant = analysisResult.complianceScore >= 100 && !hasIssues;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className="grid gap-4 lg:h-[min(600px,calc(100vh-18rem))] lg:grid-cols-[1fr_1fr] lg:overflow-hidden xl:grid-cols-[1.2fr_1fr]">
      {/* Left: Observed Fixture */}
      <section className="border-border bg-card/80 flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
          <h2 className="text-foreground text-sm font-semibold">
            Observed Fixture
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              aria-label="Zoom in"
            >
              <Plus className="size-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              aria-label="Zoom out"
            >
              <Minus className="size-4" aria-hidden />
            </Button>
            <Button variant="outline" size="sm" onClick={onReplaceImage}>
              <Upload className="size-4" aria-hidden />
              Replace image
            </Button>
            <Button variant="outline" size="sm" onClick={onRetake}>
              <Camera className="size-4" aria-hidden />
              Retake image
            </Button>
          </div>
        </div>
        <div className="bg-muted/30 min-h-0 flex-1 overflow-auto">
          {imagePreview ? (
            <div className="flex min-h-full items-center justify-center p-4">
              <img
                src={imagePreview}
                alt="Shelf analysis"
                className="max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          ) : (
            <div className="text-muted-foreground flex h-full min-h-[280px] items-center justify-center">
              <p className="text-sm">No image</p>
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="border-border text-muted-foreground flex shrink-0 flex-wrap gap-4 border-t px-4 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="bg-chart-2 h-3 w-3 rounded-sm" aria-hidden />
            Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-destructive h-3 w-3 rounded-sm" aria-hidden />
            Issue
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="border-muted-foreground h-3 w-3 rounded-sm border border-dashed"
              aria-hidden
            />
            Empty space
          </span>
        </div>
      </section>

      {/* Right: Compliance Summary */}
      <section className="border-border bg-card/80 flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border shrink-0 border-b px-4 py-3">
          <h2 className="text-foreground text-sm font-semibold">
            Compliance Summary
          </h2>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          {/* Overall Compliance Score */}
          <div className="border-border bg-card/40 rounded-lg border py-4 text-center">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Overall Compliance
            </p>
            <p
              className={cn(
                "mt-1 text-4xl font-bold",
                isCompliant ? "text-chart-2" : "text-foreground",
              )}
            >
              {analysisResult.complianceScore}%
            </p>
          </div>

          {/* Issue counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border bg-card/60 rounded-lg border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Issues Found
              </p>
              <p className="text-foreground mt-0.5 text-2xl font-bold">
                {analysisResult.totalIssues}
              </p>
            </div>
            <div className="border-border bg-card/60 rounded-lg border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Missing SKUs
              </p>
              <p className="text-foreground mt-0.5 text-2xl font-bold">
                {analysisResult.missingSkus}
              </p>
            </div>
            <div className="border-border bg-card/60 rounded-lg border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Misplaced SKUs
              </p>
              <p className="text-foreground mt-0.5 text-2xl font-bold">
                {analysisResult.misplacedSkus}
              </p>
            </div>
            <div className="border-border bg-card/60 rounded-lg border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Empty Spaces
              </p>
              <p className="text-foreground mt-0.5 text-2xl font-bold">
                {analysisResult.emptySpaces}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-border space-y-3 border-t pt-4">
            {hasIssues ? (
              <>
                <p className="text-muted-foreground text-sm">
                  Fix highlighted issues and retake photo.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={onRetake} variant="outline" size="sm">
                    <RefreshCw className="size-4" aria-hidden />
                    Retake & Reanalyze
                  </Button>
                  {onSubmitAnyway && (
                    <Button
                      onClick={onSubmitAnyway}
                      variant="secondary"
                      size="sm"
                    >
                      Submit Anyway
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-chart-2 flex items-center gap-2 text-sm font-medium">
                  <Check className="size-4" aria-hidden />
                  Shelf is compliant.
                </p>
                <Button
                  variant="success"
                  onClick={onSubmitAudit}
                  className="w-full"
                >
                  Submit Audit
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
