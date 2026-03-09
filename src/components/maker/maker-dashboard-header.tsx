import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDownIcon,
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
  className?: string;
}

/**
 * Compact dashboard header with welcome context and primary CTA.
 * Combines app context with the main action for a simplified, focused layout.
 */
export function MakerDashboardHeader({
  className,
}: MakerDashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-11 px-5 gap-2 font-semibold shrink-0 shadow-md hover:shadow-lg transition-all"
            )}
            style={{
              backgroundColor: "var(--maker-primary)",
              color: "var(--accent-foreground)",
            }}
          >
            <PlusIcon className="size-5" />
            Start New Audit
            <ChevronDownIcon className="size-4" />
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
