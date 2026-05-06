import { X } from "lucide-react";

import { InlineEdit } from "./InlineEdit";
import { InlineFacingsDepthEdit } from "./InlineFacingsDepthEdit";
import { getProductSVG } from "./productSvgUtils";
import type { PlanogramEditHandlers } from "./types";
import { getCategoryAccent, getCategoryFill } from "@/lib/constants/planogram";
import { cn } from "@/lib/utils";
import type { PlanogramProduct } from "@/types/planogram";

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
  categoryColor = "border-border/70",
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
        "group relative flex min-w-0 flex-col rounded-md border px-1 py-0.5 shadow-sm transition-[filter,box-shadow]",
        "border-border/60 bg-card/75 hover:shadow-md hover:brightness-95",
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
          className="hover:bg-destructive/20 absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
          title="Remove product"
          aria-label={`Remove ${product.name}`}
        >
          <X
            className="text-foreground/70 hover:text-destructive size-3"
            aria-hidden
          />
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
          "text-foreground min-w-0 truncate text-[11px] leading-tight font-medium",
          isEditable && "pr-8",
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
      <div className="text-foreground/80 min-w-0 truncate text-[10px] leading-tight">
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
          className="text-foreground/80"
        />
      ) : (
        <p className="text-foreground/80 mt-0.5 font-mono text-[10px] leading-tight">
          ×{product.facings} D{product.depth_count} ={totalUnits}
        </p>
      )}
    </div>
  );
}
