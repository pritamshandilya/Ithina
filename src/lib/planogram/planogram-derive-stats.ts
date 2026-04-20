import type { PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

export function derivePlanogramStats(
  shelves: PlanogramShelfDef[],
  removedItems: PlanogramProduct[],
) {
  const allProducts = shelves.flatMap((shelf) => shelf.products);
  const uniqueSkus = new Set(
    [...allProducts, ...removedItems].map((product) => product.sku),
  ).size;
  const frontFacings = allProducts.reduce((sum, product) => sum + product.facings, 0);
  const totalUnits = allProducts.reduce(
    (sum, product) => sum + product.facings * (product.depthCount || 1),
    0,
  );
  const categorySet = new Set(
    [...allProducts, ...removedItems].map((product) => product.category),
  );
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
