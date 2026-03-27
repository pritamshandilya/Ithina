import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import {
  createPlanogramColumns,
  PLANOGRAM_INITIAL_SORT,
  PLANOGRAM_PAGE_SIZE_OPTIONS,
  PlanogramActionsMenu,
} from "@/components/planogram/planogram-table-columns";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useShelves,
  useComplianceRuleSets,
  useDeleteShelf,
  usePlanogramList,
} from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import { mockUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";
import type { PlanogramArrangement } from "@/types/planogram";
import type { PlanogramShelfRow, Shelf } from "@/types/maker";
import { CheckerShelfEmptyState } from "./checker-shelf-empty-state";
import { CheckerShelfListToolbar } from "./checker-shelf-list-toolbar";

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
): PlanogramShelfRow {
  const arrangement = shelf.arrangement as PlanogramArrangement | undefined;
  const skuCount =
    arrangement?.shelfOrder?.reduce((n, s) => n + s.productIds.length, 0) ??
    8 + (shelf.id.charCodeAt(shelf.id.length - 1) % 12);
  const issues =
    shelf.status === "returned" ? 2 : shelf.status === "draft" ? 1 : 0;
  const planogramInfo = shelf.planogramId
    ? planogramMap?.get(shelf.planogramId)
    : undefined;
  const info =
    planogramInfo && typeof planogramInfo === "object" ? planogramInfo : undefined;

  const aisleCode =
    info?.aisle ??
    shelf.aisleCode ??
    (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : undefined);
  const zone = info?.zone ?? shelf.zone;
  const section = info?.section ?? shelf.section;
  const fixtureType = info?.fixtureType ?? shelf.fixtureType;
  const dimensions = info?.dimensions ?? shelf.dimensions;
  return {
    ...shelf,
    complianceRuleSet: "Default Rules",
    categorizeBy: "By Category",
    lastRun: shelf.lastAuditDate,
    productsCount: skuCount,
    issuesCount: issues,
    aisleCode,
    zone,
    section,
    fixtureType,
    dimensions,
  };
}

export interface CheckerShelfListPageProps {
  shelfDetailPath: string;
  adhocNewPath: string;
  pogNewPath: string;
}

function getOptionalStoreId(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const { storeId } = params as { storeId?: unknown };
  return typeof storeId === "string" ? storeId : undefined;
}

function asRouterPath(path: string): never {
  return path as never;
}

function asRouterParams(params: Record<string, string | undefined>): never {
  return params as never;
}

function asRouterSearch(search: Record<string, string | undefined>): never {
  return search as never;
}

export function CheckerShelfListPage({
  shelfDetailPath,
  adhocNewPath,
  pogNewPath,
}: CheckerShelfListPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const { toast } = useToast();
  const { selectedStore } = useStore();

  const isAdminPath = location.pathname.includes("/admin/");
  const storeId =
    getOptionalStoreId(params) ??
    (isAdminPath ? selectedStore?.id : undefined);

  const { data: shelves, isLoading } = useShelves();
  const deleteShelfMutation = useDeleteShelf();
  const { data: planogramList } = usePlanogramList();
  const { data: ruleSets } = useComplianceRuleSets();
  const _selectedStoreId = selectedStore?.id || mockUser.storeId;
  void _selectedStoreId;

  const [searchQuery, setSearchQuery] = useState("");
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 10,
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
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shelfIdPendingDelete, setShelfIdPendingDelete] = useState<string | null>(
    null,
  );
  const [complianceSheetOpen, setComplianceSheetOpen] = useState(false);
  const [complianceSheetRuleSet, setComplianceSheetRuleSet] =
    useState<ComplianceRuleSetSummary | null>(null);
  const [complianceSheetRuleSetName, setComplianceSheetRuleSetName] = useState<
    string | null
  >(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const skipNextOpenMenuFromTriggerRef = useRef(false);
  const [selectedRows, setSelectedRows] = useState<PlanogramShelfRow[]>([]);

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
      setActionsMenu({ row, triggerEl });
    },
    [],
  );

  const handleRowClick = useCallback(
    (row: PlanogramShelfRow) => {
      navigate({
        to: asRouterPath(shelfDetailPath),
        params: asRouterParams({ shelfId: row.id, storeId }),
      });
    },
    [navigate, shelfDetailPath, storeId],
  );

  const handleViewComplianceRule = useCallback(
    (row: PlanogramShelfRow) => {
      const ruleSetName = row.complianceRuleSet ?? "Default Rules";
      const set = (ruleSets ?? []).find((s) => s.name === ruleSetName) ?? null;
      setComplianceSheetRuleSet(set);
      setComplianceSheetRuleSetName(ruleSetName);
      setComplianceSheetOpen(true);
      setActionsMenu(null);
    },
    [ruleSets],
  );

  const handleNewRun = useCallback(
    (shelfId: string) => {
      navigate({
        to: asRouterPath(adhocNewPath),
        params: asRouterParams({ storeId }),
        search: asRouterSearch({ shelfId, from: location.pathname }),
      });
      setActionsMenu(null);
    },
    [navigate, adhocNewPath, storeId, location.pathname],
  );

  const handleAssociatePlanogram = useCallback(
    (shelfId: string) => {
      navigate({
        to: asRouterPath(pogNewPath),
        params: asRouterParams({ storeId }),
        search: asRouterSearch({ shelfId }),
      });
    },
    [navigate, pogNewPath, storeId],
  );

  const handleDeleteShelf = useCallback(
    (shelfId: string) => {
      setShelfIdPendingDelete(shelfId);
      setDeleteConfirmOpen(true);
      setActionsMenu(null);
    },
    [],
  );

  const confirmDeleteShelf = useCallback(async () => {
    if (!shelfIdPendingDelete) return;
    try {
      await deleteShelfMutation.mutateAsync(shelfIdPendingDelete);
      toast({
        title: "Shelf deleted",
        description: "The shelf has been removed successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete shelf",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setShelfIdPendingDelete(null);
    }
  }, [deleteShelfMutation, shelfIdPendingDelete, toast]);

  const tableColumns = useMemo(
    () =>
      createPlanogramColumns({
        onOpenMenu: handleOpenMenu,
        ruleSets: ruleSets ?? [],
        useShelfIdField: "shelf_id",
      }),
    [handleOpenMenu, ruleSets],
  );

  const pageSizeSelectorOptions = useMemo(
    () => [...PLANOGRAM_PAGE_SIZE_OPTIONS],
    [],
  );
  const visibleRowsCount = Math.max(
    0,
    Math.min(
      tablePagination.pageSize,
      filteredRows.length - (tablePagination.page - 1) * tablePagination.pageSize,
    ),
  );

  const handleBulkDeleteSelected = useCallback(() => {
    const count = selectedRows.length;
    if (!count) return;
    toast({
      title: "Bulk delete (frontend only)",
      description: `You selected ${count} shelf${count === 1 ? "" : "s"}. Backend delete is not wired yet.`,
      variant: "warning",
    });
  }, [selectedRows.length, toast]);

  const handleBulkAddShelves = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      toast({
        title: "Bulk add (frontend only)",
        description: `Loaded file "${file.name}". Parsing and upload will be wired to the backend later.`,
        variant: "success",
      });
    };
    input.click();
  }, [toast]);

  return (
    <>
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          if (deleteShelfMutation.isPending) return;
          setDeleteConfirmOpen(false);
          setShelfIdPendingDelete(null);
        }}
        onConfirm={confirmDeleteShelf}
        title="Delete shelf?"
        description="Are you sure you want to delete this shelf? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={deleteShelfMutation.isPending}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">
          <CheckerShelfListToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedRows.length}
            onDeleteSelected={handleBulkDeleteSelected}
            onBulkAdd={handleBulkAddShelves}
          />

          {filteredRows.length > 0 && (
            <p className="mt-2 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{visibleRowsCount}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
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
              <CheckerShelfEmptyState />
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
                  isBulkEnabled
                  onSelectionChange={setSelectedRows}
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
          variant="checker"
          onClose={() => setActionsMenu(null)}
          onNewRun={handleNewRun}
          onViewComplianceRule={handleViewComplianceRule}
          onAssociatePlanogram={handleAssociatePlanogram}
          onDeleteShelf={handleDeleteShelf}
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
