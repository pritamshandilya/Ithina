/**
 * ShelfProduct – single product block in a shelf row
 * SVG-based product shapes with facings/depth layers; inline edit when editHandlers provided
 */

import { X, Zap } from "lucide-react";

import {
  getCategoryAccent,
  getCategoryFill,
} from "@/lib/constants/planogram";
import { cn } from "@/lib/utils";
import type { PlanogramProduct } from "@/types/planogram";

import type { PlanogramEditHandlers } from "./types";
import { InlineEdit } from "./inline-edit";
import { InlineFacingsDepthEdit } from "./inline-facings-depth-edit";
import { getProductSVG } from "./product-svg-utils";

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
  categoryColor = "border-muted",
  shapeClass = "rounded-md",
  editHandlers,
  className,
}: ShelfProductProps) {
  const totalUnits = product.facings * (product.depthCount || 1);
  const isHighDemand = highDemandSkus.includes(product.sku);
  const isEditable = !!editHandlers;
  const depthCount = product.depthCount || 1;
  const fill = getCategoryFill(product.category);
  const accent = getCategoryAccent(product.category);
  const ProductSVG = getProductSVG(product.category);

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col border border-border px-1 py-0.5 transition-colors",
        shapeClass,
        categoryColor,
        isHighDemand && "ring-[3px] ring-yellow-400/80 ring-offset-1",
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
          <X className="size-3 text-slate-600 hover:text-destructive dark:text-muted-foreground" aria-hidden />
        </button>
      )}
      {isHighDemand && (
        <span
          className="absolute left-1 top-1 z-10 flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
          title="High demand product"
        >
          <Zap className="size-2.5" aria-hidden />
          HIGH
        </span>
      )}
      {/* SVG product shapes: facings columns × depth layers */}
      <div className="flex items-end justify-center gap-0.5">
        {Array.from({ length: product.facings }, (_, colIdx) => (
          <div
            key={colIdx}
            className="relative flex h-10 flex-1 items-end justify-center"
          >
            {Array.from({ length: depthCount }, (_, depthIdx) => {
              const t = depthCount > 1 ? depthIdx / (depthCount - 1) : 1;
              const opacity = 0.7 + t * 0.3;
              const scale = 0.9 + t * 0.06;
              const translateY = depthIdx * 2;
              const translateX = depthIdx * 1.5;
              return (
                <div
                  key={depthIdx}
                  className="absolute bottom-0 left-1/2 h-8 w-5"
                  style={{
                    opacity,
                    transform: `translateX(calc(-50% + ${translateX}px)) translateY(${-translateY}px) scale(${scale})`,
                    zIndex: depthIdx,
                  }}
                >
                  <ProductSVG fill={fill} accent={accent} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        className={cn(
          "min-w-0 truncate text-[11px] font-medium leading-tight text-slate-900 dark:text-foreground",
          isHighDemand && "pl-10",
          isEditable && "pr-8"
        )}
      >
        {isEditable ? (
          <InlineEdit
            value={product.name}
            onSave={(v) => editHandlers.onEditName(shelfNumber, product.sku, v)}
            className={`text-left`}
            aria-label="Edit product name"
          />
        ) : (
          <p title={product.name}>{product.name}</p>
        )}
      </div>
      <div
        className={cn(
          "min-w-0 truncate text-[10px] leading-tight text-stone-200 dark:text-muted-foreground",
          isHighDemand && "pl-10"
        )}
      >
        {isEditable ? (
          <InlineEdit
            value={product.category}
            onSave={(v) => editHandlers.onEditCategory(shelfNumber, product.sku, v)}
            className="text-left text-inherit"
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
          className="text-stone-300 dark:text-muted-foreground"
        />
      ) : (
        <p className="mt-0.5 text-[10px] font-mono leading-tight text-stone-300 dark:text-muted-foreground">
          ×{product.facings} D{product.depthCount} ={totalUnits}
        </p>
      )}
    </div>
  );
}
