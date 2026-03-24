import { Info } from "lucide-react";
import { useCallback, useState } from "react";
import {
  getCategoryColor as defaultGetCategoryColor,
  getProductShapeType,
} from "@/lib/constants/planogram";
import { cn } from "@/lib/utils";
import type { PlanogramFixture, PlanogramShelfDef } from "@/types/planogram";
import { useStore } from "@/providers/store";
import { ShelfProduct } from "./shelf-product";
import type { PlanogramEditHandlers } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type { PlanogramEditHandlers as ShelfRowEditHandlers } from "./types";

export interface ShelfRowProps {
  shelf: PlanogramShelfDef;
  /** Fixture dimensions (width, depth) - used for shelf info popup */
  fixture?: PlanogramFixture | null;
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

const UNITS = "mm";

export function ShelfRow({
  shelf,
  fixture,
  highDemandSkus = [],
  getCategoryColor = defaultGetCategoryColor,
  editHandlers,
  dragHandlers,
  className,
}: ShelfRowProps) {
  const { selectedStore } = useStore();
  const storeUnits = selectedStore?.default_dimensions;
  const units = fixture?.units ?? storeUnits ?? UNITS;
  const hasShelfWidth = shelf.width != null;
  const hasShelfDepth = shelf.depth != null;
  const widthValue = shelf.width ?? fixture?.width;
  const depthValue = shelf.depth ?? fixture?.depth;
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
      <header className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          Shelf {shelf.shelfNumber}: {shelf.name}
        </h3>
        <span className="text-xs text-muted-foreground">
          {shelf.products.length} items · {totalFacings} facings · {totalUnits} units
        </span>
        {fixture && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-full border border-chart-2/70 bg-chart-2/20 px-3 text-chart-2 shadow-sm hover:bg-chart-2/30 hover:text-chart-2"
                aria-label="View shelf dimensions"
              >
                <Info className="size-4" aria-hidden />
                <span className="text-xs font-semibold">View dimensions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] p-3">
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">Shelf {shelf.shelfNumber} info</p>
                <dl className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Height</dt>
                    <dd className="tabular-nums text-foreground">{shelf.height} {units}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Vertical position</dt>
                    <dd className="tabular-nums text-foreground">{shelf.verticalPosition} {units}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{hasShelfWidth ? "Width (shelf)" : "Width (fixture default)"}</dt>
                    <dd className="tabular-nums text-foreground">
                      {widthValue != null ? `${widthValue} ${units}` : "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{hasShelfDepth ? "Depth (shelf)" : "Depth (fixture default)"}</dt>
                    <dd className="tabular-nums text-foreground">
                      {depthValue != null ? `${depthValue} ${units}` : "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <div className="flex flex-col gap-0" onDrop={(e) => handleDrop(e)} onDragOver={(e) => e.preventDefault()}>
        <div className="flex gap-0.5 overflow-hidden rounded-t-lg border border-b-0 border-border bg-muted/20 p-1">
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
