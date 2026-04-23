import { X } from "lucide-react";

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
  shelfId: string;
  productId: string;
  widthFraction: number;
  categoryColor?: string;
  shapeClass?: "rounded-md" | "rounded-xl";
  editHandlers?: PlanogramEditHandlers;
  className?: string;
}

export function ShelfProduct({
  product,
  shelfId,
  productId,
  widthFraction,
  categoryColor = "border-muted",
  shapeClass = "rounded-md",
  editHandlers,
  className,
}: ShelfProductProps) {
  const totalUnits = product.facings * (product.depth_count || 1);
  const isEditable = !!editHandlers;
  const depthCount = product.depth_count || 1;
  const fill = getCategoryFill(product.category ?? "");
  const accent = getCategoryAccent(product.category ?? "");
  const ProductSVG = getProductSVG(product.category ?? "");

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col rounded-md border border-border/70 bg-card/30 px-1 py-0.5 transition-colors",
        shapeClass,
        categoryColor,
        className,
      )}
      style={{ flex: `${widthFraction} 1 0%` }}
      role="article"
      aria-label={`${product.name}, ${product.facings} facings, ${product.depth_count} depth, ${totalUnits} units`}
    >
      {isEditable && (
        <button
          type="button"
          onClick={() => editHandlers.onRemoveProduct(shelfId, productId)}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-destructive/20 hover:opacity-100 group-hover:opacity-100"
          title="Remove product"
          aria-label={`Remove ${product.name}`}
        >
          <X className="size-3 text-slate-600 hover:text-destructive dark:text-muted-foreground" aria-hidden />
        </button>
      )}
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
          isEditable && "pr-8"
        )}
      >
        {isEditable ? (
          <InlineEdit
            value={product.name}
            onSave={(v) => editHandlers.onEditName(shelfId, productId, v)}
            className="text-left"
            aria-label="Edit product name"
          />
        ) : (
          <p title={product.name}>{product.name}</p>
        )}
      </div>
      <div className="min-w-0 truncate text-[10px] leading-tight text-stone-200 dark:text-muted-foreground">
        {isEditable ? (
          <InlineEdit
            value={product.category ?? "Uncategorized"}
            onSave={(v) => editHandlers.onEditCategory(shelfId, productId, v)}
            className="text-left text-inherit"
            aria-label="Edit category"
          />
        ) : (
          <p title={product.category ?? "Uncategorized"}>
            {product.category ?? "Uncategorized"}
          </p>
        )}
      </div>
      {isEditable ? (
        <InlineFacingsDepthEdit
          facings={product.facings}
          depthCount={product.depth_count}
          onSave={(updates) =>
            editHandlers.onEditFacingsDepth(shelfId, productId, updates)
          }
          className="text-stone-300 dark:text-muted-foreground"
        />
      ) : (
        <p className="mt-0.5 text-[10px] font-mono leading-tight text-stone-300 dark:text-muted-foreground">
          ×{product.facings} D{product.depth_count} ={totalUnits}
        </p>
      )}
    </div>
  );
}
