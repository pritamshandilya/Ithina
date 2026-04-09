import { PackageX, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getCategoryFill, getCategoryAccent } from "@/lib/constants/planogram";
import { getProductSVG } from "./product-svg-utils";
import { IconButton } from "@/components/ui/icon-button";
import type { PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

export interface RemovedItemsSidebarProps {
  removedItems?: PlanogramProduct[];
  shelves?: PlanogramShelfDef[];
  shelfCapacities?: Record<number, number>;
  onRestore?: (shelfNumber: number, product: PlanogramProduct) => void;
  onRemoveFromShelf?: (sku: string, shelfNumber: number) => void;
  onMoveFromSidebar?: (sku: string, toShelfNumber: number) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface RemovedItemRowProps {
  item: PlanogramProduct;
  shelves: PlanogramShelfDef[];
  shelfCapacities: Record<number, number>;
  onRestore?: (shelfNumber: number, product: PlanogramProduct) => void;
  onMoveFromSidebar?: (sku: string, toShelfNumber: number) => void;
  onDragStart?: (e: React.DragEvent, sku: string) => void;
}

function RemovedItemRow({
  item,
  shelves,
  shelfCapacities,
  onRestore,
  onMoveFromSidebar,
  onDragStart,
}: RemovedItemRowProps) {
  const [selectedShelf, setSelectedShelf] = useState<number | "">("");
  const sortedShelves = [...shelves].sort(
    (a, b) => b.verticalPosition - a.verticalPosition
  );

  const currentFacings = (shelfNumber: number) =>
    shelves
      .find((s) => s.shelfNumber === shelfNumber)
      ?.products.reduce((sum, p) => sum + p.facings, 0) ?? 0;
  const capacity = (shelfNumber: number) =>
    shelfCapacities[shelfNumber] ?? currentFacings(shelfNumber) + item.facings;
  const isFull = (shelfNumber: number) =>
    currentFacings(shelfNumber) + item.facings > capacity(shelfNumber);

  const handleRestore = () => {
    if (selectedShelf === "") return;
    const shelfNum = Number(selectedShelf);
    if (isFull(shelfNum)) return;

    if (onMoveFromSidebar) {
      onMoveFromSidebar(item.sku, shelfNum);
    } else if (onRestore) {
      onRestore(shelfNum, item);
    }

    setSelectedShelf("");
  };

  const fill = getCategoryFill(item.category);
  const accent = getCategoryAccent(item.category);
  const ProductSVG = getProductSVG(item.category);

  return (
    <li
      className="rounded border border-border bg-muted/30 px-2 py-1.5 text-xs cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => onDragStart?.(e, item.sku)}
    >
      <div className="flex items-start gap-2">
        <div className="h-8 w-6 shrink-0">
          <ProductSVG fill={fill} accent={accent} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate" title={item.name}>
            {item.name}
          </p>
          <p className="text-muted-foreground truncate">
            {item.category} · {item.sku}
          </p>
          {(onRestore || onMoveFromSidebar) && (
            <div className="mt-2 flex items-center gap-1">
              <select
                value={selectedShelf}
                onChange={(e) =>
                  setSelectedShelf(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="h-6 flex-1 min-w-0 rounded border border-input bg-background px-1.5 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Select shelf to restore to"
              >
                <option value="">Select shelf…</option>
                {sortedShelves.map((s) => {
                  const full = isFull(s.shelfNumber);
                  return (
                    <option
                      key={s.shelfNumber}
                      value={s.shelfNumber}
                      disabled={full}
                    >
                      Shelf {s.shelfNumber}: {s.name}
                      {full ? " (full)" : ""}
                    </option>
                  );
                })}
              </select>
              <IconButton
                type="button"
                onClick={handleRestore}
                disabled={selectedShelf === "" || isFull(Number(selectedShelf))}
                variant="success"
                size="icon-sm"
                title="Add back to shelf"
                aria-label={`Add ${item.name} back to shelf`}
                icon={<Plus className="size-3" aria-hidden />}
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function RemovedItemsSidebar({
  removedItems = [],
  shelves = [],
  shelfCapacities = {},
  onRestore,
  onRemoveFromShelf,
  onMoveFromSidebar,
  collapsed = false,
  onToggleCollapse,
  className,
}: RemovedItemsSidebarProps) {
  const hasItems = removedItems.length > 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sku = e.dataTransfer.getData("application/planogram-product-sku");
    const fromShelfNumRaw = e.dataTransfer.getData("application/from-shelf-number");

    if (sku && fromShelfNumRaw !== "removed" && onRemoveFromShelf) {
      onRemoveFromShelf(sku, Number(fromShelfNumRaw));
    }
  };

  const handleDragStart = (e: React.DragEvent, sku: string) => {
    e.dataTransfer.setData("application/planogram-product-sku", sku);
    e.dataTransfer.setData("application/from-shelf-number", "removed");
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card/80 transition-all",
        collapsed ? "w-12" : "w-64 min-w-0 shrink-0",
        !collapsed && "min-h-50",
        className
      )}
      role="region"
      aria-label="Removed items"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header
        className={cn(
          "flex items-center gap-2 border-b border-border px-3 py-2",
          onToggleCollapse && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={onToggleCollapse}
      >
        <PackageX className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {!collapsed && (
          <>
            <h3 className="text-sm font-semibold text-foreground">Removed</h3>
            {hasItems && (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {removedItems.length}
              </span>
            )}
          </>
        )}
      </header>

      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-auto p-3">
          {hasItems ? (
            <ul className="space-y-2">
              {removedItems.map((item) => (
                <RemovedItemRow
                  key={item.sku}
                  item={item}
                  shelves={shelves}
                  shelfCapacities={shelfCapacities}
                  onRestore={onRestore}
                  onMoveFromSidebar={onMoveFromSidebar}
                  onDragStart={handleDragStart}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-3 text-center">
              <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <PackageX className="size-6 text-muted-foreground" aria-hidden />
              </div>
              <p className="text-sm font-medium text-foreground">No removed items</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag a product here or click X to remove it.
              </p>
            </div>
          )}
          {hasItems && onRestore && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Drag to shelf or use + to add back
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
