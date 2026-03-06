import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();

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
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate({ to: "/checker/store-settings" })}
        className="bg-card/50 border-border hover:bg-accent/10 text-muted-foreground gap-2 h-9 px-4 rounded-xl glassmorphism"
      >
        <Settings className="size-4" />
        Store Settings
      </Button>
    </div>
  );
}
