import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { LayoutNotificationsAction } from "./LayoutNotificationsAction";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** e.g. back button — rendered before the icon/title block */
  leading?: ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  children?: ReactNode;
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
  leading,
  icon: _icon,
  iconColor: _iconColor = "text-accent",
  children,
  className,
  showNotifications = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {leading}
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">{children}</div>
        {showNotifications && (
          <div className="border-border/60 flex h-9 items-center border-l pl-3">
            <LayoutNotificationsAction />
          </div>
        )}
      </div>
    </div>
  );
}
