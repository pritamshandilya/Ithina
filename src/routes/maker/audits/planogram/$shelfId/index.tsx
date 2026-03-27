/**
 * Planogram Preview Route
 *
 * Visual preview of a saved planogram shelf.
 * Editable: product name, category, facings/depth; remove products.
 * Drag-and-drop: reorder within shelf, move between shelves, restore from removed.
 * Access at: /maker/audits/planogram/:shelfId
 */
import { createFileRoute, Link, useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@/components/layouts/main";
import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
  StockingRulesSection,
} from "@/components/planogram";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PLANOGRAM_POC_002 } from "@/lib/api/planogram-sample";
import {
  usePlanogramShelfPreview,
  useUpdateShelfArrangement,
} from "@/queries/maker";
import { useToast } from "@/hooks/use-toast";
import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

export const Route = createFileRoute("/maker/audits/planogram/$shelfId/")({
  component: PlanogramPreviewPage,
});

function derivePlanogramStats(
  shelves: PlanogramShelfDef[],
  removedItems: PlanogramProduct[]
) {
  const allProducts = shelves.flatMap((s) => s.products);
  const uniqueSkus = new Set([...allProducts, ...removedItems].map((p) => p.sku)).size;
  const frontFacings = allProducts.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = allProducts.reduce(
    (sum, p) => sum + p.facings * (p.depthCount || 1),
    0
  );
  const categorySet = new Set([...allProducts, ...removedItems].map((p) => p.category));
  return {
    shelves: shelves.length,
    skus: uniqueSkus,
    frontFacings,
    totalUnits,
    categories: categorySet.size,
    categoryList: Array.from(categorySet).sort(),
    removed: removedItems.length,
  };
}

function deepCopyShelves(shelves: PlanogramShelfDef[]): PlanogramShelfDef[] {
  return shelves.map((s) => ({
    ...s,
    products: s.products.map((p) => ({ ...p })),
  }));
}

const PLANOGRAM_FALLBACK = "/maker/audits/planogram";

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();
  const { toast } = useToast();
  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: preview, isLoading, error } = usePlanogramShelfPreview(shelfId);
  const from = (location.state as { from?: string } | undefined)?.from;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: from ?? PLANOGRAM_FALLBACK });
    }
  };
  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set()
  );

  const dragRef = useRef<{
    sku: string;
    fromShelf: number | "removed";
  } | null>(null);

  const updateShelfArrangementMutation = useUpdateShelfArrangement();

  useEffect(() => {
    if (!preview) return;
    const payload = preview.planogramPayload ?? PLANOGRAM_POC_002;
    if (!payload?.planogram?.fixture?.shelves) return;
    const fixtureShelves = payload.planogram.fixture.shelves;
    const arrangement = preview.shelf.arrangement as PlanogramArrangement | undefined;
    let shelves = deepCopyShelves(fixtureShelves);
    const removed: PlanogramProduct[] = [];

    if (arrangement?.productEdits) {
      shelves = shelves.map((s) => ({
        ...s,
        products: s.products.map((p) => {
          const edits = arrangement.productEdits![p.sku];
          if (!edits) return p;
          return {
            ...p,
            ...(edits.name != null && { name: edits.name }),
            ...(edits.category != null && { category: edits.category }),
            ...(edits.facings != null && { facings: edits.facings }),
            ...(edits.depthCount != null && { depthCount: edits.depthCount }),
          };
        }),
      }));
    }

    if (arrangement?.removedProductIds?.length) {
      const removedSet = new Set(arrangement.removedProductIds);
      for (const shelf of shelves) {
        for (const p of shelf.products) {
          if (removedSet.has(p.sku)) removed.push(p);
        }
      }
      shelves = shelves.map((s) => ({
        ...s,
        products: s.products.filter((p) => !removedSet.has(p.sku)),
      }));
    }

    if (arrangement?.shelfOrder?.length) {
      const orderMap = new Map(
        arrangement.shelfOrder.map((o) => [
          o.shelfId.replace("shelf-", ""),
          o.productIds,
        ])
      );
      shelves = shelves.map((s) => {
        const productIds = orderMap.get(String(s.shelfNumber));
        if (!productIds?.length) return s;
        const bySku = new Map(s.products.map((p) => [p.sku, p]));
        const ordered = productIds
          .map((id) => bySku.get(id))
          .filter((p): p is PlanogramProduct => p != null);
        return { ...s, products: ordered.length ? ordered : s.products };
      });
    }

    setLocalShelves(shelves);
    setRemovedItems(removed);
    setHasChanges(false);
    setSelectedCategories(new Set());
  }, [preview]);

  const effectivePayload = preview?.planogramPayload ?? (preview ? PLANOGRAM_POC_002 : null);
  const isPlaceholder = !!preview && !preview.planogramPayload;

  const shelfCapacities = useMemo(() => {
    const orig = effectivePayload?.planogram?.fixture?.shelves ?? [];
    return Object.fromEntries(
      orig.map((s) => [
        s.shelfNumber,
        s.products.reduce((sum, p) => sum + p.facings, 0),
      ])
    );
  }, [effectivePayload?.planogram?.fixture?.shelves]);

  const findProduct = useCallback(
    (shelfNumber: number, sku: string) => {
      const shelf = localShelves.find((s) => s.shelfNumber === shelfNumber);
      return shelf?.products.find((p) => p.sku === sku);
    },
    [localShelves]
  );

  const onEditName = useCallback(
    (shelfNumber: number, sku: string, newName: string) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) =>
                  p.sku === sku ? { ...p, name: newName } : p
                ),
              }
            : s
        )
      );
      setHasChanges(true);
    },
    []
  );

  const onEditCategory = useCallback(
    (shelfNumber: number, sku: string, newCategory: string) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) =>
                  p.sku === sku ? { ...p, category: newCategory } : p
                ),
              }
            : s
        )
      );
      setHasChanges(true);
    },
    []
  );

  const onEditFacingsDepth = useCallback(
    (
      shelfNumber: number,
      sku: string,
      updates: { facings?: number; depthCount?: number }
    ) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) => {
                  if (p.sku !== sku) return p;
                  const facings = updates.facings ?? p.facings;
                  const depthCount = updates.depthCount ?? p.depthCount;
                  return { ...p, facings, depthCount };
                }),
              }
            : s
        )
      );
      setHasChanges(true);
    },
    []
  );

  const onRemoveProduct = useCallback(
    (shelfNumber: number, sku: string) => {
      const product = findProduct(shelfNumber, sku);
      if (!product) return;
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.filter((p) => p.sku !== sku),
              }
            : s
        )
      );
      setRemovedItems((prev) => [...prev, product]);
      setHasChanges(true);
    },
    [findProduct]
  );

  const onRestoreProduct = useCallback(
    (shelfNumber: number, product: PlanogramProduct) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? { ...s, products: [...s.products, { ...product }] }
            : s
        )
      );
      setRemovedItems((prev) => prev.filter((p) => p.sku !== product.sku));
      setHasChanges(true);
    },
    []
  );

  const onReorderProducts = useCallback(
    (shelfNumber: number, productIds: string[]) => {
      setLocalShelves((prev) =>
        prev.map((s) => {
          if (s.shelfNumber !== shelfNumber) return s;
          const bySku = new Map(s.products.map((p) => [p.sku, p]));
          const reordered = productIds
            .map((id) => bySku.get(id))
            .filter((p): p is PlanogramProduct => p != null);
          return { ...s, products: reordered };
        })
      );
      setHasChanges(true);
    },
    []
  );

  const onMoveProduct = useCallback(
    (from: number | "removed", to: number, sku: string, targetSku?: string) => {
      let productToMove: PlanogramProduct | undefined;
      if (from === "removed") {
        productToMove = removedItems.find((p) => p.sku === sku);
      } else {
        productToMove = localShelves
          .find((s) => s.shelfNumber === from)
          ?.products.find((p) => p.sku === sku);
      }
      if (!productToMove) return;

      if (from !== to) {
        const targetShelf = localShelves.find((s) => s.shelfNumber === to);
        if (targetShelf) {
          const currentFacings = targetShelf.products.reduce(
            (sum, p) => sum + p.facings,
            0
          );
          const capacity = shelfCapacities[to] ?? 0;
          if (currentFacings + productToMove.facings > capacity) {
            toast({
              title: "Shelf full",
              description: `${targetShelf.name} does not have enough space.`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      setLocalShelves((prev) => {
        let nextShelves = [...prev];
        if (from !== "removed") {
          nextShelves = nextShelves.map((s) =>
            s.shelfNumber === from
              ? { ...s, products: s.products.filter((p) => p.sku !== sku) }
              : s
          );
        }
        return nextShelves.map((s) => {
          if (s.shelfNumber !== to) return s;
          const productIds = s.products.map((p) => p.sku);
          const targetIdx = targetSku ? productIds.indexOf(targetSku) : -1;
          const newProducts = [...s.products];
          if (targetIdx !== -1) {
            newProducts.splice(targetIdx, 0, productToMove!);
          } else {
            newProducts.push(productToMove!);
          }
          return { ...s, products: newProducts };
        });
      });

      if (from === "removed") {
        setRemovedItems((items) => items.filter((p) => p.sku !== sku));
      }

      setHasChanges(true);
    },
    [localShelves, removedItems, shelfCapacities, toast]
  );

  const handleDragStart = useCallback(
    (sku: string, fromShelf: number | "removed") => {
      dragRef.current = { sku, fromShelf };
    },
    []
  );

  const handleDropOnShelf = useCallback(
    (toShelfNumber: number, targetSku?: string) => {
      if (!dragRef.current) return;
      const { sku, fromShelf } = dragRef.current;
      dragRef.current = null;
      onMoveProduct(fromShelf, toShelfNumber, sku, targetSku);
    },
    [onMoveProduct]
  );

  const handleDropOnRemoved = useCallback(() => {
    if (!dragRef.current) return;
    const { sku, fromShelf } = dragRef.current;
    dragRef.current = null;
    if (fromShelf === "removed") return;
    onRemoveProduct(fromShelf as number, sku);
  }, [onRemoveProduct]);

  const handleSave = useCallback(async () => {
    const payload = preview?.planogramPayload;
    if (!preview || !payload || !hasChanges || !shelfId) return;
    setIsSaving(true);
    try {
      const originalShelves = payload.planogram.fixture.shelves;
      const productEdits: NonNullable<PlanogramArrangement["productEdits"]> = {};

      for (const shelf of localShelves) {
        for (const p of shelf.products) {
          const orig = originalShelves
            .flatMap((s) => s.products)
            .find((op) => op.sku === p.sku);
          if (!orig) continue;
          const edits: {
            name?: string;
            category?: string;
            facings?: number;
            depthCount?: number;
          } = {};
          if (p.name !== orig.name) edits.name = p.name;
          if (p.category !== orig.category) edits.category = p.category;
          if (p.facings !== orig.facings) edits.facings = p.facings;
          if (p.depthCount !== orig.depthCount) edits.depthCount = p.depthCount;
          if (Object.keys(edits).length > 0) productEdits[p.sku] = edits;
        }
      }

      const arrangement: PlanogramArrangement = {
        shelfOrder: localShelves.map((s) => ({
          shelfId: `shelf-${s.shelfNumber}`,
          productIds: s.products.map((p) => p.sku),
        })),
        removedProductIds: removedItems.map((p) => p.sku),
        productEdits:
          Object.keys(productEdits).length > 0 ? productEdits : undefined,
      };

      const updated = await updateShelfArrangementMutation.mutateAsync({
        shelfId,
        arrangement,
      });
      if (updated) {
        toast({
          title: "Changes saved",
          description: "Your planogram edits have been saved.",
        });
        setHasChanges(false);
      } else {
        toast({
          title: "Save failed",
          description: "Could not update shelf. It may not exist.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Save failed",
        description: "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    preview,
    hasChanges,
    shelfId,
    localShelves,
    removedItems,
    toast,
  ]);

  const planogram = effectivePayload?.planogram;
  const metadata = effectivePayload?.metadata;
  const fixture = planogram?.fixture;
  const highDemandSkus =
    effectivePayload?.metadata?.stockingRules?.highDemandProducts ?? [];

  const baseShelves = useMemo(
    () => (localShelves.length > 0 ? localShelves : (fixture?.shelves ?? [])),
    [localShelves, fixture?.shelves]
  );

  const stats = useMemo(
    () => derivePlanogramStats(baseShelves, removedItems),
    [baseShelves, removedItems]
  );

  const shelvesToShow = useMemo(() => {
    if (selectedCategories.size === 0) return baseShelves;
    return baseShelves
      .map((s) => ({
        ...s,
        products: s.products.filter((p) => selectedCategories.has(p.category)),
      }))
      .filter((s) => s.products.length > 0);
  }, [baseShelves, selectedCategories]);

  const onToggleCategory = useCallback(
    (category: string) => {
      setSelectedCategories((prev) => {
        const all = stats.categoryList;
        const next = new Set(prev);
        if (prev.size === 0) {
          all.forEach((c) => next.add(c));
          next.delete(category);
        } else {
          if (next.has(category)) next.delete(category);
          else next.add(category);
        }
        return next;
      });
    },
    [stats.categoryList]
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <header className="flex flex-wrap items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back">
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : error ? (
                <h1 className="text-2xl font-bold text-destructive">
                  Error loading planogram
                </h1>
              ) : preview ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {preview.shelf.shelfName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    v{planogram?.version ?? "1.0"} {metadata?.location ?? "—"} ·{" "}
                    {metadata?.status ?? "active"}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">
                  Planogram not found
                </h1>
              )}
            </div>
            {hasChanges && !isPlaceholder && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="success"
              >
                <Check className="size-4" aria-hidden />
                {isSaving ? "Saving…" : "Save"}
              </Button>
            )}
          </header>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive font-medium">
                Failed to load planogram
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This shelf may not have planogram data, or it could not be loaded.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={PLANOGRAM_FALLBACK}>Back to list</Link>
              </Button>
            </div>
          )}

          {preview && !isLoading && (
            <div className="space-y-3">
              {isPlaceholder && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                  Sample planogram for display. Assign a planogram to this shelf to save edits.
                </div>
              )}
              <div
                className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6"
                role="region"
                aria-label="Planogram summary metrics"
              >
                <StatCard title="Shelves" value={stats.shelves} className="stat-card" />
                <StatCard title="SKUs" value={stats.skus} className="stat-card" />
                <StatCard
                  title="Front Facings"
                  value={stats.frontFacings}
                  className="stat-card"
                />
                <StatCard
                  title="Total Units (w/ depth)"
                  value={stats.totalUnits}
                  className="stat-card"
                />
                <StatCard
                  title="Categories"
                  value={stats.categories}
                  className="stat-card"
                />
                <StatCard
                  title="Removed"
                  value={stats.removed}
                  className="stat-card"
                />
              </div>

              <div>
                <p className="mb-0.5 text-xs font-medium text-foreground">
                  Categories
                </p>
                <CategoryFilterTags
                  categories={stats.categoryList}
                  selected={
                    selectedCategories.size === 0
                      ? new Set(stats.categoryList)
                      : selectedCategories
                  }
                  onToggle={onToggleCategory}
                />
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 space-y-2">
                  {shelvesToShow.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        No shelves match the selected categories
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Click a category pill above to include it in the view
                      </p>
                    </div>
                  ) : (
                    [...shelvesToShow]
                      .sort((a, b) => b.verticalPosition - a.verticalPosition)
                      .map((shelf) => (
                        <ShelfRow
                          key={shelf.shelfNumber}
                          shelf={shelf}
                          fixture={fixture}
                          highDemandSkus={highDemandSkus}
                          editHandlers={{
                            onEditName,
                            onEditCategory,
                            onEditFacingsDepth,
                            onRemoveProduct,
                            onMoveProduct,
                            onReorderProducts:
                              selectedCategories.size === 0
                                ? onReorderProducts
                                : undefined,
                          }}
                          dragHandlers={{
                            onDragStart: handleDragStart,
                            onDropOnShelf: handleDropOnShelf,
                            onDropOnRemoved: handleDropOnRemoved,
                          }}
                        />
                      ))
                  )}
                </div>
                <RemovedItemsSidebar
                  removedItems={removedItems}
                  shelves={baseShelves}
                  shelfCapacities={shelfCapacities}
                  // originalShelfAssignment={originalShelfAssignment}
                  onRestore={onRestoreProduct}
                  onRemoveFromShelf={(sku, shelfNumber) =>
                    onRemoveProduct(shelfNumber, sku)
                  }
                  onMoveFromSidebar={(sku, toShelfNumber) =>
                    onMoveProduct("removed", toShelfNumber, sku)
                  }
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
                <div className="min-w-0 overflow-x-auto">
                  <div className="min-w-275">
                    <ProductDetailsTable
                      shelves={shelvesToShow}
                      highDemandSkus={highDemandSkus}
                      units={fixture?.units}
                    />
                  </div>
                </div>
                <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card/80 p-3">
                  <StockingRulesSection
                    stockingRules={effectivePayload?.metadata?.stockingRules}
                  />
                </div>
              </div>
            </div>
          )}

          {!preview && !isLoading && !error && (
            <div className="rounded-xl border border-border bg-card/80 p-6 text-center">
              <p className="text-muted-foreground">Planogram not found.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={PLANOGRAM_FALLBACK}>Back to list</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
