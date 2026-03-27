import { LayoutPanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface ConfigNavItemProps {
  icon: typeof LayoutPanelLeft;
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export function StoreOnboardingConfigNavItem({
  icon: Icon,
  label,
  description,
  isActive,
  isCompleted,
  onClick,
}: ConfigNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between border border-border/60 bg-background/40 rounded-lg px-3 py-2 text-left text-xs transition-colors",
        isActive
          ? "bg-accent/10 text-accent"
          : " text-muted-foreground hover:bg-background/60",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-[11px] text-muted-foreground">{description}</span>
        </div>
      </div>
      <div
        className={cn(
          "ml-2 flex h-5 w-5 items-center justify-center rounded-full border bg-background/80 text-[10px] font-medium",
          isCompleted ? "border-emerald-500 text-emerald-500" : "border-border text-muted-foreground",
        )}
      >
        {isCompleted ? "✓" : ""}
      </div>
    </button>
  );
}
