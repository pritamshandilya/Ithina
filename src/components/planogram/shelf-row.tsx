/**
 * ShelfRow – single shelf with header and proportional product blocks
 * Shelves sorted by verticalPosition descending (top shelf first)
 */

import {
  getCategoryColor as defaultGetCategoryColor,
  getProductShapeType,
} from "@/lib/constants/planogram";
import type { PlanogramShelfDef } from "@/types/planogram";

import { ShelfProduct } from "./shelf-product";
import type { PlanogramEditHandlers } from "./types";

export type { PlanogramEditHandlers as ShelfRowEditHandlers } from "./types";

export interface ShelfRowProps {
  shelf: PlanogramShelfDef;
  /** SKUs marked as high demand */
  highDemandSkus?: string[];
  /** Map category -> Tailwind bg class */
  getCategoryColor?: (category: string) => string;
  /** Edit handlers (when provided, product cards become editable) */
  editHandlers?: PlanogramEditHandlers;
  className?: string;
}

export function ShelfRow({
  shelf,
  highDemandSkus = [],
  getCategoryColor = defaultGetCategoryColor,
  editHandlers,
  className,
}: ShelfRowProps) {
  const totalFacings = shelf.products.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = shelf.products.reduce(
    (sum, p) => sum + p.facings * (p.depthCount || 1),
    0
  );

  return (
    <section
      className={className}
      aria-label={`Shelf ${shelf.shelfNumber}: ${shelf.name}`}
    >
      <header className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">{shelf.name}</h3>
        <span className="text-xs text-muted-foreground">
          {shelf.products.length} items · {totalFacings} facings · {totalUnits} units
        </span>
      </header>
      <div className="flex flex-col gap-0">
        <div className="flex gap-1 overflow-hidden rounded-t-lg border border-b-0 border-border bg-muted/20 p-2">
          {shelf.products.map((product) => (
          <ShelfProduct
            key={product.sku}
            product={product}
            shelfNumber={shelf.shelfNumber}
            widthFraction={totalFacings > 0 ? product.facings / totalFacings : 0}
            highDemandSkus={highDemandSkus}
            categoryColor={getCategoryColor(product.category)}
            shapeClass={
              getProductShapeType(product.category) === "bottle"
                ? "rounded-xl"
                : "rounded-md"
            }
            editHandlers={editHandlers}
          />
        ))}
        </div>
        {/* Shelf surface bar */}
        <div
          className="h-2 rounded-b-lg border border-t-0 border-border bg-gradient-to-b from-muted to-muted/60"
          aria-hidden
        />
      </div>
    </section>
  );
}
