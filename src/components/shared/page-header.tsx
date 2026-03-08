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
        <section className={cn("rounded-xl border border-border/60 bg-card/70 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-6 sm:py-5", className)}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1.5">
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {Icon && <Icon className={cn("size-6 shrink-0 sm:size-7", iconColor)} />}
                    {title}
                    </h1>
                    {description && (
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {children}
                    {showNotifications ? <LayoutNotificationsAction /> : null}
                </div>
            </div>
        </section>
    );
}
