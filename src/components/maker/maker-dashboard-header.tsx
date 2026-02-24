import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  ClipboardCheckIcon,
  FileImageIcon,
  PlusIcon,
  ScanSearchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const AUDIT_MODES = [
  {
    id: "planogram",
    label: "Planogram Based Analysis",
    description: "Compare shelf against planogram",
    to: "/maker/audits/planogram",
    icon: FileImageIcon,
  },
  {
    id: "adhoc",
    label: "Adhoc Analysis",
    description: "Upload image for AI analysis",
    to: "/maker/audits/adhoc/new",
    icon: ScanSearchIcon,
  },
] as const;

export interface MakerDashboardHeaderProps {
  /** Whether user has items needing attention (returned or drafts) */
  hasAttentionItems?: boolean;
  className?: string;
}

/**
 * Compact dashboard header with welcome context and primary CTA.
 * Combines app context with the main action for a simplified, focused layout.
 */
export function MakerDashboardHeader({
  hasAttentionItems = false,
  className,
}: MakerDashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3 shadow-sm",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="region"
      aria-label="Dashboard header"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ClipboardCheckIcon
            className="size-8 shrink-0"
            style={{ color: "var(--maker-primary)" }}
            aria-hidden
          />
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Planogram Assistant
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {hasAttentionItems
            ? "You have audits that need your attention"
            : "Here's how your shelf audits are going"}
        </p>
        {!hasAttentionItems && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--maker-approved)" }}
            aria-label="All caught up"
          >
            <span className="size-2 rounded-full bg-current" aria-hidden />
            <span className="font-medium">All caught up</span>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-11 px-5 gap-2 font-semibold shrink-0",
              "shadow-md hover:shadow-lg transition-all"
            )}
            style={{
              backgroundColor: "var(--maker-primary)",
              color: "var(--accent-foreground)",
            }}
            aria-label="Start new shelf audit"
          >
            <PlusIcon className="size-5" aria-hidden />
            Start New Audit
            <ChevronDownIcon className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[260px]">
          {AUDIT_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => navigate({ to: mode.to })}
                className="flex flex-col items-start gap-0.5 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0" />
                  <span className="font-medium">{mode.label}</span>
                </div>
                <span className="text-xs text-muted-foreground pl-6">
                  {mode.description}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
