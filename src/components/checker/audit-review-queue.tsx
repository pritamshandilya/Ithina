/**
 * Audit Review Queue Component
 * 
 * Main section of the Checker Dashboard displaying pending audits.
 * 
 * Features:
 * - Filter tabs (All, Critical, Needs Attention, Good, Planogram Based, Adhoc Analysis)
 * - Sort options (Compliance, Time, Violations)
 * - Search by shelf ID or submitter name
 * - Grid of AuditQueueCard components
 * - Default sort: Lowest compliance first
 * - Loading states
 * - Empty states
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LayoutGridIcon, Search, TableIcon } from "lucide-react";

import { AuditQueueCard } from "@/components/checker/audit-queue-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditQueueFilter, AuditQueueSort } from "@/features/checker/types";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const INITIAL_SORT = { field: "complianceScore", dir: "asc" } as const;

export interface AuditReviewQueueProps {
  /**
   * List of pending audits
   */
  audits?: CheckerAudit[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: Error | null;

  /**
   * Click handler when an audit card is clicked
   */
  onAuditClick?: (auditId: string, event?: any) => void;

  /**
   * Action handlers
   */
  onApprove?: (auditId: string) => void;
  onReject?: (auditId: string) => void;
  onDelete?: (auditId: string) => void;

  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Filter configuration with labels and count functions
 */
const filterOptions: {
  value: AuditQueueFilter;
  label: string;
  count?: (audits: CheckerAudit[]) => number;
}[] = [
    {
      value: "all",
      label: "All Pending",
      count: (audits) => audits.length,
    },
    {
      value: "critical",
      label: "Critical",
      count: (audits) => audits.filter((a) => (a.complianceScore || 0) < 50).length,
    },
    {
      value: "attention",
      label: "Needs Attention",
      count: (audits) => audits.filter((a) => {
        const score = a.complianceScore || 0;
        return score >= 50 && score < 80;
      }).length,
    },
    {
      value: "good",
      label: "Good",
      count: (audits) => audits.filter((a) => (a.complianceScore || 0) >= 80).length,
    },
    {
      value: "planogram",
      label: "Planogram Based",
      count: (audits) => audits.filter((a) => a.mode === "planogram-based" || a.mode === "vision-edge").length,
    },
    {
      value: "adhoc",
      label: "Adhoc Analysis",
      count: (audits) => audits.filter((a) => a.mode === "adhoc" || a.mode === "assist-mode").length,
    },
  ];

type ViewMode = "table" | "card";
const CARD_PAGE_SIZE = 9;

const AUDIT_BASE_TABLE_COLUMNS: DataTableColumn<CheckerAudit>[] = [
  {
    title: "Aisle",
    field: "shelfInfo.aisleNumber",
    sorter: "number",
    width: 90,
    formatter: (cell) => {
      const value = (cell as { getValue: () => number | undefined }).getValue();
      if (value == null) return "A-";
      return `A${value}`;
    },
  },
  {
    title: "Bay",
    field: "shelfInfo.bayNumber",
    sorter: "number",
    width: 90,
    formatter: (cell) => {
      const value = (cell as { getValue: () => number | undefined }).getValue();
      if (value == null) return "B-";
      return `B${value}`;
    },
  },
  {
    title: "Shelf",
    field: "shelfInfo.shelfName",
    sorter: "string",
    minWidth: 200,
  },
  {
    title: "Submitter",
    field: "submittedByName",
    sorter: "string",
    minWidth: 160,
  },
  {
    title: "Mode",
    field: "mode",
    sorter: "string",
    width: 150,
    formatter: (cell) => {
      const mode = (cell as { getValue: () => string }).getValue();
      const label = mode === "planogram-based" || mode === "vision-edge" ? "Planogram Based" : "Adhoc Analysis";
      return label;
    },
  },
  {
    title: "Compliance",
    field: "complianceScore",
    sorter: "number",
    width: 130,
    formatter: (cell) => {
      const score = (cell as { getValue: () => number | undefined }).getValue();
      if (score == null) return "N/A";
      const color =
        score < 50
          ? "var(--destructive)"
          : score < 80
            ? "var(--action-warning)"
            : "var(--chart-2)";
      return `<span class="tabular-nums font-semibold" style="color:${color}">${score}%</span>`;
    },
  },
  {
    title: "Violations",
    field: "violationCount",
    sorter: "number",
    width: 120,
  },
  {
    title: "Submitted",
    field: "submittedAt",
    sorter: "datetime",
    width: 170,
    formatter: (cell) => {
      const value = (cell as { getValue: () => string | Date | undefined }).getValue();
      if (!value) return "N/A";
      return new Date(value).toLocaleString();
    },
  },
];

/**
 * AuditReviewQueue Component
 * 
 * Displays filterable, sortable grid of pending audits.
 * Default sort: Lowest compliance score first (most critical at top).
 */
const ACTIONS_COLUMN: DataTableColumn<CheckerAudit> = {
  title: "Actions",
  field: "id",
  width: 180,
  headerSort: false,
  headerFilter: false,
  hozAlign: "center",
  formatter: () => `
    <div class="flex items-center justify-center gap-2">
      <button type="button" class="approve-btn p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors" title="Approve">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </button>
      <button type="button" class="reject-btn p-1.5 rounded-md bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors" title="Reject/Return">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <button type="button" class="delete-btn p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
      </button>
    </div>
  `,
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
  const [activeFilter, setActiveFilter] = useState<AuditQueueFilter>("all");
  const [sortBy, setSortBy] = useState<AuditQueueSort>("compliance-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [cardPage, setCardPage] = useState(1);

  const handleReviewClick = useCallback(
    (auditId: string, event?: any) => {
      if (event && event.target && (event.target as HTMLElement).closest("button")) {
        // If the click originated from an action button, don't trigger review navigation
        return;
      }

      if (onAuditClick) {
        onAuditClick(auditId, event);
      } else {
        navigate({ to: "/checker/review/$auditId", params: { auditId } });
      }
    },
    [onAuditClick, navigate]
  );

  const tableColumns = useMemo<DataTableColumn<CheckerAudit>[]>(() => {
    return [
      ...AUDIT_BASE_TABLE_COLUMNS,
      {
        ...ACTIONS_COLUMN,
        cellClick: (event: unknown, cell: { getData: () => CheckerAudit; getElement: () => HTMLElement }) => {
          const e = event as MouseEvent;
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

  // Filter and sort audits
  const filteredAndSortedAudits = useMemo(() => {
    if (!audits) return [];

    // Apply filters
    let filtered = audits;

    // Status filters
    if (activeFilter === "critical") {
      filtered = filtered.filter((a) => (a.complianceScore || 0) < 50);
    } else if (activeFilter === "attention") {
      filtered = filtered.filter((a) => {
        const score = a.complianceScore || 0;
        return score >= 50 && score < 80;
      });
    } else if (activeFilter === "good") {
      filtered = filtered.filter((a) => (a.complianceScore || 0) >= 80);
    } else if (activeFilter === "planogram") {
      filtered = filtered.filter((a) => a.mode === "planogram-based" || a.mode === "vision-edge");
    } else if (activeFilter === "adhoc") {
      filtered = filtered.filter((a) => a.mode === "adhoc" || a.mode === "assist-mode");
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((audit) => {
        const shelfInfo = `aisle ${audit.shelfInfo.aisleNumber} bay ${audit.shelfInfo.bayNumber} ${audit.shelfInfo.shelfName}`.toLowerCase();
        const submitter = audit.submittedByName.toLowerCase();
        return shelfInfo.includes(query) || submitter.includes(query);
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    const getSubmittedAtTime = (audit: CheckerAudit) =>
      audit.submittedAt ? new Date(audit.submittedAt).getTime() : 0;

    switch (sortBy) {
      case "compliance-asc":
        sorted.sort((a, b) => (a.complianceScore || 0) - (b.complianceScore || 0));
        break;
      case "compliance-desc":
        sorted.sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0));
        break;
      case "time-asc":
        sorted.sort((a, b) => getSubmittedAtTime(a) - getSubmittedAtTime(b));
        break;
      case "time-desc":
        sorted.sort((a, b) => getSubmittedAtTime(b) - getSubmittedAtTime(a));
        break;
      case "violations-desc":
        sorted.sort((a, b) => b.violationCount - a.violationCount);
        break;
      case "violations-asc":
        sorted.sort((a, b) => a.violationCount - b.violationCount);
        break;
    }

    return sorted;
  }, [audits, activeFilter, sortBy, searchQuery]);

  const cardTotalPages = Math.max(1, Math.ceil(filteredAndSortedAudits.length / CARD_PAGE_SIZE));

  const paginatedCardAudits = useMemo(() => {
    const start = (cardPage - 1) * CARD_PAGE_SIZE;
    return filteredAndSortedAudits.slice(start, start + CARD_PAGE_SIZE);
  }, [cardPage, filteredAndSortedAudits]);

  const tableVisibleCount = useMemo(() => {
    const start = (tablePagination.page - 1) * tablePagination.pageSize;
    const remaining = filteredAndSortedAudits.length - start;
    return Math.max(0, Math.min(tablePagination.pageSize, remaining));
  }, [filteredAndSortedAudits.length, tablePagination.page, tablePagination.pageSize]);

  const visibleCount = viewMode === "table" ? tableVisibleCount : paginatedCardAudits.length;

  useEffect(() => {
    setCardPage(1);
    setTablePagination((prev) => ({ ...prev, page: 1 }));
  }, [activeFilter, searchQuery, sortBy]);

  useEffect(() => {
    if (cardPage > cardTotalPages) {
      setCardPage(cardTotalPages);
    }
  }, [cardPage, cardTotalPages]);

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
      {/* Filter Tabs and Search */}
      <div className="shrink-0 space-y-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const count = option.count ? option.count(audits) : 0;
            const isActive = activeFilter === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  "border-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                  isActive
                    ? "border-accent bg-accent/15 text-accent shadow-sm"
                    : "border-border bg-card text-card-foreground hover:border-accent/50"
                )}
                aria-label={`Filter: ${option.label}`}
                aria-pressed={isActive}
              >
                <span>{option.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                      isActive
                        ? "bg-accent text-white"
                        : "bg-muted text-white"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by shelf or submitter name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search audits"
          />
        </div>
      </div>

      {/* Sort and View Options */}
      <div className="mt-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as AuditQueueSort)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Sort audits"
          >
            <option value="compliance-asc">Lowest Compliance First</option>
            <option value="compliance-desc">Highest Compliance First</option>
            <option value="time-desc">Newest First</option>
            <option value="time-asc">Oldest First</option>
            <option value="violations-desc">Most Violations First</option>
            <option value="violations-asc">Least Violations First</option>
          </select>
        </div>

        <div className="flex rounded-lg border border-border p-0.5 bg-card" role="tablist" aria-label="Queue view mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "table"}
            onClick={() => setViewMode("table")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              viewMode === "table"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <TableIcon className="size-4" aria-hidden="true" />
            Table
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "card"}
            onClick={() => setViewMode("card")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              viewMode === "card"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <LayoutGridIcon className="size-4" aria-hidden="true" />
            Cards
          </button>
        </div>
      </div>

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
                  onClick={() => setSearchQuery("")}
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
                onClick={() => setCardPage((page) => Math.max(1, page - 1))}
                disabled={cardPage === 1}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  cardPage === 1
                    ? "cursor-not-allowed border-border/60 text-muted-foreground/60"
                    : "border-border text-foreground hover:bg-accent/40"
                )}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{cardPage}</span> of{" "}
                <span className="font-semibold text-foreground">{cardTotalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => setCardPage((page) => Math.min(cardTotalPages, page + 1))}
                disabled={cardPage === cardTotalPages}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  cardPage === cardTotalPages
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
