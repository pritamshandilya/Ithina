import { Link } from "@tanstack/react-router";
import { PlusIcon, ClipboardCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the PrimaryActionSection component
 */
export interface PrimaryActionSectionProps {
  className?: string;
  /**
   * Custom click handler (overrides default navigation)
   */
  onClick?: () => void;
  /**
   * Disable the button
   */
  disabled?: boolean;
}

/**
 * PrimaryActionSection Component
 * 
 * Large, visually prominent call-to-action for starting a new shelf audit.
 * This is the primary action on the Maker dashboard, designed to be
 * immediately visible and easy to tap/click.
 * 
 * Features:
 * - Gradient background for visual hierarchy
 * - Large button with generous padding
 * - Icon for visual clarity
 * - Navigates to /maker/audit/new route
 * - Responsive sizing (larger on desktop)
 * - Hover and focus states
 * 
 * @example
 * ```tsx
 * <PrimaryActionSection />
 * 
 * // With custom handler
 * <PrimaryActionSection onClick={() => console.log('clicked')} />
 * 
 * // Disabled state
 * <PrimaryActionSection disabled />
 * ```
 */
export function PrimaryActionSection({
  className,
  onClick,
  disabled = false,
}: PrimaryActionSectionProps) {
  const buttonContent = (
    <>
      <PlusIcon className="size-5 md:size-6" aria-hidden="true" />
      <span className="text-base md:text-lg font-semibold">
        Start New Shelf Audit
      </span>
    </>
  );

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

      {/* Primary CTA Button */}
      {onClick ? (
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
          onClick={onClick}
          disabled={disabled}
          aria-label="Start new shelf audit"
        >
          {buttonContent}
        </Button>
      ) : (
        <Button
          asChild
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
          <Link to="/maker/audit/new">{buttonContent}</Link>
        </Button>
      )}

      {/* Helper text */}
      <p className="mt-4 text-xs text-muted-foreground">
        You'll be able to choose between Vision Edge or Assist Mode
      </p>
    </div>
  );
}
