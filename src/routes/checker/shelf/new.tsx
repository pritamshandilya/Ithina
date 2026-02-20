import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, LayoutGrid } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
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
  usePlanogramById,
  usePlanogramList,
  useStores,
} from "@/features/maker/hooks";
import { saveShelfArrangement } from "@/features/maker/api/planogram";
import type { PlanogramArrangement } from "@/types/planogram";
import { mockUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checker/shelf/new")({
  component: AddPlanogramPage,
});

function AddPlanogramPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: stores } = useStores();
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves } = useAssignedShelves();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);
  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string>("");
  const [shelfName, setShelfName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: planogramPayload, isLoading: planogramLoading } =
    usePlanogramById(selectedPlanogramId || null);

  const duplicateNameError = useMemo(() => {
    if (!shelfName.trim()) return null;
    const exists = (shelves ?? []).some(
      (s) => s.shelfName.toLowerCase() === shelfName.trim().toLowerCase()
    );
    return exists ? `A shelf named "${shelfName.trim()}" already exists` : null;
  }, [shelves, shelfName]);

  const canSave = useMemo(() => {
    return (
      !!selectedPlanogramId &&
      !!shelfName.trim() &&
      !duplicateNameError &&
      !isSaving
    );
  }, [selectedPlanogramId, shelfName, duplicateNameError, isSaving]);

  const handleSave = useCallback(async () => {
    if (!canSave || !selectedPlanogramId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
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
      toast({ title: "Planogram saved", description: "Your planogram has been saved successfully." });
      navigate({ to: "/checker/shelf/$shelfId", params: { shelfId: shelf.id } });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    selectedPlanogramId,
    shelfName,
    selectedStoreId,
    planogramPayload,
    navigate,
    queryClient,
    toast,
  ]);

  const planogram = planogramPayload?.planogram;
  const metadata = planogramPayload?.metadata;
  const fixture = planogram?.fixture;

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/checker/shelves">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Planogram</h1>
              <p className="text-sm text-muted-foreground">
                Select a planogram from your provider, customize the arrangement, and save.
              </p>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Inputs */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Planogram details</CardTitle>
                  <CardDescription>
                    Choose a planogram and give this shelf a name.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        Save Planogram
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
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                      <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="font-medium text-foreground">No planogram loaded</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select a planogram to preview and edit.
                    </p>
                  </div>
                ) : planogramLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : planogram && fixture ? (
                  <div className="space-y-6">
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
                          {metadata?.location ?? "—"}
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
