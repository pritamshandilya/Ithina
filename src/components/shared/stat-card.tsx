import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Props for the StatCard component
 */
export interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "accent";
  className?: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

/**
 * Variant configuration for different card styles
 */
const variantConfig = {
  default: {
    card: "stat-card",
    icon: "text-muted-foreground",
    iconStyle: undefined,
    value: "text-foreground",
    valueStyle: undefined,
  },
  success: {
    card: "stat-card stat-card-success",
    icon: "",
    iconStyle: { color: "var(--maker-approved)" },
    value: "",
    valueStyle: { color: "var(--maker-approved)" },
  },
  warning: {
    card: "stat-card stat-card-warning",
    icon: "",
    iconStyle: { color: "var(--maker-returned)" },
    value: "",
    valueStyle: { color: "var(--maker-returned)" },
  },
  accent: {
    card: "stat-card stat-card-accent",
    icon: "",
    iconStyle: { color: "var(--maker-primary)" },
    value: "",
    valueStyle: { color: "var(--maker-primary)" },
  },
};

/**
 * StatCard Component
 * 
 * A card component for displaying statistics and metrics.
 * Used in the Quick Stats Panel and throughout the dashboard.
 * 
 * @example
 * ```tsx
 * <StatCard 
 *   title="Audits Today" 
 *   value={5} 
 *   icon={CheckCircleIcon}
 *   variant="success"
 * />
 * 
 * <StatCard 
 *   title="Pending Review" 
 *   value={3}
 *   description="Awaiting checker approval"
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  className,
  description,
  trend,
}: StatCardProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(config.card, className)}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p
              className={cn("text-2xl font-bold tracking-tight", config.value)}
              style={config.valueStyle}
            >
              {value}
            </p>
            {trend && (
              <span
                className="text-sm font-medium"
                style={{
                  color: trend.isPositive
                    ? "var(--maker-approved)"
                    : "var(--maker-returned)",
                }}
                aria-label={`Trend: ${trend.isPositive ? "up" : "down"} ${trend.value}`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value} {trend.label}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "rounded-md bg-background/50 p-1.5 shrink-0",
              config.icon
            )}
            style={config.iconStyle}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </div>
        )}
      </div>
    </div>
  );
}
