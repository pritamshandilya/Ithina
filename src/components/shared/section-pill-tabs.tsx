import { cn } from "@/lib/utils";

export interface SectionPillTabDef<T extends string> {
  id: T;
  label: string;
}

export interface SectionPillTabsProps<T extends string> {
  tabs: readonly SectionPillTabDef<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SectionPillTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  className,
}: SectionPillTabsProps<T>) {
  return (
    <nav
      className={cn(
        "flex w-fit flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1",
        className,
      )}
      aria-label={ariaLabel}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`section-tab-${tab.id}`}
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-accent text-accent-foreground shadow"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
