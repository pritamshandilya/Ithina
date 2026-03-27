import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useLocation, useNavigate, useParams } from "@tanstack/react-router";
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
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  useShelves,
  usePlanogramById,
  usePlanogramList,
  useAssignPlanogramToShelf,
} from "@/queries/maker";
import type { PlanogramArrangement } from "@/types/planogram";

export const Route = createFileRoute("/maker/audits/planogram/new/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      shelfId: (search.shelfId as string) || undefined,
    };
  },
  component: MakerPOGAnalysisRouteComponent,
});

type AddPOGAnalysisPageSearch = {
  shelfId?: string;
};

type AddPOGAnalysisPageProps = {
  searchOverride?: AddPOGAnalysisPageSearch;
};

function MakerPOGAnalysisRouteComponent() {
  const search = Route.useSearch();
  return <AddPOGAnalysisPage searchOverride={search} />;
}

export function AddPOGAnalysisPage({ searchOverride }: AddPOGAnalysisPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { shelfId } = searchOverride ?? {};
  const isShelfLocked = !!shelfId;
  const isAdmin = location.pathname.includes("/admin/");
  const backPath = isAdmin && params.storeId
    ? `/admin/${params.storeId}/shelf`
    : "/maker/audits/planogram";
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves, isLoading: shelvesLoading } = useShelves();
  const assignPlanogramMutation = useAssignPlanogramToShelf();

  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string>("");
  const [selectedShelfId, setSelectedShelfId] = useState<string>(shelfId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: planogramPayload, isLoading: planogramLoading } =
    usePlanogramById(selectedPlanogramId ? selectedPlanogramId : null);

  const canSave = useMemo(() => {
    return !!selectedPlanogramId && !!selectedShelfId && !isSaving;
  }, [selectedPlanogramId, selectedShelfId, isSaving]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
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

      await assignPlanogramMutation.mutateAsync({
        shelfId: selectedShelfId,
        planogramId: selectedPlanogramId,
        arrangement,
      });
      toast({ title: "Analysis configured", description: "POG Analysis is now ready for the selected shelf." });
      navigate({ to: backPath as never });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to configure analysis");
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    selectedPlanogramId,
    selectedShelfId,
    planogramPayload,
    backPath,
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
              <Link to={backPath as never}>
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add POG Analysis</h1>
            </div>
          </header>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Left: Inputs */}
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configure analysis</CardTitle>
                  <CardDescription>
                    Select an existing planogram and an existing shelf to pair them together for analysis.
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
                            {p.name} · {p.zone ?? "—"} / {p.section ?? "—"} ({p.shelfCount} shelves · {p.productCount} SKUs)
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelf-select">Shelf to analyze</Label>
                    {shelvesLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Select
                        id="shelf-select"
                        value={selectedShelfId}
                        onChange={(e) => setSelectedShelfId(e.target.value)}
                        aria-label="Select shelf"
                        disabled={isShelfLocked}
                      >
                        <option value="">Select a shelf...</option>
                        {(shelves ?? []).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shelfName}
                            {s.planogramId ? ` (Already has a planogram mapped)` : ""}
                          </option>
                        ))}
                      </Select>
                    )}
                    {isShelfLocked ? (
                      <p className="text-xs text-muted-foreground">
                        Shelf selection is locked for this analysis run.
                      </p>
                    ) : null}
                  </div>

                  {saveError && (
                    <p className="flex items-center gap-1.5 text-sm text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {saveError}
                    </p>
                  )}

                  <Button
                    variant="success"
                    className="w-full"
                    disabled={!canSave}
                    onClick={handleSave}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check className="size-4" aria-hidden />
                        Save Analysis Setup
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
                  Summary of the selected planogram structure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPlanogramId ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="font-medium text-foreground">No planogram selected</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose a planogram from the list to preview its structure.
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
