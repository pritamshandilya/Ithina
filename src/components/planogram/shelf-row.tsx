/**
 * ShelfRow – single shelf with header and proportional product blocks
 * Shelves sorted by verticalPosition descending (top shelf first)
 * Supports drag-and-drop reordering when editHandlers.onReorderProducts is provided
 */

import { useCallback, useState } from "react";

import {
  getCategoryColor as defaultGetCategoryColor,
  getProductShapeType,
} from "@/lib/constants/planogram";
import { cn } from "@/lib/utils";
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

  const canReorder = !!editHandlers?.onReorderProducts;
  const [draggedSku, setDraggedSku] = useState<string | null>(null);
  const [dropTargetSku, setDropTargetSku] = useState<string | null>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetSku: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedSku !== targetSku) setDropTargetSku(targetSku);
    },
    [draggedSku]
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetSku(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetSku: string) => {
      e.preventDefault();
      setDraggedSku(null);
      setDropTargetSku(null);
      if (!canReorder) return;
      const droppedSku = e.dataTransfer.getData("application/shelf-product-sku");
      const shelfNum = e.dataTransfer.getData("application/shelf-number");
      if (!droppedSku || shelfNum !== String(shelf.shelfNumber)) return;

      const productIds = shelf.products.map((p) => p.sku);
      const fromIdx = productIds.indexOf(droppedSku);
      const toIdx = productIds.indexOf(targetSku);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

      const reordered = [...productIds];
      const [removed] = reordered.splice(fromIdx, 1);
      const insertIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
      reordered.splice(insertIdx, 0, removed!);
      editHandlers!.onReorderProducts!(shelf.shelfNumber, reordered);
    },
    [canReorder, shelf.shelfNumber, shelf.products, editHandlers]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, sku: string) => {
      if (!canReorder) return;
      setDraggedSku(sku);
      e.dataTransfer.setData("application/shelf-product-sku", sku);
      e.dataTransfer.setData("application/shelf-number", String(shelf.shelfNumber));
      e.dataTransfer.effectAllowed = "move";
    },
    [canReorder, shelf.shelfNumber]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedSku(null);
    setDropTargetSku(null);
  }, []);

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
          <div
            key={product.sku}
            className={cn(
              "min-w-0 flex-1 transition-shadow",
              canReorder && "cursor-grab active:cursor-grabbing",
              draggedSku === product.sku && "opacity-50",
              dropTargetSku === product.sku && "ring-2 ring-ring ring-offset-2 ring-offset-background rounded-md"
            )}
            aria-label={canReorder ? `Drag to reorder ${product.name}` : undefined}
            draggable={canReorder}
            onDragOver={(e) => handleDragOver(e, product.sku)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, product.sku)}
            onDragStart={(e) => handleDragStart(e, product.sku)}
            onDragEnd={handleDragEnd}
            style={canReorder ? { flex: `${product.facings / totalFacings} 1 0%` } : undefined}
          >
            <ShelfProduct
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
          </div>
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
