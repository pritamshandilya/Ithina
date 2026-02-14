import { useEffect, useMemo, useState } from "react";
import { LayoutGridIcon, Search, TableIcon, AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedShelves, useDraftAudits, useReturnedAudits } from "@/features/maker/hooks";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { Audit } from "@/types/maker";

export interface AuditReviewQueueProps {
  className?: string;
  onAction?: (auditId: string, action: "resume" | "fix") => void;
}

type FilterType = "all" | "returned" | "draft";

function getShelfName(audit: Audit, shelves?: { id: string; shelfName: string }[]) {
  const shelf = shelves?.find((s) => s.id === audit.shelfId);
  return shelf?.shelfName ?? `Shelf ${audit.shelfId.replace("shelf-", "")}`;
}

export function AuditReviewQueue({ className, onAction }: AuditReviewQueueProps) {
  const { data: draftAudits, isLoading: isDraftsLoading } = useDraftAudits();
  const { data: returnedAudits, isLoading: isReturnedLoading } = useReturnedAudits();
  const { data: shelves } = useAssignedShelves();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [cardPage, setCardPage] = useState(1);
  const CARD_PAGE_SIZE = 9;

  const isLoading = isDraftsLoading || isReturnedLoading;

  const allAudits = useMemo(() => {
    const drafts = draftAudits || [];
    const returned = returnedAudits || [];
    return [...drafts, ...returned];
  }, [draftAudits, returnedAudits]);

  const filteredAudits = useMemo(() => {
    let result = allAudits;

    if (activeFilter === "returned") {
      result = result.filter((a) => a.status === "returned");
    } else if (activeFilter === "draft") {
      result = result.filter((a) => a.status === "draft");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.shelfId.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.draftSavedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.draftSavedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [allAudits, activeFilter, searchQuery]);

  useEffect(() => {
    setCardPage(1);
    setTablePagination((p) => ({ ...p, page: 1 }));
  }, [activeFilter, searchQuery]);

  const tableVisibleCount =
    viewMode === "table"
      ? Math.max(
          0,
          Math.min(
            tablePagination.pageSize,
            filteredAudits.length - (tablePagination.page - 1) * tablePagination.pageSize
          )
        )
      : 0;
  const cardTotalPages = Math.max(1, Math.ceil(filteredAudits.length / CARD_PAGE_SIZE));
  const paginatedCardAudits = filteredAudits.slice(
    (cardPage - 1) * CARD_PAGE_SIZE,
    cardPage * CARD_PAGE_SIZE
  );

  const tableColumns: DataTableColumn<Audit>[] = useMemo(
    () => [
      {
        title: "Shelf",
        field: "shelfId",
        sorter: "string",
        headerSort: true,
        formatter: (cell: { getData: () => Audit }) => {
          const audit = cell.getData();
          const name = getShelfName(audit, shelves);
          return `<span class="font-medium text-foreground">${name}</span>`;
        },
      },
      {
        title: "Status",
        field: "status",
        sorter: "string",
        headerSort: true,
        formatter: (cell: { getData: () => Audit }) => {
          const audit = cell.getData();
          const label = AUDIT_STATUS_LABELS[audit.status] ?? audit.status;
          const statusClass = getAuditStatusClass(audit.status);
          return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}">${label}</span>`;
        },
      },
      {
        title: "Date",
        field: "submittedAt",
        sorter: "datetime",
        headerSort: true,
        formatter: (cell: { getData: () => Audit }) => {
          const audit = cell.getData();
          const date = audit.submittedAt || audit.draftSavedAt;
          if (!date) return "—";
          return `<span class="text-sm text-muted-foreground">${formatDistanceToNow(new Date(date), { addSuffix: true })}</span>`;
        },
      },
      {
        title: "Compliance",
        field: "complianceScore",
        sorter: "number",
        headerSort: true,
        formatter: (cell: { getData: () => Audit }) => {
          const audit = cell.getData();
          if (audit.complianceScore == null) return "—";
          const color =
            audit.complianceScore >= 90
              ? "var(--chart-2)"
              : audit.complianceScore >= 75
                ? "var(--accent)"
                : "var(--destructive)";
          return `<span class="tabular-nums font-semibold" style="color:${color}">${audit.complianceScore}%</span>`;
        },
      },
      {
        title: "Actions",
        field: "id",
        width: 120,
        headerSort: false,
        headerFilter: false,
        hozAlign: "center",
        formatter: (cell: { getData: () => Audit }) => {
          const audit = cell.getData();
          const isReturned = audit.status === "returned";
          const label = isReturned ? "Fix Issues" : "Resume";
          const btnClass =
            "rounded-md border px-2.5 py-1 text-xs font-medium " +
            (isReturned
              ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "border-accent bg-accent text-accent-foreground hover:opacity-90");
          return `<button type="button" class="${btnClass}">${label}</button>`;
        },
        cellClick: (
          event: unknown,
          cell: { getData: () => Audit }
        ) => {
          (event as { stopPropagation?: () => void }).stopPropagation?.();
          const audit = cell.getData();
          onAction?.(audit.id, audit.status === "returned" ? "fix" : "resume");
        },
      },
    ],
    [shelves, onAction]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <FilterButton
            label="All Needs Attention"
            count={allAudits.length}
            isActive={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <FilterButton
            label="Returned"
            count={(returnedAudits || []).length}
            isActive={activeFilter === "returned"}
            onClick={() => setActiveFilter("returned")}
          />
          <FilterButton
            label="Drafts"
            count={(draftAudits || []).length}
            isActive={activeFilter === "draft"}
            onClick={() => setActiveFilter("draft")}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search by shelf or audit ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
              aria-label="Search audits"
            />
          </div>
          <div
            className="flex rounded-lg border border-border p-0.5 bg-card"
            role="tablist"
            aria-label="View mode"
          >
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
      </div>

      {filteredAudits.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No audits found matching your criteria.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredAudits.length}</span> audits
            </p>
          </div>
          <DataTable
            columns={tableColumns}
            data={filteredAudits}
            rowIdField="id"
            initialSort={{ field: "submittedAt", dir: "desc" }}
            emptyMessage="No audits match the current filter"
            pageSize={10}
            pageSizeSelector={[5, 10, 20, 50]}
            onPaginationChange={setTablePagination}
          />
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{paginatedCardAudits.length}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredAudits.length}</span> audits
            </p>
          </div>
          <div className="dashboard-grid">
            {paginatedCardAudits.map((audit) => (
              <AuditCard
                key={audit.id}
                audit={audit}
                shelves={shelves}
                onAction={onAction}
              />
            ))}
          </div>
          {cardTotalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCardPage((p) => Math.max(1, p - 1))}
                disabled={cardPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{cardPage}</span> of{" "}
                <span className="font-semibold text-foreground">{cardTotalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCardPage((p) => Math.min(cardTotalPages, p + 1))}
                disabled={cardPage === cardTotalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-accent text-accent-foreground border-accent shadow-sm"
          : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-accent-foreground"
      )}
      aria-pressed={isActive}
    >
      {label}
      <span className="ml-2 text-xs opacity-75">({count})</span>
    </button>
  );
}

function AuditCard({
  audit,
  shelves,
  onAction,
}: {
  audit: Audit;
  shelves?: { id: string; shelfName: string }[];
  onAction?: (auditId: string, action: "resume" | "fix") => void;
}) {
  const isReturned = audit.status === "returned";
  const date = audit.submittedAt || audit.draftSavedAt;

  return (
    <div className="rounded-lg bg-card border border-border p-4 space-y-3 transition-all">
      {/* Header with shelf name and status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-card-foreground">
            {getShelfName(audit, shelves)}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock className="size-3.5 shrink-0" />
            {date
              ? formatDistanceToNow(new Date(date), { addSuffix: true })
              : "Unknown date"}
          </p>
        </div>
        <StatusBadge status={audit.status} size="sm" />
      </div>

      {/* Rejection reason (returned audits) */}
      {isReturned && audit.rejectionReason && (
        <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
          <p className="font-medium flex items-center gap-2 text-foreground">
            <AlertTriangle className="size-4 shrink-0" />
            Correction Needed
          </p>
          <p className="mt-1 text-muted-foreground line-clamp-2">
            {audit.rejectionReason}
          </p>
        </div>
      )}

      {/* Draft progress */}
      {audit.status === "draft" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium text-accent">{audit.draftProgress ?? 0}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${audit.draftProgress ?? 0}%` }}
              role="progressbar"
              aria-valuenow={audit.draftProgress ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Compliance score (if available) */}
      {audit.complianceScore !== undefined && (
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Compliance</span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{
              color:
                audit.complianceScore >= 90
                  ? "var(--chart-2)"
                  : audit.complianceScore >= 75
                    ? "var(--accent)"
                    : "var(--destructive)",
            }}
          >
            {audit.complianceScore}%
          </span>
        </div>
      )}

      {/* Action */}
      <div className="pt-2 border-t border-border">
        <Button
          variant={isReturned ? "outline" : "default"}
          size="sm"
          className="w-full"
          onClick={() => onAction?.(audit.id, isReturned ? "fix" : "resume")}
        >
          {isReturned ? "Fix Issues" : "Resume Audit"}
        </Button>
      </div>
    </div>
  );
}
