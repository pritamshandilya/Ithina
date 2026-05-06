import {
  createFileRoute,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { AlertCircle, Check, LayoutGrid } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { DetailBackButton } from "@/components/shared/DetailBackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { groupShelvesByFixture } from "@/lib/fixtures/analysis";
import {
  getPlanogramProductId,
  getShelfDisplayLabel,
  sortPlanogramShelves,
} from "@/lib/planogram/planogramSchema";
import {
  useAssignPlanogramToShelf,
  usePlanogramById,
  usePlanogramList,
  useShelves,
} from "@/queries/maker";
import type { PlanogramArrangement } from "@/types/planogram";

export const Route = createFileRoute("/maker/audits/planogram/new/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      fixtureId:
        (search.fixtureId as string) || (search.shelfId as string) || undefined,
    };
  },
  component: MakerPOGAnalysisRouteComponent,
});

type AddPOGAnalysisPageSearch = {
  fixtureId?: string;
};

type AddPOGAnalysisPageProps = {
  searchOverride?: AddPOGAnalysisPageSearch;
};

function MakerPOGAnalysisRouteComponent() {
  const search = Route.useSearch();
  return <AddPOGAnalysisPage searchOverride={search} />;
}

export function AddPOGAnalysisPage({
  searchOverride,
}: AddPOGAnalysisPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const { toast } = useToast();
  const { fixtureId } = searchOverride ?? {};
  const isFixtureLocked = !!fixtureId;
  const isAdmin = location.pathname.includes("/admin/");
  const backPath =
    isAdmin && params.storeId
      ? `/admin/${params.storeId}/shelf`
      : "/maker/audits/planogram";
  const { data: planogramList, isLoading: listLoading } = usePlanogramList();
  const { data: shelves, isLoading: shelvesLoading } = useShelves();
  const assignPlanogramMutation = useAssignPlanogramToShelf();

  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string>("");
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(
    fixtureId || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: planogramPayload, isLoading: planogramLoading } =
    usePlanogramById(selectedPlanogramId ? selectedPlanogramId : null);

  const canSave = useMemo(() => {
    return !!selectedPlanogramId && !!selectedFixtureId && !isSaving;
  }, [selectedPlanogramId, selectedFixtureId, isSaving]);

  const fixtureGroups = useMemo(
    () => groupShelvesByFixture(shelves ?? []),
    [shelves],
  );

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);
    setSaveError(null);
    try {
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

      const targetFixture = fixtureGroups.find(
        (fixtureGroup) => fixtureGroup.fixtureId === selectedFixtureId,
      );
      const targetShelves = targetFixture?.shelves ?? [];

      if (targetShelves.length === 0) {
        throw new Error("Selected fixture has no shelves to attach.");
      }

      await Promise.all(
        targetShelves.map((shelf) =>
          assignPlanogramMutation.mutateAsync({
            shelfId: shelf.id,
            planogramId: selectedPlanogramId,
            arrangement,
          }),
        ),
      );
      toast({
        title: "Analysis configured",
        description: "POG Analysis is now ready for the selected fixture.",
      });
      navigate({ to: backPath as never });
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to configure analysis",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    selectedPlanogramId,
    selectedFixtureId,
    fixtureGroups,
    planogramPayload,
    backPath,
    navigate,
    toast,
  ]);

  const fixture = planogramPayload?.fixture;
  const sortedShelves = sortPlanogramShelves(planogramPayload?.shelves ?? []);

  return (
    <MainLayout>
      <div className="bg-primary min-h-screen px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <header className="flex items-center gap-2">
            <DetailBackButton to={backPath} />
            <div>
              <h1 className="text-foreground text-2xl font-bold">
                Add POG Analysis
              </h1>
            </div>
          </header>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Left: Inputs */}
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Configure analysis
                  </CardTitle>
                  <CardDescription>
                    Select an existing planogram and an existing fixture to pair
                    them together for analysis.
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
                            {p.name} ({p.shelfCount} shelves · {p.productCount}{" "}
                            SKUs)
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixture-select">Fixture to analyze</Label>
                    {shelvesLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Select
                        id="fixture-select"
                        value={selectedFixtureId}
                        onChange={(e) => setSelectedFixtureId(e.target.value)}
                        aria-label="Select fixture"
                        disabled={isFixtureLocked}
                      >
                        <option value="">Select a fixture...</option>
                        {fixtureGroups.map((fixtureGroup) => (
                          <option
                            key={fixtureGroup.fixtureId}
                            value={fixtureGroup.fixtureId}
                          >
                            {fixtureGroup.fixtureName}
                            {fixtureGroup.shelves.some((s) => s.planogramId)
                              ? " (Has planogram mapping)"
                              : ""}
                          </option>
                        ))}
                      </Select>
                    )}
                    {isFixtureLocked ? (
                      <p className="text-muted-foreground text-xs">
                        Fixture selection is locked for this analysis run.
                      </p>
                    ) : null}
                  </div>

                  {saveError && (
                    <p className="text-destructive flex items-center gap-1.5 text-sm">
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
                  <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 text-center">
                    <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                      <LayoutGrid
                        className="text-muted-foreground h-7 w-7"
                        aria-hidden
                      />
                    </div>
                    <p className="text-foreground font-medium">
                      No planogram selected
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Choose a planogram from the list to preview its structure.
                    </p>
                  </div>
                ) : planogramLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : planogramPayload && fixture ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Shelves
                        </p>
                        <p className="text-foreground text-lg font-semibold tabular-nums">
                          {sortedShelves.length}
                        </p>
                      </div>
                      <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          SKUs
                        </p>
                        <p className="text-foreground text-lg font-semibold tabular-nums">
                          {sortedShelves.reduce(
                            (sum, shelf) => sum + shelf.products.length,
                            0,
                          )}
                        </p>
                      </div>
                      <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Dimensions
                        </p>
                        <p className="text-foreground text-sm font-semibold tabular-nums">
                          {fixture.width}×{fixture.height}×{fixture.depth}
                        </p>
                      </div>
                      <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Status
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          {planogramPayload.status}
                        </p>
                      </div>
                      <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Version
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          {planogramPayload.version ?? "—"}
                        </p>
                      </div>
                      <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Total Units
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          {sortedShelves.reduce(
                            (sum, shelf) =>
                              sum +
                              shelf.products.reduce(
                                (productSum, product) =>
                                  productSum +
                                  product.facings * product.depth_count,
                                0,
                              ),
                            0,
                          )}
                        </p>
                      </div>
                      <div className="border-border bg-muted/30 col-span-2 rounded-lg border px-3 py-2 sm:col-span-3">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Description
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          {planogramPayload.description ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                        Shelf breakdown
                      </h3>
                      <ul className="space-y-2">
                        {sortedShelves.map((shelf) => {
                          const productCount = shelf.products.reduce(
                            (n, p) => n + p.facings * p.depth_count,
                            0,
                          );
                          return (
                            <li
                              key={shelf.id}
                              className="border-border bg-muted/20 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                            >
                              <span className="text-foreground font-medium">
                                {getShelfDisplayLabel(sortedShelves, shelf.id)}{" "}
                                · {shelf.id}
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                {shelf.products.length} items · {productCount}{" "}
                                units
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
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
