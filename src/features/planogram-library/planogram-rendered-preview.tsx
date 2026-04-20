import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
  StockingRulesSection,
} from "@/components/planogram";
import type { PlanogramEditHandlers } from "@/components/planogram/types";
import { StatCard } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { derivePlanogramStats } from "@/lib/planogram/planogram-derive-stats";
import type { PlanogramPayload, PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

interface PlanogramRenderedPreviewProps {
  payload: PlanogramPayload | null;
  isLoading?: boolean;
  embedded?: boolean;
}

function cloneShelves(shelves: PlanogramShelfDef[]): PlanogramShelfDef[] {
  return shelves.map((shelf) => ({
    ...shelf,
    products: shelf.products.map((product) => ({ ...product })),
  }));
}

export function PlanogramRenderedPreview({
  payload,
  isLoading = false,
  embedded = false,
}: PlanogramRenderedPreviewProps) {
  const fixture = payload?.planogram?.fixture;
  const highDemandSkus = payload?.metadata?.stockingRules?.highDemandProducts ?? [];
  const stockingRules = payload?.metadata?.stockingRules;

  const [shelves, setShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const dragRef = useRef<{ sku: string; fromShelf: number | "removed" } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShelves(cloneShelves(fixture?.shelves ?? []));
    setRemovedItems([]);
    setSelectedCategories(new Set());
  }, [fixture]);

  const shelfCapacities = useMemo(() => {
    const source = fixture?.shelves ?? [];
    return Object.fromEntries(
      source.map((shelf) => [
        shelf.shelfNumber,
        shelf.products.reduce((sum, product) => sum + product.facings, 0),
      ]),
    );
  }, [fixture?.shelves]);

  const stats = useMemo(() => derivePlanogramStats(shelves, removedItems), [shelves, removedItems]);

  const shelvesToShow = useMemo(() => {
    if (selectedCategories.size === 0) return shelves;
    return shelves
      .map((shelf) => ({
        ...shelf,
        products: shelf.products.filter((product) => selectedCategories.has(product.category)),
      }))
      .filter((shelf) => shelf.products.length > 0);
  }, [selectedCategories, shelves]);

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
    setShelves((previous) =>
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
  }, []);

  const onEditCategory = useCallback((shelfNumber: number, sku: string, newCategory: string) => {
    setShelves((previous) =>
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
  }, []);

  const onEditFacingsDepth = useCallback(
    (shelfNumber: number, sku: string, updates: { facings?: number; depthCount?: number }) => {
      setShelves((previous) =>
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
    },
    [],
  );

  const onRemoveProduct = useCallback((shelfNumber: number, sku: string) => {
    setShelves((previous) => {
      const sourceShelf = previous.find((shelf) => shelf.shelfNumber === shelfNumber);
      const product = sourceShelf?.products.find((item) => item.sku === sku);
      if (!product) return previous;
      setRemovedItems((items) => [...items, { ...product }]);
      return previous.map((shelf) =>
        shelf.shelfNumber === shelfNumber
          ? { ...shelf, products: shelf.products.filter((item) => item.sku !== sku) }
          : shelf,
      );
    });
  }, []);

  const onRestoreProduct = useCallback((shelfNumber: number, product: PlanogramProduct) => {
    setShelves((previous) =>
      previous.map((shelf) =>
        shelf.shelfNumber === shelfNumber
          ? { ...shelf, products: [...shelf.products, { ...product }] }
          : shelf,
      ),
    );
    setRemovedItems((previous) => previous.filter((item) => item.sku !== product.sku));
  }, []);

  const onMoveProduct = useCallback(
    (from: number | "removed", to: number, sku: string, targetSku?: string) => {
      const sourceProduct =
        from === "removed"
          ? removedItems.find((item) => item.sku === sku)
          : shelves.find((shelf) => shelf.shelfNumber === from)?.products.find((item) => item.sku === sku);
      if (!sourceProduct) return;

      setShelves((previous) => {
        let next = [...previous];
        if (from !== "removed") {
          next = next.map((shelf) =>
            shelf.shelfNumber === from
              ? { ...shelf, products: shelf.products.filter((item) => item.sku !== sku) }
              : shelf,
          );
        }

        return next.map((shelf) => {
          if (shelf.shelfNumber !== to) return shelf;
          const insertionIndex = targetSku
            ? shelf.products.findIndex((item) => item.sku === targetSku)
            : -1;
          const nextProducts = [...shelf.products];
          if (insertionIndex >= 0) nextProducts.splice(insertionIndex, 0, { ...sourceProduct });
          else nextProducts.push({ ...sourceProduct });
          return { ...shelf, products: nextProducts };
        });
      });

      if (from === "removed") {
        setRemovedItems((previous) => previous.filter((item) => item.sku !== sku));
      }
    },
    [removedItems, shelves],
  );

  const onReorderProducts = useCallback((shelfNumber: number, productIds: string[]) => {
    setShelves((previous) =>
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
  }, []);

  const editHandlers: PlanogramEditHandlers = {
    onEditName,
    onEditCategory,
    onEditFacingsDepth,
    onRemoveProduct,
    onMoveProduct,
    onReorderProducts: selectedCategories.size === 0 ? onReorderProducts : undefined,
  };

  if (isLoading) {
    return null;
  }

  if (!fixture) {
    return null;
  }

  const content = (
    <CardContent className={embedded ? "space-y-3 px-0 pb-0 pt-0" : "space-y-3"}>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard title="Shelves" value={stats.shelves} className="stat-card" />
          <StatCard title="SKUs" value={stats.skus} className="stat-card" />
          <StatCard title="Front Facings" value={stats.frontFacings} className="stat-card" />
          <StatCard title="Total Units (w/ depth)" value={stats.totalUnits} className="stat-card" />
          <StatCard title="Categories" value={stats.categories} className="stat-card" />
          <StatCard title="Removed" value={stats.removed} className="stat-card" />
        </div>

        <CategoryFilterTags
          categories={stats.categoryList}
          selected={selectedCategories.size === 0 ? new Set(stats.categoryList) : selectedCategories}
          onToggle={onToggleCategory}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-2">
            {[...shelvesToShow]
              .sort((a, b) => b.verticalPosition - a.verticalPosition)
              .map((shelf) => (
                <ShelfRow
                  key={shelf.shelfNumber}
                  shelf={shelf}
                  fixture={fixture}
                  highDemandSkus={highDemandSkus}
                  editHandlers={editHandlers}
                  dragHandlers={{
                    onDragStart: (sku, fromShelf) => {
                      dragRef.current = { sku, fromShelf };
                    },
                    onDropOnShelf: (toShelfNumber, targetSku) => {
                      if (!dragRef.current) return;
                      const { sku, fromShelf } = dragRef.current;
                      dragRef.current = null;
                      onMoveProduct(fromShelf, toShelfNumber, sku, targetSku);
                    },
                    onDropOnRemoved: () => {
                      if (!dragRef.current || dragRef.current.fromShelf === "removed") return;
                      const { sku, fromShelf } = dragRef.current;
                      dragRef.current = null;
                      onRemoveProduct(fromShelf as number, sku);
                    },
                  }}
                />
              ))}
          </div>
          <RemovedItemsSidebar
            removedItems={removedItems}
            shelves={shelves}
            shelfCapacities={shelfCapacities}
            onRestore={onRestoreProduct}
            onRemoveFromShelf={(sku, shelfNumber) => onRemoveProduct(shelfNumber, sku)}
            onMoveFromSidebar={(sku, toShelfNumber) => onMoveProduct("removed", toShelfNumber, sku)}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
          <div className="min-w-0 overflow-x-auto">
            <div className="min-w-275">
              <ProductDetailsTable shelves={shelvesToShow} highDemandSkus={highDemandSkus} units={fixture.units} />
            </div>
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card/80 p-3">
            <StockingRulesSection stockingRules={stockingRules} />
          </div>
        </div>
      </CardContent>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return <Card className="border-border bg-card/80 pt-4">{content}</Card>;
}
