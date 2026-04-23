import { PackageX, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getCategoryFill, getCategoryAccent } from "@/lib/constants/planogram";
import { getProductSVG } from "./product-svg-utils";
import { IconButton } from "@/components/ui/icon-button";
import type { PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";
import {
  getPlanogramProductId,
  getShelfDisplayLabel,
  getShelfUsedWidth,
  sortPlanogramShelves,
} from "@/lib/planogram/planogram-schema";

export interface RemovedItemsSidebarProps {
  removedItems?: PlanogramProduct[];
  shelves?: PlanogramShelfDef[];
  onRestore?: (shelfId: string, product: PlanogramProduct) => void;
  onRemoveFromShelf?: (productId: string, shelfId: string) => void;
  onMoveFromSidebar?: (productId: string, toShelfId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface RemovedItemRowProps {
  item: PlanogramProduct;
  itemId: string;
  shelves: PlanogramShelfDef[];
  onRestore?: (shelfId: string, product: PlanogramProduct) => void;
  onMoveFromSidebar?: (productId: string, toShelfId: string) => void;
  onDragStart?: (e: React.DragEvent, productId: string) => void;
}

function RemovedItemRow({
  item,
  itemId,
  shelves,
  onRestore,
  onMoveFromSidebar,
  onDragStart,
}: RemovedItemRowProps) {
  const [selectedShelfId, setSelectedShelfId] = useState("");
  const sortedShelves = useMemo(() => sortPlanogramShelves(shelves), [shelves]);

  const isFull = (shelfId: string) => {
    const shelf = shelves.find((entry) => entry.id === shelfId);
    if (!shelf) return true;
    return getShelfUsedWidth(shelf) + item.size.width * item.facings > shelf.width;
  };

  const handleRestore = () => {
    if (!selectedShelfId || isFull(selectedShelfId)) return;

    if (onMoveFromSidebar) {
      onMoveFromSidebar(itemId, selectedShelfId);
    } else if (onRestore) {
      onRestore(selectedShelfId, item);
    }

    setSelectedShelfId("");
  };

  const fill = getCategoryFill(item.category ?? "");
  const accent = getCategoryAccent(item.category ?? "");
  const ProductSVG = getProductSVG(item.category ?? "");

  return (
    <li
      className="cursor-grab rounded border border-border bg-muted/30 px-2 py-1.5 text-xs active:cursor-grabbing"
      draggable
      onDragStart={(e) => onDragStart?.(e, itemId)}
    >
      <div className="flex items-start gap-2">
        <div className="h-8 w-6 shrink-0">
          <ProductSVG fill={fill} accent={accent} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground" title={item.name}>
            {item.name}
          </p>
          <p className="truncate text-muted-foreground">
            {item.category ?? "Uncategorized"} · {item.sku ?? item.barcode ?? "No ID"}
          </p>
          {(onRestore || onMoveFromSidebar) && (
            <div className="mt-2 flex items-center gap-1">
              <select
                value={selectedShelfId}
                onChange={(e) => setSelectedShelfId(e.target.value)}
                className="h-6 min-w-0 flex-1 rounded border border-input bg-background px-1.5 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Select shelf to restore to"
              >
                <option value="">Select shelf…</option>
                {sortedShelves.map((shelf) => {
                  const full = isFull(shelf.id);
                  return (
                    <option key={shelf.id} value={shelf.id} disabled={full}>
                      {getShelfDisplayLabel(sortedShelves, shelf.id)} ({shelf.id})
                      {full ? " (full)" : ""}
                    </option>
                  );
                })}
              </select>
              <IconButton
                type="button"
                onClick={handleRestore}
                disabled={!selectedShelfId || isFull(selectedShelfId)}
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
    const productId = e.dataTransfer.getData("application/planogram-product-id");
    const fromShelfId = e.dataTransfer.getData("application/from-shelf-id");

    if (productId && fromShelfId !== "removed" && onRemoveFromShelf) {
      onRemoveFromShelf(productId, fromShelfId);
    }
  };

  const handleDragStart = (e: React.DragEvent, productId: string) => {
    e.dataTransfer.setData("application/planogram-product-id", productId);
    e.dataTransfer.setData("application/from-shelf-id", "removed");
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card/80 transition-all",
        collapsed ? "w-12" : "w-64 min-w-0 shrink-0",
        !collapsed && "min-h-50",
        className,
      )}
      role="region"
      aria-label="Removed items"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header
        className={cn(
          "flex items-center gap-2 border-b border-border px-3 py-2",
          onToggleCollapse && "cursor-pointer hover:bg-muted/50",
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
        <div className="min-h-0 flex-1 overflow-auto p-3">
          {hasItems ? (
            <ul className="space-y-2">
              {removedItems.map((item, index) => (
                <RemovedItemRow
                  key={getPlanogramProductId(item, `removed:${index}`)}
                  item={item}
                  itemId={getPlanogramProductId(item, `removed:${index}`)}
                  shelves={shelves}
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
