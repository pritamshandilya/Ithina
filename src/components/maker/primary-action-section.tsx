import { useNavigate } from "@tanstack/react-router";
import { ChevronDownIcon, ClipboardCheckIcon, FileImageIcon, PlusIcon, ScanSearchIcon } from "lucide-react";

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

/**
 * Props for the PrimaryActionSection component
 */
export interface PrimaryActionSectionProps {
  className?: string;
  /**
   * Disable the button
   */
  disabled?: boolean;
}

/**
 * PrimaryActionSection Component
 *
 * Large, visually prominent call-to-action for starting a new shelf audit.
 * Shows a dropdown with Planogram Based Analysis and Adhoc Analysis options.
 */
export function PrimaryActionSection({
  className,
  disabled = false,
}: PrimaryActionSectionProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "rounded-xl border p-6 md:p-8 text-center shadow-lg transition-all",
        "bg-linear-to-br from-accent/20 via-accent/10 to-accent/5",
        "border-accent/30",
        "hover:border-accent/50 hover:shadow-xl",
        className
      )}
      role="region"
      aria-label="Primary action: Start audit"
    >
      {/* Heading */}
      <div className="mb-4 space-y-2">
        <ClipboardCheckIcon
          className="mx-auto size-12 md:size-14"
          style={{ color: "var(--maker-primary)" }}
          aria-hidden="true"
        />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Ready to Audit?
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Start a new shelf audit to ensure planogram compliance and inventory accuracy
        </p>
      </div>

      {/* Primary CTA Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-12 md:h-14 px-6 md:px-8 text-base md:text-lg gap-2 md:gap-3",
              "shadow-lg hover:shadow-xl transition-all duration-200",
              "font-semibold"
            )}
            style={{
              backgroundColor: "var(--maker-primary)",
              color: "var(--accent-foreground)",
            }}
            disabled={disabled}
            aria-label="Start new shelf audit"
          >
            <PlusIcon className="size-5 md:size-6" aria-hidden="true" />
            <span className="text-base md:text-lg font-semibold">
              Start New Shelf Audit
            </span>
            <ChevronDownIcon className="size-4 md:size-5 ml-1" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[280px]">
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

      {/* Helper text */}
      <p className="mt-4 text-xs text-muted-foreground">
        Choose Planogram Based or Adhoc Analysis
      </p>
    </div>
  );
}
