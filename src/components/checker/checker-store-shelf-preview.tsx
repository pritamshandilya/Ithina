import { Link, useNavigate } from "@tanstack/react-router";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import { formatDistanceToNow } from "date-fns";
import { Rows3, Store, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useShelves } from "@/queries/maker";
import { useComplianceOverview } from "@/queries/checker";
import { useStore } from "@/providers/store";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
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
          className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
          style={{ height: SECTION_HEIGHT }}
        >
          <div className="p-4 space-y-3">
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
              backgroundColor: "color-mix(in oklch, var(--accent) 15%, transparent)",
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
            <h2 className="text-lg font-semibold text-foreground">
              Store & Shelf Overview
            </h2>
            
          </div>
        </div>

        <Link
          {...routes.toShelfIndex()}
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
        {(shelves ?? []).length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-12 text-center">
            <div
              className="flex size-12 items-center justify-center rounded-full mb-3"
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
            <p className="font-medium text-foreground">No Shelves in Store</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add shelves via Shelf Management to start tracking compliance.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full text-sm" role="grid">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Aisle
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Bay
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground min-w-[140px]">
                      Shelf Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Last Audit
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Compliance
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewShelves.map((shelf) => (
                    <tr
                      key={shelf.id}
                      className={cn(
                        "border-b border-border/60 transition-colors",
                        "cursor-pointer hover:bg-muted/40"
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
                            formatDistanceToNow(
                              new Date(shelf.lastAuditDate),
                              { addSuffix: true }
                            )
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {shelf.complianceScore != null ? (
                          <span
                            className="tabular-nums font-semibold"
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
                            getAuditStatusClass(shelf.status as AuditStatus)
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
              <div className="border-t border-border px-4 py-3 bg-muted/20 shrink-0">
                <Link
                  {...routes.toShelfIndex()}
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-accent hover:text-accent/90 transition-colors py-1"
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
