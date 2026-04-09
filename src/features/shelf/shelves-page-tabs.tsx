import type { ReactNode } from "react";
import { LayoutGrid, Layers3 } from "lucide-react";

import { cn } from "@/lib/utils";

export type ShelvesPageTabId = "shelves" | "templates";

const TABS: { id: ShelvesPageTabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "shelves", label: "Shelves", icon: LayoutGrid },
  { id: "templates", label: "Shelf Templates", icon: Layers3 },
];

export interface ShelvesPageTabsProps {
  activeTab: ShelvesPageTabId;
  onTabChange: (tab: ShelvesPageTabId) => void;
  shelvesPanel: ReactNode;
  templatesPanel: ReactNode;
  className?: string;
}

export function ShelvesPageTabs({
  activeTab,
  onTabChange,
  shelvesPanel,
  templatesPanel,
  className,
}: ShelvesPageTabsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <nav
        className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1"
        aria-label="Shelves sections"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`shelves-tab-${id}`}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === id
                ? "bg-accent text-accent-foreground shadow"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            aria-selected={activeTab === id}
            role="tab"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      <div
        role="tabpanel"
        aria-labelledby={`shelves-tab-${activeTab}`}
        className="min-h-0"
      >
        {activeTab === "shelves" ? shelvesPanel : templatesPanel}
      </div>
    </div>
  );
}
