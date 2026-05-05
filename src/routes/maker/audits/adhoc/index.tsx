import {
  Link,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import { createMakerPlanogramTableColumns } from "@/components/planogram/planogram-maker-table-columns";
import {
  PLANOGRAM_INITIAL_SORT,
  PlanogramActionsMenu,
} from "@/components/planogram/planogram-table-columns";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getShelfFixtureId } from "@/lib/fixtures/analysis";
import {
  useComplianceRuleSets,
  useShelves,
  useStoreFixtures,
} from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import type { PlanogramArrangement } from "@/types/planogram";

export const Route = createFileRoute("/maker/audits/adhoc/")({
  component: AdhocAnalysisPage,
});

function toPlanogramRow(
  shelf: Shelf,
  defaultComplianceRuleSetName = "Default Rules",
  fixturePlanogramId?: string | null,
): PlanogramShelfRow {
  const arrangement = shelf.arrangement as PlanogramArrangement | undefined;
  const skuCount =
    arrangement?.shelfOrder?.reduce((n, s) => n + s.productIds.length, 0) ?? 0;
  const issues =
    shelf.status === "returned" ? 2 : shelf.status === "draft" ? 1 : 0;
  return {
    ...shelf,
    planogramId: fixturePlanogramId ?? undefined,
    complianceRuleSet: defaultComplianceRuleSetName,
    categorizeBy: "By Category",
    lastRun: shelf.lastAuditDate,
    productsCount: skuCount,
    issuesCount: issues,
  };
}

function AdhocAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: shelves, isLoading: isShelvesLoading } = useShelves();
  const { data: storeFixtures = [], isLoading: isFixturesLoading } =
    useStoreFixtures();
  const isLoading = isShelvesLoading || isFixturesLoading;
  const { data: ruleSets = [] } = useComplianceRuleSets();
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
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const defaultRuleSetName = useMemo(
    () => ruleSets.find((s) => s.isDefault)?.name ?? "Default Rules",
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
      const fixtureHasShelves = fixtureShelves.length > 0;
      return fixtureHasShelves;
    });
  }, [shelvesByFixtureId, storeFixtures]);

  const fixtureRows = useMemo(() => {
    return eligibleFixtures.map((fixture) => {
      const fixtureShelves = shelvesByFixtureId.get(fixture.id) ?? [];
      const fixtureCode = (fixture.code ?? "").trim();
      const fixtureType = (fixture.type ?? "").trim();
      const representativeShelf = fixtureShelves[0];
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
      const baseRow = toPlanogramRow(
        representativeShelf ?? fallbackShelf,
        defaultRuleSetName,
        fixture.planogram_id ?? null,
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
        complianceRuleSet: defaultRuleSetName,
      } satisfies PlanogramShelfRow;
    });
  }, [defaultRuleSetName, eligibleFixtures, shelvesByFixtureId]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return fixtureRows;
    const q = searchQuery.toLowerCase();
    return fixtureRows.filter(
      (r) =>
        r.shelfName.toLowerCase().includes(q) ||
        r.complianceRuleSet?.toLowerCase().includes(q) ||
        String(r.aisleCode ?? "")
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
  }, [fixtureRows, searchQuery]);

  useEffect(() => {
    if (!actionsMenu) return;
    const handlePointerDown = (event: Event) => {
      const target = event.target as Node;
      if (actionsMenuRef.current?.contains(target)) return;
      setActionsMenu(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [actionsMenu]);

  const handleOpenMenu = useCallback(
    (row: PlanogramShelfRow, triggerEl: HTMLElement) => {
      const triggerRect = triggerEl.getBoundingClientRect();
      setActionsMenu({
        row,
        triggerEl,
        anchorPoint: { x: triggerRect.left, y: triggerRect.top },
      });
    },
    [],
  );

  const handleRunAdhoc = useCallback(
    (row: PlanogramShelfRow) => {
      if ((row.fixtureShelvesCount ?? 0) <= 0) {
        toast({
          title: "No shelves found",
          description: "This fixture has no shelves.",
          variant: "destructive",
        });
        setActionsMenu(null);
        return;
      }

      const targetFixtureId = row.fixtureId ?? row.id;
      if (!targetFixtureId) return;
      navigate({
        to: "/maker/audits/adhoc/new",
        search: { fixtureId: targetFixtureId, from: location.pathname },
      });
      setActionsMenu(null);
    },
    [location.pathname, navigate, toast],
  );

  const handleViewCompliance = useCallback(
    (row: PlanogramShelfRow) => {
      const requestedName = row.complianceRuleSet ?? defaultRuleSetName;
      const matched =
        ruleSets.find((ruleSet) => ruleSet.name === requestedName) ??
        (requestedName === "Default Rules"
          ? (ruleSets.find((ruleSet) => ruleSet.isDefault) ?? null)
          : null);
      setComplianceSheetRuleSet(matched);
      setComplianceSheetRuleSetName(matched?.name ?? requestedName);
      setComplianceSheetOpen(true);
      setActionsMenu(null);
    },
    [defaultRuleSetName, ruleSets],
  );

  const tableColumns = useMemo(
    () =>
      createMakerPlanogramTableColumns({
        onOpenMenu: handleOpenMenu,
      }),
    [handleOpenMenu],
  );

  const fixtureTable = useMemo(
    () => (
      <DataTable<PlanogramShelfRow>
        columns={tableColumns}
        data={filteredRows}
        className="h-full"
        rowIdField="id"
        initialSort={PLANOGRAM_INITIAL_SORT}
        emptyMessage="No fixtures match your search"
        pageSize={50}
        pageSizeSelector={[10, 20, 50, 75, 100]}
        headerFilters={false}
        layout="fitData"
        onPaginationChange={setTablePagination}
        onRowClick={handleRunAdhoc}
      />
    ),
    [filteredRows, handleRunAdhoc, tableColumns],
  );

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Adhoc Analysis"
          description="Select a Display Unit and run adhoc analysis without requiring a planogram in the request."
        >
          <Button asChild variant="success" className="shrink-0">
            <Link
              to="/maker/audits/adhoc/new"
              search={{ fixtureId: undefined }}
            >
              <Plus className="size-4" aria-hidden />
              New Adhoc Analysis
            </Link>
          </Button>
        </PageHeader>
      }
    >
      <div className="bg-primary flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col">
          <div className="mt-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:max-w-md">
              <Search className="text-muted-foreground group-focus-within:text-accent absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors" />
              <Input
                placeholder="Search Display Unit by type, code, or location..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent h-12 pl-11 transition-all"
              />
            </div>
          </div>

          {/* {filteredRows.length > 0 && (
            <p className="text-muted-foreground mt-4 shrink-0 text-sm">
              Showing{" "}
              <span className="text-foreground font-semibold">
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
              <span className="text-foreground font-semibold">
                {filteredRows.length}
              </span>{" "}
              Display Unit{filteredRows.length !== 1 ? "s" : ""}
            </p>
          )} */}

          <div className="mt-4 min-h-0 flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <LayoutGrid
                    className="text-muted-foreground h-7 w-7"
                    aria-hidden
                  />
                </div>
                <h3 className="text-foreground text-lg font-semibold">
                  No Display Units found
                </h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                  Add Display Units first to run adhoc analysis and view
                  compliance details.
                </p>
                <Button asChild variant="success" className="mt-6">
                  <Link
                    to="/maker/audits/adhoc/new"
                    search={{ fixtureId: undefined }}
                  >
                    <Plus className="size-4" aria-hidden />
                    New Adhoc Analysis
                  </Link>
                </Button>
              </div>
            ) : (
              <div ref={tableWrapperRef} className="h-full">
                {fixtureTable}
              </div>
            )}
          </div>
        </div>
      </div>
      {actionsMenu ? (
        <PlanogramActionsMenu
          ref={actionsMenuRef}
          row={actionsMenu.row}
          triggerEl={actionsMenu.triggerEl}
          anchorPoint={actionsMenu.anchorPoint}
          variant="maker"
          onClose={() => setActionsMenu(null)}
          onRunAdhoc={handleRunAdhoc}
          onViewComplianceRule={handleViewCompliance}
          onDeleteShelf={undefined}
          onDeleteFixture={undefined}
        />
      ) : null}
      <ComplianceRuleViewSheet
        open={complianceSheetOpen}
        onOpenChange={setComplianceSheetOpen}
        ruleSet={complianceSheetRuleSet}
        ruleSetName={complianceSheetRuleSetName}
      />
    </MainLayout>
  );
}
