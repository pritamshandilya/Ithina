import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";
import { derivePlanogramStats } from "@/lib/planogram/planogram-derive-stats";
import {
  applyArrangementToFixtureShelves,
} from "@/lib/planogram/planogram-arrangement";
import {
  getPlanogramProductId,
  getShelfUsedWidth,
  normalizePlanogramShelves,
  normalizeShelfProductPositions,
} from "@/lib/planogram/planogram-schema";

interface UsePlanogramEditorStateParams {
  fixtureShelves: PlanogramShelfDef[];
  arrangement?: PlanogramArrangement;
  onCapacityError: (shelfName: string) => void;
}

export function usePlanogramEditorState({
  fixtureShelves,
  arrangement,
  onCapacityError,
}: UsePlanogramEditorStateParams) {
  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const { shelves, removed } = applyArrangementToFixtureShelves(
      fixtureShelves,
      arrangement,
    );
    setLocalShelves(shelves);
    setRemovedItems(removed);
    setHasChanges(false);
    setSelectedCategories(new Set());
  }, [arrangement, fixtureShelves]);

  const baseShelves = useMemo(
    () => (localShelves.length > 0 ? localShelves : normalizePlanogramShelves(fixtureShelves)),
    [fixtureShelves, localShelves],
  );

  const stats = useMemo(
    () => derivePlanogramStats(baseShelves, removedItems),
    [baseShelves, removedItems],
  );

  const mutateShelfProducts = useCallback(
    (shelfId: string, updater: (products: PlanogramProduct[]) => PlanogramProduct[]) => {
      setLocalShelves((previous) =>
        previous.map((shelf) =>
          shelf.id === shelfId
            ? { ...shelf, products: normalizeShelfProductPositions(updater(shelf.products)) }
            : shelf,
        ),
      );
      setHasChanges(true);
    },
    [],
  );

  const onEditName = useCallback((shelfId: string, productId: string, newName: string) => {
    mutateShelfProducts(shelfId, (products) =>
      products.map((product, index) =>
        getPlanogramProductId(product, `${shelfId}:${index}`) === productId
          ? { ...product, name: newName }
          : product,
      ),
    );
  }, [mutateShelfProducts]);

  const onEditCategory = useCallback((shelfId: string, productId: string, newCategory: string) => {
    mutateShelfProducts(shelfId, (products) =>
      products.map((product, index) =>
        getPlanogramProductId(product, `${shelfId}:${index}`) === productId
          ? { ...product, category: newCategory }
          : product,
      ),
    );
  }, [mutateShelfProducts]);

  const onEditFacingsDepth = useCallback(
    (shelfId: string, productId: string, updates: { facings?: number; depthCount?: number }) => {
      mutateShelfProducts(shelfId, (products) =>
        products.map((product, index) =>
          getPlanogramProductId(product, `${shelfId}:${index}`) === productId
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

  const onRemoveProduct = useCallback((shelfId: string, productId: string) => {
    const product = localShelves
      .find((shelf) => shelf.id === shelfId)
      ?.products.find(
        (item, index) =>
          getPlanogramProductId(item, `${shelfId}:${index}`) === productId,
      );
    if (!product) return;
    mutateShelfProducts(shelfId, (products) =>
      products.filter(
        (item, index) =>
          getPlanogramProductId(item, `${shelfId}:${index}`) !== productId,
      ),
    );
    setRemovedItems((previous) => [...previous, { ...product, size: { ...product.size } }]);
  }, [localShelves, mutateShelfProducts]);

  const onRestoreProduct = useCallback((shelfId: string, product: PlanogramProduct) => {
    mutateShelfProducts(shelfId, (products) => [...products, { ...product, size: { ...product.size } }]);
    setRemovedItems((previous) =>
      previous.filter((item, index) => getPlanogramProductId(item, `removed:${index}`) !== getPlanogramProductId(product, "restored")),
    );
  }, [mutateShelfProducts]);

  const onReorderProducts = useCallback((shelfId: string, productIds: string[]) => {
    mutateShelfProducts(shelfId, (products) => {
      const byId = new Map(
        products.map((product, index) => [
          getPlanogramProductId(product, `${shelfId}:${index}`),
          product,
        ]),
      );
      return productIds
        .map((id) => byId.get(id))
        .filter((product): product is PlanogramProduct => product != null);
    });
  }, [mutateShelfProducts]);

  const onMoveProduct = useCallback(
    (from: string | "removed", to: string, productId: string, targetProductId?: string) => {
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
      const currentWidth = getShelfUsedWidth(targetShelf) - (from === to ? incomingWidth : 0);
      if (currentWidth + incomingWidth > targetShelf.width) {
        onCapacityError(targetShelf.id);
        return;
      }

      setLocalShelves((previous) => {
        let next = [...previous];
        if (from !== "removed") {
          next = next.map((shelf) =>
            shelf.id === from
              ? {
                  ...shelf,
                  products: normalizeShelfProductPositions(
                    shelf.products.filter(
                      (item, index) =>
                        getPlanogramProductId(item, `${from}:${index}`) !== productId,
                    ),
                  ),
                }
              : shelf,
          );
        }

        return next.map((shelf) => {
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
                  getPlanogramProductId(item, `${to}:${index}`) === targetProductId,
              )
            : -1;
          if (insertionIndex >= 0) nextProducts.splice(insertionIndex, 0, sourceProduct);
          else nextProducts.push(sourceProduct);
          return { ...shelf, products: normalizeShelfProductPositions(nextProducts) };
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
    [localShelves, onCapacityError, removedItems],
  );

  return {
    localShelves,
    removedItems,
    hasChanges,
    selectedCategories,
    setSelectedCategories,
    stats,
    onEditName,
    onEditCategory,
    onEditFacingsDepth,
    onRemoveProduct,
    onRestoreProduct,
    onReorderProducts,
    onMoveProduct,
  };
}
