import { AlertCircle, ChevronRight, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockCheckerUser } from "@/lib/api/mockData";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import { usePendingAudits } from "@/queries/checker";

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
  endAngle: number,
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

  const criticalCount = audits.filter(
    (a) => (a.complianceScore ?? 0) < 50,
  ).length;
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
          className="border-border bg-card flex shrink-0 flex-col overflow-hidden rounded-xl border"
          style={{ height: SECTION_HEIGHT }}
        >
          <div className="flex flex-col items-center justify-center gap-4 p-6">
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
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--action-warning) 20%, transparent)",
          }}
          aria-hidden
        >
          <AlertCircle
            className="size-4"
            style={{ color: "var(--action-warning)" }}
            aria-hidden
          />
        </div>
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            What Needs Your Attention
          </h2>
        </div>
      </div>

      <div
        className="border-border bg-card flex shrink-0 flex-col overflow-hidden rounded-xl border"
        style={{ height: SECTION_HEIGHT }}
      >
        {!hasItems ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div
              className="mb-4 flex size-16 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in oklch, var(--chart-2) 15%, transparent)",
              }}
              aria-hidden
            >
              <ClipboardList
                className="size-8"
                style={{ color: "var(--chart-2)" }}
                aria-hidden
              />
            </div>
            <p className="text-foreground text-lg font-medium">
              Review queue clear
            </p>
            <p className="text-muted-foreground mt-1 max-w-[240px] text-sm">
              No audits pending. New submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6">
            {/* Donut chart: Critical | Needs Attention | Good */}
            <div className="flex items-center gap-8">
              <svg
                viewBox="0 0 100 100"
                className="size-36 min-h-[144px] min-w-[144px] shrink-0"
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
                        (criticalCount / total) * 360,
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
                        ((criticalCount + needsAttentionCount) / total) * 360,
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
                        360,
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
                      className="size-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: "var(--destructive)" }}
                      aria-hidden
                    />
                    <span className="text-sm">
                      <span className="text-foreground font-semibold">
                        {criticalCount}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        critical
                      </span>
                    </span>
                  </div>
                )}
                {needsAttentionCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: "var(--action-warning)" }}
                      aria-hidden
                    />
                    <span className="text-sm">
                      <span className="text-foreground font-semibold">
                        {needsAttentionCount}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        need attention
                      </span>
                    </span>
                  </div>
                )}
                {goodCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: "var(--chart-2)" }}
                      aria-hidden
                    />
                    <span className="text-sm">
                      <span className="text-foreground font-semibold">
                        {goodCount}
                      </span>
                      <span className="text-muted-foreground ml-1">good</span>
                    </span>
                  </div>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {total} total pending
                </p>
              </div>
            </div>

            {/* Compliance distribution strip - each audit as a colored segment */}
            {audits.length > 0 && audits.length <= 16 && (
              <div className="mt-4 w-full max-w-[280px]">
                <p className="text-muted-foreground mb-2 text-center text-xs">
                  Compliance mix
                </p>
                <div className="bg-muted/30 flex h-3 gap-0.5 overflow-hidden rounded-full">
                  {audits.slice(0, 16).map((audit) => {
                    const score = audit.complianceScore ?? 0;
                    return (
                      <div
                        key={audit.id}
                        className="min-w-[2px] flex-1 transition-colors"
                        style={{ backgroundColor: getComplianceColor(score) }}
                        title={`${audit.shelfInfo.shelfName}: ${score}%`}
                      />
                    );
                  })}
                </div>
                <div className="text-muted-foreground mt-2 flex justify-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: "var(--destructive)" }}
                    />
                    &lt;50%
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: "var(--action-warning)" }}
                    />
                    50–79%
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: "var(--chart-2)" }}
                    />
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
