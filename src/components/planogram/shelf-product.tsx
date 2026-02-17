/**
 * ShelfProduct – single product block in a shelf row
 * Width proportional to facings; displays name, category, facings/depth/units
 */

import { cn } from "@/lib/utils";
import type { PlanogramProduct } from "@/types/planogram";

export interface ShelfProductProps {
  product: PlanogramProduct;
  /** Width as fraction of total shelf facings (0–1) */
  widthFraction: number;
  /** SKUs marked as high demand (badge in M4) */
  highDemandSkus?: string[];
  /** Category color for block background (M4) */
  categoryColor?: string;
  className?: string;
}

export function ShelfProduct({
  product,
  widthFraction,
  highDemandSkus = [],
  categoryColor = "bg-muted",
  className,
}: ShelfProductProps) {
  const totalUnits = product.facings * (product.depthCount || 1);
  const isHighDemand = highDemandSkus.includes(product.sku);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-md border border-border p-2 transition-colors",
        categoryColor,
        isHighDemand && "ring-2 ring-amber-400 ring-offset-2",
        className
      )}
      style={{ flex: `${widthFraction} 1 0%` }}
      role="article"
      aria-label={`${product.name}, ${product.facings} facings, ${product.depthCount} depth, ${totalUnits} units`}
    >
      <p className="truncate text-xs font-medium text-foreground" title={product.name}>
        {product.name}
      </p>
      <p className="truncate text-[10px] text-muted-foreground" title={product.category}>
        {product.category}
      </p>
      <p className="mt-1 text-[10px] font-mono text-muted-foreground">
        ×{product.facings} D{product.depthCount} ={totalUnits}
      </p>
    </div>
  );
}
