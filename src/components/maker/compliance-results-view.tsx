/**
 * Compliance Results View
 *
 * Simplified two-column layout for Maker results:
 * - Left: Observed shelf image with highlights, zoom, retake, replace
 * - Right: Compliance summary (score, counts, issues) and actions
 *
 * No tabs, no SKU list, no strategy section.
 */

import { useState } from "react";
import {
  Camera,
  Check,
  Minus,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/analysis";

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
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] lg:h-[min(600px,calc(100vh-18rem))] lg:overflow-hidden">
      {/* Left: Observed Shelf */}
      <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Observed Shelf</h2>
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
        <div className="flex-1 min-h-0 overflow-auto bg-muted/30">
          {imagePreview ? (
            <div className="p-4 flex items-center justify-center min-h-full">
              <img
                src={imagePreview}
                alt="Shelf analysis"
                className="max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center text-muted-foreground">
              <p className="text-sm">No image</p>
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="border-t border-border px-4 py-2 flex flex-wrap gap-4 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-chart-2" aria-hidden />
            Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-destructive" aria-hidden />
            Issue
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm border border-dashed border-muted-foreground"
              aria-hidden
            />
            Empty space
          </span>
        </div>
      </section>

      {/* Right: Compliance Summary */}
      <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="border-b border-border px-4 py-3 shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Compliance Summary</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
          {/* Overall Compliance Score */}
          <div className="text-center py-4 rounded-lg border border-border bg-card/40">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overall Compliance
            </p>
            <p
              className={cn(
                "mt-1 text-4xl font-bold",
                isCompliant ? "text-chart-2" : "text-foreground"
              )}
            >
              {analysisResult.complianceScore}%
            </p>
          </div>

          {/* Issue counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Issues Found
              </p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {analysisResult.totalIssues}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Missing SKUs
              </p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {analysisResult.missingSkus}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Misplaced SKUs
              </p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {analysisResult.misplacedSkus}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Empty Spaces
              </p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {analysisResult.emptySpaces}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border space-y-3">
            {hasIssues ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Fix highlighted issues and retake photo.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={onRetake} variant="outline" size="sm">
                    <RefreshCw className="size-4" aria-hidden />
                    Retake & Reanalyze
                  </Button>
                  {onSubmitAnyway && (
                    <Button onClick={onSubmitAnyway} variant="secondary" size="sm">
                      Submit Anyway
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-chart-2 flex items-center gap-2">
                  <Check className="size-4" aria-hidden />
                  Shelf is compliant.
                </p>
                <Button variant="success" onClick={onSubmitAudit} className="w-full">
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
