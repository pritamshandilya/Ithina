import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { LayoutGridIcon, TableIcon } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useShelves } from "@/queries/maker";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { AuditStatus, Shelf } from "@/types/maker";

import { ShelfCard } from "./shelf-card";

/** Assigned shelves table column definitions */
const SHELF_TABLE_COLUMNS: DataTableColumn<Shelf>[] = [
  {
    title: "ID",
    field: "shelfCode",
    sorter: "string",
    width: 120,
    headerSort: true,
    formatter: (cell) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      return `<span class="font-mono text-sm font-medium text-foreground">${shelf.shelfCode ?? shelf.shelf_id ?? "—"}</span>`;
    },
  },
  {
    title: "Aisle",
    field: "aisleCode",
    sorter: "string",
    width: 90,
    headerSort: true,
    formatter: (cell) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      return (
        shelf.aisleCode ??
        (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "—")
      );
    },
  },
  {
    title: "Shelf Name",
    field: "shelfName",
    sorter: "string",
    minWidth: 160,
    headerSort: true,
  },
  {
    title: "Zone / Section",
    field: "zone",
    sorter: "string",
    minWidth: 180,
    headerSort: true,
    formatter: (cell) => {
      const data = (cell as { getData: () => Shelf }).getData();
      return `
        <div class="flex flex-col gap-1 py-1">
          <span class="text-sm font-medium text-foreground">${data.zone ?? "—"}</span>
          <span class="text-xs text-muted-foreground">${data.section ?? "—"}</span>
        </div>
      `;
    },
  },
  {
    title: "Fixture",
    field: "fixtureType",
    sorter: "string",
    minWidth: 180,
    headerSort: true,
    formatter: (cell) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      const type = shelf.fixtureType?.replace(/_/g, " ") ?? "—";
      return `
        <div class="flex flex-col gap-1 py-1">
          <span class="text-sm font-medium text-foreground">${type}</span>
          <span class="text-xs text-muted-foreground">${shelf.dimensions ?? "—"}</span>
        </div>
      `;
    },
  },
  {
    title: "Last Audit",
    field: "lastAuditDate",
    sorter: "datetime",
    width: 140,
    headerSort: true,
    formatter: (cell) => {
      const val = (cell as { getValue: () => unknown }).getValue();
      if (val == null) return "—";
      const date = val instanceof Date ? val : new Date(val as string | number);
      const data = (cell as { getData: () => Shelf }).getData();
      if (data.status === "draft") {
        return `Draft saved ${formatDistanceToNow(date, { addSuffix: true })}`;
      }
      return formatDistanceToNow(date, { addSuffix: true });
    },
  },
  {
    title: "Compliance",
    field: "complianceScore",
    sorter: "number",
    width: 110,
    headerSort: true,
    formatter: (cell) => {
      const val = (cell as { getValue: () => unknown }).getValue();
      if (val == null || typeof val !== "number") return "—";
      const color =
        val >= 90
          ? "var(--chart-2)"
          : val >= 75
            ? "var(--accent)"
            : "var(--destructive)";
      return `<span class="tabular-nums font-semibold" style="color:${color}">${val}%</span>`;
    },
  },
  {
    title: "Status",
    field: "status",
    sorter: "string",
    width: 140,
    headerSort: true,
    formatter: (cell) => {
      const val = (cell as { getValue: () => unknown }).getValue() as AuditStatus;
      const label = AUDIT_STATUS_LABELS[val] ?? val;
      const statusClass = getAuditStatusClass(val);
      return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}">${label}</span>`;
    },
  },
];

/**
 * Props for the AssignedShelvesList component
 */
export interface AssignedShelvesListProps {
  onShelfClick?: (shelfId: string) => void;
  className?: string;
}

/**
 * Filter option type
 */
type FilterOption = "all" | AuditStatus;

/**
 * View mode: table (default) or card
 */
type ViewMode = "table" | "card";
const CARD_PAGE_SIZE = 9;

/**
 * Filter options configuration
 */
const filterOptions: { value: FilterOption; label: string; count?: (shelves: Shelf[]) => number }[] = [
  {
    value: "all",
    label: "All Shelves",
    count: (shelves) => shelves.length,
  },
  {
    value: "draft",
    label: "Draft",
    count: (shelves) => shelves.filter((s) => s.status === "draft").length,
  },
  {
    value: "never-audited",
    label: "Never Audited",
    count: (shelves) => shelves.filter((s) => s.status === "never-audited").length,
  },
  {
    value: "pending",
    label: "Pending Review",
    count: (shelves) => shelves.filter((s) => s.status === "pending").length,
  },
  {
    value: "returned",
    label: "Returned",
    count: (shelves) => shelves.filter((s) => s.status === "returned").length,
  },
  {
    value: "approved",
    label: "Approved",
    count: (shelves) => shelves.filter((s) => s.status === "approved").length,
  },
];

/**
 * AssignedShelvesList Component
 * 
 * Displays a filterable grid of assigned shelves with status indicators.
 * 
 * Features:
 * - Filter by status (All, Never Audited, Pending, Returned, Approved)
 * - Responsive grid layout (1→2→3 columns)
 * - Loading skeletons
 * - Empty states
 * - Error handling
 * - Click handler support
 * 
 * @example
 * ```tsx
 * <AssignedShelvesList 
 *   onShelfClick={(id) => navigate(`/shelf/${id}`)}
 * />
 * ```
 */
export function AssignedShelvesList({
  onShelfClick,
  className,
}: AssignedShelvesListProps) {
  const { data: shelves, isLoading, error } = useShelves();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [cardPage, setCardPage] = useState(1);

  // Filter shelves based on active filter
  const filteredShelves = useMemo(() => {
    if (!shelves) return [];
    if (activeFilter === "all") return shelves;
    return shelves.filter((shelf) => shelf.status === activeFilter);
  }, [shelves, activeFilter]);

  const cardTotalPages = Math.max(1, Math.ceil(filteredShelves.length / CARD_PAGE_SIZE));
  const visibleCardPage = Math.min(cardPage, cardTotalPages);
  const paginatedCardShelves = useMemo(() => {
    const start = (visibleCardPage - 1) * CARD_PAGE_SIZE;
    return filteredShelves.slice(start, start + CARD_PAGE_SIZE);
  }, [filteredShelves, visibleCardPage]);

  const tableVisibleCount = useMemo(() => {
    const start = (tablePagination.page - 1) * tablePagination.pageSize;
    const remaining = filteredShelves.length - start;
    return Math.max(0, Math.min(tablePagination.pageSize, remaining));
  }, [filteredShelves.length, tablePagination.page, tablePagination.pageSize]);

  const visibleShelvesCount =
    viewMode === "table" ? tableVisibleCount : paginatedCardShelves.length;

  const handleFilterChange = (nextFilter: FilterOption) => {
    setActiveFilter(nextFilter);
    setCardPage(1);
    setTablePagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Filter skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="dashboard-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg bg-card border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg bg-destructive/10 border border-destructive p-6 text-center">
          <p className="text-destructive font-semibold">
            Failed to load assigned shelves
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!shelves || shelves.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg bg-card border border-border p-12 text-center">
          <p className="text-lg font-semibold text-card-foreground">
            No Shelves Assigned
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have any shelves assigned yet. Contact your manager to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filterOptions.map((option) => {
          const count = option.count ? option.count(shelves) : 0;
          const isActive = activeFilter === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-accent-foreground"
              )}
              aria-pressed={isActive}
              aria-label={`Filter by ${option.label}, ${count} shelves`}
            >
              {option.label}
              <span className="ml-2 text-xs opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filtered count and view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {visibleShelvesCount}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {filteredShelves.length}
          </span>{" "}
          shelves
        </p>
        <div className="flex rounded-lg border border-border p-0.5 bg-card" role="tablist" aria-label="View mode">
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

      {/* Shelves: Table or Card view */}
      {filteredShelves.length === 0 ? (
        <div className="rounded-lg bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No shelves found with status:{" "}
            <span className="font-semibold text-foreground">
              {filterOptions.find((o) => o.value === activeFilter)?.label}
            </span>
          </p>
        </div>
      ) : viewMode === "table" ? (
        <DataTable<Shelf>
          columns={SHELF_TABLE_COLUMNS}
          data={filteredShelves}
          rowIdField="id"
          initialSort={{ field: "aisleCode", dir: "asc" }}
          emptyMessage="No shelves match the current filter"
          pageSize={10}
          pageSizeSelector={[5, 10, 20, 50]}
          onPaginationChange={setTablePagination}
          onRowClick={onShelfClick ? (row) => onShelfClick(row.id) : undefined}
        />
      ) : (
        <div className="space-y-4">
          <div className="dashboard-grid">
            {paginatedCardShelves.map((shelf) => (
              <ShelfCard key={shelf.id} shelf={shelf} onClick={onShelfClick} />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
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
        </div>
      )}
    </div>
  );
}
