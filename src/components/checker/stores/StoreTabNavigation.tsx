import { STORE_CONFIGURATION_TABS } from "./storeConfiguration.constants";
import type { StoreConfigurationTab } from "./storeConfiguration.types";
import { cn } from "@/lib/utils";

interface StoreTabNavigationProps {
  activeTab: StoreConfigurationTab;
  onChange: (tab: StoreConfigurationTab) => void;
}

export function StoreTabNavigation({
  activeTab,
  onChange,
}: StoreTabNavigationProps) {
  return (
    <div className="border-border bg-muted/30 flex w-fit items-center gap-1 rounded-xl border p-1">
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
