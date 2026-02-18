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
  highDemandSkus?: string[];
  getCategoryColor?: (category: string) => string;
  editHandlers?: PlanogramEditHandlers;
  dragHandlers?: {
    onDragStart: (sku: string, fromShelf: number | "removed") => void;
    onDropOnShelf: (toShelfNumber: number, targetSku?: string) => void;
    onDropOnRemoved: () => void;
  };
  className?: string;
}

export function ShelfRow({
  shelf,
  highDemandSkus = [],
  getCategoryColor = defaultGetCategoryColor,
  editHandlers,
  dragHandlers,
  className,
}: ShelfRowProps) {
  const totalFacings = shelf.products.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = shelf.products.reduce(
    (sum, p) => sum + p.facings * (p.depthCount || 1),
    0
  );

  const canEdit = !!editHandlers;
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
    (e: React.DragEvent, targetSku?: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggedSku(null);
      setDropTargetSku(null);
      if (!canEdit) return;

      const droppedSku = e.dataTransfer.getData("application/planogram-product-sku");
      const fromShelfNumRaw = e.dataTransfer.getData("application/from-shelf-number");

      if (!droppedSku) return;

      const fromShelfNum = fromShelfNumRaw === "removed" ? "removed" : Number(fromShelfNumRaw);

      editHandlers.onMoveProduct(
        fromShelfNum,
        shelf.shelfNumber,
        droppedSku,
        targetSku
      );
    },
    [canEdit, shelf.shelfNumber, editHandlers]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, sku: string) => {
      if (!canEdit) return;
      setDraggedSku(sku);
      e.dataTransfer.setData("application/planogram-product-sku", sku);
      e.dataTransfer.setData("application/from-shelf-number", String(shelf.shelfNumber));
      e.dataTransfer.effectAllowed = "move";

      if (dragHandlers) {
        const fromShelf = shelf.shelfNumber;
        dragHandlers.onDragStart(sku, fromShelf);
      }
    },
    [canEdit, shelf.shelfNumber, dragHandlers]
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
        <h3 className="text-sm font-semibold text-foreground">
          Shelf {shelf.shelfNumber}: {shelf.name}
        </h3>
        <span className="text-xs text-muted-foreground">
          {shelf.products.length} items · {totalFacings} facings · {totalUnits} units
        </span>
      </header>
      <div className="flex flex-col gap-0" onDrop={(e) => handleDrop(e)} onDragOver={(e) => e.preventDefault()}>
        <div className="flex gap-1 overflow-hidden rounded-t-lg border border-b-0 border-border bg-muted/20 p-2">
          {shelf.products.map((product) => (
            <div
              key={product.sku}
              className={cn(
                "min-w-0 flex-1 transition-shadow",
                canEdit && "cursor-grab active:cursor-grabbing",
                draggedSku === product.sku && "opacity-50",
                dropTargetSku === product.sku && "ring-2 ring-ring ring-offset-2 ring-offset-background rounded-md"
              )}
              aria-label={canEdit ? `Drag to reorder ${product.name}` : undefined}
              draggable={canEdit}
              onDragOver={(e) => handleDragOver(e, product.sku)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, product.sku)}
              onDragStart={(e) => handleDragStart(e, product.sku)}
              onDragEnd={handleDragEnd}
              style={canEdit ? { flex: `${product.facings / totalFacings} 1 0%` } : undefined}
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
        <div
          className="h-2 rounded-b-lg border border-t-0 border-border bg-gradient-to-b from-muted to-muted/60"
          aria-hidden
        />
      </div>
    </section>
  );
}
