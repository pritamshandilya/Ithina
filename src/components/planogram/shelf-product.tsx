/**
 * ShelfProduct – single product block in a shelf row
 * Width proportional to facings; displays name, category, facings/depth/units
 * Category colors and shape (box/bottle) from M4
 */

import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlanogramProduct } from "@/types/planogram";

import type { PlanogramEditHandlers } from "./types";

export interface ShelfProductProps {
  product: PlanogramProduct;
  shelfNumber: number;
  /** Width as fraction of total shelf facings (0–1) */
  widthFraction: number;
  /** SKUs marked as high demand */
  highDemandSkus?: string[];
  /** Category color for block background (Tailwind bg-* class) */
  categoryColor?: string;
  /** Shape: "box" = square corners, "bottle" = rounded */
  shapeClass?: "rounded-md" | "rounded-xl";
  /** Edit handlers (M2: wire to InlineEdit) */
  editHandlers?: PlanogramEditHandlers;
  className?: string;
}

export function ShelfProduct({
  product,
  shelfNumber,
  widthFraction,
  highDemandSkus = [],
  categoryColor = "bg-muted",
  shapeClass = "rounded-md",
  editHandlers: _editHandlers,
  className,
}: ShelfProductProps) {
  const totalUnits = product.facings * (product.depthCount || 1);
  const isHighDemand = highDemandSkus.includes(product.sku);

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col border border-border p-2 transition-colors",
        shapeClass,
        categoryColor,
        isHighDemand && "ring-2 ring-amber-400 ring-offset-2",
        className
      )}
      style={{ flex: `${widthFraction} 1 0%` }}
      role="article"
      aria-label={`${product.name}, ${product.facings} facings, ${product.depthCount} depth, ${totalUnits} units`}
    >
      {isHighDemand && (
        <span
          className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
          title="High demand product"
        >
          <Zap className="size-2.5" aria-hidden />
          HIGH
        </span>
      )}
      <p
        className={cn(
          "truncate text-xs font-medium text-foreground",
          isHighDemand && "pr-12"
        )}
        title={product.name}
      >
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
