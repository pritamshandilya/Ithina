import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import { createMakerPlanogramTableColumns } from "@/components/planogram/planogram-maker-table-columns";
import {
  PLANOGRAM_INITIAL_SORT,
  PlanogramActionsMenu,
} from "@/components/planogram/planogram-table-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getShelfFixtureId } from "@/lib/fixtures/analysis";
import {
  useComplianceRuleSets,
  usePlanogramList,
  useReadyForAnalysisFixtures,
  useShelves,
} from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import type { PlanogramArrangement } from "@/types/planogram";

const MAKER_PLANOGRAM_PAGE_SIZE_OPTIONS = [10, 20, 50, 75, 100] as const;

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
    planogramInfo && typeof planogramInfo === "object"
      ? planogramInfo
      : undefined;
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
  const { data: shelves, isLoading: isShelvesLoading } = useShelves();
  const { data: storeFixtures = [], isLoading: isFixturesLoading } =
    useReadyForAnalysisFixtures();
  const isLoading = isShelvesLoading || isFixturesLoading;
  const { data: planogramList } = usePlanogramList();
  const { data: ruleSets } = useComplianceRuleSets();

  const [searchQuery, setSearchQuery] = useState("");
  const [, setTablePagination] = useState({
    page: 1,
    pageSize: 50,
  });
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
    const map = new Map<string, { dimensions?: string }>();
    (planogramList ?? []).forEach((p) => {
      map.set(p.id, {
        dimensions: p.dimensions,
      });
    });
    return map;
  }, [planogramList]);

  const defaultRuleSetName = useMemo(
    () => ruleSets?.find((s) => s.isDefault)?.name ?? "Default Rules",
    [ruleSets],
  );

  const shelvesByFixtureId = useMemo(() => {
    const map = new Map<string, Shelf[]>();
    (shelves ?? []).forEach((shelf) => {
      const fixtureId = getShelfFixtureId(shelf);
      const fixtureShelves = map.get(fixtureId) ?? [];
      fixtureShelves.push(shelf);
      map.set(fixtureId, fixtureShelves);
    });
    return map;
  }, [shelves]);

  const eligibleFixtures = useMemo(() => {
    return storeFixtures.filter((fixture) => {
      const fixtureShelves = shelvesByFixtureId.get(fixture.id) ?? [];
      return fixtureShelves.length > 0;
    });
  }, [shelvesByFixtureId, storeFixtures]);

  const planogramRows = useMemo(() => {
    return eligibleFixtures.map((fixture) => {
      const fixtureShelves = shelvesByFixtureId.get(fixture.id) ?? [];
      const fixtureCode = (fixture.code ?? "").trim();
      const fixtureType = (fixture.type ?? "").trim();
      const representativeShelf = fixtureShelves
        .slice()
        .sort(
          (a, b) =>
            (b.updatedAt?.getTime?.() ?? 0) - (a.updatedAt?.getTime?.() ?? 0),
        )[0];

      const fallbackShelf: Shelf = {
        id: fixture.id,
        fixtureId: fixture.id,
        shelfName: `${fixtureCode} (${fixtureType})`,
        status: "never-audited",
        aisleCode: fixture.physical_location.aisle,
        zone: fixture.physical_location.zone,
        section: fixture.physical_location.section,
        fixtureType: fixture.type,
        dimensions: `${fixture.dimensions.width}x${fixture.dimensions.height}x${fixture.dimensions.depth} ${fixture.dimension_unit}`,
      };

      const fixturePlanogramId = fixture.planogram_id ?? null;

      const baseRow = toPlanogramRow(
        representativeShelf ?? fallbackShelf,
        planogramMap,
        defaultRuleSetName,
        fixturePlanogramId,
      );

      return {
        ...baseRow,
        id: fixture.id,
        fixtureId: fixture.id,
        fixtureCode: fixture.code,
        fixtureShelvesCount: fixtureShelves.length,
        aisleCode:
          fixture.physical_location.aisle || baseRow.aisleCode || undefined,
        zone: fixture.physical_location.zone || baseRow.zone,
        section: fixture.physical_location.section || baseRow.section,
        fixtureType: fixture.type || baseRow.fixtureType,
        dimensions: `${fixture.dimensions.width}x${fixture.dimensions.height}x${fixture.dimensions.depth} ${fixture.dimension_unit}`,
      } satisfies PlanogramShelfRow;
    });
  }, [eligibleFixtures, shelvesByFixtureId, planogramMap, defaultRuleSetName]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return planogramRows;
    const q = searchQuery.toLowerCase();
    return planogramRows.filter(
      (r) =>
        r.shelfName.toLowerCase().includes(q) ||
        r.complianceRuleSet?.toLowerCase().includes(q) ||
        r.categorizeBy?.toLowerCase().includes(q) ||
        String(r.aisleCode ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.bayCode ?? r.bayNumber ?? "")
          .toLowerCase()
          .includes(q) ||
        String((r as { fixtureId?: string }).fixtureId ?? "")
          .toLowerCase()
          .includes(q) ||
        r.fixtureCode?.toLowerCase().includes(q) ||
        r.zone?.toLowerCase().includes(q) ||
        r.section?.toLowerCase().includes(q) ||
        r.fixtureType?.toLowerCase().includes(q),
    );
  }, [planogramRows, searchQuery]);

  useEffect(() => {
    if (!actionsMenu) return;
    const handlePointerDown = (e: Event) => {
      const target = e.target as Node;
      const menuEl =
        actionsMenuRef.current ??
        document.querySelector("[data-planogram-actions-menu]");
      if (menuEl?.contains(target)) return;

      const triggerBtn = (target as HTMLElement).closest?.(
        '[data-action="open-menu"]',
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

  const handlePlanogramAnalysis = useCallback(
    (row: PlanogramShelfRow) => {
      const fixtureShelves =
        shelvesByFixtureId.get(row.fixtureId ?? row.id) ?? [];
      const targetShelfId = fixtureShelves[0]?.id;
      if (!targetShelfId) {
        toast({
          title: "No shelves found",
          description:
            "This fixture has no shelves yet. Add shelves first to run planogram analysis.",
          variant: "warning",
        });
        setActionsMenu(null);
        return;
      }
      if (!row.planogramId?.trim()) {
        toast({
          title: "No planogram associated",
          description: "This fixture does not have a planogram associated.",
          variant: "warning",
        });
        setActionsMenu(null);
        return;
      }
      navigate({
        to: "/maker/audits/planogram/run/$shelfId",
        params: { shelfId: targetShelfId },
        search: {
          from: location.pathname,
          fixtureId: row.fixtureId ?? row.id,
          planogramId: row.planogramId ?? undefined,
        },
      });
      setActionsMenu(null);
    },
    [location.pathname, navigate, toast, shelvesByFixtureId],
  );

  const tableColumns = useMemo(
    () =>
      createMakerPlanogramTableColumns({
        onOpenMenu: handleOpenMenu,
      }),
    [handleOpenMenu],
  );

  const pageSizeSelectorOptions = useMemo(
    () => [...MAKER_PLANOGRAM_PAGE_SIZE_OPTIONS],
    [],
  );

  return (
    <>
      <div className="bg-primary flex min-h-0 flex-1 flex-col overflow-hidden pb-4 sm:pb-4 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col">
          <div className="mt-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:max-w-md">
              <Search className="text-muted-foreground group-focus-within:text-accent absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors" />
              <Input
                placeholder="Search Display Unit by type, code, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent h-12 pl-11 transition-all"
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

          <div className="mt-4 min-h-0 flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
                <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <LayoutGrid
                    className="text-muted-foreground h-7 w-7"
                    aria-hidden
                  />
                </div>
                <h3 className="text-foreground text-lg font-semibold">
                  No Display Units yet
                </h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                  Add Display Units to run planogram-based compliance analysis.
                </p>
                <Button asChild variant="success" className="mt-6">
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
              <div ref={tableWrapperRef} className="h-full">
                {/* {filteredRows.length > 0 && (
                  <p className="text-muted-foreground mb-2 shrink-0 text-sm">
                    Showing{" "}
                    <span className="text-foreground font-semibold">
                      {Math.max(
                        0,
                        Math.min(
                          tablePagination.pageSize,
                          filteredRows.length -
                            (tablePagination.page - 1) *
                              tablePagination.pageSize,
                        ),
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="text-foreground font-semibold">
                      {filteredRows.length}
                    </span>{" "}
                    Display Unit{filteredRows.length !== 1 ? "s" : ""}
                  </p>
                )} */}
                <DataTable<PlanogramShelfRow>
                  columns={tableColumns}
                  data={filteredRows}
                  className="h-full"
                  rowIdField="id"
                  initialSort={PLANOGRAM_INITIAL_SORT}
                  emptyMessage="No Display Units match your search"
                  pageSize={50}
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
