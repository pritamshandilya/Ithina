/**
 * Notifications Dropdown Component
 *
 * Displays recent notifications in a dropdown panel.
 * Shows unread indicator, allows marking as read, and navigation.
 *
 * Features:
 * - Bell icon with unread badge count
 * - Dropdown panel with notification list
 * - Mark individual or all as read
 * - Click to navigate to related audit
 * - Keyboard navigation
 * - Auto-refresh polling
 */
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Check,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/checker";

export interface NotificationsDropdownProps {
  /**
   * List of notifications
   */
  notifications: Notification[];

  /**
   * Callback when notification is clicked
   */
  onNotificationClick?: (notification: Notification) => void;

  /**
   * Callback when mark as read is clicked
   */
  onMarkAsRead?: (notificationId: string) => void;

  /**
   * Callback when mark all as read is clicked
   */
  onMarkAllAsRead?: () => void;

  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "new_audit":
      return ClipboardList;
    case "critical_audit":
      return AlertTriangle;
    case "rule_change":
      return BookOpen;
    default:
      return Bell;
  }
}

/**
 * NotificationsDropdown Component
 *
 * Bell icon with dropdown showing recent notifications.
 * Unread count badge, mark as read functionality.
 */
export function NotificationsDropdown({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Call click handler
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Close dropdown
    setOpen(false);
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="bg-destructive border-background absolute top-2 right-2 flex h-2 w-2 rounded-full border shadow-xs"
              aria-label={`${unreadCount} unread notifications`}
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-accent hover:text-accent/80 h-auto px-2 py-1 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="text-muted-foreground px-4 py-8 text-center text-sm">
            <Bell
              className="mx-auto mb-2 size-8 opacity-50"
              aria-hidden="true"
            />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const isCritical = notification.type === "critical_audit";

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                    "hover:bg-accent focus:bg-accent focus:outline-none",
                    !notification.read && "bg-muted/50",
                  )}
                  aria-label={notification.message}
                >
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div
                      className="bg-accent mt-2 size-2 shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                  {notification.read && (
                    <div className="mt-2 size-2 shrink-0" />
                  )}

                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">
                    <Icon
                      className={cn(
                        "size-4",
                        isCritical
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        !notification.read
                          ? "text-card-foreground font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {notification.message}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Mark as Read Icon */}
                  {!notification.read && onMarkAsRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className="hover:bg-accent-foreground/10 mt-1 shrink-0 rounded-sm p-1 transition-colors"
                      aria-label="Mark as read"
                    >
                      <Check
                        className="text-accent size-4"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
