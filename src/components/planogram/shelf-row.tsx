/**
 * ShelfRow – single shelf with header and proportional product blocks
 * Shelves sorted by verticalPosition descending (top shelf first)
 */

import { ShelfProduct } from "./shelf-product";
import type { PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

export interface ShelfRowProps {
  shelf: PlanogramShelfDef;
  /** SKUs marked as high demand */
  highDemandSkus?: string[];
  /** Map category -> Tailwind bg class (M4) */
  getCategoryColor?: (category: string) => string;
  className?: string;
}

export function ShelfRow({
  shelf,
  highDemandSkus = [],
  getCategoryColor = () => "bg-muted",
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
      <div className="flex gap-1 overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
        {shelf.products.map((product) => (
          <ShelfProduct
            key={product.sku}
            product={product}
            widthFraction={totalFacings > 0 ? product.facings / totalFacings : 0}
            highDemandSkus={highDemandSkus}
            categoryColor={getCategoryColor(product.category)}
          />
        ))}
      </div>
    </section>
  );
}
