import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { FileText, LayoutGrid, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedShelves, useComplianceRuleSets, usePlanogramList } from "@/features/maker/hooks";
import type { ComplianceRuleSetSummary } from "@/features/checker/api/knowledge-center";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { mockUser } from "@/lib/api/mock-data";
import type { PlanogramArrangement } from "@/types/planogram";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import { useStore } from "@/providers/store";

export const Route = createFileRoute("/maker/audits/planogram/")({
  component: PlanogramAnalysisPage,
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
  const aisle = info?.aisle ?? (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : undefined);
  return {
    ...shelf,
    complianceRuleSet: "Default Rules",
    categorizeBy: "By Category",
    lastRun: shelf.lastAuditDate,
    productsCount: skuCount,
    issuesCount: issues,
    aisle,
    zone: info?.zone,
    section: info?.section,
    fixtureType: info?.fixtureType,
    dimensions: info?.dimensions,
  };
}

const CATEGORIZE_OPTIONS = ["By Category", "By Brand"] as const;

const PLANOGRAM_INITIAL_SORT = { field: "shelfName" as const, dir: "asc" as const };
const PLANOGRAM_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const PLANOGRAM_COLUMNS = (
  onOpenMenu: (row: PlanogramShelfRow, anchor: { x: number; y: number }) => void,
  ruleSets: ComplianceRuleSetSummary[]
): DataTableColumn<PlanogramShelfRow>[] => [
    {
      title: "Aisle",
      field: "aisleNumber",
      width: 70,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const val = row.aisle ?? (row.aisleNumber != null ? `A${row.aisleNumber}` : null) ?? "—";
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
      title: "Shelf Name",
      field: "shelfName",
      minWidth: 180,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const skus = row.productsCount ?? 0;
        const runs = row.lastRun ? "1 run" : "0 runs";
        const suffix = `(${skus} SKUs · ${runs})`;
        return `
        <div class="min-w-0 py-1">
          <span class="font-medium text-foreground truncate">${row.shelfName}</span>
          <span class="text-muted-foreground"> ${suffix}</span>
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
        return `<span class="text-sm tabular-nums font-medium text-foreground">${row.id}</span>`;
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
      width: 56,
      headerSort: false,
      headerFilter: false,
      hozAlign: "center",
      formatter: () => `
      <button type="button" data-action="open-menu" title="Actions" class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center" aria-label="Open actions menu">
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    `,
      cellClick: (event: unknown, cell: { getData: () => PlanogramShelfRow }) => {
        (event as { stopPropagation?: () => void }).stopPropagation?.();
        const target = (event as { target?: HTMLElement }).target as HTMLElement;
        const btn = target?.closest?.("[data-action]");
        if (!btn || btn.getAttribute("data-action") !== "open-menu") return;
        const rect = (btn as HTMLElement).getBoundingClientRect();
        onOpenMenu(cell.getData(), { x: rect.left, y: rect.bottom + 4 });
      },
    },
  ];

function PlanogramAnalysisPage() {
  const navigate = useNavigate();
  const { data: shelves, isLoading } = useAssignedShelves();
  const { data: planogramList } = usePlanogramList();
  const { selectedStore } = useStore();
  const { data: ruleSets } = useComplianceRuleSets();
  const _selectedStoreId = selectedStore?.id || mockUser.storeId;
  void _selectedStoreId;
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [complianceOverrides, setComplianceOverrides] = useState<Record<string, string>>({});
  const [categorizeOverrides, setCategorizeOverrides] = useState<Record<string, string>>({});
  const [actionsMenu, setActionsMenu] = useState<{
    row: PlanogramShelfRow;
    anchor: { x: number; y: number };
  } | null>(null);
  const [complianceSheetOpen, setComplianceSheetOpen] = useState(false);
  const [complianceSheetRuleSet, setComplianceSheetRuleSet] = useState<ComplianceRuleSetSummary | null>(null);
  const [complianceSheetRuleSetName, setComplianceSheetRuleSetName] = useState<string | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

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
        String(r.aisleNumber).includes(q) ||
        r.aisle?.toLowerCase().includes(q) ||
        String(r.bayNumber).includes(q) ||
        r.zone?.toLowerCase().includes(q) ||
        r.section?.toLowerCase().includes(q) ||
        r.fixtureType?.toLowerCase().includes(q)
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

  useEffect(() => {
    if (!actionsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        const tableEl = document.querySelector(".data-table-wrapper");
        if (tableEl?.contains(target)) return;
        setActionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsMenu]);

  const handleOpenMenu = useCallback((row: PlanogramShelfRow, anchor: { x: number; y: number }) => {
    const menuWidth = 192;
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const x = anchor.x + menuWidth + padding > viewportWidth
      ? viewportWidth - menuWidth - padding
      : anchor.x;
    setActionsMenu({ row, anchor: { ...anchor, x } });
  }, []);

  const handleRowClick = useCallback(
    (row: PlanogramShelfRow) => {
      navigate({ to: "/maker/audits/planogram/$shelfId", params: { shelfId: row.id } });
    },
    [navigate]
  );

  const handleViewComplianceRule = useCallback((row: PlanogramShelfRow) => {
    const ruleSetName = row.complianceRuleSet ?? "Default Rules";
    const set = (ruleSets ?? []).find((s) => s.name === ruleSetName) ?? null;
    setComplianceSheetRuleSet(set);
    setComplianceSheetRuleSetName(ruleSetName);
    setComplianceSheetOpen(true);
    setActionsMenu(null);
  }, [ruleSets]);

  const handleNewRun = useCallback(
    (shelfId: string) => {
      navigate({ to: "/maker/audits/planogram/run/$shelfId", params: { shelfId } });
      setActionsMenu(null);
    },
    [navigate]
  );

  const tableColumns = useMemo(
    () => PLANOGRAM_COLUMNS(handleOpenMenu, ruleSets ?? []),
    [handleOpenMenu, ruleSets]
  );

  const pageSizeSelectorOptions = useMemo(
    () => [...PLANOGRAM_PAGE_SIZE_OPTIONS],
    []
  );

  return (
    <MainLayout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">
          <header className="shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Planogram Based Analysis</h1>
            </div>
          </header>

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
            <Button asChild className="bg-chart-2 text-white hover:opacity-90 shrink-0">
              <Link to="/maker/audits/planogram/new">
                <Plus className="size-4" aria-hidden />
                Add Shelf
              </Link>
            </Button>
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
                  Add shelves to run planogram-based compliance analysis.
                </p>
                <Button asChild className="mt-6 bg-chart-2 text-white hover:opacity-90">
                  <Link to="/maker/audits/planogram/new">
                    <Plus className="size-4" aria-hidden />
                    Add Shelf
                  </Link>
                </Button>
              </div>
            ) : (
              <div ref={tableWrapperRef}>
                <DataTable<PlanogramShelfRow>
                  columns={tableColumns}
                  data={rowsWithOverrides}
                  rowIdField="id"
                  initialSort={PLANOGRAM_INITIAL_SORT}
                  emptyMessage="No shelves match your search"
                  pageSize={10}
                  pageSizeSelector={pageSizeSelectorOptions}
                  headerFilters={false}
                  layout="fitData"
                  onPaginationChange={setTablePagination}
                  onRowClick={handleRowClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {actionsMenu &&
        createPortal(
          <div
            ref={actionsMenuRef}
            className="fixed z-50 min-w-48 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md"
            style={{ left: actionsMenu.anchor.x, top: actionsMenu.anchor.y }}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => handleNewRun(actionsMenu.row.id)}
            >
              <Plus className="text-muted-foreground" />
              New
            </button>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => handleViewComplianceRule(actionsMenu.row)}
            >
              <FileText className="text-muted-foreground" />
              View Compliance Rule
            </button>
            <div className="-mx-1 my-1 h-px bg-border" />
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10 [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => setActionsMenu(null)}
            >
              <Trash2 />
              Delete
            </button>
          </div>,
          document.body
        )}

      <ComplianceRuleViewSheet
        open={complianceSheetOpen}
        onOpenChange={setComplianceSheetOpen}
        ruleSet={complianceSheetRuleSet}
        ruleSetName={complianceSheetRuleSetName}
      />
    </MainLayout>
  );
}
