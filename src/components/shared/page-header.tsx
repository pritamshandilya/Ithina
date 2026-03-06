import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children?: React.ReactNode;
    className?: string;
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
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between group mb-6", className)}>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    {Icon && <Icon className={cn("size-8", iconColor)} />}
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}
