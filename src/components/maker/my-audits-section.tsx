/**
 * My Audits Section Component
 *
 * Tabular display of draft and returned audits for the Maker dashboard.
 * Uses shared DataTable with dotted column lines, status badges, and action buttons.
 */

import { useCallback, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, FileEdit, Search, Trash2 } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { IconButton } from "@/components/ui/icon-button";
import {
  useShelves,
  useDraftAudits,
  useReturnedAudits,
  useDeleteDraft,
} from "@/queries/maker";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { Audit } from "@/types/maker";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const INITIAL_SORT = { field: "submittedAt", dir: "desc" } as const;

export interface MyAuditsSectionProps {
  onResume?: (auditId: string, shelfId: string) => void;
  onViewReport?: (auditId: string, shelfId: string) => void;
  /** When set, limits display to the most recent N audits (e.g. 5 for dashboard preview) */
  maxItems?: number;
  className?: string;
}

function getShelfName(audit: Audit, shelves?: { id: string; shelfName: string }[]) {
  const shelf = shelves?.find((s) => s.id === audit.shelfId);
  return shelf?.shelfName ?? `Shelf ${audit.shelfId.replace("shelf-", "")}`;
}

export function MyAuditsSection({
  onResume,
  onViewReport,
  maxItems,
  className,
}: MyAuditsSectionProps) {
  const { data: draftAudits = [], isLoading: isDraftsLoading } = useDraftAudits();
  const { data: returnedAudits = [], isLoading: isReturnedLoading } = useReturnedAudits();
  const { data: shelves } = useShelves();
  const deleteDraftMutation = useDeleteDraft();

  const [activeFilter, setActiveFilter] = useState<"all" | "draft" | "returned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);

  const resetPagination = () => {
    setTablePagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  };

  const isLoading = isDraftsLoading || isReturnedLoading;

  const allAudits = useMemo(() => {
    return [...(draftAudits || []), ...(returnedAudits || [])];
  }, [draftAudits, returnedAudits]);

  const filteredAudits = useMemo(() => {
    let result = allAudits;
    if (activeFilter === "draft") result = result.filter((a) => a.status === "draft");
    else if (activeFilter === "returned") result = result.filter((a) => a.status === "returned");
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.shelfId.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          getShelfName(a, shelves).toLowerCase().includes(query)
      );
    }
    const sorted = result.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.draftSavedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.draftSavedAt || 0).getTime();
      return dateB - dateA;
    });
    return maxItems != null ? sorted.slice(0, maxItems) : sorted;
  }, [allAudits, activeFilter, searchQuery, shelves, maxItems]);

  const handleAction = useCallback((audit: Audit, action: "resume" | "fix" | "delete") => {
    if (action === "delete") {
      setAuditToDelete(audit.id);
      setIsDeleteDialogOpen(true);
      return;
    }
    if (action === "resume") onResume?.(audit.id, audit.shelfId);
    else onViewReport?.(audit.id, audit.shelfId);
  }, [onResume, onViewReport]);

  const handleConfirmDelete = () => {
    if (auditToDelete) {
      deleteDraftMutation.mutate(auditToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setAuditToDelete(null);
        },
      });
    }
  };

  const tableColumns: DataTableColumn<Audit>[] = useMemo(
    () => [
      {
        title: "Shelf",
        field: "shelfId",
        minWidth: 140,
        sorter: "string",
        headerSort: true,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const name = getShelfName(audit, shelves);
          return `<span class="font-medium text-foreground">${name}</span>`;
        },
      },
      {
        title: "Status",
        field: "status",
        width: 120,
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
        width: 120,
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
        width: 110,
        headerFilter: false,
        formatter: (cell: unknown) => {
          const audit = (cell as { getData: () => Audit }).getData();
          const mode = audit.mode === "vision-edge" ? "Vision Edge" : "Assist Mode";
          return `<span class="text-sm text-muted-foreground">${mode}</span>`;
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
          const primaryLabel = isReturned ? "View Report" : "Resume";
          const primaryClass = isReturned
            ? "rounded-md border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 px-2.5 py-1 text-xs font-medium"
            : "rounded-md bg-chart-2 text-white hover:opacity-90 px-2.5 py-1 text-xs font-medium";
          let html = `<button type="button" class="${primaryClass}" data-action="${isReturned ? "fix" : "resume"}">${primaryLabel}</button>`;
          if (isDraft) {
            const deleteDraftBtn = renderToStaticMarkup(
              <IconButton
                type="button"
                variant="destructive-ghost"
                size="icon-sm"
                data-action="delete"
                aria-label="Delete draft"
                icon={<Trash2 size={14} aria-hidden />}
              />,
            );
            html += ` ${deleteDraftBtn}`;
          }
          return html;
        },
        cellClick: (event: unknown, cell: { getData: () => Audit }) => {
          (event as { stopPropagation?: () => void }).stopPropagation?.();
          const target = (event as { target?: HTMLElement }).target as HTMLElement;
          const btn = target?.closest?.("[data-action]");
          if (!btn) return;
          const audit = cell.getData();
          const action = btn.getAttribute("data-action") as "resume" | "fix" | "delete";
          handleAction(audit, action);
        },
      },
    ],
    [handleAction, shelves]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (filteredAudits.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <FileEdit className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">No audits to show</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeFilter === "all"
              ? "You have no draft or returned audits. Start a new audit to get started."
              : activeFilter === "draft"
                ? "No draft audits in progress."
                : "No returned audits requiring attention."}
          </p>
        </div>
      </div>
    );
  }

  const isLimitedView = maxItems != null;
  const tableVisibleCount = isLimitedView
    ? filteredAudits.length
    : Math.max(
      0,
      Math.min(
        tablePagination.pageSize,
        filteredAudits.length - (tablePagination.page - 1) * tablePagination.pageSize
      )
    );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {(["all", "draft", "returned"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                resetPagination();
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all shrink-0",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                activeFilter === filter
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              {filter === "all" && "All"}
              {filter === "draft" && (
                <>
                  <FileEdit className="size-4" />
                  Draft
                </>
              )}
              {filter === "returned" && (
                <>
                  <AlertCircle className="size-4" />
                  Returned
                </>
              )}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search by shelf or audit ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPagination();
            }}
            className="pl-9 h-10"
            aria-label="Search audits"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isLimitedView ? (
            <>
              Showing last{" "}
              <span className="font-semibold text-foreground">{tableVisibleCount}</span>{" "}
              audit{tableVisibleCount !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredAudits.length}</span> audits
            </>
          )}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DataTable<Audit>
          columns={tableColumns}
          data={filteredAudits}
          rowIdField="id"
          initialSort={INITIAL_SORT}
          emptyMessage="No audits match the current filter"
          pagination={!isLimitedView}
          pageSize={isLimitedView ? 5 : 10}
          pageSizeSelector={PAGE_SIZE_OPTIONS}
          headerFilters={false}
          onPaginationChange={isLimitedView ? undefined : setTablePagination}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Draft Audit"
        description="Are you sure you want to delete this draft? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteDraftMutation.isPending}
      />
    </div>
  );
}
