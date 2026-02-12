/**
 * Compliance Overview Component
 * 
 * Displays five key governance metrics for the Checker Dashboard:
 * 1. Total Pending Audits - Work awaiting review
 * 2. Critical Audits - Compliance below 50%
 * 3. Average Compliance Score - Last 7 days performance
 * 4. Total Approved Today - Daily productivity
 * 5. Total Overrides Today - AI decision overrides
 * 
 * This is governance-focused, not analytical.
 * Shows operational clarity for decision-making.
 */

import { 
  ClipboardList, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert 
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ComplianceOverview } from "@/types/checker";

export interface ComplianceOverviewProps {
  /**
   * Compliance overview data
   */
  data?: ComplianceOverview;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Error state
   */
  error?: Error | null;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * ComplianceOverview Component
 * 
 * Five stat cards in responsive grid layout.
 * Auto-refreshing governance metrics for oversight.
 * 
 * Color coding:
 * - Pending: Blue (checker-primary)
 * - Critical: Red (checker-critical) with pulsing animation
 * - Average Score: Green if >80%, Orange if 50-80%, Red if <50%
 * - Approved: Green (checker-success)
 * - Overrides: Orange (checker-override)
 */
export function ComplianceOverview({
  data,
  isLoading,
  error,
  className,
}: ComplianceOverviewProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4",
        className
      )}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 space-y-4"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        "rounded-lg bg-destructive/10 border border-destructive p-6",
        className
      )}>
        <p className="text-destructive font-semibold text-center">
          Failed to load compliance overview
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  // No data state
  if (!data) {
    return null;
  }

  // Determine average score color variant
  const avgScoreVariant = 
    data.avgComplianceScore >= 80 
      ? "success" 
      : data.avgComplianceScore >= 50 
      ? "warning" 
      : "default";

  // Determine if critical audits need attention (pulsing animation)
  const hasCriticalAudits = data.criticalAudits > 0;

  return (
    <div 
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4",
        className
      )}
      role="region"
      aria-label="Compliance overview metrics"
    >
      {/* 1. Total Pending Audits */}
      <StatCard
        title="Pending Audits"
        value={data.totalPendingAudits}
        icon={ClipboardList}
        variant="accent"
        description="Awaiting your review"
        className="stat-card"
      />

      {/* 2. Critical Audits */}
      <div className={cn(hasCriticalAudits && "animate-pulse-slow")}>
        <StatCard
          title="Critical Audits"
          value={data.criticalAudits}
          icon={AlertTriangle}
          variant="default"
          description="Compliance below 50%"
          className="stat-card"
          style={{
            borderColor: hasCriticalAudits 
              ? "var(--checker-critical)" 
              : undefined,
            backgroundColor: hasCriticalAudits
              ? "color-mix(in oklch, var(--checker-critical) 10%, transparent)"
              : undefined,
          }}
          trend={hasCriticalAudits ? {
            value: "Needs attention",
            isPositive: false,
          } : undefined}
        />
      </div>

      {/* 3. Average Compliance Score */}
      <StatCard
        title="Avg Compliance"
        value={`${data.avgComplianceScore.toFixed(1)}%`}
        icon={TrendingUp}
        variant={avgScoreVariant}
        description="Last 7 days average"
        className="stat-card"
      />

      {/* 4. Total Approved Today */}
      <StatCard
        title="Approved Today"
        value={data.totalApprovedToday}
        icon={CheckCircle}
        variant="success"
        description="Audits approved today"
        className="stat-card"
      />

      {/* 5. Total Overrides Today */}
      <StatCard
        title="Overrides"
        value={data.totalOverridesToday}
        icon={ShieldAlert}
        variant="default"
        description="AI decisions overridden"
        className="stat-card"
        style={{
          borderColor: data.totalOverridesToday > 0 
            ? "var(--checker-override)" 
            : undefined,
          color: data.totalOverridesToday > 0
            ? "var(--checker-override)"
            : undefined,
        }}
      />
    </div>
  );
}
