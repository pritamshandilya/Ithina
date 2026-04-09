/**
 * KnowledgeCenterSection Component
 * 
 * Provides quick access to rule management features for Checkers (Store Managers).
 * This is configuration authority - only Checkers have access to these controls.
 * 
 * Features:
 * - View all active rules and their details
 * - Create new compliance rules
 * - Manage rule versions (view history, rollback)
 * - Retire outdated rules
 * - Displays rule metadata (active count, current version, last modified)
 * 
 * Design:
 * - Clean card grid layout with icons
 * - Primary action emphasis on "View Rules"
 * - Color-coded actions (primary, success, warning, destructive)
 * - Responsive grid (1 col mobile → 2 cols tablet → 4 cols desktop)
 * - Integrated with useRuleInfo hook for live data
 * 
 * Navigation Flow:
 * - Each card will navigate to dedicated rule management routes
 * - Currently shows placeholder navigation (to be implemented in Phase 2)
 * 
 * @example
 * ```tsx
 * <KnowledgeCenterSection storeId="store-1234" />
 * ```
 */

import { useNavigate } from "@tanstack/react-router";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import {
  BookOpenIcon,
  PlusCircleIcon,
  GitBranchIcon,
  ArchiveIcon,
  ActivityIcon,
} from "lucide-react";
import { useRuleInfo } from "@/queries/checker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface KnowledgeCenterSectionProps {
  /**
   * The store ID to fetch rule information for
   */
  storeId: string;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * Action card configuration
 */
interface ActionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  action: () => void;
  isPrimary?: boolean;
}

export function KnowledgeCenterSection({
  storeId,
  className = "",
}: KnowledgeCenterSectionProps) {
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();
  const { data: ruleInfo, isLoading, error } = useRuleInfo(storeId);

  const goToKnowledgeCenter = () => navigate({ ...routes.toKnowledgeCenter() });

  // Action cards configuration - navigate to Knowledge Center
  const actionCards: ActionCard[] = [
    {
      id: "view-rules",
      title: "View Rules",
      description: "Browse all active compliance rules",
      icon: BookOpenIcon,
      colorClass: "bg-accent",
      action: goToKnowledgeCenter,
      isPrimary: true,
    },
    {
      id: "create-rule",
      title: "Create New Rule",
      description: "Define a new compliance rule",
      icon: PlusCircleIcon,
      colorClass: "bg-chart-2",
      action: goToKnowledgeCenter,
    },
    {
      id: "manage-versions",
      title: "Manage Versions",
      description: "View history and rollback changes",
      icon: GitBranchIcon,
      colorClass: "bg-action-warning",
      action: goToKnowledgeCenter,
    },
    {
      id: "retire-rule",
      title: "Retire Rule",
      description: "Archive outdated rules",
      icon: ArchiveIcon,
      colorClass: "bg-muted",
      action: goToKnowledgeCenter,
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Header with Rule Metadata */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <ActivityIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 id="knowledge-center-heading" className="text-xl font-semibold text-foreground scroll-mt-24">
              Knowledge Center
            </h2>
            <p className="text-sm text-muted-foreground">
              Rule management and configuration authority
            </p>
          </div>
        </div>

        {/* Rule Metadata Bar */}
        {isLoading ? (
          <div className="flex gap-4">
            <Skeleton className="h-20 flex-1" />
            <Skeleton className="h-20 flex-1" />
            <Skeleton className="h-20 flex-1" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Failed to load rule information
            </p>
          </div>
        ) : ruleInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Rules Count */}
            <div className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">
                {ruleInfo.activeRulesCount}
              </p>
              <p className="text-xs text-muted-foreground">Active Rules</p>
            </div>

            {/* Current Version */}
            <div className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
              <p className="text-lg font-semibold text-foreground">
                {ruleInfo.currentVersion}
              </p>
              <p className="text-xs text-muted-foreground">Current Version</p>
            </div>

            {/* Last Modified Date */}
            <div className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
              <p className="text-sm font-medium text-foreground">
                {format(new Date(ruleInfo.lastModifiedDate), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">Last Modified</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actionCards.map((card) => (
          <button
            key={card.id}
            onClick={card.action}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all",
              "hover:scale-105 hover:shadow-lg hover:border-border/80",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "active:scale-100",
              card.isPrimary && "ring-2 ring-accent/20"
            )}
            aria-label={`${card.title}: ${card.description}`}
          >
            {/* Background Gradient */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5",
                card.colorClass
              )}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative space-y-3">
              {/* Icon */}
              <div
                className={cn(
                  "inline-flex rounded-lg p-3 transition-colors",
                  card.colorClass
                )}
              >
                <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-accent">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>

              {/* Primary Badge */}
              {card.isPrimary && (
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                  Recommended
                </span>
              )}
            </div>

            {/* Hover Arrow Indicator */}
            <div
              className="absolute bottom-4 right-4 translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
              aria-hidden="true"
            >
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Configuration Authority:</strong>{" "}
          Only Checkers (Store Managers) have access to rule management. Changes
          to rules affect all future audits and may require maker re-training.
        </p>
      </div>
    </div>
  );
}
