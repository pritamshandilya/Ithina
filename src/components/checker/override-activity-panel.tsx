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

import { ShieldAlert, TrendingUp, AlertCircle } from "lucide-react";
import { useOverrideActivity } from "@/queries/checker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
        <div className="rounded-lg bg-action-warning p-1.5">
          <ShieldAlert className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <h3 id="override-activity-heading" className="text-base font-semibold text-foreground scroll-mt-24">
            Override Activity
          </h3>
          <p className="text-xs text-muted-foreground">
            AI transparency and human oversight
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load override activity data
            </p>
          </div>
        </div>
      )}

      {/* Data Display */}
      {!isLoading && !error && data && (
        <div className="space-y-3">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Overrides Today */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Today
                </p>
                <TrendingUp
                  className="h-3.5 w-3.5 text-action-warning shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {data.overridesToday}
              </p>
              <p className="text-[11px] text-muted-foreground">
                AI decisions overridden
              </p>
            </div>

            {/* Overrides This Week */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  This Week
                </p>
                <TrendingUp
                  className="h-3.5 w-3.5 text-action-warning shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {data.overridesThisWeek}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total weekly overrides
              </p>
            </div>

            {/* Top Overridden Rule */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Top Rule
                </p>
                <ShieldAlert
                  className="h-3.5 w-3.5 text-action-warning shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm font-bold text-foreground truncate">
                {data.topOverriddenRule}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Most frequently overridden
              </p>
            </div>
          </div>

          {/* Transparency Notice */}
          <div className="rounded-lg border border-action-warning/30 bg-action-warning/5 p-3">
            <p className="text-xs text-muted-foreground">
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
