/**
 * RemovedItemsSidebar – right-side panel for removed products
 * Supports restoring items to a shelf via dropdown + add button
 */

import { PackageX, Plus } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { getCategoryFill, getCategoryAccent } from "@/lib/constants/planogram";
import { getProductSVG } from "./product-svg-utils";
import type { PlanogramProduct, PlanogramShelfDef } from "@/types/planogram";

export interface RemovedItemsSidebarProps {
  /** Removed products (moved from shelf) */
  removedItems?: PlanogramProduct[];
  /** Current shelves (for restore target options) */
  shelves?: PlanogramShelfDef[];
  /** Max facings per shelf (shelfNumber -> capacity) */
  shelfCapacities?: Record<number, number>;
  /** Restore product to shelf */
  onRestore?: (shelfNumber: number, product: PlanogramProduct) => void;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  /** Toggle collapse (optional) */
  onToggleCollapse?: () => void;
  className?: string;
}

interface RemovedItemRowProps {
  item: PlanogramProduct;
  shelves: PlanogramShelfDef[];
  shelfCapacities: Record<number, number>;
  onRestore?: (shelfNumber: number, product: PlanogramProduct) => void;
}

function RemovedItemRow({
  item,
  shelves,
  shelfCapacities,
  onRestore,
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
    if (selectedShelf === "" || !onRestore) return;
    const shelfNum = Number(selectedShelf);
    if (isFull(shelfNum)) return;
    onRestore(shelfNum, item);
    setSelectedShelf("");
  };

  const fill = getCategoryFill(item.category);
  const accent = getCategoryAccent(item.category);
  const ProductSVG = getProductSVG(item.category);

  return (
    <li className="rounded border border-border bg-muted/30 px-2 py-1.5 text-xs">
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
          {onRestore && (
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
                      Shelf {s.shelfNumber}
                      {full ? " (full)" : ""}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={handleRestore}
                disabled={
                  selectedShelf === "" || isFull(Number(selectedShelf))
                }
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-chart-2 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add back to shelf"
                aria-label={`Add ${item.name} back to shelf`}
              >
                <Plus className="size-3" aria-hidden />
              </button>
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
  collapsed = false,
  onToggleCollapse,
  className,
}: RemovedItemsSidebarProps) {
  const hasItems = removedItems.length > 0;

  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card/80 transition-all",
        collapsed ? "w-12" : "w-64 min-w-0 shrink-0",
        className
      )}
      role="region"
      aria-label="Removed items"
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
        <div className="flex-1 overflow-auto p-3">
          {hasItems ? (
            <ul className="space-y-2">
              {removedItems.map((item) => (
                <RemovedItemRow
                  key={item.sku}
                  item={item}
                  shelves={shelves}
                  shelfCapacities={shelfCapacities}
                  onRestore={onRestore}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <PackageX className="size-6 text-muted-foreground" aria-hidden />
              </div>
              <p className="text-sm font-medium text-foreground">No removed items</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hover a product and click X to remove it here.
              </p>
            </div>
          )}
          {hasItems && onRestore && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Click + to add back to a shelf
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
