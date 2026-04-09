import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import { Check, Trash2, X } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

import { AuditQueueCard } from "@/components/checker/audit-queue-card";
import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";
import type { AuditQueueFilter, AuditQueueSort } from "@/types/checker-ui";
import {
  AUDIT_BASE_TABLE_COLUMNS,
  CARD_PAGE_SIZE,
  filterOptions,
  INITIAL_SORT,
  PAGE_SIZE_OPTIONS,
  type ViewMode,
} from "./audit-review-queue.constants";
import { AuditReviewQueueToolbar } from "./audit-review-queue-toolbar";
import { useAuditReviewQueueData } from "./use-audit-review-queue-data";

export interface AuditReviewQueueProps {
  audits?: CheckerAudit[];
  isLoading?: boolean;
  error?: Error | null;
  onAuditClick?: (auditId: string, event?: unknown) => void;
  onApprove?: (auditId: string) => void;
  onReject?: (auditId: string) => void;
  onDelete?: (auditId: string) => void;
  className?: string;
}

const ACTIONS_COLUMN: DataTableColumn<CheckerAudit> = {
  title: "Actions",
  field: "id",
  width: 180,
  headerSort: false,
  headerFilter: false,
  hozAlign: "center",
  formatter: () => {
    const approveBtn = renderToStaticMarkup(
      <IconButton
        type="button"
        className="approve-btn"
        variant="success-outline"
        size="icon-sm"
        aria-label="Approve"
        icon={<Check size={16} aria-hidden />}
      />,
    );

    const rejectBtn = renderToStaticMarkup(
      <IconButton
        type="button"
        className="reject-btn"
        variant="destructive-ghost"
        size="icon-sm"
        aria-label="Reject/Return"
        icon={<X size={16} aria-hidden />}
      />,
    );

    const deleteBtn = renderToStaticMarkup(
      <IconButton
        type="button"
        className="delete-btn"
        variant="destructive-ghost"
        size="icon-sm"
        aria-label="Delete"
        icon={<Trash2 size={16} aria-hidden />}
      />,
    );

    return `<div class="flex items-center justify-center gap-2">${approveBtn}${rejectBtn}${deleteBtn}</div>`;
  },
};

export function AuditReviewQueue({
  audits = [],
  isLoading,
  error,
  onAuditClick,
  onApprove,
  onReject,
  onDelete,
  className,
}: AuditReviewQueueProps) {
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();
  const [activeFilter, setActiveFilter] = useState<AuditQueueFilter>("all");
  const [sortBy, setSortBy] = useState<AuditQueueSort>("compliance-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [cardPage, setCardPage] = useState(1);

  const resetPagination = useCallback(() => {
    setCardPage(1);
    setTablePagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, []);

  const handleReviewClick = useCallback(
    (auditId: string, event?: unknown) => {
      const target =
        event && typeof event === "object" && "target" in event
          ? (event.target as EventTarget | null)
          : null;

      if (target instanceof HTMLElement && target.closest("button")) {
        // If the click originated from an action button, don't trigger review navigation
        return;
      }

      if (onAuditClick) {
        onAuditClick(auditId, event);
      } else {
        navigate({ ...routes.toReviewAudit(auditId) });
      }
    },
    [onAuditClick, navigate, routes]
  );

  const tableColumns = useMemo<DataTableColumn<CheckerAudit>[]>(() => {
    return [
      ...AUDIT_BASE_TABLE_COLUMNS,
      {
        ...ACTIONS_COLUMN,
        cellClick: (event: unknown, cell: DataTableCell<CheckerAudit>) => {
          const e = event as MouseEvent | undefined;
          if (!e) return;
          e.stopPropagation();

          const target = e.target as HTMLElement;
          const audit = cell.getData();

          if (target.closest(".approve-btn") && onApprove) {
            onApprove(audit.id);
          } else if (target.closest(".reject-btn") && onReject) {
            onReject(audit.id);
          } else if (target.closest(".delete-btn") && onDelete) {
            onDelete(audit.id);
          } else if (target.closest(".review-btn")) {
            handleReviewClick(audit.id);
          }
        },
      },
    ];
  }, [handleReviewClick, onApprove, onReject, onDelete]);

  const filteredAndSortedAudits = useAuditReviewQueueData({
    audits,
    activeFilter,
    sortBy,
    searchQuery,
  });

  const cardTotalPages = Math.max(1, Math.ceil(filteredAndSortedAudits.length / CARD_PAGE_SIZE));
  const visibleCardPage = Math.min(cardPage, cardTotalPages);

  const paginatedCardAudits = useMemo(() => {
    const start = (visibleCardPage - 1) * CARD_PAGE_SIZE;
    return filteredAndSortedAudits.slice(start, start + CARD_PAGE_SIZE);
  }, [filteredAndSortedAudits, visibleCardPage]);

  const tableVisibleCount = useMemo(() => {
    const start = (tablePagination.page - 1) * tablePagination.pageSize;
    const remaining = filteredAndSortedAudits.length - start;
    return Math.max(0, Math.min(tablePagination.pageSize, remaining));
  }, [filteredAndSortedAudits.length, tablePagination.page, tablePagination.pageSize]);

  const visibleCount = viewMode === "table" ? tableVisibleCount : paginatedCardAudits.length;

  const handleFilterChange = (nextFilter: AuditQueueFilter) => {
    setActiveFilter(nextFilter);
    resetPagination();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPagination();
  };

  const handleSortChange = (value: AuditQueueSort) => {
    setSortBy(value);
    resetPagination();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>

        {/* Card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-lg border border-destructive bg-destructive/10 p-6", className)}>
        <p className="text-destructive font-semibold text-center">
          Failed to load audit queue
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <AuditReviewQueueToolbar
        audits={audits}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mt-3 flex-1 min-h-0 overflow-auto">
        {filteredAndSortedAudits.length === 0 ? (
          <div className="flex min-h-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-10 text-center">
            <div>
              <p className="font-medium text-muted-foreground">
                {searchQuery.trim()
                  ? `No audits found matching "${searchQuery}"`
                  : `No ${activeFilter === "all" ? "pending" : filterOptions.find((f) => f.value === activeFilter)?.label.toLowerCase()} audits`}
              </p>
              {searchQuery.trim() && (
                <button
                  onClick={() => handleSearchChange("")}
                  type="button"
                  className="mt-3 text-sm text-accent underline hover:text-accent/80"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "table" ? (
          <>
            <DataTable<CheckerAudit>
              columns={tableColumns}
              data={filteredAndSortedAudits}
              rowIdField="id"
              initialSort={INITIAL_SORT}
              emptyMessage="No audits match the current filters"
              pageSize={10}
              pageSizeSelector={PAGE_SIZE_OPTIONS}
              onPaginationChange={setTablePagination}
              onRowClick={(row, event) => handleReviewClick(row.id, event)}
            />

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Showing {visibleCount} of {filteredAndSortedAudits.length} audits
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedCardAudits.map((audit) => (
                <AuditQueueCard
                  key={audit.id}
                  audit={audit}
                  onClick={onAuditClick}
                  onApprove={onApprove}
                  onReject={onReject}
                  onDelete={onDelete}
                />
              ))}
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCardPage((page) => Math.max(1, Math.min(page, cardTotalPages) - 1))}
                disabled={visibleCardPage === 1}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  visibleCardPage === 1
                    ? "cursor-not-allowed border-border/60 text-muted-foreground/60"
                    : "border-border text-foreground hover:bg-accent/40"
                )}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{visibleCardPage}</span> of{" "}
                <span className="font-semibold text-foreground">{cardTotalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => setCardPage((page) => Math.min(cardTotalPages, Math.min(page, cardTotalPages) + 1))}
                disabled={visibleCardPage === cardTotalPages}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  visibleCardPage === cardTotalPages
                    ? "cursor-not-allowed border-border/60 text-muted-foreground/60"
                    : "border-border text-foreground hover:bg-accent/40"
                )}
              >
                Next
              </button>
            </div>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Showing {visibleCount} of {filteredAndSortedAudits.length} audits
            </p>
          </>
        )}
      </div>
    </div>
  );
}
