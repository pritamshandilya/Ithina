import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

function deepCopyShelves(shelves: PlanogramShelfDef[]): PlanogramShelfDef[] {
  return shelves.map((s) => ({
    ...s,
    products: s.products.map((p) => ({ ...p })),
  }));
}

function derivePlanogramStats(
  shelves: PlanogramShelfDef[],
  removedItems: PlanogramProduct[],
) {
  const allProducts = shelves.flatMap((s) => s.products);
  const uniqueSkus = new Set([...allProducts, ...removedItems].map((p) => p.sku)).size;
  const frontFacings = allProducts.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = allProducts.reduce(
    (sum, p) => sum + p.facings * (p.depthCount || 1),
    0,
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

interface UsePlanogramEditorStateParams {
  fixtureShelves: PlanogramShelfDef[];
  arrangement?: PlanogramArrangement;
  shelfCapacities: Record<number, number>;
  onCapacityError: (shelfName: string) => void;
}

export function usePlanogramEditorState({
  fixtureShelves,
  arrangement,
  shelfCapacities,
  onCapacityError,
}: UsePlanogramEditorStateParams) {
  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const [categoryPositions, setCategoryPositions] = useState<
    Map<string, { shelfNumber: number; position: number }>
  >(new Map());
  const dragRef = useRef<{ sku: string; fromShelf: number | "removed" } | null>(null);
  const toggleInProgressRef = useRef(false);

  useEffect(() => {
    let shelves = deepCopyShelves(fixtureShelves);
    const removed: PlanogramProduct[] = [];

    if (arrangement?.productEdits) {
      shelves = shelves.map((s) => ({
        ...s,
        products: s.products.map((p) => {
          const edits = arrangement.productEdits?.[p.sku];
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
        arrangement.shelfOrder.map((o) => [o.shelfId.replace("shelf-", ""), o.productIds]),
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
  }, [fixtureShelves, arrangement]);

  const onEditName = useCallback((shelfNumber: number, sku: string, newName: string) => {
    setLocalShelves((prev) =>
      prev.map((s) =>
        s.shelfNumber === shelfNumber
          ? { ...s, products: s.products.map((p) => (p.sku === sku ? { ...p, name: newName } : p)) }
          : s,
      ),
    );
    setHasChanges(true);
  }, []);

  const onEditCategory = useCallback((shelfNumber: number, sku: string, newCategory: string) => {
    setLocalShelves((prev) =>
      prev.map((s) =>
        s.shelfNumber === shelfNumber
          ? { ...s, products: s.products.map((p) => (p.sku === sku ? { ...p, category: newCategory } : p)) }
          : s,
      ),
    );
    setHasChanges(true);
  }, []);

  const onEditFacingsDepth = useCallback(
    (shelfNumber: number, sku: string, updates: { facings?: number; depthCount?: number }) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) =>
                  p.sku === sku
                    ? {
                        ...p,
                        facings: updates.facings ?? p.facings,
                        depthCount: updates.depthCount ?? p.depthCount,
                      }
                    : p,
                ),
              }
            : s,
        ),
      );
      setHasChanges(true);
    },
    [],
  );

  const onRemoveProduct = useCallback((shelfNumber: number, sku: string) => {
    const product = localShelves
      .find((s) => s.shelfNumber === shelfNumber)
      ?.products.find((p) => p.sku === sku);
    if (!product) return;
    setLocalShelves((prev) =>
      prev.map((s) =>
        s.shelfNumber === shelfNumber
          ? { ...s, products: s.products.filter((p) => p.sku !== sku) }
          : s,
      ),
    );
    setRemovedItems((prev) => [...prev, product]);
    setHasChanges(true);
  }, [localShelves]);

  const onRestoreProduct = useCallback((shelfNumber: number, product: PlanogramProduct) => {
    setLocalShelves((prev) =>
      prev.map((s) =>
        s.shelfNumber === shelfNumber ? { ...s, products: [...s.products, { ...product }] } : s,
      ),
    );
    setRemovedItems((prev) => prev.filter((p) => p.sku !== product.sku));
    setHasChanges(true);
  }, []);

  const onReorderProducts = useCallback((shelfNumber: number, productIds: string[]) => {
    setLocalShelves((prev) =>
      prev.map((s) => {
        if (s.shelfNumber !== shelfNumber) return s;
        const bySku = new Map(s.products.map((p) => [p.sku, p]));
        const reordered = productIds
          .map((id) => bySku.get(id))
          .filter((p): p is PlanogramProduct => p != null);
        return { ...s, products: reordered };
      }),
    );
    setCategoryPositions((prev) => {
      const next = new Map(prev);
      productIds.forEach((sku, idx) => next.set(sku, { shelfNumber, position: idx }));
      return next;
    });
    setHasChanges(true);
  }, []);

  const onMoveProduct = useCallback(
    (from: number | "removed", to: number, sku: string, targetSku?: string) => {
      const productToMove =
        from === "removed"
          ? removedItems.find((p) => p.sku === sku)
          : localShelves.find((s) => s.shelfNumber === from)?.products.find((p) => p.sku === sku);
      if (!productToMove) return;

      if (from !== to) {
        const targetShelf = localShelves.find((s) => s.shelfNumber === to);
        if (targetShelf) {
          const currentFacings = targetShelf.products.reduce((sum, p) => sum + p.facings, 0);
          const capacity = shelfCapacities[to] ?? 0;
          if (currentFacings + productToMove.facings > capacity) {
            onCapacityError(targetShelf.name);
            return;
          }
        }
      }

      setLocalShelves((prev) => {
        let nextShelves = [...prev];
        if (from !== "removed") {
          nextShelves = nextShelves.map((s) =>
            s.shelfNumber === from ? { ...s, products: s.products.filter((p) => p.sku !== sku) } : s,
          );
        }
        return nextShelves.map((s) => {
          if (s.shelfNumber !== to) return s;
          const targetIdx = targetSku ? s.products.findIndex((p) => p.sku === targetSku) : -1;
          const newProducts = [...s.products];
          if (targetIdx !== -1) newProducts.splice(targetIdx, 0, productToMove);
          else newProducts.push(productToMove);
          return { ...s, products: newProducts };
        });
      });

      if (from === "removed") {
        setRemovedItems((items) => items.filter((p) => p.sku !== sku));
      }
      setHasChanges(true);
    },
    [localShelves, removedItems, shelfCapacities, onCapacityError],
  );

  const handleDragStart = useCallback((sku: string, fromShelf: number | "removed") => {
    dragRef.current = { sku, fromShelf };
  }, []);

  const handleDropOnShelf = useCallback((toShelfNumber: number, targetSku?: string) => {
    if (!dragRef.current) return;
    const { sku, fromShelf } = dragRef.current;
    dragRef.current = null;
    onMoveProduct(fromShelf, toShelfNumber, sku, targetSku);
  }, [onMoveProduct]);

  const handleDropOnRemoved = useCallback(() => {
    if (!dragRef.current) return;
    const { sku, fromShelf } = dragRef.current;
    dragRef.current = null;
    if (fromShelf === "removed") return;
    onRemoveProduct(fromShelf, sku);
  }, [onRemoveProduct]);

  const onToggleCategory = useCallback(
    (category: string) => {
      if (toggleInProgressRef.current) return;
      toggleInProgressRef.current = true;

      setSelectedCategories((prevSelected) => {
        const isHidden = prevSelected.has(category);
        const nextSelected = new Set(prevSelected);
        if (isHidden) nextSelected.delete(category);
        else nextSelected.add(category);
        setTimeout(() => {
          toggleInProgressRef.current = false;
        }, 100);
        return nextSelected;
      });
    },
    [],
  );

  const stats = useMemo(
    () => derivePlanogramStats(localShelves, removedItems),
    [localShelves, removedItems],
  );

  return {
    localShelves,
    removedItems,
    hasChanges,
    setHasChanges,
    selectedCategories,
    categoryPositions,
    stats,
    onToggleCategory,
    onEditName,
    onEditCategory,
    onEditFacingsDepth,
    onRemoveProduct,
    onRestoreProduct,
    onReorderProducts,
    onMoveProduct,
    handleDragStart,
    handleDropOnShelf,
    handleDropOnRemoved,
    setLocalShelves,
    setRemovedItems,
  };
}
