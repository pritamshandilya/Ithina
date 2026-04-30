import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast, type HeaderNotification } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MAX_BADGE_COUNT = 9;

interface HeaderNotificationsTriggerProps {
  className?: string;
}

function formatNotificationTime(createdAt: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(createdAt);
}

function notificationTitle(notification: HeaderNotification) {
  return notification.title ?? "Notification";
}

export default function HeaderNotificationsTrigger({ className }: HeaderNotificationsTriggerProps) {
  const { markNotificationsRead, notifications, unreadCount } = useToast();
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && hasUnread) markNotificationsRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          {hasUnread ? (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-background bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground"
              aria-hidden="true"
            >
              {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 border-border bg-popover p-0 text-popover-foreground">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="text-xs font-semibold text-foreground">Notifications</span>
          {notifications.length > 0 ? (
            <span className="text-[10px] font-medium text-muted-foreground">{notifications.length} recent</span>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-80 overflow-y-auto p-1">
          {notifications.length === 0 ? (
            <div className="px-3 py-5 text-center text-xs text-muted-foreground">No notifications yet.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  notification.variant === "destructive"
                    ? "border-destructive/30 bg-destructive/10"
                    : "border-border/60 bg-muted/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div
                      className={cn(
                        "text-xs font-semibold leading-5",
                        notification.variant === "destructive" ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {notificationTitle(notification)}
                    </div>
                    {notification.description ? (
                      <div className="text-xs leading-5 text-muted-foreground">{notification.description}</div>
                    ) : null}
                  </div>
                  <time
                    dateTime={new Date(notification.createdAt).toISOString()}
                    className="shrink-0 pt-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {formatNotificationTime(notification.createdAt)}
                  </time>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
