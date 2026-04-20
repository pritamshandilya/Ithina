import type { PlanogramArrangement, PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

export function deepCopyShelves(shelves: PlanogramShelfDef[]): PlanogramShelfDef[] {
  return shelves.map((shelf) => ({
    ...shelf,
    products: shelf.products.map((product) => ({ ...product })),
  }));
}

/**
 * Applies saved shelf arrangement (edits, removals, order) onto fixture shelves from planogram payload.
 */
export function applyArrangementToFixtureShelves(
  fixtureShelves: PlanogramShelfDef[],
  arrangement: PlanogramArrangement | undefined,
): { shelves: PlanogramShelfDef[]; removed: PlanogramProduct[] } {
  let shelves = deepCopyShelves(fixtureShelves);
  const removed: PlanogramProduct[] = [];

  if (arrangement?.productEdits) {
    shelves = shelves.map((shelf) => ({
      ...shelf,
      products: shelf.products.map((product) => {
        const edits = arrangement.productEdits?.[product.sku];
        if (!edits) return product;
        return {
          ...product,
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
      for (const product of shelf.products) {
        if (removedSet.has(product.sku)) removed.push(product);
      }
    }
    shelves = shelves.map((shelf) => ({
      ...shelf,
      products: shelf.products.filter((product) => !removedSet.has(product.sku)),
    }));
  }

  if (arrangement?.shelfOrder?.length) {
    const orderMap = new Map(
      arrangement.shelfOrder.map((item) => [
        item.shelfId.replace("shelf-", ""),
        item.productIds,
      ]),
    );
    shelves = shelves.map((shelf) => {
      const productIds = orderMap.get(String(shelf.shelfNumber));
      if (!productIds?.length) return shelf;
      const bySku = new Map(shelf.products.map((product) => [product.sku, product]));
      const ordered = productIds
        .map((id) => bySku.get(id))
        .filter((product): product is PlanogramProduct => product != null);
      return { ...shelf, products: ordered.length ? ordered : shelf.products };
    });
  }

  return { shelves, removed };
}
