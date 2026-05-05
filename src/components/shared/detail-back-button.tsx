import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DetailBackLinkProps = Omit<ComponentProps<typeof Link>, "children">;

export type DetailBackButtonProps = {
  className?: string;
  /** Defaults to "Back". */
  "aria-label"?: string;
} & (
  | { to: string; onClick?: never; linkProps?: never }
  | { onClick: () => void; to?: never; linkProps?: never }
  | { linkProps: DetailBackLinkProps; to?: never; onClick?: never }
);

/**
 * Icon-only back control: ghost button + ArrowLeft (`size-4`).
 * Use `to` for a simple path, `linkProps` for store-scoped / param routes, or `onClick` for history.navigate.
 */
export function DetailBackButton({
  className,
  to,
  onClick,
  linkProps,
  "aria-label": ariaLabel = "Back",
}: DetailBackButtonProps) {
  const icon = <ArrowLeft className="size-4 shrink-0" aria-hidden />;

  if (linkProps) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("shrink-0", className)}
        asChild
      >
        <Link {...linkProps} aria-label={ariaLabel}>
          {icon}
        </Link>
      </Button>
    );
  }

  if (to) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("shrink-0", className)}
        asChild
      >
        <Link to={to as never} aria-label={ariaLabel}>
          {icon}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0", className)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon}
    </Button>
  );
}
