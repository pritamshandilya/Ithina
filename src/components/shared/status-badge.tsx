import type { AuditStatus } from "@/types/maker";
import { CheckCircle2Icon, ClockIcon, XCircleIcon, AlertCircleIcon, FileEditIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Props for the StatusBadge component
 */
export interface StatusBadgeProps {
  status: AuditStatus;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Status badge configuration
 * Maps each status to its display properties
 */
const statusConfig: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2Icon;
    className: string;
  }
> = {
  "never-audited": {
    label: "Never Audited",
    icon: AlertCircleIcon,
    className: "status-never-audited",
  },
  draft: {
    label: "Draft",
    icon: FileEditIcon,
    className: "status-draft",
  },
  pending: {
    label: "Pending Review",
    icon: ClockIcon,
    className: "status-pending",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2Icon,
    className: "status-approved",
  },
  returned: {
    label: "Returned",
    icon: XCircleIcon,
    className: "status-returned",
  },
  active: {
    label: "Active",
    icon: CheckCircle2Icon,
    className: "status-approved",
  },
  inactive: {
    label: "Inactive",
    icon: AlertCircleIcon,
    className: "status-neutral",
  },
};

/**
 * Size configuration for the badge
 */
const sizeConfig = {
  sm: {
    badge: "text-xs px-2 py-0.5",
    icon: "size-3",
  },
  md: {
    badge: "text-sm px-3 py-1",
    icon: "size-4",
  },
  lg: {
    badge: "text-base px-4 py-1.5",
    icon: "size-5",
  },
};

/**
 * StatusBadge Component
 * 
 * Displays a colored badge indicating the audit status of a shelf.
 * Uses semantic colors defined in index.css for consistency.
 * 
 * @example
 * ```tsx
 * <StatusBadge status="approved" showIcon />
 * <StatusBadge status="returned" size="lg" />
 * ```
 */
export function StatusBadge({
  status,
  className,
  showIcon = true,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status as AuditStatus] || {
    label: status,
    icon: AlertCircleIcon,
    className: "status-neutral",
  };
  const sizes = sizeConfig[size] || sizeConfig.md;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
        config.className,
        sizes.badge,
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && Icon && <Icon className={cn("shrink-0", sizes.icon)} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
