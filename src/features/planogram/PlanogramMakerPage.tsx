import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";

import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import { createMakerPlanogramTableColumns } from "@/components/planogram/planogram-maker-table-columns";
import { PLANOGRAM_INITIAL_SORT, PlanogramActionsMenu } from "@/components/planogram/planogram-table-columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useShelves,
  useComplianceRuleSets,
  usePlanogramList,
} from "@/queries/maker";
import { fetchStoreFixtures as fetchCheckerStoreFixtures } from "@/queries/checker/api/fixtures";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import { mockUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";
import type { PlanogramArrangement } from "@/types/planogram";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import { getShelfFixtureId } from "@/lib/fixtures/analysis";

const MAKER_PLANOGRAM_PAGE_SIZE_OPTIONS = [20, 50, 75, 100] as const;

/** Map shelf to planogram row with derived/mock planogram-specific fields */
function toPlanogramRow(
  shelf: Shelf,
  planogramMap?: Map<
    string,
    {
      aisle?: string;
      zone?: string;
      section?: string;
      fixtureType?: string;
      dimensions?: string;
    }
  >,
  defaultComplianceRuleSetName = "Default Rules",
  fixturePlanogramId?: string | null,
): PlanogramShelfRow {
  const arrangement = shelf.arrangement as PlanogramArrangement | undefined;
  const skuCount =
    arrangement?.shelfOrder?.reduce((n, s) => n + s.productIds.length, 0) ??
    8 + (shelf.id.charCodeAt(shelf.id.length - 1) % 12);
  const issues =
    shelf.status === "returned" ? 2 : shelf.status === "draft" ? 1 : 0;
  const resolvedPlanogramId = fixturePlanogramId ?? shelf.planogramId;
  const planogramInfo = resolvedPlanogramId
    ? planogramMap?.get(resolvedPlanogramId)
    : undefined;
  const info =
    planogramInfo && typeof planogramInfo === "object" ? planogramInfo : undefined;
  const aisleCode =
    info?.aisle ??
    shelf.aisleCode ??
    (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : undefined);
  return {
    ...shelf,
    planogramId: resolvedPlanogramId ?? undefined,
    complianceRuleSet: defaultComplianceRuleSetName,
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

export function PlanogramMakerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { selectedStore } = useStore();
  const { data: shelves, isLoading } = useShelves();
  const { data: storeFixtures = [] } = useQuery({
    queryKey: ["maker", "fixtures", "list", selectedStore?.id ?? "no-store"],
    queryFn: fetchCheckerStoreFixtures,
    enabled: !!selectedStore?.id,
    staleTime: 60 * 1000,
  });
  const { data: planogramList } = usePlanogramList();
  const { data: ruleSets } = useComplianceRuleSets();
  const _selectedStoreId = selectedStore?.id || mockUser.storeId;
  void _selectedStoreId;

  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 50,
  });
  const [complianceOverrides, setComplianceOverrides] = useState<
    Record<string, string>
  >({});
  const [categorizeOverrides, setCategorizeOverrides] = useState<
    Record<string, string>
  >({});
  const [actionsMenu, setActionsMenu] = useState<{
    row: PlanogramShelfRow;
    triggerEl: HTMLElement;
    anchorPoint: { x: number; y: number };
  } | null>(null);
  const [complianceSheetOpen, setComplianceSheetOpen] = useState(false);
  const [complianceSheetRuleSet, setComplianceSheetRuleSet] =
    useState<ComplianceRuleSetSummary | null>(null);
  const [complianceSheetRuleSetName, setComplianceSheetRuleSetName] = useState<
    string | null
  >(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  /** After mousedown closes menu on the same … trigger, skip the following click so it does not reopen */
  const skipNextOpenMenuFromTriggerRef = useRef(false);

  const planogramMap = useMemo(() => {
    const map = new Map<
      string,
      {
        aisle?: string;
        zone?: string;
        section?: string;
        fixtureType?: string;
        dimensions?: string;
      }
    >();
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

  const defaultRuleSetName = useMemo(
    () => ruleSets?.find((s) => s.isDefault)?.name ?? "Default Rules",
    [ruleSets],
  );

  const planogramRows = useMemo(() => {
    const fixturePlanogramById = new Map(
      storeFixtures.map((fixture) => [fixture.id, fixture.planogram_id ?? null]),
    );
    return (shelves ?? []).map((s) => ({
      ...toPlanogramRow(
        s,
        planogramMap,
        defaultRuleSetName,
        fixturePlanogramById.get(getShelfFixtureId(s)),
      ),
      fixtureId: getShelfFixtureId(s),
    }));
  }, [shelves, planogramMap, defaultRuleSetName, storeFixtures]);

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
        String((r as { fixtureId?: string }).fixtureId ?? "")
          .toLowerCase()
          .includes(q) ||
        r.shelfCode?.toLowerCase().includes(q) ||
        r.zone?.toLowerCase().includes(q) ||
        r.section?.toLowerCase().includes(q) ||
        r.fixtureType?.toLowerCase().includes(q),
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
      const select = (e.target as HTMLElement).closest?.(
        "[data-planogram-dropdown]",
      );
      if (!select || !(select instanceof HTMLSelectElement)) return;
      const shelfId = select.getAttribute("data-shelf-id");
      const field = select.getAttribute("data-field");
      const value = select.value;
      if (!shelfId || !field) return;
      if (field === "compliance")
        setComplianceOverrides((prev) => ({ ...prev, [shelfId]: value }));
      if (field === "categorize")
        setCategorizeOverrides((prev) => ({ ...prev, [shelfId]: value }));
    };
    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!actionsMenu) return;
    const handlePointerDown = (e: Event) => {
      const target = e.target as Node;
      const menuEl =
        actionsMenuRef.current ??
        document.querySelector("[data-planogram-actions-menu]");
      if (menuEl?.contains(target)) return;

      const triggerBtn = (target as HTMLElement).closest?.(
        "[data-action=\"open-menu\"]",
      );
      if (triggerBtn && triggerBtn === actionsMenu.triggerEl) {
        skipNextOpenMenuFromTriggerRef.current = true;
      }
      setActionsMenu(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [actionsMenu]);

  const handleOpenMenu = useCallback(
    (row: PlanogramShelfRow, triggerEl: HTMLElement) => {
      if (skipNextOpenMenuFromTriggerRef.current) {
        skipNextOpenMenuFromTriggerRef.current = false;
        return;
      }
      const triggerRect = triggerEl.getBoundingClientRect();
      setActionsMenu({
        row,
        triggerEl,
        anchorPoint: {
          x: triggerRect.left,
          y: triggerRect.top,
        },
      });
    },
    [],
  );

  const handleViewComplianceRule = useCallback(
    (row: PlanogramShelfRow) => {
      const sets = ruleSets ?? [];
      const requestedName = row.complianceRuleSet ?? defaultRuleSetName;
      const matched =
        sets.find((s) => s.name === requestedName) ??
        (requestedName === "Default Rules"
          ? (sets.find((s) => s.isDefault) ?? null)
          : null);
      setComplianceSheetRuleSet(matched);
      setComplianceSheetRuleSetName(matched?.name ?? requestedName);
      setComplianceSheetOpen(true);
      setActionsMenu(null);
    },
    [ruleSets, defaultRuleSetName],
  );

  const handleNewRun = useCallback(
    (shelfId: string) => {
      navigate({
        to: "/maker/audits/planogram/run/$shelfId",
        params: { shelfId },
      });
      setActionsMenu(null);
    },
    [navigate],
  );

  const handlePlanogramAnalysis = useCallback(
    (row: PlanogramShelfRow) => {
      if (!row.planogramId?.trim()) {
        toast({
          title: "No planogram associated",
          description:
            "This fixture does not have a planogram associated.",
          variant: "warning",
        });
        setActionsMenu(null);
        return;
      }
      navigate({
        to: "/maker/audits/planogram/$shelfId",
        params: { shelfId: row.id },
        state: { from: location.pathname } as never,
      });
      setActionsMenu(null);
    },
    [location.pathname, navigate, toast],
  );

  const tableColumns = useMemo(
    () =>
      createMakerPlanogramTableColumns({
        onOpenMenu: handleOpenMenu,
        ruleSets: ruleSets ?? [],
      }),
    [handleOpenMenu, ruleSets],
  );

  const pageSizeSelectorOptions = useMemo(
    () => [...MAKER_PLANOGRAM_PAGE_SIZE_OPTIONS],
    [],
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">
          <div className="mt-4 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                placeholder="Search shelves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background"
                aria-label="Search shelves"
              />
            </div>
            {/* <Button
              asChild
              variant="success"
              className="shrink-0"
            >
              <Link
                to="/maker/audits/planogram/new"
                search={{ fixtureId: undefined }}
              >
                <Plus className="size-4" aria-hidden />
                Add POG Analysis
              </Link>
            </Button> */}
            
          </div>

          {filteredRows.length > 0 && (
            <p className="mt-2 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.max(
                  0,
                  Math.min(
                    tablePagination.pageSize,
                    filteredRows.length -
                      (tablePagination.page - 1) * tablePagination.pageSize,
                  ),
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
              shelf{filteredRows.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <LayoutGrid
                    className="h-7 w-7 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No shelves yet
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Add shelves to run planogram-based compliance analysis.
                </p>
                <Button
                  asChild
                  variant="success"
                  className="mt-6"
                >
                  <Link
                    to="/maker/audits/planogram/new"
                    search={{ fixtureId: undefined }}
                  >
                    <Plus className="size-4" aria-hidden />
                    Add POG Analysis
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
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {actionsMenu && (
        <PlanogramActionsMenu
          ref={actionsMenuRef}
          row={actionsMenu.row}
          triggerEl={actionsMenu.triggerEl}
          anchorPoint={actionsMenu.anchorPoint}
          variant="maker"
          onClose={() => setActionsMenu(null)}
          onRunPlanogram={handlePlanogramAnalysis}
          onRunAdhoc={(row) => handleNewRun(row.id)}
          onViewComplianceRule={handleViewComplianceRule}
        />
      )}

      <ComplianceRuleViewSheet
        open={complianceSheetOpen}
        onOpenChange={setComplianceSheetOpen}
        ruleSet={complianceSheetRuleSet}
        ruleSetName={complianceSheetRuleSetName}
      />
    </>
  );
}
