/**
 * Override Activity Panel Component
 *
 * Displays AI override metrics to build trust in governance transparency.
 * Shows when Checkers override AI decisions and approve audits manually.
 *
 * Metrics:
 * - Overrides Today - Number of AI decisions overridden today
 * - Overrides This Week - Weekly override count
 * - Top Overridden Rule - Most frequently overridden compliance rule
 *
 * Purpose:
 * This builds trust by making AI decision-making transparent. When Checkers
 * override AI, it's tracked and displayed to ensure human oversight is visible
 * and accountable.
 *
 * Design:
 * - Clean card layout with icon header
 * - Three key metrics in a responsive grid
 * - Orange/warning color scheme (checker-override)
 * - Integrated with useOverrideActivity hook
 * - Loading skeletons and error handling
 */
import { AlertCircle, ShieldAlert, TrendingUp } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useOverrideActivity } from "@/queries/checker";

export interface OverrideActivityPanelProps {
  /**
   * The store ID to fetch override data for
   */
  storeId: string;

  /**
   * Optional CSS class name
   */
  className?: string;
}

export function OverrideActivityPanel({
  storeId,
  className = "",
}: OverrideActivityPanelProps) {
  const { data, isLoading, error } = useOverrideActivity(storeId);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="bg-action-warning rounded-lg p-1.5">
          <ShieldAlert className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <h3
            id="override-activity-heading"
            className="text-foreground scroll-mt-24 text-base font-semibold"
          >
            Override Activity
          </h3>
          <p className="text-muted-foreground text-xs">
            AI transparency and human oversight
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-destructive h-4 w-4" />
            <p className="text-destructive text-sm">
              Failed to load override activity data
            </p>
          </div>
        </div>
      )}

      {/* Data Display */}
      {!isLoading && !error && data && (
        <div className="space-y-3">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Overrides Today */}
            <div className="border-border bg-card space-y-1 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                  Today
                </p>
                <TrendingUp
                  className="text-action-warning h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-foreground text-2xl font-bold">
                {data.overridesToday}
              </p>
              <p className="text-muted-foreground text-[11px]">
                AI decisions overridden
              </p>
            </div>

            {/* Overrides This Week */}
            <div className="border-border bg-card space-y-1 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                  This Week
                </p>
                <TrendingUp
                  className="text-action-warning h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-foreground text-2xl font-bold">
                {data.overridesThisWeek}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Total weekly overrides
              </p>
            </div>

            {/* Top Overridden Rule */}
            <div className="border-border bg-card space-y-1 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                  Top Rule
                </p>
                <ShieldAlert
                  className="text-action-warning h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-foreground truncate text-sm font-bold">
                {data.topOverriddenRule}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Most frequently overridden
              </p>
            </div>
          </div>

          {/* Transparency Notice */}
          <div className="border-action-warning/30 bg-action-warning/5 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              <strong className="text-foreground">Governance Note:</strong>{" "}
              Overrides are tracked to ensure transparency in human-AI
              collaboration. High override rates on specific rules may indicate
              the need for rule refinement or additional training data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
