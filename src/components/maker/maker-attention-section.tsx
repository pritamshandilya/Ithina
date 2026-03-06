import { AlertCircle, LayoutGrid, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDraftAudits,
  useReturnedAudits,
} from "@/queries/maker";
import { cn } from "@/lib/utils";

export interface MakerAttentionSectionProps {
  onResume?: (auditId: string, shelfId: string) => void;
  onViewReport?: (auditId: string, shelfId: string) => void;
  onViewAll?: () => void;
  className?: string;
}

/** Fixed height to match Assigned Shelves */
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

/**
 * "What Needs Your Attention" - graphical summary of returned and draft audits.
 * Users go to audit review for individual items.
 */
export function MakerAttentionSection({
  onViewAll,
  className,
}: MakerAttentionSectionProps) {
  const { data: drafts = [], isLoading: draftsLoading } = useDraftAudits();
  const { data: returned = [], isLoading: returnedLoading } = useReturnedAudits();

  const isLoading = draftsLoading || returnedLoading;
  const total = returned.length + drafts.length;
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
          <p className="text-sm text-muted-foreground">
            {hasItems
              ? "Returned audits and drafts requiring action"
              : "You're all caught up"}
          </p>
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
              style={{ backgroundColor: "color-mix(in oklch, var(--maker-approved) 15%, transparent)" }}
              aria-hidden
            >
              <LayoutGrid
                className="size-8"
                style={{ color: "var(--maker-approved)" }}
                aria-hidden
              />
            </div>
            <p className="font-medium text-foreground text-lg">All caught up</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
              No returned audits or drafts. Start a new audit when ready.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 min-h-0">
            {/* Donut chart: Returned vs Drafts */}
            <div className="flex items-center gap-8">
              <svg
                viewBox="0 0 100 100"
                className="size-36 shrink-0 min-w-[144px] min-h-[144px]"
                aria-label="Audit workload: returned vs drafts"
              >
                <g transform="rotate(-90 50 50)">
                  {returned.length > 0 && (
                    <path
                      d={donutSegment(
                        50,
                        50,
                        40,
                        26,
                        0,
                        (returned.length / total) * 360
                      )}
                      fill="var(--destructive)"
                      className="transition-opacity hover:opacity-90"
                    >
                      <title>Returned: {returned.length}</title>
                    </path>
                  )}
                  {drafts.length > 0 && (
                    <path
                      d={donutSegment(
                        50,
                        50,
                        40,
                        26,
                        (returned.length / total) * 360,
                        360
                      )}
                      fill="var(--accent)"
                      className="transition-opacity hover:opacity-90"
                    >
                      <title>Drafts: {drafts.length}</title>
                    </path>
                  )}
                </g>
              </svg>

              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-sm shrink-0"
                    style={{ backgroundColor: "var(--destructive)" }}
                    aria-hidden
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{returned.length}</span>
                    <span className="text-muted-foreground ml-1">returned</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-sm shrink-0"
                    style={{ backgroundColor: "var(--accent)" }}
                    aria-hidden
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{drafts.length}</span>
                    <span className="text-muted-foreground ml-1">drafts</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {total} total needing action
                </p>
              </div>
            </div>

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
                View all audits
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
