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
        "border-border flex items-center justify-between border-b pb-4",
        className,
      )}
      role="region"
      aria-label="Dashboard"
    >
      <h1 className="text-foreground text-xl font-bold">Dashboard</h1>
    </div>
  );
}
