import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
} from "@/components/planogram";
import type { PlanogramEditHandlers } from "@/components/planogram/types";
import { Card, CardContent } from "@/components/ui/card";
import { derivePlanogramStats } from "@/lib/planogram/planogram-derive-stats";
import {
  getPlanogramProductId,
  getShelfUsedWidth,
  normalizePlanogramShelves,
  normalizeShelfProductPositions,
  sortPlanogramShelves,
} from "@/lib/planogram/planogram-schema";
import type {
  PlanogramPayload,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

interface PlanogramRenderedPreviewProps {
  payload: PlanogramPayload | null;
  isLoading?: boolean;
  embedded?: boolean;
}

export function PlanogramRenderedPreview({
  payload,
  isLoading = false,
  embedded = false,
}: PlanogramRenderedPreviewProps) {
  const [shelves, setShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const dragRef = useRef<{
    productId: string;
    fromShelf: string | "removed";
  } | null>(null);

  useEffect(() => {
    setShelves(payload ? normalizePlanogramShelves(payload.shelves) : []);
    setRemovedItems([]);
    setSelectedCategories(new Set());
  }, [payload]);

  const stats = useMemo(
    () => derivePlanogramStats(shelves, removedItems),
    [shelves, removedItems],
  );

  const shelvesToShow = useMemo(() => {
    if (selectedCategories.size === 0) return shelves;
    return shelves
      .map((shelf) => ({
        ...shelf,
        products: shelf.products.filter((product) =>
          selectedCategories.has(product.category ?? "Uncategorized"),
        ),
      }))
      .filter((shelf) => shelf.products.length > 0);
  }, [selectedCategories, shelves]);

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
      shelfId: string,
      updater: (products: PlanogramProduct[]) => PlanogramProduct[],
    ) => {
      setShelves((previous) =>
        previous.map((shelf) =>
          shelf.id === shelfId
            ? {
                ...shelf,
                products: normalizeShelfProductPositions(
                  updater(shelf.products),
                ),
              }
            : shelf,
        ),
      );
    },
    [],
  );

  const onEditName = useCallback(
    (shelfId: string, productId: string, newName: string) => {
      mutateShelfProducts(shelfId, (products) =>
        products.map((product, index) =>
          getPlanogramProductId(product, `${shelfId}:${index}`) === productId
            ? { ...product, name: newName }
            : product,
        ),
      );
    },
    [mutateShelfProducts],
  );

  const onEditCategory = useCallback(
    (shelfId: string, productId: string, newCategory: string) => {
      mutateShelfProducts(shelfId, (products) =>
        products.map((product, index) =>
          getPlanogramProductId(product, `${shelfId}:${index}`) === productId
            ? { ...product, category: newCategory }
            : product,
        ),
      );
    },
    [mutateShelfProducts],
  );

  const onEditFacingsDepth = useCallback(
    (
      shelfId: string,
      productId: string,
      updates: { facings?: number; depthCount?: number },
    ) => {
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
    setShelves((previous) => {
      const sourceShelf = previous.find((shelf) => shelf.id === shelfId);
      const product = sourceShelf?.products.find(
        (item, index) =>
          getPlanogramProductId(item, `${shelfId}:${index}`) === productId,
      );
      if (!product) return previous;
      setRemovedItems((items) => [
        ...items,
        { ...product, size: { ...product.size } },
      ]);
      return previous.map((shelf) =>
        shelf.id === shelfId
          ? {
              ...shelf,
              products: normalizeShelfProductPositions(
                shelf.products.filter(
                  (item, index) =>
                    getPlanogramProductId(item, `${shelfId}:${index}`) !==
                    productId,
                ),
              ),
            }
          : shelf,
      );
    });
  }, []);

  const onRestoreProduct = useCallback(
    (shelfId: string, product: PlanogramProduct) => {
      mutateShelfProducts(shelfId, (products) => [
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
          : shelves
              .find((shelf) => shelf.id === from)
              ?.products.find(
                (item, index) =>
                  getPlanogramProductId(item, `${from}:${index}`) === productId,
              );
      if (!sourceProduct) return;

      const targetShelf = shelves.find((shelf) => shelf.id === to);
      if (!targetShelf) return;

      const incomingWidth = sourceProduct.size.width * sourceProduct.facings;
      const currentWidth =
        getShelfUsedWidth(targetShelf) - (from === to ? incomingWidth : 0);

      if (currentWidth + incomingWidth > targetShelf.width) {
        return;
      }

      setShelves((previous) => {
        let next = [...previous];
        if (from !== "removed") {
          next = next.map((shelf) =>
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
    },
    [removedItems, shelves],
  );

  const onReorderProducts = useCallback(
    (shelfId: string, productIds: string[]) => {
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
    },
    [mutateShelfProducts],
  );

  const editHandlers: PlanogramEditHandlers = {
    onEditName,
    onEditCategory,
    onEditFacingsDepth,
    onRemoveProduct,
    onMoveProduct,
    onReorderProducts:
      selectedCategories.size === 0 ? onReorderProducts : undefined,
  };

  if (isLoading || !payload) {
    return null;
  }

  const content = (
    <CardContent
      className={embedded ? "space-y-3 px-0 pt-0 pb-0" : "space-y-3"}
    >
      {/* <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Shelves" value={stats.shelves} className="stat-card" />
        <StatCard title="SKUs" value={stats.skus} className="stat-card" />
        <StatCard title="Front Facings" value={stats.frontFacings} className="stat-card" />
        <StatCard title="Total Units" value={stats.totalUnits} className="stat-card" />
        <StatCard title="Categories" value={stats.categories} className="stat-card" />
        <StatCard title="Removed" value={stats.removed} className="stat-card" />
      </div> */}

      <CategoryFilterTags
        categories={stats.categoryList}
        selected={
          selectedCategories.size === 0
            ? new Set(stats.categoryList)
            : selectedCategories
        }
        onToggle={onToggleCategory}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          {sortPlanogramShelves(shelvesToShow).map((shelf) => (
            <ShelfRow
              key={shelf.id}
              shelf={shelf}
              allShelves={shelves}
              fixture={payload.fixture}
              editHandlers={editHandlers}
              dragHandlers={{
                onDragStart: (productId, fromShelf) => {
                  dragRef.current = { productId, fromShelf };
                },
                onDropOnShelf: (toShelfId, targetProductId) => {
                  if (!dragRef.current) return;
                  const { productId, fromShelf } = dragRef.current;
                  dragRef.current = null;
                  onMoveProduct(
                    fromShelf,
                    toShelfId,
                    productId,
                    targetProductId,
                  );
                },
                onDropOnRemoved: () => {
                  if (
                    !dragRef.current ||
                    dragRef.current.fromShelf === "removed"
                  )
                    return;
                  const { productId, fromShelf } = dragRef.current;
                  dragRef.current = null;
                  onRemoveProduct(fromShelf, productId);
                },
              }}
            />
          ))}
        </div>
        <RemovedItemsSidebar
          removedItems={removedItems}
          shelves={shelves}
          onRestore={onRestoreProduct}
          onRemoveFromShelf={onRemoveProduct}
          onMoveFromSidebar={(productId, toShelfId) =>
            onMoveProduct("removed", toShelfId, productId)
          }
        />
      </div>

      <div className="grid gap-3">
        <div className="min-w-0 overflow-x-auto">
          <div className="min-w-275">
            <ProductDetailsTable shelves={shelvesToShow} />
          </div>
        </div>
      </div>
    </CardContent>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return <Card className="border-border bg-card/80 pt-4">{content}</Card>;
}
