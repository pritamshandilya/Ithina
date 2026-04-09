/**
 * Audit Review Queue Component
 *
 * Tabular display of all audits including drafts, pending, approved, and returned.
 * Uses shared DataTable with dotted column lines, status badges, and action buttons.
 * Matches the pattern used in MyAuditsSection, AssignedShelvesList, and Compliance Rules.
 */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useShelves, useMakerAudits } from "@/queries/maker";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { Audit } from "@/types/maker";

export interface AuditReviewQueueProps {
  className?: string;
  onAction?: (auditId: string, action: "resume" | "fix") => void;
}

type FilterType = "all" | "returned" | "draft" | "pending" | "approved";

function getShelfName(audit: Audit, shelves?: { id: string; shelfName: string }[]) {
  const shelf = shelves?.find((s) => s.id === audit.shelfId);
  return shelf?.shelfName ?? `Shelf ${audit.shelfId.replace("shelf-", "")}`;
}

export function AuditReviewQueue({ className, onAction }: AuditReviewQueueProps) {
  const { data: allAudits, isLoading } = useMakerAudits();
  const { data: shelves } = useShelves();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });

  const resetPagination = () => {
    setTablePagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  };

  const filteredAudits = useMemo(() => {
    let result = allAudits || [];

    if (activeFilter !== "all") {
      result = result.filter((a) => a.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.shelfId.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          getShelfName(a, shelves).toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.draftSavedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.draftSavedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [allAudits, activeFilter, searchQuery, shelves]);

  const tableVisibleCount = Math.max(
    0,
    Math.min(
      tablePagination.pageSize,
      filteredAudits.length - (tablePagination.page - 1) * tablePagination.pageSize
    )
  );

  const tableColumns: DataTableColumn<Audit>[] = useMemo(
    () => [
      {
        title: "Shelf",
        field: "shelfId",
        minWidth: 140,
        sorter: "string",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const name = getShelfName(audit, shelves);
          return `<span class="font-medium text-foreground">${name}</span>`;
        },
      },
      {
        title: "Status",
        field: "status",
        width: 140,
        sorter: "string",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const label = AUDIT_STATUS_LABELS[audit.status] ?? audit.status;
          const statusClass = getAuditStatusClass(audit.status);
          return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}">${label}</span>`;
        },
      },
      {
        title: "Progress / Score",
        field: "draftProgress",
        width: 140,
        sorter: "number",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          if (audit.status === "draft" && audit.draftProgress != null) {
            return `<span class="text-sm font-medium text-accent">${audit.draftProgress}%</span>`;
          }
          if (audit.complianceScore != null) {
            const color =
              audit.complianceScore >= 90
                ? "text-chart-2"
                : audit.complianceScore >= 75
                  ? "text-accent"
                  : "text-destructive";
            return `<span class="tabular-nums font-semibold ${color}">${audit.complianceScore}%</span>`;
          }
          return "—";
        },
      },
      {
        title: "Date",
        field: "submittedAt",
        width: 140,
        sorter: "datetime",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const date = audit.submittedAt || audit.draftSavedAt;
          if (!date) return "—";
          return `<span class="text-sm text-muted-foreground">${formatDistanceToNow(new Date(date), { addSuffix: true })}</span>`;
        },
      },
      {
        title: "Mode",
        field: "mode",
        width: 130,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const isManual = audit.mode === "assist-mode";
          const modeLabel = isManual ? "Manual Override" : "Vision Edge (AI)";
          const modeClass = isManual ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground";
          return `<span class="text-sm ${modeClass}">${modeLabel}</span>`;
        },
      },
      {
        title: "Actions",
        field: "id",
        width: 140,
        headerSort: false,
        headerFilter: false,
        hozAlign: "center",
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const isReturned = audit.status === "returned";
          const isDraft = audit.status === "draft";
          
          if (!isReturned && !isDraft) return `<span class="text-xs text-muted-foreground">—</span>`;

          const label = isReturned ? "Fix Issues" : "Resume";
          const btnClass = isReturned
            ? "rounded-md border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 px-2.5 py-1 text-xs font-medium transition-colors"
            : "rounded-md bg-chart-2 text-white hover:opacity-90 px-2.5 py-1 text-xs font-medium transition-opacity";
          return `<button type="button" class="${btnClass}" data-action="${isReturned ? "fix" : "resume"}">${label}</button>`;
        },
        cellClick: (event: unknown, cell: { getData: () => Audit }) => {
          (event as { stopPropagation?: () => void }).stopPropagation?.();
          const target = (event as { target?: HTMLElement }).target as HTMLElement;
          const btn = target?.closest?.("[data-action]");
          if (!btn) return;
          const audit = cell.getData();
          if (audit.status === "returned" || audit.status === "draft") {
             onAction?.(audit.id, audit.status === "returned" ? "fix" : "resume");
          }
        },
      },
    ],
    [shelves, onAction]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const counts = {
    all: (allAudits || []).length,
    draft: (allAudits || []).filter(a => a.status === "draft").length,
    returned: (allAudits || []).filter(a => a.status === "returned").length,
    pending: (allAudits || []).filter(a => a.status === "pending").length,
    approved: (allAudits || []).filter(a => a.status === "approved").length,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 pb-2">
          {(["all", "draft", "returned", "pending", "approved"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                resetPagination();
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all shrink-0",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                activeFilter === filter
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
              aria-pressed={activeFilter === filter}
            >
              {filter === "all" && `All Audits (${counts.all})`}
              {filter === "draft" && `Drafts (${counts.draft})`}
              {filter === "returned" && `Returned (${counts.returned})`}
              {filter === "pending" && `Pending (${counts.pending})`}
              {filter === "approved" && `Approved (${counts.approved})`}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search by shelf or audit ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPagination();
            }}
            className="pl-9 h-10 w-full bg-background"
            aria-label="Search audits"
          />
        </div>
      </div>

      {/* Table */}
      {filteredAudits.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
             <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No audits found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredAudits.length}</span> audits
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
            <DataTable<Audit>
              columns={tableColumns}
              data={filteredAudits}
              rowIdField="id"
              initialSort={{ field: "submittedAt", dir: "desc" }}
              emptyMessage="No audits match the current filter"
              pageSize={10}
              pageSizeSelector={[5, 10, 20]}
              headerFilters={false}
              onPaginationChange={setTablePagination}
            />
          </div>
        </>
      )}
    </div>
  );
}
