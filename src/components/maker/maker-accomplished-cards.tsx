import {
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  FileEdit,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared";
import { useQuickStats, useDraftAudits, useShelves } from "@/queries/maker";
import { cn } from "@/lib/utils";

export interface MakerAccomplishedCardsProps {
  className?: string;
}

/**
 * Key metrics for the maker dashboard - "What I Accomplished" / "My Work at a Glance".
 * Displays 4 cards: Audits Today, Pending Review, Returned, Drafts in Progress.
 */
export function MakerAccomplishedCards({ className }: MakerAccomplishedCardsProps) {
  const { data: stats, isLoading: statsLoading, error } = useQuickStats();
  const { data: drafts = [] } = useDraftAudits();
  const { data: shelves = [] } = useShelves();

  if (statsLoading) {
    return (
      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const draftCount = drafts.length;
  const assignedCount = shelves.length;

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="ithina-overline mb-1">Maker Overview</p>
        <h2 className="text-lg font-semibold text-foreground">
          My Work at a Glance
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="Audits Submitted Today"
          value={stats.auditsSubmittedToday}
          icon={CheckCircleIcon}
          variant="success"
          description="Keep up the great work!"
        />

        <StatCard
          title="Pending Review"
          value={stats.pendingReviewCount}
          icon={ClockIcon}
          variant="accent"
          description={`${stats.pendingReviewCount} awaiting checker approval`}
        />

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

        <StatCard
          title="Drafts in Progress"
          value={draftCount}
          icon={FileEdit}
          variant={draftCount > 0 ? "accent" : "default"}
          description={
            draftCount > 0
              ? "Continue where you left off"
              : assignedCount > 0
                ? "Start a new audit"
                : "No drafts in progress"
          }
        />
      </div>
    </div>
  );
}
