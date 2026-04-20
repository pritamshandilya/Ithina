import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { applyArrangementToFixtureShelves } from "@/lib/planogram/planogram-arrangement";
import { derivePlanogramStats } from "@/lib/planogram/planogram-derive-stats";
import type { PlanogramShelfPreview } from "@/queries/maker/hooks/usePlanogramShelfPreview";
import { useUpdateShelfArrangement } from "@/queries/maker";
import type { PlanogramArrangement, PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

interface UseStoreFixtureDetailPlanogramEditorParams {
  shelfId: string;
  preview: PlanogramShelfPreview | null | undefined;
  resolvedPlanogramPayload: PlanogramShelfPreview["planogramPayload"];
}

export function useStoreFixtureDetailPlanogramEditor({
  shelfId,
  preview,
  resolvedPlanogramPayload,
}: UseStoreFixtureDetailPlanogramEditorParams) {
  const { toast } = useToast();
  const updateShelfArrangementMutation = useUpdateShelfArrangement();

  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSavingArrangement, setIsSavingArrangement] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const dragRef = useRef<{ sku: string; fromShelf: number | "removed" } | null>(null);

  useEffect(() => {
    if (!preview) return;
    const payload = resolvedPlanogramPayload;
    if (!payload?.planogram?.fixture?.shelves) {
      setLocalShelves([]);
      setRemovedItems([]);
      setHasChanges(false);
      setSelectedCategories(new Set());
      return;
    }
    const arrangement = preview.shelf.arrangement as PlanogramArrangement | undefined;
    const { shelves, removed } = applyArrangementToFixtureShelves(
      payload.planogram.fixture.shelves,
      arrangement,
    );
    setLocalShelves(shelves);
    setRemovedItems(removed);
    setHasChanges(false);
    setSelectedCategories(new Set());
  }, [preview, resolvedPlanogramPayload]);

  const effectivePayload = resolvedPlanogramPayload;
  const planogram = effectivePayload?.planogram;
  const planogramFixture = planogram?.fixture;
  const highDemandSkus =
    effectivePayload?.metadata?.stockingRules?.highDemandProducts ?? [];

  const shelfCapacities = useMemo(() => {
    const originalShelves = effectivePayload?.planogram?.fixture?.shelves ?? [];
    return Object.fromEntries(
      originalShelves.map((shelf) => [
        shelf.shelfNumber,
        shelf.products.reduce((sum, product) => sum + product.facings, 0),
      ]),
    );
  }, [effectivePayload?.planogram?.fixture?.shelves]);

  const baseShelves = useMemo(
    () => (localShelves.length > 0 ? localShelves : (planogramFixture?.shelves ?? [])),
    [localShelves, planogramFixture?.shelves],
  );

  const stats = useMemo(
    () => derivePlanogramStats(baseShelves, removedItems),
    [baseShelves, removedItems],
  );

  const shelvesToShow = useMemo(() => {
    if (selectedCategories.size === 0) return baseShelves;
    return baseShelves
      .map((shelf) => ({
        ...shelf,
        products: shelf.products.filter((product) =>
          selectedCategories.has(product.category),
        ),
      }))
      .filter((shelf) => shelf.products.length > 0);
  }, [baseShelves, selectedCategories]);

  const onToggleCategory = useCallback(
    (category: string) => {
      setSelectedCategories((previous) => {
        const next = new Set(previous);
        if (previous.size === 0) {
          for (const item of stats.categoryList) {
            next.add(item);
          }
          next.delete(category);
          return next;
        }
        if (next.has(category)) next.delete(category);
        else next.add(category);
        return next;
      });
    },
    [stats.categoryList],
  );

  const onEditName = useCallback((shelfNumber: number, sku: string, newName: string) => {
    setLocalShelves((previous) =>
      previous.map((shelf) =>
        shelf.shelfNumber === shelfNumber
          ? {
              ...shelf,
              products: shelf.products.map((product) =>
                product.sku === sku ? { ...product, name: newName } : product,
              ),
            }
          : shelf,
      ),
    );
    setHasChanges(true);
  }, []);

  const onEditCategory = useCallback(
    (shelfNumber: number, sku: string, newCategory: string) => {
      setLocalShelves((previous) =>
        previous.map((shelf) =>
          shelf.shelfNumber === shelfNumber
            ? {
                ...shelf,
                products: shelf.products.map((product) =>
                  product.sku === sku ? { ...product, category: newCategory } : product,
                ),
              }
            : shelf,
        ),
      );
      setHasChanges(true);
    },
    [],
  );

  const onEditFacingsDepth = useCallback(
    (
      shelfNumber: number,
      sku: string,
      updates: { facings?: number; depthCount?: number },
    ) => {
      setLocalShelves((previous) =>
        previous.map((shelf) =>
          shelf.shelfNumber === shelfNumber
            ? {
                ...shelf,
                products: shelf.products.map((product) =>
                  product.sku === sku
                    ? {
                        ...product,
                        facings: updates.facings ?? product.facings,
                        depthCount: updates.depthCount ?? product.depthCount,
                      }
                    : product,
                ),
              }
            : shelf,
        ),
      );
      setHasChanges(true);
    },
    [],
  );

  const onRemoveProduct = useCallback(
    (shelfNumber: number, sku: string) => {
      const product = localShelves
        .find((shelf) => shelf.shelfNumber === shelfNumber)
        ?.products.find((item) => item.sku === sku);
      if (!product) return;
      setLocalShelves((previous) =>
        previous.map((shelf) =>
          shelf.shelfNumber === shelfNumber
            ? { ...shelf, products: shelf.products.filter((item) => item.sku !== sku) }
            : shelf,
        ),
      );
      setRemovedItems((previous) => [...previous, product]);
      setHasChanges(true);
    },
    [localShelves],
  );

  const onRestoreProduct = useCallback((shelfNumber: number, product: PlanogramProduct) => {
    setLocalShelves((previous) =>
      previous.map((shelf) =>
        shelf.shelfNumber === shelfNumber
          ? { ...shelf, products: [...shelf.products, { ...product }] }
          : shelf,
      ),
    );
    setRemovedItems((previous) => previous.filter((item) => item.sku !== product.sku));
    setHasChanges(true);
  }, []);

  const onReorderProducts = useCallback((shelfNumber: number, productIds: string[]) => {
    setLocalShelves((previous) =>
      previous.map((shelf) => {
        if (shelf.shelfNumber !== shelfNumber) return shelf;
        const bySku = new Map(shelf.products.map((product) => [product.sku, product]));
        return {
          ...shelf,
          products: productIds
            .map((id) => bySku.get(id))
            .filter((product): product is PlanogramProduct => product != null),
        };
      }),
    );
    setHasChanges(true);
  }, []);

  const onMoveProduct = useCallback(
    (from: number | "removed", to: number, sku: string, targetSku?: string) => {
      const sourceProduct =
        from === "removed"
          ? removedItems.find((item) => item.sku === sku)
          : localShelves
              .find((shelf) => shelf.shelfNumber === from)
              ?.products.find((item) => item.sku === sku);
      if (!sourceProduct) return;
      const targetShelf = localShelves.find((shelf) => shelf.shelfNumber === to);
      if (from !== to && targetShelf) {
        const currentFacings = targetShelf.products.reduce((sum, item) => sum + item.facings, 0);
        const capacity = shelfCapacities[to] ?? 0;
        if (currentFacings + sourceProduct.facings > capacity) {
          toast({
            title: "Shelf full",
            description: `${targetShelf.name} does not have enough space.`,
            variant: "destructive",
          });
          return;
        }
      }
      setLocalShelves((previous) => {
        let nextShelves = [...previous];
        if (from !== "removed") {
          nextShelves = nextShelves.map((shelf) =>
            shelf.shelfNumber === from
              ? { ...shelf, products: shelf.products.filter((item) => item.sku !== sku) }
              : shelf,
          );
        }
        return nextShelves.map((shelf) => {
          if (shelf.shelfNumber !== to) return shelf;
          const targetIndex = targetSku
            ? shelf.products.findIndex((item) => item.sku === targetSku)
            : -1;
          const nextProducts = [...shelf.products];
          if (targetIndex >= 0) nextProducts.splice(targetIndex, 0, sourceProduct);
          else nextProducts.push(sourceProduct);
          return { ...shelf, products: nextProducts };
        });
      });
      if (from === "removed") {
        setRemovedItems((previous) => previous.filter((item) => item.sku !== sku));
      }
      setHasChanges(true);
    },
    [localShelves, removedItems, shelfCapacities, toast],
  );

  const handleSaveArrangement = useCallback(async () => {
    const payload = preview?.planogramPayload;
    if (!preview || !payload || !hasChanges) return;
    setIsSavingArrangement(true);
    try {
      const originalShelves = payload.planogram.fixture.shelves;
      const productEdits: NonNullable<PlanogramArrangement["productEdits"]> = {};
      for (const shelf of localShelves) {
        for (const product of shelf.products) {
          const original = originalShelves
            .flatMap((item) => item.products)
            .find((item) => item.sku === product.sku);
          if (!original) continue;
          const edits: {
            name?: string;
            category?: string;
            facings?: number;
            depthCount?: number;
          } = {};
          if (product.name !== original.name) edits.name = product.name;
          if (product.category !== original.category) edits.category = product.category;
          if (product.facings !== original.facings) edits.facings = product.facings;
          if (product.depthCount !== original.depthCount) edits.depthCount = product.depthCount;
          if (Object.keys(edits).length > 0) productEdits[product.sku] = edits;
        }
      }
      await updateShelfArrangementMutation.mutateAsync({
        shelfId,
        arrangement: {
          shelfOrder: localShelves.map((shelf) => ({
            shelfId: `shelf-${shelf.shelfNumber}`,
            productIds: shelf.products.map((product) => product.sku),
          })),
          removedProductIds: removedItems.map((product) => product.sku),
          productEdits: Object.keys(productEdits).length > 0 ? productEdits : undefined,
        },
      });
      setHasChanges(false);
      toast({ title: "Changes saved", description: "Planogram arrangement was updated." });
    } catch {
      toast({
        title: "Save failed",
        description: "An error occurred while saving planogram arrangement.",
        variant: "destructive",
      });
    } finally {
      setIsSavingArrangement(false);
    }
  }, [hasChanges, localShelves, preview, removedItems, shelfId, toast, updateShelfArrangementMutation]);

  return {
    isMissingPlanogram: !!preview && !effectivePayload,
    effectivePayload,
    planogramFixture,
    highDemandSkus,
    shelfCapacities,
    baseShelves,
    stats,
    shelvesToShow,
    selectedCategories,
    removedItems,
    hasChanges,
    isSavingArrangement,
    dragRef,
    onToggleCategory,
    editHandlers: {
      onEditName,
      onEditCategory,
      onEditFacingsDepth,
      onRemoveProduct,
      onMoveProduct,
      onReorderProducts,
    },
    onRestoreProduct,
    handleSaveArrangement,
  };
}
