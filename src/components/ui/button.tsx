import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold text-sm font-sans transition-[background-color,border-color,color] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default:
          "border border-accent/35 bg-accent/75 text-accent-foreground hover:bg-accent/85",
        accent:
          "border border-accent/35 bg-accent/75 text-accent-foreground hover:bg-accent/85",
        success:
          "border border-chart-2/35 bg-chart-2/70 text-[#062515] hover:bg-chart-2/80 focus-visible:ring-chart-2/30",
        destructive:
          "border border-destructive/35 bg-destructive/75 text-destructive-foreground hover:bg-destructive/85 focus-visible:ring-destructive/30",
        outline:
          "border border-border bg-card text-card-foreground hover:border-muted-foreground/50 hover:bg-secondary",
        "success-outline":
          "border border-chart-2/35 bg-chart-2/15 text-chart-2 hover:border-chart-2/55 hover:bg-chart-2/22 focus-visible:ring-chart-2/30",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:border-muted-foreground/40 hover:bg-secondary/85",
        ghost:
          "text-muted-foreground hover:bg-muted/45 hover:text-foreground",
        "icon-ghost":
          "text-muted-foreground hover:bg-muted/45 hover:text-foreground",
        "success-ghost":
          "text-chart-2 hover:bg-chart-2/18 hover:text-chart-2 focus-visible:ring-chart-2/30",
        "destructive-ghost":
          "text-destructive hover:bg-destructive/18 hover:text-destructive focus-visible:ring-destructive/30",
        link: "text-accent underline-offset-4 hover:text-accent hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 px-5 text-sm has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
