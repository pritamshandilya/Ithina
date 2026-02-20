import { Link } from "@tanstack/react-router";
import { ShieldCheck, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StoreSelectorDropdown } from "@/components/checker/store-selector-dropdown";
import { useStores } from "@/features/checker/hooks";
import { useStore } from "@/providers/store";
import { cn } from "@/lib/utils";

export interface CheckerDashboardHeaderProps {
  /** Whether there are critical or pending audits needing attention */
  hasAttentionItems?: boolean;
  className?: string;
}

/**
 * Checker dashboard header with store selector and primary CTA.
 * Mirrors maker dashboard header design for consistency.
 */
export function CheckerDashboardHeader({
  hasAttentionItems = false,
  className,
}: CheckerDashboardHeaderProps) {
  const { selectedStore, setSelectedStore } = useStore();
  const { data: stores = [] } = useStores();
  const selectedStoreId = selectedStore?.id ?? stores[0]?.id ?? "";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        "flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="region"
      aria-label="Dashboard header"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck
            className="size-8 shrink-0"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Planogram Assistant
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {hasAttentionItems
            ? "Audits need your review"
            : "Store-level and shelf-level oversight"}
        </p>
        {!hasAttentionItems && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--chart-2)" }}
            aria-label="All caught up"
          >
            <span className="size-2 rounded-full bg-current" aria-hidden />
            <span className="font-medium">Review queue clear</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {stores.length > 0 && (
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-xs text-muted-foreground">Store</p>
            <StoreSelectorDropdown
              stores={stores}
              selectedStoreId={selectedStoreId}
              onStoreChange={(id) => {
                const store = stores.find((s) => s.id === id);
                if (store) setSelectedStore(store);
              }}
              className="min-w-[200px]"
            />
          </div>
        )}

        <Button
          asChild
          size="lg"
          className={cn(
            "h-11 px-5 gap-2 font-semibold shrink-0",
            "shadow-md hover:shadow-lg transition-all"
          )}
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
          aria-label="Review audits"
        >
          <Link to="/checker/audit-review" className="inline-flex items-center">
            Review Audits
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
