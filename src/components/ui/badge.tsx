import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-accent/20 bg-accent/10 text-accent",
                secondary:
                    "border-white/10 bg-white/5 text-muted-foreground",
                destructive:
                    "border-destructive/20 bg-destructive/10 text-destructive",
                outline: "border-white/10 bg-transparent text-muted-foreground",
                purple: "border-accent/20 bg-accent/10 text-accent",
                emerald: "border-chart-2/20 bg-chart-2/10 text-chart-2",
                amber: "border-action-warning/20 bg-action-warning/10 text-action-warning",
                rose: "border-destructive/20 bg-destructive/10 text-destructive",
                slate: "border-white/10 bg-white/5 text-muted-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
