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
      "h-10 w-full rounded-md border border-input bg-secondary px-3.5 py-2 text-sm text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
      "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      "font-medium appearance-none bg-[linear-gradient(45deg,transparent_50%,#94a3b8_50%),linear-gradient(135deg,#94a3b8_50%,transparent_50%)] bg-[position:calc(100%-18px)_calc(50%-1px),calc(100%-12px)_calc(50%-1px)] bg-[size:6px_6px,6px_6px] bg-no-repeat",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
