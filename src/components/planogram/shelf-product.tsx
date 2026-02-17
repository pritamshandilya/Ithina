/**
 * ShelfProduct – single product block in a shelf row
 * Width proportional to facings; displays name, category, facings/depth/units
 * Inline edit for name, category, facings/depth when editHandlers provided
 */

import { X, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlanogramProduct } from "@/types/planogram";

import type { PlanogramEditHandlers } from "./types";
import { InlineEdit } from "./inline-edit";
import { InlineFacingsDepthEdit } from "./inline-facings-depth-edit";

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
  /** Edit handlers (when provided, product card becomes editable) */
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
  editHandlers,
  className,
}: ShelfProductProps) {
  const totalUnits = product.facings * (product.depthCount || 1);
  const isHighDemand = highDemandSkus.includes(product.sku);
  const isEditable = !!editHandlers;

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col border border-border p-2 transition-colors",
        shapeClass,
        categoryColor,
        isHighDemand && "ring-2 ring-amber-400 ring-offset-2",
        className
      )}
      style={{ flex: `${widthFraction} 1 0%` }}
      role="article"
      aria-label={`${product.name}, ${product.facings} facings, ${product.depthCount} depth, ${totalUnits} units`}
    >
      {isEditable && (
        <button
          type="button"
          onClick={() => editHandlers.onRemoveProduct(shelfNumber, product.sku)}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-destructive/20 hover:opacity-100 group-hover:opacity-100"
          title="Remove product"
          aria-label={`Remove ${product.name}`}
        >
          <X className="size-3 text-muted-foreground hover:text-destructive" aria-hidden />
        </button>
      )}
      {isHighDemand && (
        <span
          className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
          title="High demand product"
        >
          <Zap className="size-2.5" aria-hidden />
          HIGH
        </span>
      )}
      <div
        className={cn(
          "min-w-0 truncate text-xs font-medium text-foreground",
          isHighDemand && "pl-10",
          isEditable && "pr-8"
        )}
      >
        {isEditable ? (
          <InlineEdit
            value={product.name}
            onSave={(v) => editHandlers.onEditName(shelfNumber, product.sku, v)}
            className="text-left"
            aria-label="Edit product name"
          />
        ) : (
          <p title={product.name}>{product.name}</p>
        )}
      </div>
      <div
        className={cn(
          "min-w-0 truncate text-[10px] text-muted-foreground",
          isHighDemand && "pl-10"
        )}
      >
        {isEditable ? (
          <InlineEdit
            value={product.category}
            onSave={(v) => editHandlers.onEditCategory(shelfNumber, product.sku, v)}
            className="text-left"
            aria-label="Edit category"
          />
        ) : (
          <p title={product.category}>{product.category}</p>
        )}
      </div>
      {isEditable ? (
        <InlineFacingsDepthEdit
          facings={product.facings}
          depthCount={product.depthCount}
          onSave={(updates) =>
            editHandlers.onEditFacingsDepth(shelfNumber, product.sku, updates)
          }
        />
      ) : (
        <p className="mt-1 text-[10px] font-mono text-muted-foreground">
          ×{product.facings} D{product.depthCount} ={totalUnits}
        </p>
      )}
    </div>
  );
}
