import {
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared";
import { useComplianceOverview } from "@/queries/checker";
import { useStore } from "@/providers/store";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

export interface CheckerAccomplishedCardsProps {
  className?: string;
}

/**
 * Key governance metrics for the checker dashboard - "Store at a Glance".
 * Five cards: Pending, Critical, Avg Compliance, Approved Today, Overrides.
 */
export function CheckerAccomplishedCards({ className }: CheckerAccomplishedCardsProps) {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? mockCheckerUser.storeId;
  const { data, isLoading, error } = useComplianceOverview(storeId);

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="stat-card space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const hasCritical = data.criticalAudits > 0;
  const avgScore = data.avgComplianceScore;
  const complianceVariant =
    avgScore >= 80 ? "success" : avgScore >= 50 ? "warning" : "default";

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="ithina-overline mb-1">Store Governance</p>
        <h2 className="text-lg font-semibold text-foreground">
          Store at a Glance
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Pending Audits"
          value={data.totalPendingAudits}
          icon={ClipboardList}
          variant="accent"
          description="Awaiting your review"
        />

        <StatCard
          title="Critical Audits"
          value={data.criticalAudits}
          icon={AlertTriangle}
          variant={hasCritical ? "warning" : "default"}
          description={
            hasCritical ? "Compliance below 50%" : "No critical audits"
          }
        />

        <StatCard
          title="Avg Compliance"
          value={`${avgScore.toFixed(1)}%`}
          icon={TrendingUp}
          variant={complianceVariant}
          description="Last 7 days average"
        />

        <StatCard
          title="Approved Today"
          value={data.totalApprovedToday}
          icon={CheckCircle}
          variant="success"
          description="Audits approved today"
        />

        <StatCard
          title="Overrides"
          value={data.totalOverridesToday}
          icon={ShieldAlert}
          variant="default"
          description="AI decisions overridden"
        />
      </div>
    </div>
  );
}
