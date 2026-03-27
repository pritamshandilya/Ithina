import { cn } from "@/lib/utils";

import type { StoreConfigurationTab } from "./store-configuration.types";
import { STORE_CONFIGURATION_TABS } from "./store-configuration.constants";

interface StoreTabNavigationProps {
  activeTab: StoreConfigurationTab;
  onChange: (tab: StoreConfigurationTab) => void;
}

export function StoreTabNavigation({
  activeTab,
  onChange,
}: StoreTabNavigationProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
      {STORE_CONFIGURATION_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            activeTab === id
              ? "bg-accent text-accent-foreground shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
