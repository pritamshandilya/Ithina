import { cn } from "@/lib/utils";

export interface CheckerDashboardHeaderProps {
  /** @deprecated Kept for API compatibility; no longer used */
  hasAttentionItems?: boolean;
  className?: string;
}

/**
 * Checker dashboard header with navigation to store settings.
 */
export function CheckerDashboardHeader({
  className,
}: CheckerDashboardHeaderProps) {
  return (
    <div
      className={cn(
        "pb-4 flex items-center justify-between border-b border-border",
        className
      )}
      role="region"
      aria-label="Dashboard"
    >
      <h1 className="text-xl font-bold text-foreground">
        Dashboard
      </h1>
    </div>
  );
}
