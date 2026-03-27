/**
 * Planogram Analysis View Route
 * 
 * Visual preview of a saved planogram shelf.
 * This file was moved from index.tsx to allow for a dedicated Shelf Detail page.
 */
import { createFileRoute, Link, useLocation, useParams } from "@tanstack/react-router";
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
  planogramShelfPreviewKeys,
  usePlanogramShelfPreview,
  useUpdateShelfArrangement,
} from "@/queries/maker";
import { queryClient } from "@/queries/shared";
import { useToast } from "@/hooks/use-toast";
import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

export const Route = createFileRoute("/checker/shelf/$shelfId/analysis")({
  component: PlanogramAnalysisViewPage,
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

export function PlanogramAnalysisViewPage() {
  const { shelfId } = Route.useParams() as { shelfId: string };
  const location = useLocation();
  const params = useParams({ strict: false }) as { storeId?: string };
  const { toast } = useToast();
  const isAdmin = location.pathname.includes("/admin/");
  const storeId = params.storeId as string | undefined;
  const detailPath =
    isAdmin && storeId ? `/admin/${storeId}/shelf/${shelfId}` : `/checker/shelf/${shelfId}`;
  const { data: preview, isLoading, error } = usePlanogramShelfPreview(shelfId);
  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set()
  );

  const [categoryPositions, setCategoryPositions] = useState<Map<string, {
    shelfNumber: number;
    position: number; 
  }>>(new Map());

  const dragRef = useRef<{
    sku: string;
    fromShelf: number | "removed";
  } | null>(null);

  const toggleInProgressRef = useRef(false);
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

    const posMap = new Map<string, { shelfNumber: number; position: number }>();
    shelves.forEach((shelf) => {
      shelf.products.forEach((product, idx) => {
        posMap.set(product.sku, { shelfNumber: shelf.shelfNumber, position: idx });
      });
    });

    setLocalShelves(shelves);
    setRemovedItems(removed);
    setCategoryPositions(posMap);
    setHasChanges(false);
    setSelectedCategories(new Set());
  }, [preview]);

  const effectivePayload = preview?.planogramPayload ?? (preview ? PLANOGRAM_POC_002 : null);
  const isBlankShelf = !!preview && !preview.planogramPayload;

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

      setCategoryPositions((prev) => {
        const next = new Map(prev);
        productIds.forEach((sku, idx) => {
          next.set(sku, { shelfNumber, position: idx });
        });
        return next;
      });

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

      setCategoryPositions((prev) => {
        const next = new Map(prev);
        const targetShelf = localShelves.find((s) => s.shelfNumber === to);
        if (targetShelf) {
          const productIds = targetShelf.products.map((p) => p.sku);
          const targetIdx = targetSku ? productIds.indexOf(targetSku) : productIds.length;
          next.set(sku, { shelfNumber: to, position: targetIdx });
        }
        return next;
      });

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
    if (!preview || !preview.planogramPayload || !hasChanges || !shelfId) return;
    setIsSaving(true);
    try {
      const originalShelves = preview.planogramPayload.planogram.fixture.shelves;
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
        await queryClient.invalidateQueries({
          queryKey: planogramShelfPreviewKeys.all,
        });
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
    queryClient,
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

  const shelvesToShow = baseShelves;

  const onToggleCategory = useCallback(
    (category: string) => {
      if (toggleInProgressRef.current) {
        return;
      }

      toggleInProgressRef.current = true;

      setSelectedCategories((prevSelected) => {
        const isCurrentlyHidden = prevSelected.has(category);
        const nextSelected = new Set(prevSelected);

        if (isCurrentlyHidden) {
          nextSelected.delete(category);

          const toRestore = removedItems.filter((p) => p.category === category);

          const restoredSkus = new Set<string>(
            toRestore
              .filter((p) => categoryPositions.has(p.sku))
              .map((p) => p.sku)
          );

          setLocalShelves((prevShelves) => {
            return prevShelves.map((shelf) => {
              const newProducts = [...shelf.products];

              toRestore.forEach((product) => {
                const originalPos = categoryPositions.get(product.sku);
                if (
                  !originalPos ||
                  originalPos.shelfNumber !== shelf.shelfNumber
                )
                  return;

                const capacity = shelfCapacities[shelf.shelfNumber] ?? 0;
                const currentFacings = newProducts.reduce(
                  (sum, p) => sum + p.facings,
                  0
                );
                const hasSpace = currentFacings + product.facings <= capacity;

                if (hasSpace) {
                  const insertPos = Math.min(
                    originalPos.position,
                    newProducts.length
                  );
                  newProducts.splice(insertPos, 0, product);
                } else if (originalPos.position < newProducts.length) {
                  const occupant = newProducts[originalPos.position];
                  newProducts.splice(originalPos.position, 1, product);

                  setRemovedItems((items) => {
                    if (items.some((i) => i.sku === occupant.sku))
                      return items;
                    return [...items, occupant];
                  });
                }
              });

              return { ...shelf, products: newProducts };
            });
          });

          setTimeout(() => {
            setRemovedItems((prevRemoved) => {
              const filtered = prevRemoved.filter(
                (p) => !restoredSkus.has(p.sku)
              );

              return filtered;
            });
          }, 0);

          setHasChanges(true);
        } else {
          nextSelected.add(category);

          const toRemove = localShelves.flatMap((shelf) =>
            shelf.products.filter((p) => p.category === category)
          );

          setLocalShelves((prevShelves) => {
            return prevShelves.map((shelf) => ({
              ...shelf,
              products: shelf.products.filter((p) => p.category !== category),
            }));
          });

          setRemovedItems((prevRemoved) => {
            const existingSkus = new Set(prevRemoved.map((p) => p.sku));
            const newItems = toRemove.filter((p) => !existingSkus.has(p.sku));
            return [...prevRemoved, ...newItems];
          });

          setHasChanges(true);
        }

        setTimeout(() => {
          toggleInProgressRef.current = false;
        }, 100);

        return nextSelected;
      });
    },
    [removedItems, categoryPositions, shelfCapacities, localShelves]
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <header className="flex flex-wrap items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={detailPath as never}>
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back to Details</span>
              </Link>
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
                    {preview.shelf.shelfName} - Analysis
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isBlankShelf
                      ? "Sample planogram for display"
                      : `v${planogram?.version ?? "1.0"} ${metadata?.location ?? "—"} · ${metadata?.status ?? "active"}`}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">
                  Planogram not found
                </h1>
              )}
            </div>

            {hasChanges && !isBlankShelf && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="success"
              >
                <Check className="size-4" aria-hidden />
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            )}
          </header>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          )}

          {preview && !isLoading && (
            <div className="space-y-4">
              {isBlankShelf && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                  Sample planogram for display. Assign a planogram to this shelf to save edits.
                </div>
              )}
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
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
                <p className="mb-2 text-xs font-medium text-foreground">
                  Categories (Click to hide/show)
                </p>
                <CategoryFilterTags
                  categories={stats.categoryList}
                  selected={
                    new Set(stats.categoryList.filter(c => !selectedCategories.has(c)))
                  }
                  onToggle={onToggleCategory}
                />
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 space-y-4">
                  {shelvesToShow.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        No shelves available
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
                            onReorderProducts,
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
                  onRestore={onRestoreProduct}
                  onRemoveFromShelf={(skuList: string, shelfNo: number) =>
                    onRemoveProduct(shelfNo, skuList)
                  }
                  onMoveFromSidebar={(skuList: string, shelfNo: number) =>
                    onMoveProduct("removed", shelfNo, skuList)
                  }
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
                <StockingRulesSection stockingRules={metadata?.stockingRules} />
                <ProductDetailsTable 
                  shelves={baseShelves} 
                  highDemandSkus={highDemandSkus}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
