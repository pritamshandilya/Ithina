import { Info } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ShelfProduct } from "./ShelfProduct";
import type { PlanogramEditHandlers } from "./types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  getCategoryColor as defaultGetCategoryColor,
  getProductShapeType,
} from "@/lib/constants/planogram";
import {
  getPlanogramProductId,
  getShelfDisplayLabel,
  sortPlanogramProducts,
} from "@/lib/planogram/planogramSchema";
import { cn } from "@/lib/utils";
import type { PlanogramFixture, PlanogramShelfDef } from "@/types/planogram";

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
  const [dropTargetProductId, setDropTargetProductId] = useState<string | null>(
    null,
  );

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

      const droppedProductId = e.dataTransfer.getData(
        "application/planogram-product-id",
      );
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
        <h3 className="text-foreground text-sm font-semibold">
          {displayLabel}
        </h3>
        <span className="text-muted-foreground text-xs">
          {shelf.id} · {shelf.products.length} items · {totalFacings} facings ·{" "}
          {totalUnits} units
        </span>
        {fixture && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-chart-2/70 bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 hover:text-chart-2 h-8 shrink-0 gap-1.5 rounded-full border px-3 shadow-sm"
                aria-label="View shelf dimensions"
              >
                <Info className="size-4" aria-hidden />
                <span className="text-xs font-semibold">View dimensions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[220px] p-3">
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-semibold">
                  {displayLabel} info
                </p>
                <dl className="text-muted-foreground space-y-1">
                  <div className="flex justify-between gap-4">
                    <dt>Height</dt>
                    <dd className="text-foreground tabular-nums">
                      {shelf.height}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Y Position</dt>
                    <dd className="text-foreground tabular-nums">
                      {shelf.y_position}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Width</dt>
                    <dd className="text-foreground tabular-nums">
                      {shelf.width}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Fixture Depth</dt>
                    <dd className="text-foreground tabular-nums">
                      {fixture.depth}
                    </dd>
                  </div>
                </dl>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <div
        className="flex flex-col gap-0"
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="border-border bg-muted/20 flex gap-0.5 overflow-hidden rounded-t-lg border border-b-0 p-1">
          {sortedProducts.map((product, index) => {
            const productId = getPlanogramProductId(
              product,
              `${shelf.id}:${index}`,
            );
            return (
              <div
                key={productId}
                className={cn(
                  "min-w-0 flex-1 transition-shadow",
                  canEdit && "cursor-grab active:cursor-grabbing",
                  draggedProductId === productId && "opacity-50",
                  dropTargetProductId === productId &&
                    "ring-ring ring-offset-background rounded-md ring-2 ring-offset-2",
                )}
                aria-label={
                  canEdit ? `Drag to reorder ${product.name}` : undefined
                }
                draggable={canEdit}
                onDragOver={(e) => handleDragOver(e, productId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, productId)}
                onDragStart={(e) => handleDragStart(e, productId)}
                onDragEnd={handleDragEnd}
                style={
                  canEdit
                    ? { flex: `${product.facings / totalFacings} 1 0%` }
                    : undefined
                }
              >
                <ShelfProduct
                  product={product}
                  shelfId={shelf.id}
                  productId={productId}
                  widthFraction={
                    totalFacings > 0 ? product.facings / totalFacings : 0
                  }
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
          className="border-border from-muted to-muted/60 h-2 rounded-b-lg border border-t-0 bg-gradient-to-b"
          aria-hidden
        />
      </div>
    </section>
  );
}
