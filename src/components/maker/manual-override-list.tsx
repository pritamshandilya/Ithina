/**
 * Approval Status List Component
 *
 * Displays all submitted audits and their approval status for Makers.
 * Allows tracking of pending, approved, and returned audits.
 */

import { useMemo, useState } from "react";
import { Search, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useShelves, useMakerAudits } from "@/queries/maker";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { Audit } from "@/types/maker";

export type ApprovalAction = "view-report" | "view-details" | "fix" | "resume";

export interface ApprovalStatusListProps {
  className?: string;
  onAction?: (
    auditId: string,
    shelfId: string,
    action: ApprovalAction,
    mode?: string,
    adhocAnalysisId?: string,
    submittedAt?: Date
  ) => void;
}

type FilterType = "all" | "pending" | "approved" | "returned";

function getShelfName(audit: Audit, shelves?: { id: string; shelfName: string }[]) {
  const shelf = shelves?.find((s) => s.id === audit.shelfId);
  return shelf?.shelfName ?? `Shelf ${audit.shelfId.replace("shelf-", "")}`;
}

function getModeLabel(mode: string): string {
  if (mode === "planogram-based" || mode === "vision-edge") return "Planogram Based";
  if (mode === "adhoc" || mode === "assist-mode") return "Adhoc Analysis";
  return "Planogram Based";
}

export function ApprovalStatusList({ className, onAction }: ApprovalStatusListProps) {
  const { data: allAudits, isLoading } = useMakerAudits();
  const { data: shelves } = useShelves();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });

  const resetPagination = () => {
    setTablePagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  };

  const submittedAudits = useMemo(() => {
    return (allAudits || []).filter((a) => a.status !== "draft" && a.status !== "never-audited");
  }, [allAudits]);

  const normalizedAudits = useMemo(() => {
    return submittedAudits.map((audit) => {
      const submittedAt = audit.submittedAt ? new Date(audit.submittedAt) : undefined;
      let approvedAt = audit.approvedAt ? new Date(audit.approvedAt) : undefined;

      if (audit.status === "approved") {
        if (submittedAt && (!approvedAt || approvedAt < submittedAt)) {
          approvedAt = new Date(submittedAt.getTime() + 30 * 60 * 1000);
        }
      } else {
        approvedAt = undefined;
      }

      return {
        ...audit,
        submittedAt,
        approvedAt,
      };
    });
  }, [submittedAudits]);

  const filteredAudits = useMemo(() => {
    let result = normalizedAudits;

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
  }, [normalizedAudits, activeFilter, searchQuery, shelves]);

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
        title: "Compliance Score",
        field: "complianceScore",
        width: 140,
        sorter: "number",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          if (audit.complianceScore != null) {
            const color =
              audit.complianceScore >= 90
                ? "text-chart-2"
                : audit.complianceScore >= 75
                  ? "text-accent"
                  : "text-destructive";
            return `<span class="tabular-nums font-semibold ${color}">${audit.complianceScore}%</span>`;
          }
          return `<span class="text-xs text-muted-foreground">Pending</span>`;
        },
      },
      {
        title: "Submitted",
        field: "submittedAt",
        width: 180,
        sorter: "datetime",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const date = audit.submittedAt;
          if (!date) return "&mdash;";
          return `<span class="text-sm text-muted-foreground">${format(new Date(date), "MMM d, yyyy h:mm a")}</span>`;
        },
      },
      {
        title: "Date Approved",
        field: "approvedAt",
        width: 180,
        sorter: "datetime",
        headerSort: true,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          if (audit.status !== "approved" || !audit.approvedAt) {
            return `<span class="text-sm text-muted-foreground">&mdash;</span>`;
          }
          return `<span class="text-sm text-muted-foreground">${format(new Date(audit.approvedAt), "MMM d, yyyy h:mm a")}</span>`;
        },
      },
      {
        title: "Mode",
        field: "mode",
        width: 150,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const modeLabel = getModeLabel(audit.mode);
          const isPlanogram = modeLabel === "Planogram Based";
          const modeClass = isPlanogram
            ? "text-blue-600 dark:text-blue-400 font-medium"
            : "text-amber-600 dark:text-amber-400 font-medium";
          return `<span class="text-sm ${modeClass}">${modeLabel}</span>`;
        },
      },
      {
        title: "Actions",
        field: "id",
        width: 180,
        headerSort: false,
        headerFilter: false,
        hozAlign: "center",
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const btnBase = "rounded-md px-2.5 py-1 text-xs font-medium transition-colors inline-flex items-center gap-1";

          if (audit.status === "returned") {
            const btnClass = `${btnBase} border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20`;
            return `<button type="button" class="${btnClass}" data-action="fix">Fix Issues</button>`;
          }
          if (audit.status === "approved") {
            const btnClass = `${btnBase} border border-chart-2/50 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20`;
            return `<button type="button" class="${btnClass}" data-action="view-report">View Report</button>`;
          }
          if (audit.status === "pending") {
            const btnClass = `${btnBase} border border-accent/50 bg-accent/10 text-accent hover:bg-accent/20`;
            return `<button type="button" class="${btnClass}" data-action="view-details">View Details</button>`;
          }
          return `<span class="text-xs text-muted-foreground">&mdash;</span>`;
        },
        cellClick: (event: unknown, cell: { getData: () => Audit }) => {
          (event as { stopPropagation?: () => void }).stopPropagation?.();
          const target = (event as { target?: HTMLElement }).target as HTMLElement;
          const btn = target?.closest?.("[data-action]");
          if (!btn) return;
          const audit = cell.getData();
          const action = (btn as HTMLElement).getAttribute("data-action") as ApprovalAction | null;
          if (action && onAction) {
            onAction(audit.id, audit.shelfId, action, audit.mode, audit.adhocAnalysisId, audit.submittedAt);
          }
        },
      },
    ],
    [shelves, onAction]
  );

  if (isLoading) {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full max-w-80 rounded-md" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const counts = {
    all: submittedAudits.length,
    pending: submittedAudits.filter((a) => a.status === "pending").length,
    approved: submittedAudits.filter((a) => a.status === "approved").length,
    returned: submittedAudits.filter((a) => a.status === "returned").length,
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="shrink-0 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-xl font-bold">{counts.pending}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-xl font-bold">{counts.approved}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Returned</p>
            <p className="text-xl font-bold">{counts.returned}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 shrink-0 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "returned"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                resetPagination();
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                activeFilter === filter
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
              aria-pressed={activeFilter === filter}
            >
              <span className="capitalize">{filter}</span>
              <span className="ml-1 text-xs opacity-60">
                ({filter === "all" ? counts.all : counts[filter as keyof typeof counts]})
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search audits..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPagination();
            }}
            className="h-9 w-full bg-background pl-9"
            aria-label="Search audits"
          />
        </div>
      </div>

      {filteredAudits.length > 0 && (
        <div className="mt-2 shrink-0 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredAudits.length}</span> audits
          </p>
        </div>
      )}

      <div className="mt-2 flex-1 min-h-0 overflow-auto">
        {filteredAudits.length === 0 ? (
          <div className="flex min-h-full items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No audits found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no submitted audits matching your criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
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
        )}
      </div>
    </div>
  );
}

// Export with old name for backward compatibility
export const ManualOverrideList = ApprovalStatusList;
