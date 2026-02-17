import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedShelves, useComplianceRuleSets, useStores } from "@/features/maker/hooks";
import type { ComplianceRuleSetSummary } from "@/features/checker/api/knowledge-center";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { mockUser } from "@/lib/api/mock-data";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";

export const Route = createFileRoute("/maker/audits/planogram")({
  component: PlanogramAnalysisPage,
});

/** Map shelf to planogram row with derived/mock planogram-specific fields */
function toPlanogramRow(shelf: Shelf): PlanogramShelfRow {
  const skuCount = 8 + (shelf.id.charCodeAt(shelf.id.length - 1) % 12);
  const issues = shelf.status === "returned" ? 2 : shelf.status === "draft" ? 1 : 0;
  return {
    ...shelf,
    complianceRuleSet: "Default Rules",
    categorizeBy: "By Category",
    lastRun: shelf.lastAuditDate,
    productsCount: skuCount,
    issuesCount: issues,
  };
}

const CATEGORIZE_OPTIONS = ["By Category", "By Brand"] as const;

const PLANOGRAM_COLUMNS = (
  onAction: (shelfId: string, action: "new" | "modify" | "delete") => void,
  ruleSets: ComplianceRuleSetSummary[]
): DataTableColumn<PlanogramShelfRow>[] => [
  {
    title: "Shelf",
    field: "shelfName",
    minWidth: 220,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => PlanogramShelfRow }).getData();
      const subtitle = `Aisle ${row.aisleNumber} · ${row.productsCount ?? 0} SKUs · ${row.lastRun ? "1 run" : "0 runs"}`;
      return `
        <div class="flex items-center gap-2 py-1">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/20 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <div class="min-w-0">
            <span class="font-medium text-foreground block truncate">${row.shelfName}</span>
            <span class="text-xs text-muted-foreground block truncate">${subtitle}</span>
          </div>
        </div>
      `;
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
      const defaultName = ruleSets.find((s) => s.isDefault)?.name ?? "Default Rules";
      const selected = row.complianceRuleSet ?? defaultName;
      const sets: { name: string }[] = ruleSets.length > 0 ? ruleSets : [{ name: "Default Rules" }];
      const options = sets
        .map((s) => {
          const sel = s.name === selected ? " selected" : "";
          return `<option value="${s.name}"${sel}>${s.name}</option>`;
        })
        .join("");
      return `
        <select data-planogram-dropdown data-shelf-id="${row.id}" data-field="compliance"
          class="w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          ${options}
        </select>
      `;
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
      const options = CATEGORIZE_OPTIONS.map(
        (opt) => `<option value="${opt}"${opt === selected ? " selected" : ""}>${opt}</option>`
      ).join("");
      return `
        <select data-planogram-dropdown data-shelf-id="${row.id}" data-field="categorize"
          class="w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          ${options}
        </select>
      `;
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
      if (!row.lastRun) return `<span class="text-xs text-muted-foreground italic">No runs</span>`;
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
      const cls = n > 0 ? "text-destructive font-semibold" : "text-muted-foreground";
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
  {
    title: "Action",
    field: "id",
    width: 180,
    headerSort: false,
    headerFilter: false,
    hozAlign: "center",
    formatter: () => {
      return `
        <div class="flex items-center justify-center gap-1">
          <button type="button" class="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-1" data-action="new">
            <span class="sr-only">New</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New
          </button>
          <button type="button" class="rounded-md border border-border bg-transparent px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent/50 transition-colors inline-flex items-center gap-1" data-action="modify">
            <span class="sr-only">Modify</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Modify
          </button>
          <button type="button" class="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" data-action="delete" aria-label="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      `;
    },
    cellClick: (event: unknown, cell: { getData: () => PlanogramShelfRow }) => {
      (event as { stopPropagation?: () => void }).stopPropagation?.();
      const target = (event as { target?: HTMLElement }).target as HTMLElement;
      const btn = target?.closest?.("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action") as "new" | "modify" | "delete";
      const shelf = cell.getData();
      onAction(shelf.id, action);
    },
  },
];

function PlanogramAnalysisPage() {
  const { data: shelves, isLoading } = useAssignedShelves();
  const { data: stores } = useStores();
  const { data: ruleSets } = useComplianceRuleSets();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [complianceOverrides, setComplianceOverrides] = useState<Record<string, string>>({});
  const [categorizeOverrides, setCategorizeOverrides] = useState<Record<string, string>>({});
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const planogramRows = useMemo(() => {
    return (shelves ?? []).map(toPlanogramRow);
  }, [shelves]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return planogramRows;
    const q = searchQuery.toLowerCase();
    return planogramRows.filter(
      (r) =>
        r.shelfName.toLowerCase().includes(q) ||
        r.complianceRuleSet?.toLowerCase().includes(q) ||
        r.categorizeBy?.toLowerCase().includes(q) ||
        String(r.aisleNumber).includes(q) ||
        String(r.bayNumber).includes(q)
    );
  }, [planogramRows, searchQuery]);

  const rowsWithOverrides = useMemo(() => {
    return filteredRows.map((r) => ({
      ...r,
      complianceRuleSet: complianceOverrides[r.id] ?? r.complianceRuleSet,
      categorizeBy: categorizeOverrides[r.id] ?? r.categorizeBy,
    }));
  }, [filteredRows, complianceOverrides, categorizeOverrides]);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleChange = (e: Event) => {
      const select = (e.target as HTMLElement).closest?.("[data-planogram-dropdown]");
      if (!select || !(select instanceof HTMLSelectElement)) return;
      const shelfId = select.getAttribute("data-shelf-id");
      const field = select.getAttribute("data-field");
      const value = select.value;
      if (!shelfId || !field) return;
      if (field === "compliance") setComplianceOverrides((prev) => ({ ...prev, [shelfId]: value }));
      if (field === "categorize") setCategorizeOverrides((prev) => ({ ...prev, [shelfId]: value }));
    };
    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, []);

  const handlePlanogramAction = useMemo(
    () => (shelfId: string, action: "new" | "modify" | "delete") => {
      // TODO: Wire up to actual flows (new run, modify config, delete)
      void shelfId;
      void action;
    },
    []
  );

  const tableColumns = useMemo(
    () => PLANOGRAM_COLUMNS(handlePlanogramAction, ruleSets ?? []),
    [handlePlanogramAction, ruleSets]
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Planogram Based Analysis</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stores?.find((s) => s.id === selectedStoreId)?.name ?? "Select a store"}
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <Button className="bg-chart-2 text-white hover:opacity-90 shrink-0">
              <Plus className="size-4" aria-hidden />
              Add Shelf
            </Button>
          </div>

          <div className="min-h-[400px] space-y-4">
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
                  Add shelves to run planogram-based compliance analysis.
                </p>
                <Button className="mt-6 bg-chart-2 text-white hover:opacity-90">
                  <Plus className="size-4" aria-hidden />
                  Add Shelf
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {Math.max(0, Math.min(tablePagination.pageSize, filteredRows.length - (tablePagination.page - 1) * tablePagination.pageSize))}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">{filteredRows.length}</span>{" "}
                  shelf{filteredRows.length !== 1 ? "s" : ""}
                </p>
                <div ref={tableWrapperRef}>
                  <DataTable<PlanogramShelfRow>
                    columns={tableColumns}
                    data={rowsWithOverrides}
                  rowIdField="id"
                  initialSort={{ field: "shelfName", dir: "asc" }}
                  emptyMessage="No shelves match your search"
                  pageSize={10}
                  pageSizeSelector={[5, 10, 20, 50]}
                  headerFilters={false}
                    onPaginationChange={setTablePagination}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
