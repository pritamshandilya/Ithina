import type {
  PlanogramArrangement,
  PlanogramPayload,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

export function getPlanogramProductId(
  product: PlanogramProduct,
  fallback = "product",
): string {
  if (product.sku?.trim()) return product.sku.trim();
  if (product.barcode?.trim()) return product.barcode.trim();
  return `${fallback}:${product.brand}:${product.name}:${product.x_position}`;
}

export function sortPlanogramProducts(
  products: PlanogramProduct[],
): PlanogramProduct[] {
  return [...products].sort((a, b) => a.x_position - b.x_position);
}

export function sortPlanogramShelves(
  shelves: PlanogramShelfDef[],
): PlanogramShelfDef[] {
  return [...shelves].sort((a, b) => b.y_position - a.y_position);
}

export function normalizeShelfProductPositions(
  products: PlanogramProduct[],
): PlanogramProduct[] {
  let nextPosition = 0;

  return sortPlanogramProducts(products).map((product) => {
    const normalized = { ...product, x_position: nextPosition };
    nextPosition += product.size.width * product.facings;
    return normalized;
  });
}

export function clonePlanogramShelves(
  shelves: PlanogramShelfDef[],
): PlanogramShelfDef[] {
  return shelves.map((shelf) => ({
    ...shelf,
    products: shelf.products.map((product) => ({
      ...product,
      size: { ...product.size },
    })),
  }));
}

export function normalizePlanogramShelves(
  shelves: PlanogramShelfDef[],
): PlanogramShelfDef[] {
  return sortPlanogramShelves(
    clonePlanogramShelves(shelves).map((shelf) => ({
      ...shelf,
      products: normalizeShelfProductPositions(shelf.products),
    })),
  );
}

export function getShelfUsedWidth(shelf: PlanogramShelfDef): number {
  return shelf.products.reduce(
    (sum, product) => sum + product.size.width * product.facings,
    0,
  );
}

export function getShelfDisplayNumber(
  shelves: PlanogramShelfDef[],
  shelfId: string,
): number {
  const index = sortPlanogramShelves(shelves).findIndex((shelf) => shelf.id === shelfId);
  return index >= 0 ? index + 1 : 0;
}

export function getShelfDisplayLabel(
  shelves: PlanogramShelfDef[],
  shelfId: string,
): string {
  const number = getShelfDisplayNumber(shelves, shelfId);
  return number > 0 ? `Shelf ${number}` : "Shelf";
}

export function applyArrangementToPlanogram(
  payload: PlanogramPayload,
  arrangement?: PlanogramArrangement,
): { shelves: PlanogramShelfDef[]; removed: PlanogramProduct[] } {
  let shelves = normalizePlanogramShelves(payload.shelves);
  const removed: PlanogramProduct[] = [];

  if (arrangement?.productEdits) {
    shelves = shelves.map((shelf) => ({
      ...shelf,
      products: shelf.products.map((product, index) => {
        const productId = getPlanogramProductId(product, `${shelf.id}:${index}`);
        const edits = arrangement.productEdits?.[productId];
        if (!edits) return product;
        return {
          ...product,
          ...(edits.name != null ? { name: edits.name } : {}),
          ...(edits.category != null ? { category: edits.category } : {}),
          ...(edits.facings != null ? { facings: edits.facings } : {}),
          ...(edits.depthCount != null
            ? { depth_count: edits.depthCount }
            : {}),
        };
      }),
    }));
  }

  if (arrangement?.removedProductIds?.length) {
    const removedSet = new Set(arrangement.removedProductIds);
    for (const shelf of shelves) {
      shelf.products.forEach((product, index) => {
        const productId = getPlanogramProductId(product, `${shelf.id}:${index}`);
        if (removedSet.has(productId)) removed.push(product);
      });
    }

    shelves = shelves.map((shelf) => ({
      ...shelf,
      products: shelf.products.filter((product, index) => {
        const productId = getPlanogramProductId(product, `${shelf.id}:${index}`);
        return !removedSet.has(productId);
      }),
    }));
  }

  if (arrangement?.shelfOrder?.length) {
    const orderMap = new Map(
      arrangement.shelfOrder.map((item) => [item.shelfId, item.productIds]),
    );

    shelves = shelves.map((shelf) => {
      const productIds = orderMap.get(shelf.id);
      if (!productIds?.length) {
        return {
          ...shelf,
          products: normalizeShelfProductPositions(shelf.products),
        };
      }

      const byId = new Map(
        shelf.products.map((product, index) => [
          getPlanogramProductId(product, `${shelf.id}:${index}`),
          product,
        ]),
      );

      const ordered = productIds
        .map((id) => byId.get(id))
        .filter((product): product is PlanogramProduct => product != null);

      return {
        ...shelf,
        products: normalizeShelfProductPositions(
          ordered.length ? ordered : shelf.products,
        ),
      };
    });
  } else {
    shelves = shelves.map((shelf) => ({
      ...shelf,
      products: normalizeShelfProductPositions(shelf.products),
    }));
  }

  return { shelves: sortPlanogramShelves(shelves), removed };
}
