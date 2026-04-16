import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createPlanogramColumns,
} from "@/components/planogram/planogram-table-columns";
import type { PlanogramShelfRow } from "@/types/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { StoreFixtureModalValues } from "@/components/common/store-fixture-modal";
import {
  type DataTableColumn,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import { usePlanogramList } from "@/queries/maker";
import { useShelves } from "@/queries/maker";
import { useComplianceRuleSets } from "@/queries/maker";
import { useShelfTemplates } from "@/queries/checker";
import {
  createStoreFixture,
  deleteStoreFixture,
  fetchStoreFixtures,
  updateStoreFixture,
  type StoreFixtureApiModel,
} from "@/queries/checker/api/fixtures";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";
import { buildFixtureGroupHeader, groupByFixtureRow } from "./fixture-grouping";
import { StoreFixturesPageView } from "./store-fixtures-page-view";
import { useFixtureShelfRows } from "./use-fixture-shelf-rows";
import { usePersistedFixturePlanogramOverrides } from "./use-persisted-fixture-planogram-overrides";
import { useSubmitBulkShelves } from "./use-submit-bulk-shelves";

interface StoreFixturesPageProps {
  canEdit?: boolean;
}

const FIXTURE_PLANOGRAM_ASSOCIATIONS_STORAGE_KEY =
  "checker-fixture-planogram-associations";

export function StoreFixturesPage({ canEdit = false }: StoreFixturesPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore } = useGlobalStore();
  const [fixtureModalOpen, setFixtureModalOpen] = useState(false);
  const [isCreatingFixture, setIsCreatingFixture] = useState(false);
  const [editingFixture, setEditingFixture] = useState<StoreFixtureApiModel | null>(null);
  const [fixtureToDelete, setFixtureToDelete] = useState<StoreFixtureApiModel | null>(null);
  const [isDeletingFixture, setIsDeletingFixture] = useState(false);
  const [defaultDimensionUnit, setDefaultDimensionUnit] = useState<StoreDimensionUnit>("mm");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [pendingFixtureForShelf, setPendingFixtureForShelf] = useState<string | null>(null);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 50,
  });
  const [actionsMenu, setActionsMenu] = useState<{
    row: PlanogramShelfRow;
    triggerEl: HTMLElement;
    mode: "fixture" | "shelf";
    anchorPoint?: { x: number; y: number };
  } | null>(null);
  const [fixtureComplianceOverrides, setFixtureComplianceOverrides] = useState<
    Record<string, string>
  >({});
  const [fixtureCategorizeOverrides, setFixtureCategorizeOverrides] = useState<
    Record<string, string>
  >({});
  const [fixturePlanogramOverrides, setFixturePlanogramOverrides] = useState<
    Record<string, string | null>
  >({});
  const [planogramAssociationModalOpen, setPlanogramAssociationModalOpen] =
    useState(false);
  const [fixtureIdForPlanogramAssociation, setFixtureIdForPlanogramAssociation] =
    useState<string | null>(null);
  const [pendingPlanogramId, setPendingPlanogramId] = useState<string>("");
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [complianceSheetOpen, setComplianceSheetOpen] = useState(false);
  const [complianceSheetRuleSet, setComplianceSheetRuleSet] =
    useState<ComplianceRuleSetSummary | null>(null);
  const [complianceSheetRuleSetName, setComplianceSheetRuleSetName] = useState<string | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const { data: planogramList = [] } = usePlanogramList();
  const { data: ruleSets = [] } = useComplianceRuleSets();
  const { data: shelves = [] } = useShelves();
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } = useShelfTemplates();
  const isAdminPath = location.pathname.includes("/admin/");
  const storeId = params.storeId ?? selectedStore?.id;
  const selectedStoreId = selectedStore?.id;
  const shelfNewPath = isAdminPath ? "/admin/$storeId/shelf/new" : "/checker/shelf/new";
  const fixtureAssociationsStorageKey = storeId
    ? `${FIXTURE_PLANOGRAM_ASSOCIATIONS_STORAGE_KEY}:${storeId}`
    : FIXTURE_PLANOGRAM_ASSOCIATIONS_STORAGE_KEY;

  const planogramNameById = useMemo(
    () => new Map(planogramList.map((p) => [p.id, p.name])),
    [planogramList],
  );
  const planogramOptions = useMemo(
    () => planogramList.map((p) => ({ id: p.id, name: p.name })),
    [planogramList],
  );
  const { data: fixtures = [] } = useQuery({
    queryKey: ["maker", "fixtures", "list", selectedStore?.id ?? "no-store"],
    queryFn: fetchStoreFixtures,
    enabled: !!selectedStore?.id,
    staleTime: 60 * 1000,
  });

  const {
    defaultRuleSetName,
    fixtureById,
    effectivePlanogramByFixtureId,
    fixtureShelfRows,
    rowIdToFixtureId,
    shelvesByFixtureId,
  } = useFixtureShelfRows({
    fixtures,
    shelves,
    ruleSets,
    searchQuery,
    planogramNameById,
    fixturePlanogramOverrides,
    fixtureComplianceOverrides,
    fixtureCategorizeOverrides,
  });

  usePersistedFixturePlanogramOverrides({
    storageKey: fixtureAssociationsStorageKey,
    overrides: fixturePlanogramOverrides,
    setOverrides: setFixturePlanogramOverrides,
  });

  const openAddShelfModal = useCallback((fixtureId?: string) => {
    setPendingFixtureForShelf(fixtureId ?? null);
    setIsAddShelfModalOpen(true);
  }, []);

  const handleContinueAddShelf = useCallback(
    (payload: { addMode: "manual" | "template"; templateId?: string }) => {
    navigate({
      to: shelfNewPath as never,
      params: (isAdminPath ? { storeId } : {}) as never,
      search: {
        addMode: payload.addMode,
        templateId: payload.templateId,
        fixtureId: pendingFixtureForShelf ?? undefined,
      } as never,
    });
    setIsAddShelfModalOpen(false);
  }, [isAdminPath, navigate, pendingFixtureForShelf, shelfNewPath, storeId]);

  const handleBulkActions = useCallback(() => {
    setIsBulkAddModalOpen(true);
  }, []);

  const handleSubmitBulkShelves = useSubmitBulkShelves(selectedStoreId);

  if (!selectedStore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const handleCreateFixture = async (values: StoreFixtureModalValues) => {
    if (!canEdit) return;
    const type = values.type.trim();
    if (!type) {
      toast({
        title: "Missing fixture type",
        description: "Fixture type is required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFixture(true);
    try {
      if (editingFixture) {
        const code = values.code?.trim() || undefined;
        await updateStoreFixture(selectedStore.id, editingFixture.id, {
          type,
          ...(code ? { code } : {}),
          dimensions: {
            width: Number(values.width) || editingFixture.dimensions.width,
            height: Number(values.height) || editingFixture.dimensions.height,
            depth: Number(values.depth) || editingFixture.dimensions.depth,
          },
          dimension_unit: values.dimensionUnit || defaultDimensionUnit,
          physical_location: {
            section: values.section.trim() || editingFixture.physical_location.section,
            aisle: values.aisle.trim() || editingFixture.physical_location.aisle,
            zone: values.zone.trim() || editingFixture.physical_location.zone,
          },
        });
        if (values.planogramId !== undefined) {
          setFixturePlanogramOverrides((prev) => ({
            ...prev,
            [editingFixture.id]: values.planogramId?.trim() || null,
          }));
        }
      } else {
        await createStoreFixture(selectedStore.id, {
          type,
          dimensions: {
            width: Number(values.width) || 120,
            height: Number(values.height) || 200,
            depth: Number(values.depth) || 45,
          },
          dimension_unit: values.dimensionUnit || defaultDimensionUnit,
          physical_location: {
            section: values.section.trim() || "General",
            aisle: values.aisle.trim() || "A1",
            zone: values.zone.trim() || "General",
          },
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStore.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStore.id],
        }),
      ]);
      setFixtureModalOpen(false);
      setEditingFixture(null);
      setDefaultDimensionUnit(selectedStore.default_dimensions as StoreDimensionUnit || "mm");
      toast({
        title: editingFixture ? "Fixture updated" : "Fixture added",
        description: editingFixture
          ? "Fixture has been updated for this store."
          : "Fixture has been added to this store.",
      });
    } catch (error) {
      toast({
        title: editingFixture ? "Failed to update fixture" : "Failed to add fixture",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFixture(false);
    }
  };

  const handleDeleteFixture = async (fixture: StoreFixtureApiModel) => {
    if (!canEdit) return;
    setIsDeletingFixture(true);
    try {
      await deleteStoreFixture(selectedStore.id, fixture.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStore.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStore.id],
        }),
      ]);
      toast({
        title: "Fixture deleted",
        description: "Fixture has been removed from this store.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete fixture",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingFixture(false);
      setFixtureToDelete(null);
    }
  };

  const handleOpenFixtureActions = useCallback(
    (row: PlanogramShelfRow, triggerEl: HTMLElement) => {
      const triggerRect = triggerEl.getBoundingClientRect();
      setActionsMenu({
        row,
        triggerEl,
        mode: "shelf",
        anchorPoint: {
          x: triggerRect.left,
          y: triggerRect.top,
        },
      });
    },
    [],
  );

  const handleAddShelfForFixture = useCallback(
    (row: PlanogramShelfRow) => {
      if (!row.fixtureId) {
        toast({
          title: "Fixture missing",
          description: "Cannot add shelf without a fixture context.",
          variant: "warning",
        });
        return;
      }
      openAddShelfModal(row.fixtureId);
      setActionsMenu(null);
    },
    [openAddShelfModal, toast],
  );

  const handleAssociateFixturePlanogram = useCallback((row: PlanogramShelfRow) => {
    const fixtureId = row.fixtureId;
    if (!fixtureId) return;
    setFixtureIdForPlanogramAssociation(fixtureId);
    setPendingPlanogramId(effectivePlanogramByFixtureId.get(fixtureId) ?? "");
    setPlanogramAssociationModalOpen(true);
    setActionsMenu(null);
  }, [effectivePlanogramByFixtureId]);

  const handleFixtureRowClick = useCallback(
    (row: PlanogramShelfRow) => {
      const fixture = row.fixtureId ? fixtures.find((f) => f.id === row.fixtureId) : null;
      if (!fixture || !canEdit) return;
      setEditingFixture(fixture);
      setDefaultDimensionUnit((fixture.dimension_unit as StoreDimensionUnit) || "mm");
      setFixtureModalOpen(true);
    },
    [canEdit, fixtures],
  );

  const handleEditShelf = useCallback(
    (row: PlanogramShelfRow) => {
      if (row.id.startsWith("fixture-")) return;
      const path = isAdminPath
        ? "/admin/$storeId/shelf/$shelfId"
        : "/checker/shelf/$shelfId";
      navigate({
        to: path as never,
        params: (isAdminPath ? { storeId, shelfId: row.id } : { shelfId: row.id }) as never,
      });
    },
    [isAdminPath, navigate, storeId],
  );

  const handleDeleteShelf = useCallback(
    (shelfId: string) => {
      toast({
        title: "Delete shelf",
        description: `Delete request queued for shelf ${shelfId}.`,
        variant: "warning",
      });
    },
    [toast],
  );

  const handleSavePlanogramAssociation = useCallback(() => {
    if (!fixtureIdForPlanogramAssociation) return;
    setFixturePlanogramOverrides((prev) => ({
      ...prev,
      [fixtureIdForPlanogramAssociation]: pendingPlanogramId || null,
    }));
    setPlanogramAssociationModalOpen(false);
    setFixtureIdForPlanogramAssociation(null);
    setPendingPlanogramId("");
    toast({
      title: "Planogram association saved",
      description: "Association is currently stored on frontend only.",
      variant: "success",
    });
  }, [fixtureIdForPlanogramAssociation, pendingPlanogramId, toast]);

  const handleViewFixtureComplianceRule = useCallback(
    (row: PlanogramShelfRow) => {
      const ruleSetName = row.complianceRuleSet ?? "Default Rules";
      const set = ruleSets.find((s) => s.name === ruleSetName) ?? null;
      setComplianceSheetRuleSet(set);
      setComplianceSheetRuleSetName(ruleSetName);
      setComplianceSheetOpen(true);
      setActionsMenu(null);
    },
    [ruleSets],
  );

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleChange = (e: Event) => {
      const select = (e.target as HTMLElement).closest?.("[data-planogram-dropdown]");
      if (!select || !(select instanceof HTMLSelectElement)) return;
      const rowId = select.getAttribute("data-shelf-id");
      const field = select.getAttribute("data-field");
      const value = select.value;
      if (!rowId || !field) return;
      const fixtureId = rowIdToFixtureId.get(rowId) ?? rowId;
      if (field === "compliance") {
        setFixtureComplianceOverrides((prev) => ({ ...prev, [fixtureId]: value }));
      }
      if (field === "categorize") {
        setFixtureCategorizeOverrides((prev) => ({ ...prev, [fixtureId]: value }));
      }
    };
    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, [rowIdToFixtureId]);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const trigger = target.closest(
        "[data-action='fixture-group-menu']",
      ) as HTMLElement | null;
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      const fixtureId = trigger.getAttribute("data-fixture-id");
      if (!fixtureId) return;
      const fixture = fixtureById.get(fixtureId);
      if (!fixture) return;
      const firstShelf = (shelvesByFixtureId.get(fixtureId) ?? [])[0];
      const row: PlanogramShelfRow = {
        ...(firstShelf ?? {
          id: `fixture-${fixture.id}`,
          shelfName: fixture.type,
          status: "never-audited",
        }),
        fixtureId,
        planogramId: effectivePlanogramByFixtureId.get(fixtureId) ?? undefined,
        complianceRuleSet:
          fixtureComplianceOverrides[fixtureId] ?? defaultRuleSetName,
        categorizeBy: fixtureCategorizeOverrides[fixtureId] ?? "By Category",
      };
      const rect = trigger.getBoundingClientRect();
      setActionsMenu({
        row,
        triggerEl: trigger,
        mode: "fixture",
        anchorPoint: { x: rect.left, y: rect.top },
      });
    };
    el.addEventListener("click", handleClick, true);
    return () => el.removeEventListener("click", handleClick, true);
  }, [
    defaultRuleSetName,
    effectivePlanogramByFixtureId,
    fixtureById,
    fixtureCategorizeOverrides,
    fixtureComplianceOverrides,
    shelvesByFixtureId,
  ]);

  useEffect(() => {
    if (!actionsMenu) return;
    const onPointerDown = (event: Event) => {
      const target = event.target as Node | null;
      const menuEl =
        actionsMenuRef.current ??
        document.querySelector("[data-planogram-actions-menu]");
      if (menuEl?.contains(target)) return;
      const triggerBtn = (target as HTMLElement | null)?.closest?.(
        "[data-action=\"open-menu\"], [data-action=\"fixture-group-menu\"]",
      );
      if (triggerBtn && triggerBtn === actionsMenu.triggerEl) return;
      setActionsMenu(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [actionsMenu]);

  const columns: DataTableColumn<PlanogramShelfRow>[] = useMemo(
    () =>
      createPlanogramColumns({
        onOpenMenu: handleOpenFixtureActions,
        ruleSets,
        useShelfIdField: "id",
      }),
    [handleOpenFixtureActions, ruleSets],
  );

  const groupedByFixture = useCallback((row: PlanogramShelfRow) => groupByFixtureRow(row), []);

  const fixtureGroupHeader = useCallback(
    (value: string, count: number) => buildFixtureGroupHeader(fixtureById, value, count),
    [fixtureById],
  );

  const editingFixturePlanogramId = editingFixture
    ? (effectivePlanogramByFixtureId.get(editingFixture.id) ??
      editingFixture.planogram_id ??
      null)
    : null;

  return (
    <StoreFixturesPageView
      canEdit={canEdit}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isCreatingFixture={isCreatingFixture}
      onOpenCreateFixture={() => {
        setDefaultDimensionUnit((selectedStore.default_dimensions as StoreDimensionUnit) || "mm");
        setEditingFixture(null);
        setFixtureModalOpen(true);
      }}
      onOpenAddShelf={() => openAddShelfModal()}
      onBulkAddShelves={handleBulkActions}
      onBulkActions={handleBulkActions}
      tableWrapperRef={tableWrapperRef}
      fixtureShelfRows={fixtureShelfRows}
      tablePagination={tablePagination}
      setTablePagination={setTablePagination}
      columns={columns}
      onRowClick={handleFixtureRowClick}
      groupedByFixture={groupedByFixture}
      fixtureGroupHeader={fixtureGroupHeader}
      isDeleteConfirmOpen={!!fixtureToDelete}
      onCloseDeleteConfirm={() => {
        if (isDeletingFixture) return;
        setFixtureToDelete(null);
      }}
      onConfirmDelete={() => {
        if (!fixtureToDelete) return;
        void handleDeleteFixture(fixtureToDelete);
      }}
      fixtureToDeleteType={fixtureToDelete?.type}
      isDeletingFixture={isDeletingFixture}
      fixtureModalOpen={fixtureModalOpen}
      onCloseFixtureModal={() => {
        setFixtureModalOpen(false);
        setEditingFixture(null);
      }}
      onSaveFixture={handleCreateFixture}
      editingFixture={editingFixture}
      editingFixturePlanogramId={editingFixturePlanogramId}
      defaultDimensionUnit={defaultDimensionUnit}
      planogramOptions={planogramOptions}
      actionsMenu={actionsMenu}
      actionsMenuRef={actionsMenuRef}
      onCloseActionsMenu={() => setActionsMenu(null)}
      onEditShelf={handleEditShelf}
      onDeleteShelf={handleDeleteShelf}
      onAddShelfForFixture={handleAddShelfForFixture}
      onViewComplianceRule={handleViewFixtureComplianceRule}
      onAssociatePlanogram={handleAssociateFixturePlanogram}
      isBulkAddModalOpen={isBulkAddModalOpen}
      onCloseBulkAddModal={() => setIsBulkAddModalOpen(false)}
      onSubmitBulkShelves={handleSubmitBulkShelves}
      isAddShelfModalOpen={isAddShelfModalOpen}
      onCloseAddShelfModal={() => setIsAddShelfModalOpen(false)}
      shelfTemplates={shelfTemplates}
      shelfTemplatesLoading={shelfTemplatesLoading}
      onContinueAddShelf={handleContinueAddShelf}
      planogramAssociationModalOpen={planogramAssociationModalOpen}
      onClosePlanogramAssociationModal={() => setPlanogramAssociationModalOpen(false)}
      pendingPlanogramId={pendingPlanogramId}
      onChangePendingPlanogramId={setPendingPlanogramId}
      onSavePlanogramAssociation={handleSavePlanogramAssociation}
      complianceSheetOpen={complianceSheetOpen}
      onOpenChangeComplianceSheet={setComplianceSheetOpen}
      complianceSheetRuleSet={complianceSheetRuleSet}
      complianceSheetRuleSetName={complianceSheetRuleSetName}
    />
  );
}
