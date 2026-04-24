import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import type { StoreFixtureModalValues } from "@/components/common/store-fixture-modal";
import {
  type DataTableColumn,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { formatPlanogramShelfDimensionDisplay } from "@/lib/planogram/format-planogram-shelf-dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import { useShelfTemplates } from "@/queries/checker";
import {
  assignPlanogramToFixture,
  clearPlanogramFromFixture,
  createStoreFixture,
  deleteStoreFixture,
  fetchStoreFixtures,
  updateStoreFixture,
  type StoreFixtureApiModel,
} from "@/queries/checker/api/fixtures";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";
import { useComplianceRuleSets, useCreateShelf, usePlanogramList, useShelves } from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { PlanogramShelfRow } from "@/types/maker";
import { AddShelfFormModal } from "./add-shelf-form-modal";
import { AddShelfModeModal } from "./add-shelf-mode-modal";
import { StoreFixturesPageView } from "./store-fixtures-page-view";
import { useFixtureShelfRows } from "./use-fixture-shelf-rows";
import { useStoreFixturesTableDom } from "./use-store-fixtures-table-dom";
import { useSubmitBulkShelves } from "./use-submit-bulk-shelves";

interface StoreFixturesPageProps {
  canEdit?: boolean;
}

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
  const [isAddShelfModeModalOpen, setIsAddShelfModeModalOpen] = useState(false);
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [pendingFixtureForShelf, setPendingFixtureForShelf] = useState<string | null>(null);
  const [selectedFixtureForShelfForm, setSelectedFixtureForShelfForm] = useState("");
  const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>(undefined);
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
  const createShelfMutation = useCreateShelf();
  const isAdminPath = location.pathname.includes("/admin/");
  const storeId = params.storeId ?? selectedStore?.id;
  const adminStoreIdFromPath =
    isAdminPath
      ? (/\/admin\/([^/]+)/.exec(location.pathname)?.[1] ?? undefined)
      : undefined;
  const resolvedAdminStoreId = isAdminPath
    ? (storeId ?? adminStoreIdFromPath)
    : undefined;
  const selectedStoreId = selectedStore?.id;

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
    rowIdToFixtureId,
    shelvesByFixtureId,
  } = useFixtureShelfRows({
    fixtures,
    shelves,
    ruleSets,
    searchQuery,
    planogramNameById,
    fixtureComplianceOverrides,
    fixtureCategorizeOverrides,
  });

  const openAddShelfModal = useCallback((fixtureId?: string) => {
    setPendingFixtureForShelf(fixtureId ?? null);
    setPendingTemplateId(undefined);
    setIsAddShelfModeModalOpen(true);
  }, []);

  const handleContinueAddShelf = useCallback(
    (payload: { addMode: "manual" | "template"; templateId?: string }) => {
      void payload.addMode;
      setPendingTemplateId(payload.templateId);
      setSelectedFixtureForShelfForm(pendingFixtureForShelf ?? "");
      setIsAddShelfModeModalOpen(false);
      setIsAddShelfModalOpen(true);
    },
    [pendingFixtureForShelf],
  );

  const handleCreateShelfFromModal = useCallback(
    async (values: {
      name: string;
      code?: string;
      width: number;
      height: number;
      vertical_position: number;
    }) => {
      const targetFixtureId = selectedFixtureForShelfForm || pendingFixtureForShelf;
      if (!targetFixtureId) {
        toast({
          title: "Select a fixture first",
          description: "Please select a fixture in the add shelf form.",
          variant: "warning",
        });
        return;
      }
      setIsCreatingShelf(true);
      try {
        const generatedCode = `SH-${Date.now().toString().slice(-6)}`;
        await createShelfMutation.mutateAsync({
          ...values,
          code: values.code?.trim() || generatedCode,
          fixture_id: targetFixtureId,
        });
        await queryClient.invalidateQueries({ queryKey: ["maker", "shelves"] });
        setIsAddShelfModalOpen(false);
        setPendingFixtureForShelf(null);
        setSelectedFixtureForShelfForm("");
        setPendingTemplateId(undefined);
        toast({
          title: "Shelf created",
          description: "New shelf has been added to the fixture.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Failed to create shelf",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingShelf(false);
      }
    },
    [
      createShelfMutation,
      pendingFixtureForShelf,
      queryClient,
      selectedFixtureForShelfForm,
      toast,
    ],
  );

  const handleBulkActions = useCallback(() => {
    setIsBulkAddModalOpen(true);
  }, []);

  const handleSubmitBulkShelves = useSubmitBulkShelves(selectedStoreId);

  const handleCreateFixture = async (values: StoreFixtureModalValues) => {
    if (!canEdit) return;
    if (!selectedStoreId) return;
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
        await updateStoreFixture(selectedStoreId, editingFixture.id, {
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
          const nextPlanogramId = values.planogramId?.trim() || null;
          const currentPlanogramId = editingFixture.planogram_id ?? null;
          if (nextPlanogramId !== currentPlanogramId) {
            if (nextPlanogramId) {
              await assignPlanogramToFixture(selectedStoreId, editingFixture.id, nextPlanogramId);
            } else {
              await clearPlanogramFromFixture(selectedStoreId, editingFixture.id);
            }
          }
        }
      } else {
        await createStoreFixture(selectedStoreId, {
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
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStoreId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStoreId],
        }),
      ]);
      setFixtureModalOpen(false);
      setEditingFixture(null);
      setDefaultDimensionUnit(selectedStore?.default_dimensions as StoreDimensionUnit || "mm");
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
    if (!selectedStoreId) return;
    setIsDeletingFixture(true);
    try {
      await deleteStoreFixture(selectedStoreId, fixture.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStoreId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStoreId],
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
        mode: "fixture",
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
      setPendingTemplateId(undefined);
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

  const openFixtureDetail = useCallback((
    targetShelfId: string,
    options?: { fixtureId?: string },
  ) => {
    if (isAdminPath && !resolvedAdminStoreId) {
      toast({
        title: "Store context missing",
        description: "Cannot open fixture details without a store id.",
        variant: "destructive",
      });
      return;
    }
    const path = isAdminPath
      ? "/admin/$storeId/fixture-types/$shelfId"
      : "/checker/fixture-types/$shelfId";
    navigate({
      to: path as never,
      params: (isAdminPath
        ? { storeId: resolvedAdminStoreId, shelfId: targetShelfId }
        : { shelfId: targetShelfId }) as never,
      state: { from: location.pathname, fixtureId: options?.fixtureId } as never,
    });
  }, [isAdminPath, location.pathname, navigate, resolvedAdminStoreId, toast]);

  const openFixtureDetailFromRow = useCallback(
    (row: PlanogramShelfRow) => {
      const fixtureId = row.fixtureId;
      if (!fixtureId) return;
      const firstShelf = (shelvesByFixtureId.get(fixtureId) ?? [])[0];
      const firstShelfId = firstShelf?.id ?? firstShelf?.shelf_id;
      openFixtureDetail(firstShelfId ?? fixtureId, { fixtureId });
    },
    [openFixtureDetail, shelvesByFixtureId],
  );

  const handleFixtureRowClick = useCallback(
    (row: PlanogramShelfRow) => {
      openFixtureDetailFromRow(row);
    },
    [openFixtureDetailFromRow],
  );

  const handleEditFixture = useCallback(
    (row: PlanogramShelfRow) => {
      const fixtureId = row.fixtureId;
      if (!fixtureId) return;
      const targetFixture = fixtures.find((fixture) => fixture.id === fixtureId);
      if (!targetFixture) return;
      setDefaultDimensionUnit((targetFixture.dimension_unit ?? "mm") as StoreDimensionUnit);
      setEditingFixture(targetFixture);
      setFixtureModalOpen(true);
      setActionsMenu(null);
    },
    [fixtures],
  );

  const handleDeleteFixtureFromRow = useCallback(
    (row: PlanogramShelfRow) => {
      const fixtureId = row.fixtureId;
      if (!fixtureId) return;
      const targetFixture = fixtures.find((fixture) => fixture.id === fixtureId);
      if (!targetFixture) return;
      setFixtureToDelete(targetFixture);
      setActionsMenu(null);
    },
    [fixtures],
  );

  const handleSavePlanogramAssociation = useCallback(async () => {
    if (!fixtureIdForPlanogramAssociation || !selectedStoreId) return;
    try {
      if (pendingPlanogramId) {
        await assignPlanogramToFixture(
          selectedStoreId,
          fixtureIdForPlanogramAssociation,
          pendingPlanogramId,
        );
      } else {
        await clearPlanogramFromFixture(selectedStoreId, fixtureIdForPlanogramAssociation);
      }
      await queryClient.invalidateQueries({
        queryKey: ["maker", "fixtures", "list", selectedStoreId],
      });
      setPlanogramAssociationModalOpen(false);
      setFixtureIdForPlanogramAssociation(null);
      setPendingPlanogramId("");
      toast({
        title: "Planogram association saved",
        description: "Fixture planogram assignment was updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to save planogram association",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [fixtureIdForPlanogramAssociation, pendingPlanogramId, queryClient, selectedStoreId, toast]);

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

  const handleRunFixtureAdhocAnalysis = useCallback(
    (_row: PlanogramShelfRow) => {
      toast({
        title: "Adhoc analysis",
        description: "Adhoc analysis flow for fixtures will be available soon.",
        variant: "warning",
      });
      setActionsMenu(null);
    },
    [toast],
  );

  const fixtureRowIdToFixtureId = useMemo(() => {
    const map = new Map<string, string>();
    fixtureById.forEach((_fixture, fixtureId) => {
      map.set(`fixture-${fixtureId}`, fixtureId);
    });
    return map;
  }, [fixtureById]);

  const effectiveRowIdToFixtureId = useMemo(() => {
    const map = new Map<string, string>(rowIdToFixtureId);
    fixtureRowIdToFixtureId.forEach((fixtureId, rowId) => {
      map.set(rowId, fixtureId);
    });
    return map;
  }, [fixtureRowIdToFixtureId, rowIdToFixtureId]);

  useStoreFixturesTableDom({
    tableWrapperRef,
    rowIdToFixtureId: effectiveRowIdToFixtureId,
    setFixtureComplianceOverrides,
    setFixtureCategorizeOverrides,
    fixtureById,
    shelvesByFixtureId,
    effectivePlanogramByFixtureId,
    defaultRuleSetName,
    fixtureComplianceOverrides,
    fixtureCategorizeOverrides,
    setActionsMenu,
    openFixtureDetail,
    toast,
    actionsMenu,
    actionsMenuRef,
  });

  const fixtureRows: PlanogramShelfRow[] = useMemo(
    () =>
      Array.from(fixtureById.values()).map((fixture) => {
        const fixtureShelves = shelvesByFixtureId.get(fixture.id) ?? [];
        const planogramId = effectivePlanogramByFixtureId.get(fixture.id) ?? undefined;
        return {
          id: `fixture-${fixture.id}`,
          fixtureId: fixture.id,
          shelfName: fixture.type,
          shelfCode: fixture.code ?? "—",
          fixtureType: fixture.type,
          section: fixture.physical_location.section,
          zone: fixture.physical_location.zone,
          aisleCode: fixture.physical_location.aisle,
          width: fixture.dimensions.width,
          height: fixture.dimensions.height,
          depth: fixture.dimensions.depth,
          dimensions: `${fixture.dimensions.width}×${fixture.dimensions.height}×${fixture.dimensions.depth} ${fixture.dimension_unit}`,
          status: "never-audited",
          productsCount: fixtureShelves.length,
          planogramId,
          description: planogramId ? (planogramNameById.get(planogramId) ?? "—") : "—",
          dimensionUnit: fixture.dimension_unit,
          complianceRuleSet: fixtureComplianceOverrides[fixture.id] ?? defaultRuleSetName,
          categorizeBy: fixtureCategorizeOverrides[fixture.id] ?? "By Category",
        };
      }),
    [
      defaultRuleSetName,
      effectivePlanogramByFixtureId,
      fixtureById,
      fixtureCategorizeOverrides,
      fixtureComplianceOverrides,
      planogramNameById,
      shelvesByFixtureId,
    ],
  );

  const columns: DataTableColumn<PlanogramShelfRow>[] = useMemo(
    () => [
      {
        title: "Code",
        field: "shelfCode",
        minWidth: 150,
        sorter: "string",
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => PlanogramShelfRow }).getData();
          return `<span class="p-1">${row.shelfCode ?? "—"}</span>`;
        },
      },
      {
        title: "Type",
        field: "fixtureType",
        minWidth: 200,
        width: 250,
        widthGrow: 1,
        sorter: "string",
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => PlanogramShelfRow }).getData();
          const fixtureType = row.fixtureType?.replace(/_/g, " ") ?? "—";
          return `<span class="text-sm font-medium text-foreground">${fixtureType}</span>`;
        },
      },
      
      {
        title: "Section",
        field: "section",
        minWidth: 150,
        maxWidth: 200,
        sorter: "string",
      },
      {
        title: "Aisle",
        field: "aisleCode",
        minWidth: 100,
        sorter: "string",
      },
      {
        title: "Zone",
        field: "zone",
        minWidth: 130,
        width: 140,
        sorter: "string",
      },
      {
        title: "Dimension",
        field: "dimensions",
        minWidth: 230,
        sorter: "string",
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => PlanogramShelfRow }).getData();
          const text = formatPlanogramShelfDimensionDisplay(row);
          return `<span class="text-sm tabular-nums font-medium text-foreground">${text}</span>`;
        },
      },
      {
        title: "Compliance",
        field: "complianceRuleSet",
        minWidth: 250,
        sorter: "string",
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => PlanogramShelfRow }).getData();
          return `<span class="text-sm font-medium text-foreground">${row.complianceRuleSet ?? "Default Rules"}</span>`;
        },
      },
      {
        title: "Shelves",
        field: "productsCount",
        minWidth: 100,
        sorter: "number",
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => PlanogramShelfRow }).getData();
          return `<span class="text-sm tabular-nums font-medium text-foreground">${row.productsCount ?? 0}</span>`;
        },
      },
      {
        title: "Action",
        field: "id",
        minWidth: 60,
        headerSort: false,
        frozen: true,
        hozAlign: "center",
        formatter: () => `
          <button type="button" data-action="open-menu" title="Actions" class="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Open actions menu">
            ⋯
          </button>
        `,
        cellClick: (event: unknown, cell: { getData: () => PlanogramShelfRow }) => {
          (event as { stopPropagation?: () => void }).stopPropagation?.();
          const target = (event as { target?: HTMLElement }).target as HTMLElement;
          const trigger = target?.closest?.("[data-action='open-menu']");
          if (!trigger) return;
          handleOpenFixtureActions(cell.getData(), trigger as HTMLElement);
        },
      },
    ],
    [handleOpenFixtureActions, ruleSets],
  );

  const editingFixturePlanogramId = editingFixture
    ? (effectivePlanogramByFixtureId.get(editingFixture.id) ??
      editingFixture.planogram_id ??
      null)
    : null;

  if (!selectedStore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <>
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
        onOpenAddShelf={() => {
          openAddShelfModal();
        }}
        onBulkAddShelves={handleBulkActions}
        tableWrapperRef={tableWrapperRef}
        fixtureShelfRows={fixtureRows}
        tablePagination={tablePagination}
        setTablePagination={setTablePagination}
        columns={columns}
        onRowClick={handleFixtureRowClick}
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
        onEditShelf={handleEditFixture}
        onDeleteShelf={() => undefined}
        onAddShelfForFixture={handleAddShelfForFixture}
        onViewComplianceRule={handleViewFixtureComplianceRule}
        onAssociatePlanogram={handleAssociateFixturePlanogram}
        onViewFixture={openFixtureDetailFromRow}
        onDeleteFixture={handleDeleteFixtureFromRow}
        onRunAdhocAnalysis={handleRunFixtureAdhocAnalysis}
        isBulkAddModalOpen={isBulkAddModalOpen}
        onCloseBulkAddModal={() => setIsBulkAddModalOpen(false)}
        onSubmitBulkShelves={handleSubmitBulkShelves}
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
      <AddShelfFormModal
        isOpen={isAddShelfModalOpen}
        onClose={() => {
          setIsAddShelfModalOpen(false);
          setPendingFixtureForShelf(null);
          setSelectedFixtureForShelfForm("");
          setPendingTemplateId(undefined);
        }}
        onSubmit={handleCreateShelfFromModal}
        isSaving={isCreatingShelf}
        defaultDimensionUnit={defaultDimensionUnit}
        shelfTemplates={shelfTemplates}
        shelfTemplatesLoading={shelfTemplatesLoading}
        initialTemplateId={pendingTemplateId}
        fixtureOptions={fixtures.map((fixture) => ({
          id: fixture.id,
          label: fixture.code
            ? `${fixture.code} (${fixture.type})`
            : `${fixture.type} - ${fixture.physical_location.zone}/${fixture.physical_location.section}`,
        }))}
        selectedFixtureId={selectedFixtureForShelfForm}
        onFixtureChange={setSelectedFixtureForShelfForm}
        disableFixtureSelect={!!pendingFixtureForShelf}
      />
      <AddShelfModeModal
        isOpen={isAddShelfModeModalOpen}
        onClose={() => {
          setIsAddShelfModeModalOpen(false);
          setPendingFixtureForShelf(null);
          setPendingTemplateId(undefined);
        }}
        shelfTemplates={shelfTemplates}
        shelfTemplatesLoading={shelfTemplatesLoading}
        onContinue={handleContinueAddShelf}
      />
    </>
  );
}
