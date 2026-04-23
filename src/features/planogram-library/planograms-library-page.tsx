import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanogramSectionHref } from "@/features/planogram-library/use-planogram-section-href";
import { usePlanogramList } from "@/queries/maker";
import type { PlanogramSummary } from "@/types/planogram";

type PlanogramTableRow = PlanogramSummary;

function escapeAttr(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const INITIAL_SORT = { field: "name" as const, dir: "asc" as const };
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function getCellRow(cell: unknown): PlanogramTableRow {
  return (cell as { getData: () => PlanogramTableRow }).getData();
}

const PLANOGRAM_LIBRARY_COLUMNS: DataTableColumn<PlanogramTableRow>[] = [
  {
    title: "Name",
    field: "name",
    minWidth: 200,
    widthGrow: 3,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    hozAlign: "left",
    headerHozAlign: "left",
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<div class="min-w-0 py-0.5 text-left"><span class="font-medium text-foreground">${escapeAttr(row.name)}</span></div>`;
    },
  },
  // {
  //   title: "Catalog",
  //   field: "catalogKind",
  //   minWidth: 96,
  //   sorter: "string",
  //   headerSort: true,
  //   headerFilter: "input",
  //   formatter: (cell) => {
  //     const row = getCellRow(cell);
  //     const cls = "border border-border bg-transparent text-foreground";
  //     return `<span class="inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ${cls}">${escapeAttr(row.catalogKind)}</span>`;
  //   },
  // },
  {
    title: "Zone",
    field: "zone",
    minWidth: 100,
    widthGrow: 1,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<span class="text-sm text-foreground">${escapeAttr(row.zone ?? "—")}</span>`;
    },
  },
  {
    title: "Section",
    field: "section",
    minWidth: 160,
    widthGrow: 3,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    hozAlign: "left",
    headerHozAlign: "left",
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<span class="text-sm text-foreground">${escapeAttr(row.section ?? "—")}</span>`;
    },
  },
  {
    title: "Aisle",
    field: "aisle",
    minWidth: 72,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<span class="tabular-nums text-sm text-foreground">${escapeAttr(row.aisle ?? "—")}</span>`;
    },
  },
  {
    title: "Bay",
    field: "bay",
    minWidth: 72,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<span class="tabular-nums text-sm text-foreground">${escapeAttr(row.bay ?? "—")}</span>`;
    },
  },
  {
    title: "Shelves",
    field: "shelfCount",
    minWidth: 88,
    sorter: "number",
    headerSort: true,
    headerFilter: false,
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<span class="tabular-nums text-sm font-medium text-foreground">${row.shelfCount}</span>`;
    },
  },
  {
    title: "SKUs",
    field: "productCount",
    minWidth: 80,
    sorter: "number",
    headerSort: true,
    headerFilter: false,
    formatter: (cell) => {
      const row = getCellRow(cell);
      return `<span class="tabular-nums text-sm font-medium text-foreground">${row.productCount}</span>`;
    },
  },
  {
    title: "Fixture",
    field: "fixtureType",
    minWidth: 140,
    widthGrow: 2,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    hozAlign: "left",
    headerHozAlign: "left",
    formatter: (cell) => {
      const row = getCellRow(cell);
      const t = row.fixtureType?.replace(/_/g, " ") ?? "—";
      return `<span class="text-sm capitalize text-foreground">${escapeAttr(t)}</span>`;
    },
  },
  {
    title: "Dimensions",
    field: "dimensions",
    minWidth: 140,
    widthGrow: 1,
    sorter: "string",
    headerSort: true,
    headerFilter: "input",
    formatter: (cell) => {
      const row = getCellRow(cell);
      const dim =
        row.dimensions ??
        (row.width != null && row.height != null && row.depth != null
          ? `${row.width}×${row.height}×${row.depth}`
          : "—");
      return `<span class="tabular-nums text-xs text-muted-foreground">${escapeAttr(dim)}</span>`;
    },
  },
];

export function PlanogramsLibraryPage() {
  const href = usePlanogramSectionHref();
  const navigate = useNavigate();
  const { data: list, isLoading } = usePlanogramList();
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 20 });

  const tableRows = useMemo<PlanogramTableRow[]>(() => {
    const rows = list ?? [];
    return rows.map((p) => ({
      ...p
      // catalogKind: "API" as const,
    }));
  }, [list]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return tableRows;
    const q = searchQuery.toLowerCase();
    return tableRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.zone ?? "").toLowerCase().includes(q) ||
        (r.section ?? "").toLowerCase().includes(q) ||
        (r.aisle ?? "").toLowerCase().includes(q) ||
        (r.bay ?? "").toLowerCase().includes(q) ||
        (r.fixtureType ?? "").toLowerCase().includes(q) ||
        (r.dimensions ?? "").toLowerCase().includes(q)
        // r.catalogKind.toLowerCase().includes(q),
    );
  }, [tableRows, searchQuery]);

  const onRowClick = useCallback(
    (row: PlanogramTableRow) => {
      void navigate({ to: href.detail(row.id) as never });
    },
    [href, navigate],
  );

  const pageSizeSelectorOptions = useMemo(() => [...PAGE_SIZE_OPTIONS], []);

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Planograms"
          description="Browse and filter the catalog in the table. Click a row to open the planogram view and edit page."
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary px-2 pb-4 pt-2 sm:px-3 sm:pb-4 lg:px-4 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">
          <div className="mt-2 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Search planograms…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 bg-background pl-9"
                aria-label="Search planograms"
              />
            </div>
            <Button variant="success" asChild className="shrink-0 self-start sm:self-auto">
              <Link to={href.newPage as never}>
                <Plus className="size-4" aria-hidden />
                Add planogram
              </Link>
            </Button>
          </div>

          {filteredRows.length > 0 && (
            <p className="mt-2 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.max(
                  0,
                  Math.min(
                    tablePagination.pageSize,
                    filteredRows.length - (tablePagination.page - 1) * tablePagination.pageSize,
                  ),
                )}
              </span>{" "}
              of <span className="font-semibold text-foreground">{filteredRows.length}</span> planogram
              {filteredRows.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="mt-3 flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-72 w-full rounded-lg" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
                <h3 className="text-lg font-semibold text-foreground">No planograms</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {tableRows.length === 0
                    ? "No planograms are available for this store yet."
                    : "No planograms match your search or column filters."}
                </p>
              </div>
            ) : (
              <DataTable<PlanogramTableRow>
                className="min-w-0 [&_.tabulator]:w-full"
                columns={PLANOGRAM_LIBRARY_COLUMNS}
                data={filteredRows}
                rowIdField="id"
                initialSort={INITIAL_SORT}
                emptyMessage="No planograms match your filters"
                pageSize={20}
                pageSizeSelector={pageSizeSelectorOptions}
                headerFilters
                layout="fitColumns"
                onPaginationChange={setTablePagination}
                onRowClick={onRowClick}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
