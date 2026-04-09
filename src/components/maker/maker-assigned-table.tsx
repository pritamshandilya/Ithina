import { Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Rows3, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useShelves } from "@/queries/maker";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { AuditStatus } from "@/types/maker";

const PREVIEW_ROWS = 6;
/** Fixed height to match What Needs Your Attention; content scrolls when it overflows */
const SECTION_HEIGHT = 420;

export interface MakerAssignedTableProps {
  onShelfClick?: (shelfId: string) => void;
  className?: string;
}

function getComplianceColor(score: number): string {
  if (score >= 90) return "var(--chart-2)";
  if (score >= 75) return "var(--accent)";
  return "var(--destructive)";
}

/**
 * Tabular preview of assigned shelves, matching height of What Needs Your Attention.
 * Shows up to 6 rows with View all link to /maker/audits/planogram.
 */
export function MakerAssignedTable({
  onShelfClick,
  className,
}: MakerAssignedTableProps) {
  const navigate = useNavigate();
  const { data: shelves, isLoading, error } = useShelves();

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-40" />
        <div
          className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
          style={{ height: SECTION_HEIGHT }}
        >
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !shelves) return null;

  const previewShelves = shelves.slice(0, PREVIEW_ROWS);
  const hasMore = shelves.length > PREVIEW_ROWS;

  const handleRowClick = (shelfId: string) => {
    if (onShelfClick) {
      onShelfClick(shelfId);
    } else {
      navigate({ to: "/maker/audits/planogram/$shelfId", params: { shelfId } });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "color-mix(in oklch, var(--accent) 15%, transparent)" }}
            aria-hidden
          >
            <Rows3
              className="size-4"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Assigned Shelves
            </h2>
            <p className="text-sm text-muted-foreground">
              {shelves.length} shelf{shelves.length !== 1 ? "s" : ""} assigned to you
            </p>
          </div>
        </div>

        <Link
          to="/maker/audits/planogram"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/90 transition-colors shrink-0"
        >
          View all
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div
        className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
        style={{ height: SECTION_HEIGHT }}
      >
        {shelves.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-12 text-center">
            <p className="font-medium text-foreground">No Shelves Assigned</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact your manager to get shelf assignments.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full text-sm" role="grid">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Aisle</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Bay</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground min-w-[140px]">Shelf Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Last Audit</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Compliance</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewShelves.map((shelf) => (
                    <tr
                      key={shelf.id}
                      className={cn(
                        "border-b border-border/60 transition-colors",
                        (onShelfClick !== undefined) && "cursor-pointer hover:bg-muted/40"
                      )}
                      onClick={() => handleRowClick(shelf.id)}
                      role="row"
                    >
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {shelf.aisleCode ??
                          (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "—")}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {shelf.bayCode ?? (shelf.bayNumber != null ? shelf.bayNumber : "—")}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground truncate max-w-[180px]">
                        {shelf.shelfName}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {shelf.lastAuditDate ? (
                          shelf.status === "draft" ? (
                            `Draft saved ${formatDistanceToNow(new Date(shelf.lastAuditDate), { addSuffix: true })}`
                          ) : (
                            formatDistanceToNow(new Date(shelf.lastAuditDate), { addSuffix: true })
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {shelf.complianceScore != null ? (
                          <span
                            className="tabular-nums font-semibold"
                            style={{ color: getComplianceColor(shelf.complianceScore) }}
                          >
                            {shelf.complianceScore}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                            getAuditStatusClass(shelf.status as AuditStatus)
                          )}
                        >
                          {AUDIT_STATUS_LABELS[shelf.status as AuditStatus] ?? shelf.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="border-t border-border px-4 py-3 bg-muted/20 shrink-0">
                <Link
                  to="/maker/audits/planogram"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-accent hover:text-accent/90 transition-colors py-1"
                >
                  View all {shelves.length} shelves
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
