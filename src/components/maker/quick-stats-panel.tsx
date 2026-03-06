import { CheckCircleIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared";
import { useQuickStats } from "@/queries/maker";
import { cn } from "@/lib/utils";

/**
 * Props for the QuickStatsPanel component
 */
export interface QuickStatsPanelProps {
  className?: string;
}

/**
 * QuickStatsPanel Component
 * 
 * Displays three key execution-focused metrics for the Maker dashboard:
 * 1. Audits Submitted Today - Daily productivity metric
 * 2. Pending Review Count - Work awaiting checker approval
 * 3. Returned Audits Count - Items requiring resubmission
 * 
 * This is NOT an analytical dashboard - it's operational and action-oriented.
 * The goal is to help store workers understand their daily progress and
 * what needs immediate attention.
 * 
 * Features:
 * - Real-time data with auto-refresh (every 2 minutes)
 * - Color-coded by importance (green/accent/warning)
 * - Icons for quick visual scanning
 * - Loading skeletons
 * - Error handling
 * - Responsive grid layout
 * 
 * @example
 * ```tsx
 * <QuickStatsPanel />
 * ```
 */
export function QuickStatsPanel({ className }: QuickStatsPanelProps) {
  const { data: stats, isLoading, error } = useQuickStats();

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("dashboard-grid", className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="stat-card space-y-4"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-lg bg-destructive/10 border border-destructive p-6", className)}>
        <p className="text-destructive font-semibold text-center">
          Failed to load statistics
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  // No data state (shouldn't happen with mock data, but good to handle)
  if (!stats) {
    return null;
  }

  return (
    <div className={cn("dashboard-grid", className)}>
      {/* Audits Submitted Today */}
      <StatCard
        title="Audits Submitted Today"
        value={stats.auditsSubmittedToday}
        icon={CheckCircleIcon}
        variant="success"
        description="Keep up the great work!"
      />

      {/* Pending Review */}
      <StatCard
        title="Pending Review"
        value={stats.pendingReviewCount}
        icon={ClockIcon}
        variant="accent"
        description="Awaiting checker approval"
      />

      {/* Returned Audits */}
      <StatCard
        title="Returned Audits"
        value={stats.returnedAuditsCount}
        icon={AlertTriangleIcon}
        variant={stats.returnedAuditsCount > 0 ? "warning" : "default"}
        description={
          stats.returnedAuditsCount > 0
            ? "Requires your attention"
            : "No items to resubmit"
        }
      />
    </div>
  );
}
