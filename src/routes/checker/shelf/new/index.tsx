import { createFileRoute, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { z } from "zod";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MainLayout from "@/components/layouts/main";
import {
  useAssignPlanogramToShelf,
  useCreateFixture,
  useCreateShelf,
  usePlanogramById,
  usePlanogramList,
  useShelves,
  useStoreFixtures,
} from "@/queries/maker";
import { useShelfTemplates, useStoreFixtureTypes } from "@/queries/checker";
import type { PlanogramArrangement } from "@/types/planogram";
import type { ShelfTemplate } from "@/types/shelf-template";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { useDimensionUnits } from "@/queries/checker";
import { AddPlanogramHeader } from "./-add-planogram-header";
import { AddShelfDetailsCard } from "./-add-shelf-details-card";
import { PlanogramPreviewCard } from "./-planogram-preview-card";

export const Route = createFileRoute("/checker/shelf/new/")({
  component: AddPlanogramPage,
  validateSearch: (search: unknown) =>
    z
      .object({
        associateShelfId: z.string().optional(),
        associateShelfName: z.string().optional(),
        templateId: z.string().optional(),
        addMode: z.enum(["manual", "template"]).optional(),
      })
      .parse(search),
});

const fixtureTypeDedupeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

type AddPlanogramPageSearch = {
  associateShelfId?: string;
  associateShelfName?: string;
  templateId?: string;
  addMode?: "manual" | "template";
};

type AddPlanogramPageProps = {
  searchOverride?: AddPlanogramPageSearch;
};

export function AddPlanogramPage({ searchOverride }: AddPlanogramPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const currentSearch = (location.search ?? {}) as AddPlanogramPageSearch;
  const { associateShelfId, associateShelfName, templateId, addMode } =
    searchOverride ?? currentSearch;
  const isManualEntryMode = addMode === "manual";
  const isAdmin = location.pathname.includes("/admin/");
  const storeId = params.storeId as string | undefined;
  const shelfListPath =
    isAdmin && storeId ? `/admin/${storeId}/shelf` : "/checker/shelf";
  const { toast } = useToast();
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves } = useShelves();
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } =
    useShelfTemplates();
  const { data: extraFixtureLabels = [] } = useStoreFixtureTypes();
  const { data: storeFixtures = [], isLoading: fixturesLoading } =
    useStoreFixtures();
  const createFixtureMutation = useCreateFixture();
  const createShelfMutation = useCreateShelf();
  const assignPlanogramMutation = useAssignPlanogramToShelf();
  const isAssociateMode = !!associateShelfId;

  const { selectedStore } = useStore();

  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string>("");
  const [shelfName, setShelfName] = useState("");
  const [aisleCode, setAisleCode] = useState<string>("");
  const [bayCode, setBayCode] = useState<string>("");
  const [zone, setZone] = useState("");
  const [section, setSection] = useState("");
  const [fixtureType, setFixtureType] = useState("");
  const [dimWidth, setDimWidth] = useState("");
  const [dimHeight, setDimHeight] = useState("");
  const [dimDepth, setDimDepth] = useState("");
  const [verticalPosition, setVerticalPosition] = useState("0");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const lastSearchTemplateAppliedId = useRef<string | undefined>(undefined);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: dimensionUnits = [] } = useDimensionUnits();

  const selectedTemplate = useMemo<ShelfTemplate | null>(() => {
    if (!selectedTemplateId) return null;
    return shelfTemplates.find((t) => t.id === selectedTemplateId) ?? null;
  }, [shelfTemplates, selectedTemplateId]);

  const defaultDimensionUnit = useMemo<StoreDimensionUnit>(() => {
    const raw = selectedStore?.default_dimensions;
    if (!raw) return "mm";
    const value = raw.toLowerCase();
    const match = dimensionUnits.find(
      (unit) =>
        value === unit.toLowerCase() ||
        value.endsWith(` ${unit.toLowerCase()}`),
    ) as StoreDimensionUnit | undefined;
    return match ?? "mm";
  }, [selectedStore, dimensionUnits]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setFixtureType(selectedTemplate.fixtureType);
    setDimWidth(String(selectedTemplate.width));
    setDimHeight(String(selectedTemplate.height));
    if (selectedTemplate.zone) setZone(selectedTemplate.zone);
    if (selectedTemplate.section) setSection(selectedTemplate.section);
  }, [selectedTemplate]);

  const fixtureTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    const deduped: { value: string; label: string }[] = [];

    for (const label of extraFixtureLabels) {
      const trimmed = label.trim();
      const key = fixtureTypeDedupeKey(trimmed);
      if (!trimmed || !key || seen.has(key)) continue;
      seen.add(key);
      deduped.push({ value: trimmed, label: trimmed });
    }

    return deduped;
  }, [extraFixtureLabels]);

  const fixtureDepthByType = useMemo(() => {
    const map = new Map<string, string>();
    for (const fixture of storeFixtures) {
      const key = fixtureTypeDedupeKey(fixture.type);
      if (!key || map.has(key)) continue;
      map.set(key, String(fixture.dimensions.depth));
    }
    return map;
  }, [storeFixtures]);

  const resolveDepthForFixtureType = useCallback(
    (nextFixtureType: string): string | undefined =>
      fixtureDepthByType.get(fixtureTypeDedupeKey(nextFixtureType)),
    [fixtureDepthByType],
  );

  const applyShelfTemplate = useCallback(
    (tpl: ShelfTemplate, options?: { prefillShelfName?: boolean }) => {
      const prefillShelfName = options?.prefillShelfName ?? true;
    setFixtureType(tpl.fixtureType);
    setZone(tpl.zone ?? "");
    setSection(tpl.section ?? "");
    setDimWidth(String(tpl.width));
    setDimHeight(String(tpl.height));
      if (prefillShelfName) {
        setShelfName((prev) => (prev.trim() ? prev : tpl.name));
      }
    },
    []
  );

  // Depth comes from the store fixtures API (derived by fixture type + unit).
  useEffect(() => {
    if (!fixtureType) return;
    const depthFromFixture = resolveDepthForFixtureType(fixtureType);
    setDimDepth(depthFromFixture ? String(depthFromFixture) : "");
  }, [fixtureType, resolveDepthForFixtureType]);

  useEffect(() => {
    if (isAssociateMode || !templateId) {
      return;
    }
    if (lastSearchTemplateAppliedId.current === templateId) {
      return;
    }
    const match = shelfTemplates.find((t) => t.id === templateId);
    if (match) {
      applyShelfTemplate(match, { prefillShelfName: false });
      setSelectedTemplateId(match.id);
      lastSearchTemplateAppliedId.current = templateId;
    }
  }, [isAssociateMode, templateId, shelfTemplates, applyShelfTemplate]);

  useEffect(() => {
    if (isAssociateMode && associateShelfName) {
      setShelfName(associateShelfName);
    }
  }, [isAssociateMode, associateShelfName]);

  const { data: planogramPayload, isLoading: planogramLoading } =
    usePlanogramById(
      selectedPlanogramId ? selectedPlanogramId : null
    );

  const duplicateNameError = useMemo(() => {
    if (!shelfName.trim() || isSaving) return null;
    const excludeId = isAssociateMode ? associateShelfId : undefined;
    const exists = (shelves ?? []).some(
      (s) => s.id !== excludeId && s.shelfName.toLowerCase() === shelfName.trim().toLowerCase()
    );
    return exists ? `A shelf named "${shelfName.trim()}" already exists` : null;
  }, [shelves, shelfName, isSaving, isAssociateMode, associateShelfId]);

  const canSave = useMemo(() => {
    if (isAssociateMode) {
      return !!selectedPlanogramId && !isSaving;
    }
    return (
      !!shelfName.trim() &&
      !duplicateNameError &&
      !isSaving &&
      aisleCode.trim() !== "" &&
      bayCode.trim() !== "" &&
      dimDepth.trim() !== ""
    );
  }, [
    selectedPlanogramId,
    shelfName,
    duplicateNameError,
    isSaving,
    isAssociateMode,
    aisleCode,
    bayCode,
    dimDepth,
  ]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      if (isAssociateMode && associateShelfId && selectedPlanogramId) {
        const arrangement: PlanogramArrangement = {
          planogramId: selectedPlanogramId,
          shelfOrder:
            planogramPayload?.planogram.fixture.shelves.map((s) => ({
              shelfId: `shelf-${s.shelfNumber}`,
              productIds: s.products.map((p) => p.sku),
            })) ?? [],
        };
        await assignPlanogramMutation.mutateAsync({
          shelfId: associateShelfId,
          planogramId: selectedPlanogramId,
          arrangement,
        });
        toast({ title: "Planogram associated", description: "The planogram has been associated with the shelf." });
        navigate({ to: shelfListPath as never });
      } else if (!isAssociateMode) {
        const fixtureTypeValue = fixtureType.trim() || "gondola";
        const fixtureWidth = Number(dimWidth) || 1;
        const fixtureHeight = Number(dimHeight) || 1;
        const fixtureDepth = Number(dimDepth);
        const verticalPositionValue = Number(verticalPosition || "0");
        if (!Number.isFinite(fixtureDepth) || fixtureDepth <= 0) {
          setSaveError("Shelf depth is missing for the selected fixture type.");
          return;
        }
        if (!Number.isFinite(verticalPositionValue)) {
          setSaveError("Vertical position must be a valid number.");
          return;
        }
        const aisleValue = aisleCode.trim();
        const bayValue = bayCode.trim();
        const zoneValue = zone.trim() || "General";
        const sectionValue = section.trim() || "General";

        const normalize = (v: string) => v.trim().toLowerCase();
        // Backend stores floats; use tolerance to avoid spurious mismatches.
        const floatEq = (a: number, b: number) => Math.abs(a - b) < 1e-6;

        const matchedFixture = !fixturesLoading
          ? storeFixtures.find((f) => {
              return (
                normalize(f.type) === normalize(fixtureTypeValue) &&
                normalize(f.dimension_unit) === normalize(defaultDimensionUnit) &&
                normalize(f.physical_location.section) === normalize(sectionValue) &&
                normalize(f.physical_location.aisle) === normalize(aisleValue) &&
                normalize(f.physical_location.zone) === normalize(zoneValue) &&
                floatEq(f.dimensions.width, fixtureWidth) &&
                floatEq(f.dimensions.height, fixtureHeight) &&
                floatEq(f.dimensions.depth, fixtureDepth)
              );
            })
          : undefined;

        const fixtureId = matchedFixture
          ? matchedFixture.id
          : (
              await createFixtureMutation.mutateAsync({
                type: fixtureTypeValue,
                dimensions: {
                  width: fixtureWidth,
                  height: fixtureHeight,
                  depth: fixtureDepth,
                },
                dimension_unit: defaultDimensionUnit,
                physical_location: {
                  aisle: aisleValue,
                  zone: zoneValue,
                  section: sectionValue,
                },
              })
            ).id;

        await createShelfMutation.mutateAsync({
          code: `S${aisleValue}-${bayValue}`, // Unique business ID (string codes)
          name: shelfName.trim(),
          fixture_id: fixtureId,
          width: fixtureWidth,
          height: fixtureHeight,
          vertical_position: verticalPositionValue,
        });
        toast({
          title: "Shelf created",
          description: "Your shelf has been created successfully.",
          variant: "success",
        });
        navigate({ to: shelfListPath as never });
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    isAssociateMode,
    associateShelfId,
    selectedPlanogramId,
    shelfName,
    aisleCode,
    bayCode,
    zone,
    section,
    fixtureType,
    dimWidth,
    dimHeight,
    dimDepth,
    verticalPosition,
    defaultDimensionUnit,
    shelfListPath,
    planogramPayload,
    storeFixtures,
    fixturesLoading,
    createFixtureMutation,
    createShelfMutation,
    assignPlanogramMutation,
    navigate,
    toast,
  ]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <AddPlanogramHeader
            shelfListPath={shelfListPath}
            isAssociateMode={isAssociateMode}
          />

          <div className={cn("grid gap-4", isAssociateMode ? "lg:grid-cols-2" : "w-full")}>
            <div className="space-y-4">
              <AddShelfDetailsCard
                isAssociateMode={isAssociateMode}
                isManualEntryMode={isManualEntryMode}
                listLoading={listLoading}
                selectedPlanogramId={selectedPlanogramId}
                setSelectedPlanogramId={setSelectedPlanogramId}
                planogramList={planogramList ?? []}
                shelfName={shelfName}
                setShelfName={setShelfName}
                duplicateNameError={duplicateNameError}
                shelfTemplatesLoading={shelfTemplatesLoading}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
                shelfTemplates={shelfTemplates}
                applyShelfTemplate={applyShelfTemplate}
                aisleCode={aisleCode}
                setAisleCode={setAisleCode}
                bayCode={bayCode}
                setBayCode={setBayCode}
                zone={zone}
                setZone={setZone}
                section={section}
                setSection={setSection}
                fixtureType={fixtureType}
                setFixtureType={setFixtureType}
                fixtureTypeOptions={fixtureTypeOptions}
                resolveDepthForFixtureType={resolveDepthForFixtureType}
                defaultDimensionUnit={defaultDimensionUnit}
                dimWidth={dimWidth}
                setDimWidth={setDimWidth}
                dimHeight={dimHeight}
                setDimHeight={setDimHeight}
                setDimDepth={setDimDepth}
                verticalPosition={verticalPosition}
                setVerticalPosition={setVerticalPosition}
                saveError={saveError}
                canSave={canSave}
                isSaving={isSaving}
                onSave={() => {
                  void handleSave();
                }}
              />
            </div>

            {isAssociateMode && (
              <PlanogramPreviewCard
                selectedPlanogramId={selectedPlanogramId}
                isLoading={planogramLoading}
                data={planogramPayload ?? undefined}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
