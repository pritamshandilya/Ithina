import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AddShelfFormModal } from "./add-shelf-form-modal";
import { StoreFixtureDetailComplianceTab } from "./store-fixture-detail-compliance-tab";
import { StoreFixtureDetailFixtureTabCard } from "./store-fixture-detail-fixture-tab-card";
import type { FixtureFormDraft } from "./store-fixture-detail-fixture-tab-card";
import { StoreFixtureDetailPlanogramTab } from "./store-fixture-detail-planogram-tab";
import { StoreFixtureDetailShelvesTab } from "./store-fixture-detail-shelves-tab";
import { usePersistedFixturePlanogramOverrides } from "./use-persisted-fixture-planogram-overrides";
import { useStoreFixtureDetailPlanogramEditor } from "./use-store-fixture-detail-planogram-editor";
import MainLayout from "@/components/layouts/main";
import { SectionPillTabs } from "@/components/shared";
import { DetailBackButton } from "@/components/shared/detail-back-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { getFixtureComplianceAssociationsStorageKey } from "@/lib/fixtures/fixture-compliance-storage";
import { useStore as useGlobalStore } from "@/providers/store";
import { useShelfTemplates } from "@/queries/checker";
import {
  assignPlanogramToFixture,
  clearPlanogramFromFixture,
  fetchStoreFixtures,
  updateStoreFixture,
} from "@/queries/checker/api/fixtures";
import {
  useComplianceRuleSets,
  useCreateShelf,
  usePlanogramById,
  usePlanogramList,
  usePlanogramShelfPreview,
  useShelves,
  useUpdateShelf,
} from "@/queries/maker";

export interface StoreFixtureDetailPageProps {
  shelfId: string;
  storeId?: string;
  isAdminPath?: boolean;
  fallbackPath: string;
}

type DetailTabId = "fixture" | "shelf" | "planogram" | "compliance";

const DETAIL_TABS: { id: DetailTabId; label: string }[] = [
  { id: "fixture", label: "Display Unit Details" },
  { id: "shelf", label: "Shelves" },
  { id: "planogram", label: "Planogram Association" },
  { id: "compliance", label: "Compliance Rule Set" },
];

export function StoreFixtureDetailPage({
  shelfId,
  storeId,
  isAdminPath: _isAdminPath = false,
  fallbackPath,
}: StoreFixtureDetailPageProps) {
  const { toast } = useToast();
  const { selectedStore } = useGlobalStore();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeState =
    (location.state as { from?: string; fixtureId?: string } | undefined) ?? {};
  const from = routeState.from;

  const effectiveStoreId = storeId ?? selectedStore?.id;
  const { data: preview, isLoading } = usePlanogramShelfPreview(shelfId);
  const selectedFixtureId = preview?.shelf?.fixtureId ?? routeState.fixtureId;
  const { data: shelfRows = [] } = useShelves(selectedFixtureId);
  const { data: planogramList = [] } = usePlanogramList();
  const { data: ruleSets = [] } = useComplianceRuleSets();
  const { data: fixtures = [] } = useQuery({
    queryKey: ["maker", "fixtures", "list", effectiveStoreId ?? "no-store"],
    queryFn: fetchStoreFixtures,
    staleTime: 60 * 1000,
  });
  const updateShelfMutation = useUpdateShelf();
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } =
    useShelfTemplates();
  const createShelfMutation = useCreateShelf();

  const fixture = useMemo(
    () => fixtures.find((item) => item.id === selectedFixtureId) ?? null,
    [fixtures, selectedFixtureId],
  );

  const [activeTab, setActiveTab] = useState<DetailTabId>("fixture");
  const [isFixtureEditing, setIsFixtureEditing] = useState(false);
  const [isFixtureSaving, setIsFixtureSaving] = useState(false);
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [fixtureComplianceOverrides, setFixtureComplianceOverrides] = useState<
    Record<string, string | null>
  >({});
  const [fixtureDraft, setFixtureDraft] = useState<FixtureFormDraft>({
    type: "",
    code: "",
    width: "",
    height: "",
    depth: "",
    dimensionUnit: "mm",
    aisle: "",
    section: "",
    zone: "",
    planogramId: "",
    complianceRuleSetId: "",
  });
  const fixtureComplianceStorageKey =
    getFixtureComplianceAssociationsStorageKey(effectiveStoreId);

  usePersistedFixturePlanogramOverrides({
    storageKey: fixtureComplianceStorageKey,
    overrides: fixtureComplianceOverrides,
    setOverrides: setFixtureComplianceOverrides,
  });

  const effectiveFixturePlanogramId = fixture
    ? (fixture.planogram_id ?? "")
    : "";
  const { data: associatedPlanogramPayload } = usePlanogramById(
    preview?.planogramPayload ? null : effectiveFixturePlanogramId || null,
  );
  const resolvedPlanogramPayload =
    preview?.planogramPayload ?? associatedPlanogramPayload ?? null;

  const planogramEditor = useStoreFixtureDetailPlanogramEditor({
    shelfId,
    preview: preview ?? undefined,
    resolvedPlanogramPayload,
  });

  useEffect(() => {
    if (!fixture) return;
    setFixtureDraft({
      type: fixture.type,
      code: fixture.code ?? "",
      width: String(fixture.dimensions.width),
      height: String(fixture.dimensions.height),
      depth: String(fixture.dimensions.depth),
      dimensionUnit: fixture.dimension_unit || "mm",
      aisle: fixture.physical_location.aisle,
      section: fixture.physical_location.section,
      zone: fixture.physical_location.zone,
      planogramId: fixture.planogram_id ?? "",
      complianceRuleSetId:
        fixtureComplianceOverrides[fixture.id] ??
        fixture.compliance_rule_set_id ??
        selectedStore?.default_compliance_rule_set_id ??
        "",
    });
  }, [
    fixture,
    fixtureComplianceOverrides,
    selectedStore?.default_compliance_rule_set_id,
  ]);

  const planogramOptions = planogramList.map((item) => ({
    id: item.id,
    name: item.name,
  }));
  const isMissingPlanogram = !!preview && !resolvedPlanogramPayload;

  const handleBack = () => {
    navigate({ to: from ?? fallbackPath, replace: true });
  };

  const handleSaveFixture = useCallback(async () => {
    if (!fixture || !effectiveStoreId) return;
    const width = Number(fixtureDraft.width);
    const height = Number(fixtureDraft.height);
    const depth = Number(fixtureDraft.depth);
    if (
      !fixtureDraft.code.trim() ||
      !fixtureDraft.type.trim() ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      !Number.isFinite(depth)
    ) {
      toast({
        title: "Invalid fixture details",
        description: "Fixture code, type, and valid dimensions are required.",
        variant: "destructive",
      });
      return;
    }
    setIsFixtureSaving(true);
    try {
      await updateStoreFixture(effectiveStoreId, fixture.id, {
        type: fixtureDraft.type.trim(),
        code: fixtureDraft.code.trim(),
        dimensions: { width, height, depth },
        dimension_unit: fixtureDraft.dimensionUnit,
        physical_location: {
          aisle: fixtureDraft.aisle.trim(),
          section: fixtureDraft.section.trim(),
          zone: fixtureDraft.zone.trim(),
        },
      });
      await queryClient.invalidateQueries({
        queryKey: ["maker", "fixtures", "list"],
      });
      setIsFixtureEditing(false);
      toast({
        title: "Fixture updated",
        description: "Fixture details were saved.",
        variant: "success",
      });
    } catch (saveError) {
      toast({
        title: "Failed to save fixture",
        description:
          saveError instanceof Error ? saveError.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFixtureSaving(false);
    }
  }, [effectiveStoreId, fixture, fixtureDraft, queryClient, toast]);

  const handleSavePlanogramAssociation = useCallback(async () => {
    if (!fixture || !effectiveStoreId) return;
    try {
      if (fixtureDraft.planogramId) {
        await assignPlanogramToFixture(
          effectiveStoreId,
          fixture.id,
          fixtureDraft.planogramId,
        );
      } else {
        await clearPlanogramFromFixture(effectiveStoreId, fixture.id);
      }
      await queryClient.invalidateQueries({
        queryKey: ["maker", "fixtures", "list"],
      });
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
  }, [effectiveStoreId, fixture, fixtureDraft.planogramId, queryClient, toast]);

  const handleSaveComplianceAssociation = useCallback(async () => {
    if (!fixture || !effectiveStoreId) return;
    try {
      await updateStoreFixture(effectiveStoreId, fixture.id, {
        compliance_rule_set_id: fixtureDraft.complianceRuleSetId || null,
      });
      await queryClient.invalidateQueries({
        queryKey: ["maker", "fixtures", "list"],
      });
      setFixtureComplianceOverrides((previous) => ({
        ...previous,
        [fixture.id]: fixtureDraft.complianceRuleSetId || null,
      }));
      toast({
        title: "Compliance rule set saved",
        description: "Fixture compliance override was updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to save compliance rule set",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [
    effectiveStoreId,
    fixture,
    fixtureDraft.complianceRuleSetId,
    queryClient,
    toast,
  ]);

  const handleInlineShelfUpdate = useCallback(
    async (
      targetShelfId: string,
      updates: Partial<{
        name: string;
        code: string;
        width: number;
        height: number;
        vertical_position: number;
      }>,
    ) => {
      await updateShelfMutation.mutateAsync({
        shelfId: targetShelfId,
        payload: updates,
      });
      await queryClient.invalidateQueries({ queryKey: ["maker", "shelves"] });
    },
    [queryClient, updateShelfMutation],
  );

  const handleCreateShelf = useCallback(
    async (values: {
      name: string;
      code?: string;
      width: number;
      height: number;
      vertical_position: number;
    }) => {
      if (!selectedFixtureId) {
        toast({
          title: "Fixture missing",
          description: "Cannot add shelf without a fixture context.",
          variant: "destructive",
        });
        return;
      }
      setIsCreatingShelf(true);
      const generatedCode = `SH-${Date.now().toString().slice(-6)}`;
      try {
        await createShelfMutation.mutateAsync({
          ...values,
          code: values.code?.trim() || generatedCode,
          fixture_id: selectedFixtureId,
        });
        await queryClient.invalidateQueries({ queryKey: ["maker", "shelves"] });
        setIsAddShelfModalOpen(false);
        toast({
          title: "Shelf created",
          description: "New shelf has been added to this fixture.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Failed to create shelf",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingShelf(false);
      }
    },
    [createShelfMutation, queryClient, selectedFixtureId, toast],
  );

  return (
    <MainLayout>
      <div className="bg-primary min-h-screen px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <header className="flex flex-wrap items-center gap-4">
            <DetailBackButton onClick={handleBack} />
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <>
                  <h1 className="text-foreground truncate text-2xl font-bold">
                    {fixture
                      ? `${fixture.code.trim()} (${(preview?.shelf.shelfName?.trim() || fixture.type).trim()})`
                      : (preview?.shelf.shelfName ?? "Fixture details")}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {fixture
                      ? `${fixture.code.trim()} (${fixture.type.trim()})`
                      : "Fixture"}{" "}
                    · v{resolvedPlanogramPayload?.version ?? "—"} ·{" "}
                    {resolvedPlanogramPayload?.description ?? "—"}
                  </p>
                </>
              )}
            </div>
            {activeTab === "planogram" &&
              planogramEditor.hasChanges &&
              !planogramEditor.isMissingPlanogram && (
                <Button
                  onClick={planogramEditor.handleSaveArrangement}
                  disabled={planogramEditor.isSavingArrangement}
                  variant="success"
                >
                  <Check className="size-4" aria-hidden />
                  {planogramEditor.isSavingArrangement
                    ? "Saving..."
                    : "Save Planogram"}
                </Button>
              )}
          </header>

          <SectionPillTabs
            tabs={DETAIL_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            ariaLabel="Fixture detail sections"
          />

          {activeTab === "fixture" && (
            <StoreFixtureDetailFixtureTabCard
              fixtureDraft={fixtureDraft}
              setFixtureDraft={setFixtureDraft}
              isFixtureEditing={isFixtureEditing}
              setIsFixtureEditing={setIsFixtureEditing}
              isFixtureSaving={isFixtureSaving}
              onSaveFixture={handleSaveFixture}
            />
          )}

          {activeTab === "shelf" && !isLoading && (
            <StoreFixtureDetailShelvesTab
              onOpenAddShelf={() => setIsAddShelfModalOpen(true)}
              onInlineShelfUpdate={handleInlineShelfUpdate}
              shelfRows={shelfRows}
              fixtureId={selectedFixtureId}
            />
          )}

          {activeTab === "planogram" && !isLoading && (
            <StoreFixtureDetailPlanogramTab
              isMissingPlanogram={isMissingPlanogram}
              effectivePayload={planogramEditor.effectivePayload}
              planogramFixture={planogramEditor.planogramFixture}
              stats={planogramEditor.stats}
              shelvesToShow={planogramEditor.shelvesToShow}
              baseShelves={planogramEditor.baseShelves}
              removedItems={planogramEditor.removedItems}
              selectedCategories={planogramEditor.selectedCategories}
              onToggleCategory={planogramEditor.onToggleCategory}
              editHandlers={planogramEditor.editHandlers}
              onRestoreProduct={planogramEditor.onRestoreProduct}
              onRemoveProduct={planogramEditor.editHandlers.onRemoveProduct}
              onMoveProduct={planogramEditor.editHandlers.onMoveProduct}
              dragRef={planogramEditor.dragRef}
              planogramOptions={planogramOptions}
              planogramId={fixtureDraft.planogramId}
              onPlanogramIdChange={(value) =>
                setFixtureDraft((prev) => ({ ...prev, planogramId: value }))
              }
              onSaveAssociation={handleSavePlanogramAssociation}
              effectiveFixturePlanogramId={effectiveFixturePlanogramId}
            />
          )}

          {activeTab === "compliance" && !isLoading && (
            <StoreFixtureDetailComplianceTab
              ruleSets={ruleSets}
              selectedRuleSetId={fixtureDraft.complianceRuleSetId}
              onRuleSetChange={(value) =>
                setFixtureDraft((prev) => ({
                  ...prev,
                  complianceRuleSetId: value,
                }))
              }
              onSaveRuleSet={handleSaveComplianceAssociation}
            />
          )}
        </div>
      </div>
      <AddShelfFormModal
        isOpen={isAddShelfModalOpen}
        onClose={() => setIsAddShelfModalOpen(false)}
        onSubmit={handleCreateShelf}
        isSaving={isCreatingShelf}
        shelfTemplates={shelfTemplates}
        shelfTemplatesLoading={shelfTemplatesLoading}
        defaultDimensionUnit={
          (fixture?.dimension_unit ?? "mm") as StoreDimensionUnit
        }
        fixtureOptions={
          selectedFixtureId && fixture
            ? [
                {
                  id: selectedFixtureId,
                  label: `${fixture.code.trim()} (${fixture.type.trim()})`,
                },
              ]
            : []
        }
        selectedFixtureId={selectedFixtureId ?? ""}
        disableFixtureSelect
      />
    </MainLayout>
  );
}
