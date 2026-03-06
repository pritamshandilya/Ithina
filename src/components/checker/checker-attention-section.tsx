import { AlertCircle, ClipboardList, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingAudits } from "@/queries/checker";
import { useStore } from "@/providers/store";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

export interface CheckerAttentionSectionProps {
  onAuditClick?: (auditId: string) => void;
  onViewAll?: () => void;
  className?: string;
}

/** Fixed height to match Store/Shelf Preview */
const SECTION_HEIGHT = 420;

/**
 * Donut chart segment - returns SVG path for a segment from startAngle to endAngle (degrees)
 */
function donutSegment(
  cx: number,
  cy: number,
  r: number,
  ir: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angle = endAngle - startAngle;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const x3 = cx + ir * Math.cos(toRad(endAngle));
  const y3 = cy + ir * Math.sin(toRad(endAngle));
  const x4 = cx + ir * Math.cos(toRad(startAngle));
  const y4 = cy + ir * Math.sin(toRad(startAngle));
  const largeArc = angle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

function getComplianceColor(score: number): string {
  if (score < 50) return "var(--destructive)";
  if (score < 80) return "var(--action-warning)";
  return "var(--chart-2)";
}

/**
 * "What Needs Your Attention" - graphical summary of audits by compliance tier.
 * Critical (<50%), Needs Attention (50–79%), Good (80%+). Includes compliance mix strip.
 */
function CheckerAttentionSection({
  onViewAll,
  className,
}: CheckerAttentionSectionProps) {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? mockCheckerUser.storeId;
  const { data: audits = [], isLoading } = usePendingAudits(storeId);

  const criticalCount = audits.filter((a) => (a.complianceScore ?? 0) < 50).length;
  const needsAttentionCount = audits.filter((a) => {
    const s = a.complianceScore ?? 0;
    return s >= 50 && s < 80;
  }).length;
  const goodCount = audits.filter((a) => (a.complianceScore ?? 0) >= 80).length;
  const total = criticalCount + needsAttentionCount + goodCount;
  const hasItems = total > 0;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-48" />
        <div
          className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
          style={{ height: SECTION_HEIGHT }}
        >
          <div className="p-6 flex flex-col items-center justify-center gap-4">
            <Skeleton className="size-32 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "color-mix(in oklch, var(--action-warning) 20%, transparent)" }}
          aria-hidden
        >
          <AlertCircle
            className="size-4"
            style={{ color: "var(--action-warning)" }}
            aria-hidden
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What Needs Your Attention
          </h2>
  
        </div>
      </div>

      <div
        className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
        style={{ height: SECTION_HEIGHT }}
      >
        {!hasItems ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 px-6 text-center min-h-0">
            <div
              className="flex size-16 items-center justify-center rounded-full mb-4"
              style={{ backgroundColor: "color-mix(in oklch, var(--chart-2) 15%, transparent)" }}
              aria-hidden
            >
              <ClipboardList
                className="size-8"
                style={{ color: "var(--chart-2)" }}
                aria-hidden
              />
            </div>
            <p className="font-medium text-foreground text-lg">Review queue clear</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
              No audits pending. New submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 min-h-0">
            {/* Donut chart: Critical | Needs Attention | Good */}
            <div className="flex items-center gap-8">
              <svg
                viewBox="0 0 100 100"
                className="size-36 shrink-0 min-w-[144px] min-h-[144px]"
                aria-label="Audit queue by compliance tier"
              >
                <g transform="rotate(-90 50 50)">
                  {criticalCount > 0 && (
                    <path
                      d={donutSegment(
                        50,
                        50,
                        40,
                        26,
                        0,
                        (criticalCount / total) * 360
                      )}
                      fill="var(--destructive)"
                      className="transition-opacity hover:opacity-90"
                    >
                      <title>Critical: {criticalCount}</title>
                    </path>
                  )}
                  {needsAttentionCount > 0 && (
                    <path
                      d={donutSegment(
                        50,
                        50,
                        40,
                        26,
                        (criticalCount / total) * 360,
                        ((criticalCount + needsAttentionCount) / total) * 360
                      )}
                      fill="var(--action-warning)"
                      className="transition-opacity hover:opacity-90"
                    >
                      <title>Needs Attention: {needsAttentionCount}</title>
                    </path>
                  )}
                  {goodCount > 0 && (
                    <path
                      d={donutSegment(
                        50,
                        50,
                        40,
                        26,
                        ((criticalCount + needsAttentionCount) / total) * 360,
                        360
                      )}
                      fill="var(--chart-2)"
                      className="transition-opacity hover:opacity-90"
                    >
                      <title>Good: {goodCount}</title>
                    </path>
                  )}
                </g>
              </svg>

              <div className="flex flex-col gap-3 text-left">
                {criticalCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-sm shrink-0"
                      style={{ backgroundColor: "var(--destructive)" }}
                      aria-hidden
                    />
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">{criticalCount}</span>
                      <span className="text-muted-foreground ml-1">critical</span>
                    </span>
                  </div>
                )}
                {needsAttentionCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-sm shrink-0"
                      style={{ backgroundColor: "var(--action-warning)" }}
                      aria-hidden
                    />
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">{needsAttentionCount}</span>
                      <span className="text-muted-foreground ml-1">need attention</span>
                    </span>
                  </div>
                )}
                {goodCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-sm shrink-0"
                      style={{ backgroundColor: "var(--chart-2)" }}
                      aria-hidden
                    />
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">{goodCount}</span>
                      <span className="text-muted-foreground ml-1">good</span>
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {total} total pending
                </p>
              </div>
            </div>

            {/* Compliance distribution strip - each audit as a colored segment */}
            {audits.length > 0 && audits.length <= 16 && (
              <div className="w-full max-w-[280px] mt-4">
                <p className="text-xs text-muted-foreground mb-2 text-center">
                  Compliance mix
                </p>
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted/30">
                  {audits.slice(0, 16).map((audit) => {

                    const score = audit.complianceScore ?? 0;
                    return (
                      <div
                        key={audit.id}
                        className="flex-1 min-w-[2px] transition-colors"
                        style={{ backgroundColor: getComplianceColor(score) }}
                        title={`${audit.shelfInfo.shelfName}: ${score}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--destructive)" }} />
                    &lt;50%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--action-warning)" }} />
                    50–79%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} />
                    80%+
                  </span>
                </div>
              </div>
            )}

            {onViewAll && (
              <Button
                size="lg"
                onClick={onViewAll}
                className="mt-6 gap-2 font-semibold"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
              >
                Review audits
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { CheckerAttentionSection };
