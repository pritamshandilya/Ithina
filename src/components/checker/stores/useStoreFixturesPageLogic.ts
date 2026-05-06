import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import { useSubmitBulkShelves } from "./useSubmitBulkShelves";
import type { StoreFixtureModalValues } from "@/components/common/StoreFixtureModal";
import { useToast } from "@/hooks/useToast";
import type { StoreFixtureApiModel } from "@/lib/api/checker/fixtures";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import { useShelfTemplates } from "@/queries/checker";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";
import {
  useComplianceRuleSets,
  useCreateFixture,
  useCreateShelf,
  usePlanogramList,
  useShelves,
  useStoreFixtures,
} from "@/queries/maker";
import {
  useAssignPlanogramToFixture,
  useClearPlanogramFromFixture,
  useDeleteFixture,
  useUpdateFixture,
} from "@/queries/maker/hooks/useFixtureMutations";
import type { ComplianceRuleSetSummary } from "@/types/complianceRuleSet";
import type { PlanogramShelfRow } from "@/types/maker";

import { useFixtureShelfRows } from "./useFixtureShelfRows";

export interface ActionsMenuState {
  row: PlanogramShelfRow;
  triggerEl: HTMLElement;
  mode: "fixture" | "shelf";
  anchorPoint?: { x: number; y: number };
}

export function useStoreFixturesPageLogic(canEdit: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore } = useGlobalStore();

  const [fixtureModalOpen, setFixtureModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] =
    useState<StoreFixtureApiModel | null>(null);
  const [fixtureToDelete, setFixtureToDelete] =
    useState<StoreFixtureApiModel | null>(null);
  const [defaultDimensionUnit, setDefaultDimensionUnit] =
    useState<StoreDimensionUnit>("mm");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddShelfModeModalOpen, setIsAddShelfModeModalOpen] = useState(false);
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [pendingFixtureForShelf, setPendingFixtureForShelf] = useState<
    string | null
  >(null);
  const [selectedFixtureForShelfForm, setSelectedFixtureForShelfForm] =
    useState("");
  const [pendingTemplateId, setPendingTemplateId] = useState<
    string | undefined
  >(undefined);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 50,
  });
  const [actionsMenu, setActionsMenu] = useState<ActionsMenuState | null>(null);
  const [fixtureComplianceOverrides, setFixtureComplianceOverrides] = useState<
    Record<string, string>
  >({});
  const [fixtureCategorizeOverrides, setFixtureCategorizeOverrides] = useState<
    Record<string, string>
  >({});
  const [planogramAssociationModalOpen, setPlanogramAssociationModalOpen] =
    useState(false);
  const [
    fixtureIdForPlanogramAssociation,
    setFixtureIdForPlanogramAssociation,
  ] = useState<string | null>(null);
  const [pendingPlanogramId, setPendingPlanogramId] = useState<string>("");
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [complianceSheetOpen, setComplianceSheetOpen] = useState(false);
  const [complianceSheetRuleSet, setComplianceSheetRuleSet] =
    useState<ComplianceRuleSetSummary | null>(null);
  const [complianceSheetRuleSetName, setComplianceSheetRuleSetName] = useState<
    string | null
  >(null);

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const { data: planogramList = [] } = usePlanogramList();
  const { data: ruleSets = [] } = useComplianceRuleSets();
  const { data: shelves = [] } = useShelves();
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } =
    useShelfTemplates();
  const { data: fixtures = [] } = useStoreFixtures();

  const createShelfMutation = useCreateShelf();
  const createFixtureMutation = useCreateFixture();
  const updateFixtureMutation = useUpdateFixture();
  const deleteFixtureMutation = useDeleteFixture();
  const assignPlanogramMutation = useAssignPlanogramToFixture();
  const clearPlanogramMutation = useClearPlanogramFromFixture();

  const isAdminPath = location.pathname.includes("/admin/");
  const selectedStoreId = selectedStore?.id;
  const handleSubmitBulkShelves = useSubmitBulkShelves(selectedStoreId);
  const storeId = params.storeId ?? selectedStoreId;
  const adminStoreIdFromPath = isAdminPath
    ? (/\/admin\/([^/]+)/.exec(location.pathname)?.[1] ?? undefined)
    : undefined;
  const resolvedAdminStoreId = isAdminPath
    ? (storeId ?? adminStoreIdFromPath)
    : undefined;

  const planogramNameById = useMemo(
    () => new Map(planogramList.map((p) => [p.id, p.name])),
    [planogramList],
  );

  const planogramOptions = useMemo(
    () => planogramList.map((p) => ({ id: p.id, name: p.name })),
    [planogramList],
  );

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
      const targetFixtureId =
        selectedFixtureForShelfForm || pendingFixtureForShelf;
      if (!targetFixtureId) {
        toast({
          title: "Select a fixture first",
          description: "Please select a fixture in the add shelf form.",
          variant: "warning",
        });
        return;
      }

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
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
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

  const handleCreateFixture = async (values: StoreFixtureModalValues) => {
    if (!canEdit || !selectedStoreId) return;

    const type = values.type.trim();
    const code = values.code.trim();

    if (!type || !code) {
      toast({
        title: !type ? "Missing fixture type" : "Missing fixture code",
        description: !type ? "Fixture type is required." : "Fixture code is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingFixture) {
        await updateFixtureMutation.mutateAsync({
          storeId: selectedStoreId,
          fixtureId: editingFixture.id,
          payload: {
            type,
            code,
            dimensions: {
              width: Number(values.width) || editingFixture.dimensions.width,
              height: Number(values.height) || editingFixture.dimensions.height,
              depth: Number(values.depth) || editingFixture.dimensions.depth,
            },
            dimension_unit: values.dimensionUnit || defaultDimensionUnit,
            physical_location: {
              section:
                values.section.trim() || editingFixture.physical_location.section,
              aisle:
                values.aisle.trim() || editingFixture.physical_location.aisle,
              zone: values.zone.trim() || editingFixture.physical_location.zone,
            },
          },
        });

        if (values.planogramId !== undefined) {
          const nextPlanogramId = values.planogramId?.trim() || null;
          const currentPlanogramId = editingFixture.planogram_id ?? null;
          if (nextPlanogramId !== currentPlanogramId) {
            if (nextPlanogramId) {
              await assignPlanogramMutation.mutateAsync({
                storeId: selectedStoreId,
                fixtureId: editingFixture.id,
                planogramId: nextPlanogramId,
              });
            } else {
              await clearPlanogramMutation.mutateAsync({
                storeId: selectedStoreId,
                fixtureId: editingFixture.id,
              });
            }
          }
        }
      } else {
        await createFixtureMutation.mutateAsync({
          type,
          code,
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
      setDefaultDimensionUnit(
        (selectedStore?.default_dimensions as StoreDimensionUnit) || "mm",
      );
      toast({
        title: editingFixture ? "Fixture updated" : "Fixture added",
        description: editingFixture
          ? "Fixture has been updated for this store."
          : "Fixture has been added to this store.",
      });
    } catch (error) {
      toast({
        title: editingFixture
          ? "Failed to update fixture"
          : "Failed to add fixture",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFixture = async (fixture: StoreFixtureApiModel) => {
    if (!canEdit || !selectedStoreId) return;

    try {
      await deleteFixtureMutation.mutateAsync({
        storeId: selectedStoreId,
        fixtureId: fixture.id,
      });
      toast({
        title: "Fixture deleted",
        description: "Fixture has been removed from this store.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete fixture",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
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

  const handleAssociateFixturePlanogram = useCallback(
    (row: PlanogramShelfRow) => {
      const fixtureId = row.fixtureId;
      if (!fixtureId) return;
      setFixtureIdForPlanogramAssociation(fixtureId);
      setPendingPlanogramId(effectivePlanogramByFixtureId.get(fixtureId) ?? "");
      setPlanogramAssociationModalOpen(true);
      setActionsMenu(null);
    },
    [effectivePlanogramByFixtureId],
  );

  const openFixtureDetail = useCallback(
    (targetShelfId: string, options?: { fixtureId?: string }) => {
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
        state: {
          from: location.pathname,
          fixtureId: options?.fixtureId,
        } as never,
      });
    },
    [isAdminPath, location.pathname, navigate, resolvedAdminStoreId, toast],
  );

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

  const handleEditFixture = useCallback(
    (row: PlanogramShelfRow) => {
      const fixtureId = row.fixtureId;
      if (!fixtureId) return;
      const targetFixture = fixtures.find(
        (fixture) => fixture.id === fixtureId,
      );
      if (!targetFixture) return;
      setDefaultDimensionUnit(
        (targetFixture.dimension_unit ?? "mm") as StoreDimensionUnit,
      );
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
      const targetFixture = fixtures.find(
        (fixture) => fixture.id === fixtureId,
      );
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
        await assignPlanogramMutation.mutateAsync({
          storeId: selectedStoreId,
          fixtureId: fixtureIdForPlanogramAssociation,
          planogramId: pendingPlanogramId,
        });
      } else {
        await clearPlanogramMutation.mutateAsync({
          storeId: selectedStoreId,
          fixtureId: fixtureIdForPlanogramAssociation,
        });
      }
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
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [
    fixtureIdForPlanogramAssociation,
    pendingPlanogramId,
    selectedStoreId,
    assignPlanogramMutation,
    clearPlanogramMutation,
    toast,
  ]);

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
    (row: PlanogramShelfRow) => {
      const fixtureId = row.fixtureId;
      if (!fixtureId) {
        toast({
          title: "Fixture missing",
          description: "Cannot start adhoc analysis without fixture context.",
          variant: "warning",
        });
        setActionsMenu(null);
        return;
      }
      const adhocPath =
        isAdminPath && resolvedAdminStoreId
          ? `/admin/${resolvedAdminStoreId}/audits/adhoc/new`
          : location.pathname.startsWith("/maker/")
            ? "/maker/audits/adhoc/new"
            : "/checker/audits/adhoc/new";
      navigate({
        to: adhocPath as never,
        search: { fixtureId, from: location.pathname } as never,
      });
      setActionsMenu(null);
    },
    [isAdminPath, location.pathname, navigate, resolvedAdminStoreId, toast],
  );

  const effectiveRowIdToFixtureId = useMemo(() => {
    const map = new Map<string, string>(rowIdToFixtureId);
    fixtureById.forEach((_fixture, fixtureId) => {
      map.set(`fixture-${fixtureId}`, fixtureId);
    });
    return map;
  }, [fixtureById, rowIdToFixtureId]);

  const fixtureRows: PlanogramShelfRow[] = useMemo(
    () =>
      Array.from(fixtureById.values()).map((fixture) => {
        const fixtureShelves = shelvesByFixtureId.get(fixture.id) ?? [];
        const planogramId =
          effectivePlanogramByFixtureId.get(fixture.id) ?? undefined;
        const planogramName = planogramId
          ? (fixture.current_planogram_assignment?.planogram_name ??
            planogramNameById.get(planogramId) ??
            "—")
          : "—";
        return {
          id: `fixture-${fixture.id}`,
          fixtureId: fixture.id,
          shelfName: fixture.type,
          shelfCode: fixture.code.trim() || "—",
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
          planogramName,
          description: planogramName,
          dimensionUnit: fixture.dimension_unit,
          complianceRuleSet:
            fixtureComplianceOverrides[fixture.id] ?? defaultRuleSetName,
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

  const editingFixturePlanogramId = useMemo(() => {
    return editingFixture
      ? (effectivePlanogramByFixtureId.get(editingFixture.id) ??
        editingFixture.planogram_id ??
        null)
      : null;
  }, [editingFixture, effectivePlanogramByFixtureId]);

  return {
    state: {
      selectedStore,
      searchQuery,
      fixtureModalOpen,
      isCreatingFixture: createFixtureMutation.isPending || updateFixtureMutation.isPending,
      editingFixture,
      editingFixturePlanogramId,
      fixtureToDelete,
      isDeletingFixture: deleteFixtureMutation.isPending,
      defaultDimensionUnit,
      isAddShelfModeModalOpen,
      isAddShelfModalOpen,
      isCreatingShelf: createShelfMutation.isPending,
      pendingFixtureForShelf,
      selectedFixtureForShelfForm,
      pendingTemplateId,
      tablePagination,
      actionsMenu,
      planogramAssociationModalOpen,
      pendingPlanogramId,
      isBulkAddModalOpen,
      complianceSheetOpen,
      complianceSheetRuleSet,
      complianceSheetRuleSetName,
      planogramOptions,
      shelfTemplates,
      shelfTemplatesLoading,
      fixtures,
      fixtureRows,
    },
    refs: {
      tableWrapperRef,
      actionsMenuRef,
    },
    computed: {
      effectiveRowIdToFixtureId,
      fixtureById,
      shelvesByFixtureId,
      effectivePlanogramByFixtureId,
      defaultRuleSetName,
      fixtureComplianceOverrides,
      fixtureCategorizeOverrides,
      planogramNameById,
    },
    actions: {
      setSearchQuery,
      setTablePagination,
      setFixtureModalOpen,
      setEditingFixture,
      setFixtureToDelete,
      setDefaultDimensionUnit,
      setIsAddShelfModeModalOpen,
      setIsAddShelfModalOpen,
      setSelectedFixtureForShelfForm,
      setActionsMenu,
      setPlanogramAssociationModalOpen,
      setPendingPlanogramId,
      setIsBulkAddModalOpen,
      setComplianceSheetOpen,
      setFixtureComplianceOverrides,
      setFixtureCategorizeOverrides,
      openAddShelfModal,
      handleContinueAddShelf,
      handleCreateShelfFromModal,
      handleCreateFixture,
      handleDeleteFixture,
      handleOpenFixtureActions,
      handleAddShelfForFixture,
      handleAssociateFixturePlanogram,
      openFixtureDetail,
      openFixtureDetailFromRow,
      handleEditFixture,
      handleDeleteFixtureFromRow,
      handleSavePlanogramAssociation,
      handleViewFixtureComplianceRule,
      handleRunFixtureAdhocAnalysis,
      handleSubmitBulkShelves,
    },
  };
}
