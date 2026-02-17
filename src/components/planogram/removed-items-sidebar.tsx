/**
 * RemovedItemsSidebar – right-side or collapsible panel for removed products
 * Wireframe: empty state only; no remove/restore logic (Phase 2)
 */

import { PackageX } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RemovedItemsSidebarProps {
  /** Removed items (wireframe: always empty) */
  removedItems?: unknown[];
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  /** Toggle collapse (optional) */
  onToggleCollapse?: () => void;
  className?: string;
}

export function RemovedItemsSidebar({
  removedItems = [],
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
              {/* Phase 2: render removed items */}
              {removedItems.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {String(item)}
                </li>
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
        </div>
      )}
    </aside>
  );
}
