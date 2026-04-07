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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <p
              className={cn("text-3xl font-extrabold tracking-[-0.04em]", config.value)}
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
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "shrink-0 rounded-lg border border-white/6 bg-secondary p-2.5",
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
