/**
 * RuleStatusBadge Component
 *
 * Displays a colored badge for compliance rule status (Draft, Active, Retired, Archived).
 * Enterprise-grade, consistent with design system.
 */

import { ArchiveIcon, CheckCircle2Icon, FileEditIcon, HistoryIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RuleStatus, RuleVersionStatus } from "@/types/checker";

export interface RuleStatusBadgeProps {
  status: RuleStatus | RuleVersionStatus;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  RuleStatus | RuleVersionStatus,
  {
    label: string;
    icon: typeof CheckCircle2Icon;
    className: string;
  }
> = {
  Draft: {
    label: "Draft",
    icon: FileEditIcon,
    className: "bg-muted/80 text-muted-foreground border-border",
  },
  Active: {
    label: "Active",
    icon: CheckCircle2Icon,
    className: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  },
  Retired: {
    label: "Retired",
    icon: ArchiveIcon,
    className: "bg-muted/60 text-muted-foreground border-border",
  },
  Archived: {
    label: "Archived",
    icon: HistoryIcon,
    className: "bg-muted/50 text-muted-foreground border-border",
  },
};

const sizeConfig = {
  sm: { badge: "text-xs px-2 py-0.5", icon: "size-3" },
  md: { badge: "text-sm px-3 py-1", icon: "size-4" },
  lg: { badge: "text-base px-4 py-1.5", icon: "size-5" },
};

export function RuleStatusBadge({
  status,
  className,
  showIcon = true,
  size = "md",
}: RuleStatusBadgeProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium",
        config.className,
        sizes.badge,
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && <Icon className={cn("shrink-0", sizes.icon)} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
