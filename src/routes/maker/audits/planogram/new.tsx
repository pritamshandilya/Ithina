import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, LayoutGrid } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useMemo, useState } from "react";

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
  assignedShelvesKeys,
  useAssignedShelves,
  useCreateShelf,
  usePlanogramById,
  usePlanogramList,
  planogramShelfPreviewKeys,
} from "@/features/maker/hooks";
import { useStore } from "@/providers/store";
import { saveShelfArrangement } from "@/features/maker/api/planogram";
import type { PlanogramArrangement } from "@/types/planogram";
import { mockUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

const BLANK_SHELF_VALUE = "__blank__";

export const Route = createFileRoute("/maker/audits/planogram/new")({
  component: AddPlanogramPage,
});

function AddPlanogramPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves } = useAssignedShelves();
  const createShelfMutation = useCreateShelf();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id || mockUser.storeId;
  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string>("");
  const [shelfName, setShelfName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: planogramPayload, isLoading: planogramLoading } =
    usePlanogramById(
      selectedPlanogramId && selectedPlanogramId !== BLANK_SHELF_VALUE
        ? selectedPlanogramId
        : null
    );

  const duplicateNameError = useMemo(() => {
    if (!shelfName.trim()) return null;
    const exists = (shelves ?? []).some(
      (s) => s.shelfName.toLowerCase() === shelfName.trim().toLowerCase()
    );
    return exists ? `A shelf named "${shelfName.trim()}" already exists` : null;
  }, [shelves, shelfName]);

  const isBlankShelf = selectedPlanogramId === BLANK_SHELF_VALUE;
  const canSave = useMemo(() => {
    return (
      !!shelfName.trim() &&
      !duplicateNameError &&
      !isSaving &&
      (isBlankShelf || !!selectedPlanogramId)
    );
  }, [selectedPlanogramId, shelfName, duplicateNameError, isSaving, isBlankShelf]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      if (isBlankShelf) {
        await createShelfMutation.mutateAsync({
          aisleNumber: 1,
          bayNumber: 1,
          shelfName: shelfName.trim(),
          description: "Blank shelf",
        });
        toast({ title: "Shelf created", description: "Your blank shelf has been created successfully." });
        navigate({ to: "/maker/audits/planogram" });
      } else if (selectedPlanogramId) {
        const arrangement: PlanogramArrangement = {
          planogramId: selectedPlanogramId,
          shelfOrder:
            planogramPayload?.planogram.fixture.shelves.map((s) => ({
              shelfId: `shelf-${s.shelfNumber}`,
              productIds: s.products.map((p) => p.sku),
            })) ?? [],
        };
        const shelf = await saveShelfArrangement(
          shelfName.trim(),
          selectedPlanogramId,
          arrangement,
          selectedStoreId
        );
        await queryClient.invalidateQueries({ queryKey: assignedShelvesKeys.all });
        // Prefetch shelf preview so edit page has data immediately (avoids brief error flash)
        await queryClient.prefetchQuery({ queryKey: planogramShelfPreviewKeys.byShelfId(shelf.id) });
        toast({ title: "Planogram saved", description: "Your planogram has been saved successfully." });
        navigate({ to: "/maker/shelves/$shelfId/edit", params: { shelfId: shelf.id } });
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    isBlankShelf,
    selectedPlanogramId,
    shelfName,
    selectedStoreId,
    planogramPayload,
    createShelfMutation,
    navigate,
    queryClient,
    toast,
  ]);

  const planogram = planogramPayload?.planogram;
  const metadata = planogramPayload?.metadata;
  const fixture = planogram?.fixture;

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">

          <header className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/maker/audits/planogram">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Planogram</h1>
              
            </div>
          </header>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Left: Inputs */}
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Planogram details</CardTitle>
                  <CardDescription>
                    Choose a planogram and give this shelf a name.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                        <option value={BLANK_SHELF_VALUE}>Create blank shelf</option>
                        {(planogramList ?? []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.shelfCount} shelves · {p.productCount} SKUs)
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelf-name">Shelf name</Label>
                    <Input
                      id="shelf-name"
                      placeholder="e.g., Food & Beverage Shelf"
                      value={shelfName}
                      onChange={(e) => setShelfName(e.target.value)}
                      className={cn(duplicateNameError && "border-destructive")}
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

                  {saveError && (
                    <p className="flex items-center gap-1.5 text-sm text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {saveError}
                    </p>
                  )}

                  <Button
                    className="w-full bg-chart-2 text-white hover:opacity-90"
                    disabled={!canSave}
                    onClick={handleSave}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check className="size-4" aria-hidden />
                        {isBlankShelf ? "Create Shelf" : "Save Planogram"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right: Planogram preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Planogram preview</CardTitle>
                <CardDescription>
                  Summary of the selected planogram. Edit arrangement in a future release.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPlanogramId ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="font-medium text-foreground">No planogram loaded</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select a planogram to preview and edit, or create a blank shelf.
                    </p>
                  </div>
                ) : isBlankShelf ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="font-medium text-foreground">Blank shelf</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create a shelf with no planogram. You can add products and configure it later.
                    </p>
                  </div>
                ) : planogramLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : planogram && fixture ? (
                  <div className="space-y-3">
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
                          {fixture.width}×{fixture.height} {fixture.units}
                        </p>
                      </div>
                      <div className="col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:col-span-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {metadata?.location ?? planogram.physicalLocation.bay}
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
