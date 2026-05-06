import { Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Rows3, Store } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useStoreScopedCheckerRoutes } from "@/hooks/useStoreScopedCheckerRoutes";
import { mockCheckerUser } from "@/lib/api/mockData";
import {
  AUDIT_STATUS_LABELS,
  getAuditStatusClass,
} from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import { useComplianceOverview } from "@/queries/checker";
import { useShelves } from "@/queries/maker";
import type { AuditStatus } from "@/types/maker";

const PREVIEW_ROWS = 6;
const SECTION_HEIGHT = 420;

export interface CheckerStoreShelfPreviewProps {
  onShelfClick?: (shelfId: string) => void;
  className?: string;
}

function getComplianceColor(score: number): string {
  if (score >= 90) return "var(--chart-2)";
  if (score >= 75) return "var(--accent)";
  return "var(--destructive)";
}

/**
 * Store-level summary + shelf-level table preview for checker dashboard.
 * Matches height of CheckerAttentionSection; links to /checker/shelves.
 */
export function CheckerStoreShelfPreview({
  onShelfClick,
  className,
}: CheckerStoreShelfPreviewProps) {
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? mockCheckerUser.storeId;
  const { data: shelves, isLoading: shelvesLoading } = useShelves();
  const { data: _compliance, isLoading: complianceLoading } =
    useComplianceOverview(storeId);

  const isLoading = shelvesLoading || complianceLoading;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-40" />
        <div
          className="border-border bg-card flex shrink-0 flex-col overflow-hidden rounded-xl border"
          style={{ height: SECTION_HEIGHT }}
        >
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const previewShelves = (shelves ?? []).slice(0, PREVIEW_ROWS);
  const hasMore = (shelves ?? []).length > PREVIEW_ROWS;

  const handleRowClick = (shelfId: string) => {
    if (onShelfClick) {
      onShelfClick(shelfId);
    } else {
      navigate({ ...routes.toShelfIndex() });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent) 15%, transparent)",
            }}
            aria-hidden
          >
            <Store
              className="size-4"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Store & Shelf Overview
            </h2>
          </div>
        </div>

        <Link
          {...routes.toShelfIndex()}
          className="text-accent hover:text-accent/90 inline-flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
        >
          View all
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div
        className="border-border bg-card flex shrink-0 flex-col overflow-hidden rounded-xl border"
        style={{ height: SECTION_HEIGHT }}
      >
        {(shelves ?? []).length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-12 text-center">
            <div
              className="mb-3 flex size-12 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in oklch, var(--accent) 15%, transparent)",
              }}
              aria-hidden
            >
              <Rows3
                className="size-6"
                style={{ color: "var(--accent)" }}
                aria-hidden
              />
            </div>
            <p className="text-foreground font-medium">No Shelves in Store</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Add shelves via Shelf Management to start tracking compliance.
            </p>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full text-sm" role="grid">
                <thead className="bg-muted/80 sticky top-0 z-10 backdrop-blur-sm">
                  <tr className="border-border border-b">
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Aisle
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Bay
                    </th>
                    <th className="text-foreground min-w-[140px] px-4 py-3 text-left font-semibold">
                      Shelf Name
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Last Audit
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Compliance
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewShelves.map((shelf) => (
                    <tr
                      key={shelf.id}
                      className={cn(
                        "border-border/60 border-b transition-colors",
                        "hover:bg-muted/40 cursor-pointer",
                      )}
                      onClick={() => handleRowClick(shelf.id)}
                      role="row"
                    >
                      <td className="text-muted-foreground px-4 py-2.5">
                        {shelf.aisleCode ??
                          (shelf.aisleNumber != null
                            ? `A${shelf.aisleNumber}`
                            : "—")}
                      </td>
                      <td className="text-muted-foreground px-4 py-2.5">
                        {shelf.bayCode ??
                          (shelf.bayNumber != null ? shelf.bayNumber : "—")}
                      </td>
                      <td className="text-foreground max-w-[180px] truncate px-4 py-2.5 font-medium">
                        {shelf.shelfName}
                      </td>
                      <td className="text-muted-foreground px-4 py-2.5">
                        {shelf.lastAuditDate
                          ? shelf.status === "draft"
                            ? `Draft saved ${formatDistanceToNow(new Date(shelf.lastAuditDate), { addSuffix: true })}`
                            : formatDistanceToNow(
                                new Date(shelf.lastAuditDate),
                                { addSuffix: true },
                              )
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {shelf.complianceScore != null ? (
                          <span
                            className="font-semibold tabular-nums"
                            style={{
                              color: getComplianceColor(shelf.complianceScore),
                            }}
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
                            getAuditStatusClass(shelf.status as AuditStatus),
                          )}
                        >
                          {AUDIT_STATUS_LABELS[shelf.status as AuditStatus] ??
                            shelf.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="border-border bg-muted/20 shrink-0 border-t px-4 py-3">
                <Link
                  {...routes.toShelfIndex()}
                  className="text-accent hover:text-accent/90 flex w-full items-center justify-center gap-2 py-1 text-sm font-medium transition-colors"
                >
                  View all {(shelves ?? []).length} shelves
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
