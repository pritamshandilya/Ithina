import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutNotificationsAction } from "./layout-notifications-action";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children?: React.ReactNode;
    className?: string;
    showNotifications?: boolean;
}

/**
 * PageHeader Component
 * 
 * A consistent header for pages, following the application's design system.
 * Includes a title, optional description, icon, and right-aligned actions.
 */
export function PageHeader({
    title,
    description,
    icon: Icon,
    iconColor = "text-accent",
    children,
    className,
    showNotifications = true,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", className)}>
            <div className="min-w-0">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                            <Icon className={cn("size-5", iconColor)} />
                        </div>
                    )}
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm font-medium text-muted-foreground/70">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    {children}
                </div>
                {showNotifications && (
                    <div className="flex items-center pl-3 border-l border-border/50 h-8">
                        <LayoutNotificationsAction />
                    </div>
                )}
            </div>
        </div>
    );
}

