import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const hideNumberSteppersClass =
    type === "number"
      ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      : ""

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-accent selection:text-accent-foreground border-input h-10 w-full min-w-0 rounded-md border bg-secondary px-3.5 py-2 text-sm text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        hideNumberSteppersClass,
        className
      )}
      {...props}
    />
  )
}

export { Input }
