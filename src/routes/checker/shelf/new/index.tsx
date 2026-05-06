import {
  createFileRoute,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { AddPlanogramHeader } from "./-add-planogram-header";
import { AddShelfDetailsCard } from "./-add-shelf-details-card";
import { PlanogramPreviewCard } from "./-planogram-preview-card";
import MainLayout from "@/components/layouts/main";
import { useToast } from "@/hooks/useToast";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { fixtureTypeKey } from "@/lib/fixtures/typeNormalization";
import { getPlanogramProductId } from "@/lib/planogram/planogramSchema";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import {
  useDimensionUnits,
  useShelfTemplates,
  useStoreFixtureTypes,
} from "@/queries/checker";
import {
  useAssignPlanogramToShelf,
  useCreateShelf,
  usePlanogramById,
  usePlanogramList,
  useShelves,
  useStoreFixtures,
} from "@/queries/maker";
import type { PlanogramArrangement } from "@/types/planogram";
import type { ShelfTemplate } from "@/types/shelfTemplate";

export const Route = createFileRoute("/checker/shelf/new/")({
  component: AddPlanogramPage,
  validateSearch: (search: unknown) =>
    z
      .object({
        associateShelfId: z.string().optional(),
        associateShelfName: z.string().optional(),
        fixtureId: z.string().optional(),
        templateId: z.string().optional(),
        addMode: z.enum(["manual", "template"]).optional(),
      })
      .parse(search),
});

const fixtureTypeDedupeKey = (value: string) => fixtureTypeKey(value);

type AddPlanogramPageSearch = {
  associateShelfId?: string;
  associateShelfName?: string;
  fixtureId?: string;
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
  const {
    associateShelfId,
    associateShelfName,
    fixtureId,
    templateId,
    addMode,
  } = searchOverride ?? currentSearch;
  const isManualEntryMode = addMode === "manual";
  const isAdmin = location.pathname.includes("/admin/");
  const storeId = params.storeId as string | undefined;
  const shelfListPath =
    isAdmin && storeId
      ? `/admin/${storeId}/fixture-types`
      : "/checker/fixture-types";
  const { toast } = useToast();
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves } = useShelves();
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } =
    useShelfTemplates();
  const { data: extraFixtureLabels = [] } = useStoreFixtureTypes();
  const { data: storeFixtures = [], isLoading: fixturesLoading } =
    useStoreFixtures();
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
  const [, setDimDepth] = useState("");
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

  useEffect(() => {
    if (!fixtureId) return;
    const fixture = storeFixtures.find((item) => item.id === fixtureId);
    if (!fixture) return;
    setFixtureType(fixture.type);
    setAisleCode((prev) => prev || fixture.physical_location.aisle);
    setZone((prev) => prev || fixture.physical_location.zone);
    setSection((prev) => prev || fixture.physical_location.section);
    setDimWidth(String(fixture.dimensions.width));
    setDimHeight(String(fixture.dimensions.height));
    setDimDepth(String(fixture.dimensions.depth));
  }, [fixtureId, storeFixtures]);

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
    setDimDepth(String(selectedTemplate.depth));
    if (selectedTemplate.zone) setZone(selectedTemplate.zone);
    if (selectedTemplate.section) setSection(selectedTemplate.section);
  }, [selectedTemplate]);

  const fixtureTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    const deduped: { value: string; label: string }[] = [];

    const addOption = (raw: string | undefined) => {
      const trimmed = raw?.trim() ?? "";
      const key = fixtureTypeDedupeKey(trimmed);
      if (!trimmed || !key || seen.has(key)) return;
      seen.add(key);
      deduped.push({ value: trimmed, label: trimmed });
    };

    for (const label of extraFixtureLabels) {
      addOption(label);
    }

    for (const fixture of storeFixtures) {
      addOption(fixture.type);
    }

    // Ensure template-applied/current value is always selectable even if
    // store fixture type options are delayed or missing this label.
    addOption(selectedTemplate?.fixtureType);
    addOption(fixtureType);

    return deduped;
  }, [extraFixtureLabels, storeFixtures, selectedTemplate, fixtureType]);

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
    [],
  );

  // Depth comes from the store fixtures API (derived by fixture type + unit).
  useEffect(() => {
    if (!fixtureType) return;
    const depthFromFixture = resolveDepthForFixtureType(fixtureType);
    if (depthFromFixture) {
      setDimDepth(String(depthFromFixture));
      return;
    }

    // Keep template-provided depth when fixture type came from template but
    // store fixture list does not contain a matching type label yet.
    if (
      selectedTemplate &&
      fixtureTypeDedupeKey(selectedTemplate.fixtureType) ===
        fixtureTypeDedupeKey(fixtureType)
    ) {
      setDimDepth(String(selectedTemplate.depth));
      return;
    }

    setDimDepth("");
  }, [fixtureType, resolveDepthForFixtureType, selectedTemplate]);

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
    usePlanogramById(selectedPlanogramId ? selectedPlanogramId : null);

  const duplicateNameError = useMemo(() => {
    if (!shelfName.trim() || isSaving) return null;
    const excludeId = isAssociateMode ? associateShelfId : undefined;
    const exists = (shelves ?? []).some(
      (s) =>
        s.id !== excludeId &&
        s.shelfName.toLowerCase() === shelfName.trim().toLowerCase(),
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
      !fixturesLoading &&
      aisleCode.trim() !== "" &&
      bayCode.trim() !== ""
    );
  }, [
    selectedPlanogramId,
    shelfName,
    duplicateNameError,
    isSaving,
    isAssociateMode,
    fixturesLoading,
    aisleCode,
    bayCode,
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
            planogramPayload?.shelves.map((shelf) => ({
              shelfId: shelf.id,
              productIds: shelf.products.map((product, index) =>
                getPlanogramProductId(product, `${shelf.id}:${index}`),
              ),
            })) ?? [],
        };
        await assignPlanogramMutation.mutateAsync({
          shelfId: associateShelfId,
          planogramId: selectedPlanogramId,
          arrangement,
        });
        toast({
          title: "Planogram associated",
          description: "The planogram has been associated with the shelf.",
        });
        navigate({ to: shelfListPath as never });
      } else if (!isAssociateMode) {
        if (fixturesLoading) {
          setSaveError(
            "Display Units are still loading. Please wait a moment and try again.",
          );
          return;
        }

        const fixtureTypeValue = fixtureType.trim() || "gondola";
        const fixtureWidth = Number(dimWidth) || 1;
        const fixtureHeight = Number(dimHeight) || 1;
        const verticalPositionValue = Number(verticalPosition || "0");
        if (!Number.isFinite(verticalPositionValue)) {
          setSaveError("Vertical position must be a valid number.");
          return;
        }
        const aisleValue = aisleCode.trim();
        const bayValue = bayCode.trim();
        const zoneValue = zone.trim() || "General";
        const sectionValue = section.trim() || "General";

        const normalize = (v: string) => v.trim().toLowerCase();
        const matchedFixtureFromSearch = fixtureId
          ? storeFixtures.find((fixture) => fixture.id === fixtureId)
          : undefined;
        const exactMatches = storeFixtures.filter((f) => {
          return (
            fixtureTypeDedupeKey(f.type) ===
              fixtureTypeDedupeKey(fixtureTypeValue) &&
            normalize(f.physical_location.section) ===
              normalize(sectionValue) &&
            normalize(f.physical_location.aisle) === normalize(aisleValue) &&
            normalize(f.physical_location.zone) === normalize(zoneValue)
          );
        });
        const typeMatches = storeFixtures.filter(
          (f) =>
            fixtureTypeDedupeKey(f.type) ===
            fixtureTypeDedupeKey(fixtureTypeValue),
        );

        const matchedFixture =
          matchedFixtureFromSearch ??
          exactMatches[0] ??
          (typeMatches.length === 1 ? typeMatches[0] : undefined);

        if (!matchedFixture) {
          setSaveError(
            "No matching fixture found. Please create/select a fixture first, then create shelf.",
          );
          return;
        }

        await createShelfMutation.mutateAsync({
          code: `S${aisleValue}-${bayValue}`, // Unique business ID (string codes)
          name: shelfName.trim(),
          fixture_id: matchedFixture.id,
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
    verticalPosition,
    shelfListPath,
    planogramPayload,
    storeFixtures,
    fixturesLoading,
    createShelfMutation,
    assignPlanogramMutation,
    navigate,
    toast,
  ]);

  return (
    <MainLayout>
      <div className="bg-primary min-h-screen px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <AddPlanogramHeader
            shelfListPath={shelfListPath}
            isAssociateMode={isAssociateMode}
          />

          <div
            className={cn(
              "grid gap-4",
              isAssociateMode ? "lg:grid-cols-2" : "w-full",
            )}
          >
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
