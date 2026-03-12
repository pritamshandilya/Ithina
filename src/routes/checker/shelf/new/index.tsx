import { createFileRoute, Link, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, LayoutGrid } from "lucide-react";
import { z } from "zod";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useShelves,
  useCreateShelf,
  usePlanogramById,
  usePlanogramList,
  useAssignPlanogramToShelf,
} from "@/queries/maker";
import type { PlanogramArrangement } from "@/types/planogram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checker/shelf/new/")({
  component: AddPlanogramPage,
  validateSearch: (search) =>
    z
      .object({
        associateShelfId: z.string().optional(),
        associateShelfName: z.string().optional(),
      })
      .parse(search),
});

export function AddPlanogramPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as any;
  const { associateShelfId, associateShelfName } = Route.useSearch();
  const isAdmin = location.pathname.includes("/admin/");
  const storeId = params.storeId as string | undefined;
  const shelfListPath =
    isAdmin && storeId ? `/admin/${storeId}/shelf` : "/checker/shelf";
  const { toast } = useToast();
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves } = useShelves();
  const createShelfMutation = useCreateShelf();
  const assignPlanogramMutation = useAssignPlanogramToShelf();
  const isAssociateMode = !!associateShelfId;

  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string>("");
  const [shelfName, setShelfName] = useState("");
  const [aisleNumber, setAisleNumber] = useState<number | "">("");
  const [bayNumber, setBayNumber] = useState<number | "">("");
  const [zone, setZone] = useState("");
  const [section, setSection] = useState("");
  const [fixtureType, setFixtureType] = useState("");
  const [dimWidth, setDimWidth] = useState("");
  const [dimHeight, setDimHeight] = useState("");
  const [dimDepth, setDimDepth] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      aisleNumber !== "" &&
      bayNumber !== ""
    );
  }, [selectedPlanogramId, shelfName, duplicateNameError, isSaving, isAssociateMode, aisleNumber, bayNumber]);

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
        navigate({ to: shelfListPath as any });
      } else if (!isAssociateMode) {
        // Map UI fields to real API CreateShelfPayload
        await createShelfMutation.mutateAsync({
          shelf_id: `S${aisleNumber}-${bayNumber}`, // Unique business ID
          name: shelfName.trim(),
          fixture: {
            type: fixtureType.trim() || "gondola",
            dimensions: {
              width: Number(dimWidth) || 0,
              height: Number(dimHeight) || 0,
              depth: Number(dimDepth) || 300, // Default to 300mm if not provided to satisfy gt=0
            },
            physical_location: {
              aisle: String(aisleNumber),
              zone: zone.trim() || "General",
              section: section.trim() || "General",
            },
          },
        });
        toast({ title: "Shelf created", description: "Your shelf has been created successfully." });
        navigate({ to: shelfListPath as any });
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
    aisleNumber,
    bayNumber,
    zone,
    section,
    fixtureType,
    dimWidth,
    dimHeight,
    planogramPayload,
    createShelfMutation,
    assignPlanogramMutation,
    navigate,
    toast,
  ]);

  const planogram = planogramPayload?.planogram;
  const metadata = planogramPayload?.metadata;
  const fixture = planogram?.fixture;

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={shelfListPath as any}>
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isAssociateMode ? "Associated Planogram" : "Add Shelf"}
              </h1>
            </div>
          </header>

          <div className={cn("grid gap-4", isAssociateMode ? "lg:grid-cols-2" : "w-full")}>
            {/* Left: Inputs */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{isAssociateMode ? "Planogram details" : "Shelf details"}</CardTitle>
                  <CardDescription>
                    {isAssociateMode
                      ? "Select a planogram to associate with this shelf."
                      : "Provide details to create a new manual shelf."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAssociateMode && (
                    <div className="space-y-2">
                      <Label htmlFor="planogram-select">Planogram</Label>
                      {listLoading ? (
                        <Skeleton className="h-9 w-full" />
                      ) : (
                        <Select
                          id="planogram-select"
                          value={selectedPlanogramId}
                          onChange={(e) => setSelectedPlanogramId(e.target.value)}
                          aria-label="Select planogram"
                        >
                          <option value="">Select a planogram...</option>
                          {(planogramList ?? []).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · {p.zone ?? "—"} / {p.section ?? "—"} ({p.shelfCount} shelves · {p.productCount} SKUs)
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="shelf-name">Shelf name</Label>
                    <Input
                      id="shelf-name"
                      placeholder="e.g., Food & Beverage Shelf"
                      value={shelfName}
                      onChange={(e) => setShelfName(e.target.value)}
                      readOnly={isAssociateMode}
                      className={cn(duplicateNameError && "border-destructive", isAssociateMode && "bg-muted/50")}
                      aria-invalid={!!duplicateNameError}
                      aria-describedby={duplicateNameError ? "shelf-name-error" : undefined}
                    />
                    {duplicateNameError && (
                      <p
                        id="shelf-name-error"
                        className="flex items-center gap-1.5 text-sm text-destructive"
                      >
                        <AlertCircle className="size-4 shrink-0" />
                        {duplicateNameError}
                      </p>
                    )}
                  </div>

                  {!isAssociateMode && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="aisle-number">Aisle number</Label>
                          <Input
                            id="aisle-number"
                            type="number"
                            min="1"
                            placeholder="e.g., 1"
                            value={aisleNumber}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "") setAisleNumber("");
                              else if (Number(v) >= 1) setAisleNumber(Number(v));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bay-number">Bay number</Label>
                          <Input
                            id="bay-number"
                            type="number"
                            min="1"
                            placeholder="e.g., 1"
                            value={bayNumber}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "") setBayNumber("");
                              else if (Number(v) >= 1) setBayNumber(Number(v));
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zone">Zone</Label>
                          <Input
                            id="zone"
                            placeholder="e.g., Grocery"
                            value={zone}
                            onChange={(e) => setZone(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            placeholder="e.g., Snacks"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fixture-type">Fixture Type</Label>
                          <Select
                            id="fixture-type"
                            value={fixtureType}
                            onChange={(e) => setFixtureType(e.target.value)}
                          >
                            <option value="">Choose...</option>
                            <option value="gondola">Gondola</option>
                            <option value="wall_shelving">Wall Shelving</option>
                            <option value="end_cap">End Cap</option>
                            <option value="freezer">Freezer</option>
                            <option value="cooler">Cooler</option>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dim-width">Dimensions (W×H×D)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="dim-width"
                              placeholder="Width"
                              value={dimWidth}
                              onChange={(e) => setDimWidth(e.target.value)}
                            />
                            <span className="text-muted-foreground">×</span>
                            <Input
                              id="dim-height"
                              placeholder="Height"
                              value={dimHeight}
                              onChange={(e) => setDimHeight(e.target.value)}
                            />
                            <span className="text-muted-foreground">×</span>
                            <Input
                              id="dim-depth"
                              placeholder="Depth"
                              value={dimDepth}
                              onChange={(e) => setDimDepth(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {saveError && (
                    <p className="flex items-center gap-1.5 text-sm text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {saveError}
                    </p>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      className="bg-chart-2 text-white hover:opacity-90"
                      disabled={!canSave}
                      onClick={handleSave}
                    >
                      {isSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Check className="size-4" aria-hidden />
                          {isAssociateMode ? "Associate Planogram" : "Create Shelf"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Planogram preview (Only show in associate mode) */}
            {isAssociateMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Planogram preview</CardTitle>
                  <CardDescription>
                    Summary of the selected planogram. Edit arrangement in a future release.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedPlanogramId ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                        <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
                      </div>
                      <p className="font-medium text-foreground">No planogram loaded</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Select a planogram to preview and associate.
                      </p>
                    </div>
                  ) : planogramLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : planogram && fixture ? (
                    <div className="space-y-4">
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Shelves
                          </p>
                          <p className="text-lg font-semibold tabular-nums text-foreground">
                            {fixture.shelves.length}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            SKUs
                          </p>
                          <p className="text-lg font-semibold tabular-nums text-foreground">
                            {metadata?.totalSKUs ??
                              fixture.shelves.reduce((s, sh) => s + sh.products.length, 0)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Dimensions
                          </p>
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {fixture.width}×{fixture.height}×{fixture.depth}{" "}
                            {planogram.storeConfig?.units ?? "mm"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Fixture type
                          </p>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {fixture.type?.replace(/_/g, " ") ?? "—"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Zone
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {planogram.physicalLocation?.zone ?? "—"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Aisle · Bay
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {planogram.physicalLocation?.aisle ?? "—"} ·{" "}
                            {planogram.physicalLocation?.bay ?? "—"}
                          </p>
                        </div>
                        <div className="col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:col-span-3">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Section
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {planogram.physicalLocation?.section ?? planogram.location ?? "—"}
                          </p>
                        </div>
                      </div>

                      {/* Shelf breakdown */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Shelf breakdown
                        </h3>
                        <ul className="space-y-2">
                          {fixture.shelves.map((shelf) => {
                            const productCount = shelf.products.reduce(
                              (n, p) => n + p.facings * p.depthCount,
                              0
                            );
                            return (
                              <li
                                key={shelf.shelfNumber}
                                className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
                              >
                                <span className="font-medium text-foreground">
                                  {shelf.name}
                                </span>
                                <span className="tabular-nums text-muted-foreground">
                                  {shelf.products.length} items · {productCount} units
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Planogram not found.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
