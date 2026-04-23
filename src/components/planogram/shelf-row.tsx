import { Info } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  getCategoryColor as defaultGetCategoryColor,
  getProductShapeType,
} from "@/lib/constants/planogram";
import { cn } from "@/lib/utils";
import type { PlanogramFixture, PlanogramShelfDef } from "@/types/planogram";
import { ShelfProduct } from "./shelf-product";
import type { PlanogramEditHandlers } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  getPlanogramProductId,
  getShelfDisplayLabel,
  sortPlanogramProducts,
} from "@/lib/planogram/planogram-schema";

export type { PlanogramEditHandlers as ShelfRowEditHandlers } from "./types";

export interface ShelfRowProps {
  shelf: PlanogramShelfDef;
  allShelves: PlanogramShelfDef[];
  fixture?: PlanogramFixture | null;
  getCategoryColor?: (category: string) => string;
  editHandlers?: PlanogramEditHandlers;
  dragHandlers?: {
    onDragStart: (productId: string, fromShelf: string | "removed") => void;
    onDropOnShelf: (toShelfId: string, targetProductId?: string) => void;
    onDropOnRemoved: () => void;
  };
  className?: string;
}

export function ShelfRow({
  shelf,
  allShelves,
  fixture,
  getCategoryColor = defaultGetCategoryColor,
  editHandlers,
  dragHandlers,
  className,
}: ShelfRowProps) {
  const totalFacings = shelf.products.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = shelf.products.reduce(
    (sum, p) => sum + p.facings * (p.depth_count || 1),
    0,
  );

  const displayLabel = getShelfDisplayLabel(allShelves, shelf.id);
  const sortedProducts = useMemo(
    () => sortPlanogramProducts(shelf.products),
    [shelf.products],
  );

  const canEdit = !!editHandlers;
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dropTargetProductId, setDropTargetProductId] = useState<string | null>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetProductId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedProductId !== targetProductId) {
        setDropTargetProductId(targetProductId);
      }
    },
    [draggedProductId],
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetProductId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetProductId?: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggedProductId(null);
      setDropTargetProductId(null);
      if (!canEdit) return;

      const droppedProductId = e.dataTransfer.getData("application/planogram-product-id");
      if (!droppedProductId) return;

      editHandlers.onMoveProduct(
        e.dataTransfer.getData("application/from-shelf-id") || "removed",
        shelf.id,
        droppedProductId,
        targetProductId,
      );
    },
    [canEdit, editHandlers, shelf.id],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, productId: string) => {
      if (!canEdit) return;
      setDraggedProductId(productId);
      e.dataTransfer.setData("application/planogram-product-id", productId);
      e.dataTransfer.setData("application/from-shelf-id", shelf.id);
      e.dataTransfer.effectAllowed = "move";

      dragHandlers?.onDragStart(productId, shelf.id);
    },
    [canEdit, dragHandlers, shelf.id],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedProductId(null);
    setDropTargetProductId(null);
  }, []);

  return (
    <section className={className} aria-label={`${displayLabel}: ${shelf.id}`}>
      <header className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {displayLabel}
        </h3>
        <span className="text-xs text-muted-foreground">
          {shelf.id} · {shelf.products.length} items · {totalFacings} facings · {totalUnits} units
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
            <DropdownMenuContent align="start" className="min-w-[220px] p-3">
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">{displayLabel} info</p>
                <dl className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Height</dt>
                    <dd className="tabular-nums text-foreground">{shelf.height}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Y Position</dt>
                    <dd className="tabular-nums text-foreground">{shelf.y_position}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Width</dt>
                    <dd className="tabular-nums text-foreground">{shelf.width}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Fixture Depth</dt>
                    <dd className="tabular-nums text-foreground">{fixture.depth}</dd>
                  </div>
                </dl>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <div className="flex flex-col gap-0" onDrop={(e) => handleDrop(e)} onDragOver={(e) => e.preventDefault()}>
        <div className="flex gap-0.5 overflow-hidden rounded-t-lg border border-b-0 border-border bg-muted/20 p-1">
          {sortedProducts.map((product, index) => {
            const productId = getPlanogramProductId(product, `${shelf.id}:${index}`);
            return (
              <div
                key={productId}
                className={cn(
                  "min-w-0 flex-1 transition-shadow",
                  canEdit && "cursor-grab active:cursor-grabbing",
                  draggedProductId === productId && "opacity-50",
                  dropTargetProductId === productId &&
                    "rounded-md ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
                aria-label={canEdit ? `Drag to reorder ${product.name}` : undefined}
                draggable={canEdit}
                onDragOver={(e) => handleDragOver(e, productId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, productId)}
                onDragStart={(e) => handleDragStart(e, productId)}
                onDragEnd={handleDragEnd}
                style={canEdit ? { flex: `${product.facings / totalFacings} 1 0%` } : undefined}
              >
                <ShelfProduct
                  product={product}
                  shelfId={shelf.id}
                  productId={productId}
                  widthFraction={totalFacings > 0 ? product.facings / totalFacings : 0}
                  categoryColor={getCategoryColor(product.category ?? "")}
                  shapeClass={
                    getProductShapeType(product.category ?? "") === "bottle"
                      ? "rounded-xl"
                      : "rounded-md"
                  }
                  editHandlers={editHandlers}
                />
              </div>
            );
          })}
        </div>
        <div
          className="h-2 rounded-b-lg border border-t-0 border-border bg-gradient-to-b from-muted to-muted/60"
          aria-hidden
        />
      </div>
    </section>
  );
}
