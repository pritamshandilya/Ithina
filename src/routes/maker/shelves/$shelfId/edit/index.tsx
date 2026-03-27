

/**
 * Planogram Preview Route
 *
 * Visual preview of a saved planogram shelf.
 * Editable: product name, category, facings/depth; remove products.
 * Drag-and-drop: reorder within shelf, move between shelves, restore from removed.
 * Access at: /maker/audits/planogram/:shelfId
 */
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@/components/layouts/main";
import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
  StockingRulesSection,
  ShelfInfoModal,
} from "@/components/planogram";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  fetchPlanogramShelfPreview,
} from "@/store/slices/planogramPreviewSlice";
import {
  selectPlanogramPreview,
  selectPlanogramPreviewError,
  selectPlanogramPreviewLoading,
} from "@/store/selectors";
import { updateShelfArrangementThunk } from "@/store/slices/shelvesSlice";
import { useToast } from "@/hooks/use-toast";
import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

export const Route = createFileRoute("/maker/shelves/$shelfId/edit/")({
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

const SHELVES_FALLBACK = "/maker/shelves";

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();
  const { toast } = useToast();
  const router = useRouter();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const preview = useSelector(selectPlanogramPreview);
  const isLoading = useSelector(selectPlanogramPreviewLoading);
  const error = useSelector(selectPlanogramPreviewError);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: SHELVES_FALLBACK });
    }
  };
  useEffect(() => {
    if (shelfId) {
      dispatch(fetchPlanogramShelfPreview(shelfId));
    }
  }, [dispatch, shelfId]);
  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set()
  );

  const [categoryPositions, setCategoryPositions] = useState<Map<string, {
    shelfNumber: number;
    position: number; // index in products array
  }>>(new Map());

  const dragRef = useRef<{
    sku: string;
    fromShelf: number | "removed";
  } | null>(null);

  const toggleInProgressRef = useRef(false);

  useEffect(() => {
    const payload = preview?.planogramPayload;
    if (!preview || !payload?.planogram.fixture.shelves) return;
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
  }, [preview, preview?.planogramPayload?.planogram.fixture.shelves, preview?.shelf.arrangement]);

  const shelfCapacities = useMemo(() => {
    const orig = preview?.planogramPayload?.planogram.fixture.shelves ?? [];
    return Object.fromEntries(
      orig.map((s) => [
        s.shelfNumber,
        s.products.reduce((sum, p) => sum + p.facings, 0),
      ])
    );
  }, [preview?.planogramPayload?.planogram?.fixture?.shelves]);

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

      // Update position tracking
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
      const originalShelves = preview.planogramPayload?.planogram.fixture.shelves;
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

      const action = await dispatch(
        updateShelfArrangementThunk({ shelfId, arrangement }),
      );
      const updated = action.payload;
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
  }, [preview, hasChanges, shelfId, localShelves, removedItems, toast, dispatch]);

  const planogram = preview?.planogramPayload?.planogram;
  const metadata = preview?.planogramPayload?.metadata;
  const fixture = planogram?.fixture;
  const highDemandSkus =
    preview?.planogramPayload?.stockingRules?.highDemandProducts ?? [];
  const isBlankShelf = !!preview && !preview.planogramPayload;

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

          // console.log(
          //   `Restoring category "${category}": ${restoredSkus.size} products to restore`,
          //   Array.from(restoredSkus)
          // );

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
      <div className="min-h-screen bg-primary pt-1 px-2 pb-4 sm:pt-2 sm:px-2 sm:pb-4 lg:pt-3 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-2">
          <header className="flex flex-wrap items-center gap-2">
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
                    {isBlankShelf
                      ? "Blank shelf · Add products in a future release"
                      : `v${planogram?.version ?? "1.0"} ${metadata?.location ?? "—"} · ${metadata?.status ?? "active"}`}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">
                  Planogram not found
                </h1>
              )}
            </div>

            {/* {preview && !isBlankShelf && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsInfoModalOpen(true)}
                className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
                title="View Shelf Information"
              >
                <Info className="size-4" aria-hidden />
              </Button>
            )} */}

            {hasChanges && (
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
                <Link to={SHELVES_FALLBACK}>Back to shelves</Link>
              </Button>
            </div>
          )}

          {preview && !isLoading && isBlankShelf && (
            <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
              <p className="font-medium text-foreground">Blank shelf</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This shelf has no planogram. Product arrangement and editing will be available in a future release.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={SHELVES_FALLBACK}>Back to shelves</Link>
              </Button>
            </div>
          )}

          {preview && !isLoading && !isBlankShelf && (
            <div className="space-y-3">
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
                    // Invert logic: selected = visible (not hidden)
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

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
                <div className="min-w-0 overflow-x-auto">
                  <div className="min-w-275">
                    <ProductDetailsTable
                      shelves={shelvesToShow}
                      highDemandSkus={highDemandSkus}
                      units={fixture?.units}
                    />
                  </div>
                </div>
                <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card/80 p-4">
                  <StockingRulesSection
                    stockingRules={preview.planogramPayload?.stockingRules}
                  />
                </div>
              </div>
            </div>
          )}

          {!preview && !isLoading && !error && (
            <div className="rounded-xl border border-border bg-card/80 p-6 text-center">
              <p className="text-muted-foreground">Planogram not found.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={SHELVES_FALLBACK}>Back to shelves</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      {preview?.planogramPayload && (
        <ShelfInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          payload={preview.planogramPayload}
          stats={stats}
        />
      )}
    </MainLayout>
  );
}
