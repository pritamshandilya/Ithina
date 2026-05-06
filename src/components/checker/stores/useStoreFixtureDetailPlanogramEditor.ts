import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useToast } from "@/hooks/useToast";
import { derivePlanogramStats } from "@/lib/planogram/planogramDeriveStats";
import {
  applyArrangementToPlanogram,
  getPlanogramProductId,
  getShelfUsedWidth,
  normalizePlanogramShelves,
  normalizeShelfProductPositions,
} from "@/lib/planogram/planogramSchema";
import { useUpdateShelfArrangement } from "@/queries/maker";
import type { PlanogramShelfPreview } from "@/queries/maker/hooks/usePlanogramShelfPreview";
import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

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
  const dragRef = useRef<{
    productId: string;
    fromShelf: string | "removed";
  } | null>(null);

  useEffect(() => {
    if (!preview) return;
    const payload = resolvedPlanogramPayload;
    if (!payload) {
      setLocalShelves([]);
      setRemovedItems([]);
      setHasChanges(false);
      setSelectedCategories(new Set());
      return;
    }

    const arrangement = preview.shelf.arrangement as
      | PlanogramArrangement
      | undefined;
    const { shelves, removed } = applyArrangementToPlanogram(
      payload,
      arrangement,
    );
    setLocalShelves(shelves);
    setRemovedItems(removed);
    setHasChanges(false);
    setSelectedCategories(new Set());
  }, [preview, resolvedPlanogramPayload]);

  const effectivePayload = resolvedPlanogramPayload;
  const planogramFixture = effectivePayload?.fixture;

  const baseShelves = useMemo(
    () =>
      localShelves.length > 0
        ? localShelves
        : normalizePlanogramShelves(effectivePayload?.shelves ?? []),
    [effectivePayload?.shelves, localShelves],
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
          selectedCategories.has(product.category ?? "Uncategorized"),
        ),
      }))
      .filter((shelf) => shelf.products.length > 0);
  }, [baseShelves, selectedCategories]);

  const onToggleCategory = useCallback(
    (category: string) => {
      setSelectedCategories((previous) => {
        const next = new Set(previous);
        if (previous.size === 0) {
          stats.categoryList.forEach((item) => next.add(item));
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

  const mutateShelfProducts = useCallback(
    (
      targetShelfId: string,
      updater: (products: PlanogramProduct[]) => PlanogramProduct[],
    ) => {
      setLocalShelves((previous) =>
        previous.map((shelf) =>
          shelf.id === targetShelfId
            ? {
                ...shelf,
                products: normalizeShelfProductPositions(
                  updater(shelf.products),
                ),
              }
            : shelf,
        ),
      );
      setHasChanges(true);
    },
    [],
  );

  const onEditName = useCallback(
    (targetShelfId: string, productId: string, newName: string) => {
      mutateShelfProducts(targetShelfId, (products) =>
        products.map((product, index) =>
          getPlanogramProductId(product, `${targetShelfId}:${index}`) ===
          productId
            ? { ...product, name: newName }
            : product,
        ),
      );
    },
    [mutateShelfProducts],
  );

  const onEditCategory = useCallback(
    (targetShelfId: string, productId: string, newCategory: string) => {
      mutateShelfProducts(targetShelfId, (products) =>
        products.map((product, index) =>
          getPlanogramProductId(product, `${targetShelfId}:${index}`) ===
          productId
            ? { ...product, category: newCategory }
            : product,
        ),
      );
    },
    [mutateShelfProducts],
  );

  const onEditFacingsDepth = useCallback(
    (
      targetShelfId: string,
      productId: string,
      updates: { facings?: number; depthCount?: number },
    ) => {
      mutateShelfProducts(targetShelfId, (products) =>
        products.map((product, index) =>
          getPlanogramProductId(product, `${targetShelfId}:${index}`) ===
          productId
            ? {
                ...product,
                facings: updates.facings ?? product.facings,
                depth_count: updates.depthCount ?? product.depth_count,
              }
            : product,
        ),
      );
    },
    [mutateShelfProducts],
  );

  const onRemoveProduct = useCallback(
    (targetShelfId: string, productId: string) => {
      const product = localShelves
        .find((shelf) => shelf.id === targetShelfId)
        ?.products.find(
          (item, index) =>
            getPlanogramProductId(item, `${targetShelfId}:${index}`) ===
            productId,
        );
      if (!product) return;

      mutateShelfProducts(targetShelfId, (products) =>
        products.filter(
          (item, index) =>
            getPlanogramProductId(item, `${targetShelfId}:${index}`) !==
            productId,
        ),
      );
      setRemovedItems((previous) => [
        ...previous,
        { ...product, size: { ...product.size } },
      ]);
    },
    [localShelves, mutateShelfProducts],
  );

  const onRestoreProduct = useCallback(
    (targetShelfId: string, product: PlanogramProduct) => {
      mutateShelfProducts(targetShelfId, (products) => [
        ...products,
        { ...product, size: { ...product.size } },
      ]);
      setRemovedItems((previous) =>
        previous.filter(
          (item, index) =>
            getPlanogramProductId(item, `removed:${index}`) !==
            getPlanogramProductId(product, "restored"),
        ),
      );
    },
    [mutateShelfProducts],
  );

  const onReorderProducts = useCallback(
    (targetShelfId: string, productIds: string[]) => {
      mutateShelfProducts(targetShelfId, (products) => {
        const byId = new Map(
          products.map((product, index) => [
            getPlanogramProductId(product, `${targetShelfId}:${index}`),
            product,
          ]),
        );
        return productIds
          .map((id) => byId.get(id))
          .filter((product): product is PlanogramProduct => product != null);
      });
    },
    [mutateShelfProducts],
  );

  const onMoveProduct = useCallback(
    (
      from: string | "removed",
      to: string,
      productId: string,
      targetProductId?: string,
    ) => {
      const sourceProduct =
        from === "removed"
          ? removedItems.find(
              (item, index) =>
                getPlanogramProductId(item, `removed:${index}`) === productId,
            )
          : localShelves
              .find((shelf) => shelf.id === from)
              ?.products.find(
                (item, index) =>
                  getPlanogramProductId(item, `${from}:${index}`) === productId,
              );
      if (!sourceProduct) return;

      const targetShelf = localShelves.find((shelf) => shelf.id === to);
      if (!targetShelf) return;

      const incomingWidth = sourceProduct.size.width * sourceProduct.facings;
      const currentWidth =
        getShelfUsedWidth(targetShelf) - (from === to ? incomingWidth : 0);

      if (currentWidth + incomingWidth > targetShelf.width) {
        toast({
          title: "Shelf full",
          description: `${targetShelf.id} does not have enough space.`,
          variant: "destructive",
        });
        return;
      }

      setLocalShelves((previous) => {
        let nextShelves = [...previous];
        if (from !== "removed") {
          nextShelves = nextShelves.map((shelf) =>
            shelf.id === from
              ? {
                  ...shelf,
                  products: normalizeShelfProductPositions(
                    shelf.products.filter(
                      (item, index) =>
                        getPlanogramProductId(item, `${from}:${index}`) !==
                        productId,
                    ),
                  ),
                }
              : shelf,
          );
        }

        return nextShelves.map((shelf) => {
          if (shelf.id !== to) return shelf;
          const nextProducts =
            from === to
              ? shelf.products.filter(
                  (item, index) =>
                    getPlanogramProductId(item, `${to}:${index}`) !== productId,
                )
              : [...shelf.products];
          const insertionIndex = targetProductId
            ? nextProducts.findIndex(
                (item, index) =>
                  getPlanogramProductId(item, `${to}:${index}`) ===
                  targetProductId,
              )
            : -1;
          const productToInsert = {
            ...sourceProduct,
            size: { ...sourceProduct.size },
          };
          if (insertionIndex >= 0)
            nextProducts.splice(insertionIndex, 0, productToInsert);
          else nextProducts.push(productToInsert);
          return {
            ...shelf,
            products: normalizeShelfProductPositions(nextProducts),
          };
        });
      });

      if (from === "removed") {
        setRemovedItems((previous) =>
          previous.filter(
            (item, index) =>
              getPlanogramProductId(item, `removed:${index}`) !== productId,
          ),
        );
      }
      setHasChanges(true);
    },
    [localShelves, removedItems, toast],
  );

  const handleSaveArrangement = useCallback(async () => {
    const payload = preview?.planogramPayload;
    if (!preview || !payload || !hasChanges) return;
    setIsSavingArrangement(true);
    try {
      const originalShelves = normalizePlanogramShelves(payload.shelves);
      const productEdits: NonNullable<PlanogramArrangement["productEdits"]> =
        {};

      for (const shelf of localShelves) {
        for (const [index, product] of shelf.products.entries()) {
          const productId = getPlanogramProductId(
            product,
            `${shelf.id}:${index}`,
          );
          const original = originalShelves
            .find((item) => item.id === shelf.id)
            ?.products.find(
              (candidate, candidateIndex) =>
                getPlanogramProductId(
                  candidate,
                  `${shelf.id}:${candidateIndex}`,
                ) === productId,
            );
          if (!original) continue;

          const edits: {
            name?: string;
            category?: string;
            facings?: number;
            depthCount?: number;
          } = {};
          if (product.name !== original.name) edits.name = product.name;
          if ((product.category ?? "") !== (original.category ?? ""))
            edits.category = product.category ?? "";
          if (product.facings !== original.facings)
            edits.facings = product.facings;
          if (product.depth_count !== original.depth_count)
            edits.depthCount = product.depth_count;
          if (Object.keys(edits).length > 0) productEdits[productId] = edits;
        }
      }

      await updateShelfArrangementMutation.mutateAsync({
        shelfId,
        arrangement: {
          shelfOrder: localShelves.map((shelf) => ({
            shelfId: shelf.id,
            productIds: shelf.products.map((product, index) =>
              getPlanogramProductId(product, `${shelf.id}:${index}`),
            ),
          })),
          removedProductIds: removedItems.map((product, index) =>
            getPlanogramProductId(product, `removed:${index}`),
          ),
          productEdits:
            Object.keys(productEdits).length > 0 ? productEdits : undefined,
        },
      });
      setHasChanges(false);
      toast({
        title: "Changes saved",
        description: "Planogram arrangement was updated.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "An error occurred while saving planogram arrangement.",
        variant: "destructive",
      });
    } finally {
      setIsSavingArrangement(false);
    }
  }, [
    hasChanges,
    localShelves,
    preview,
    removedItems,
    shelfId,
    toast,
    updateShelfArrangementMutation,
  ]);

  return {
    isMissingPlanogram: !!preview && !effectivePayload,
    effectivePayload,
    planogramFixture,
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
