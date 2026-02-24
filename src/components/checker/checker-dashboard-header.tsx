import { cn } from "@/lib/utils";

export interface CheckerDashboardHeaderProps {
  /** @deprecated Kept for API compatibility; no longer used */
  hasAttentionItems?: boolean;
  className?: string;
}

/**
 * Checker dashboard header. Store selection is shown in the sidebar.
 */
export function CheckerDashboardHeader({
  className,
}: CheckerDashboardHeaderProps) {
  return (
    <div
      className={cn(
        "pb-4 border-b border-border",
        className
      )}
      role="region"
      aria-label="Dashboard"
    >
      <h1 className="text-lg font-semibold text-foreground">
        Dashboard
      </h1>
    </div>
  );
}
