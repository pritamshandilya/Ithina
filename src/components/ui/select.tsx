/**
 * Select Component
 *
 * Native select styled to match the app's color scheme.
 * Uses bg-card and text-card-foreground for consistency with dark theme.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    data-slot="select"
    className={cn(
      "h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-card-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      "md:text-sm",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
