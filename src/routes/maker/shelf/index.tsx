import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { LayoutGrid, Search } from "lucide-react";
import { useMemo, useState } from "react";



import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { usePlanogramList, useShelves } from "@/queries/maker";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import type { PlanogramArrangement } from "@/types/planogram";




















export const Route = createFileRoute("/maker/shelf/")({
  component: MakerShelfPage,
});

/** Map shelf to planogram row with derived/mock planogram-specific fields */
function toPlanogramRow(
  shelf: Shelf,
  planogramMap?: Map<string, { aisle?: string; zone?: string; section?: string; fixtureType?: string; dimensions?: string }>
): PlanogramShelfRow {
  const arrangement = shelf.arrangement as PlanogramArrangement | undefined;
  const skuCount =
    arrangement?.shelfOrder?.reduce((n, s) => n + s.productIds.length, 0) ??
    8 + (shelf.id.charCodeAt(shelf.id.length - 1) % 12);
  const issues = shelf.status === "returned" ? 2 : shelf.status === "draft" ? 1 : 0;
  const planogramInfo = shelf.planogramId ? planogramMap?.get(shelf.planogramId) : undefined;
  const info = planogramInfo && typeof planogramInfo === "object" ? planogramInfo : undefined;
  const aisleCode =
    info?.aisle ??
    shelf.aisleCode ??
    (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : undefined);
  return {
    ...shelf,
    complianceRuleSet: "Default Rules",
    categorizeBy: "By Category",
    lastRun: shelf.lastAuditDate,
    productsCount: skuCount,
    issuesCount: issues,
    aisleCode,
    zone: info?.zone ?? shelf.zone,
    section: info?.section ?? shelf.section,
    fixtureType: info?.fixtureType ?? shelf.fixtureType,
    dimensions: info?.dimensions ?? shelf.dimensions,
  };
}

const PLANOGRAM_INITIAL_SORT = { field: "shelfName" as const, dir: "asc" as const };
const PLANOGRAM_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const PLANOGRAM_COLUMNS: DataTableColumn<PlanogramShelfRow>[] = [
  {
    title: "Shelf Name",
    field: "shelfName",
    minWidth: 180,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      return `
        <div class="min-w-0 py-1">
          <span class="font-medium text-foreground truncate">${row.shelfName}</span>
        </div>
      `;
    },
  },
  {
    title: "Shelf ID",
    field: "id",
    width: 120,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      return `<span class="text-sm tabular-nums font-medium text-foreground">${row.shelfCode ?? row.shelf_id ?? "—"}</span>`;
    },
  },
  {
    title: "Aisle",
    field: "aisleCode",
    width: 70,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const val =
        row.aisleCode ??
        (row.aisleNumber != null ? `A${row.aisleNumber}` : null) ??
        "—";
      return `<span class="text-sm font-medium text-foreground tabular-nums">${val}</span>`;
    },
  },
  {
    title: "Zone",
    field: "zone",
    width: 100,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      return `<span class="text-sm font-medium text-foreground">${row.zone ?? "—"}</span>`;
    },
  },
  {
    title: "Section",
    field: "section",
    minWidth: 140,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      return `<span class="text-sm font-medium text-foreground truncate block">${row.section ?? "—"}</span>`;
    },
  },
  {
    title: "Fixture",
    field: "fixtureType",
    width: 120,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const type = row.fixtureType?.replace(/_/g, " ") ?? "—";
      return `<span class="text-sm font-medium text-foreground">${type}</span>`;
    },
  },
  {
    title: "Dimensions",
    field: "dimensions",
    width: 110,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      return `<span class="text-sm tabular-nums font-medium text-foreground">${row.dimensions ?? "—"}</span>`;
    },
  },
  {
    title: "Compliance",
    field: "complianceRuleSet",
    width: 160,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const selected = row.complianceRuleSet ?? "Default Rules";
      return `<span class="text-sm font-medium text-foreground underline decoration-dashed underline-offset-4">${selected}</span>`;
    },
  },
  {
    title: "Categorize By",
    field: "categorizeBy",
    width: 140,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const selected = row.categorizeBy ?? "By Category";
      return `<span class="text-sm font-medium text-foreground">${selected}</span>`;
    },
  },
  {
    title: "Last Run",
    field: "lastRun",
    width: 120,
    sorter: "date",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      if (!row.lastRun)
        return `<span class="text-xs text-muted-foreground italic">No runs</span>`;
      return `<span class="text-sm text-foreground">${format(new Date(row.lastRun), "MMM d, yyyy")}</span>`;
    },
  },
  {
    title: "Products",
    field: "productsCount",
    width: 100,
    sorter: "number",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const n = row.productsCount ?? 0;
      return `<span class="tabular-nums text-sm font-medium text-foreground">${n}</span>`;
    },
  },
  {
    title: "Issues",
    field: "issuesCount",
    width: 90,
    sorter: "number",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const n = row.issuesCount ?? 0;
      const cls =
        n > 0 ? "text-destructive font-semibold" : "text-muted-foreground";
      return `<span class="tabular-nums text-sm ${cls}">${n}</span>`;
    },
  },
  {
    title: "Status",
    field: "status",
    width: 130,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const label = AUDIT_STATUS_LABELS[row.status] ?? row.status;
      const statusClass = getAuditStatusClass(row.status);
      return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}">${label}</span>`;
    },
  },
];

export function MakerShelfPage() {
  const { data: shelves, isLoading } = useShelves();
  const { data: planogramList } = usePlanogramList();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });

  const planogramMap = useMemo(() => {
    const map = new Map<string, { aisle?: string; zone?: string; section?: string; fixtureType?: string; dimensions?: string }>();
    (planogramList ?? []).forEach((p) => {
      map.set(p.id, {
        aisle: p.aisle,
        zone: p.zone,
        section: p.section,
        fixtureType: p.fixtureType,
        dimensions: p.dimensions,
      });
    });
    return map;
  }, [planogramList]);

  const planogramRows = useMemo(() => {
    return (shelves ?? []).map((s) => toPlanogramRow(s, planogramMap));
  }, [shelves, planogramMap]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return planogramRows;
    const q = searchQuery.toLowerCase();
    return planogramRows.filter(
      (r) =>
        r.shelfName.toLowerCase().includes(q) ||
        r.complianceRuleSet?.toLowerCase().includes(q) ||
        r.categorizeBy?.toLowerCase().includes(q) ||
        String(r.aisleCode ?? "").toLowerCase().includes(q) ||
        String(r.bayCode ?? r.bayNumber ?? "").toLowerCase().includes(q) ||
        r.shelfCode?.toLowerCase().includes(q) ||
        r.zone?.toLowerCase().includes(q) ||
        r.section?.toLowerCase().includes(q) ||
        r.fixtureType?.toLowerCase().includes(q)
    );
  }, [planogramRows, searchQuery]);
  
  const pageSizeSelectorOptions = useMemo(
    () => [...PLANOGRAM_PAGE_SIZE_OPTIONS],
    []
  );

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Shelves Overview"
          description="View current shelves and planograms assigned to the store."
          showNotifications={false}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">

          <div className="mt-4 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Search shelves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background"
                aria-label="Search shelves"
              />
            </div>
          </div>

          {filteredRows.length > 0 && (
            <p className="mt-2 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.max(0, Math.min(tablePagination.pageSize, filteredRows.length - (tablePagination.page - 1) * tablePagination.pageSize))}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{filteredRows.length}</span>{" "}
              shelf{filteredRows.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="mt-4 flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No shelves yet</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  No shelves have been created for this store yet.
                </p>
              </div>
            ) : (
              <div>
                <DataTable<PlanogramShelfRow>
                  columns={PLANOGRAM_COLUMNS}
                  data={filteredRows}
                  rowIdField="id"
                  initialSort={PLANOGRAM_INITIAL_SORT}
                  emptyMessage="No shelves match your search"
                  pageSize={10}
                  pageSizeSelector={pageSizeSelectorOptions}
                  headerFilters={false}
                  layout="fitData"
                  onPaginationChange={setTablePagination}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
