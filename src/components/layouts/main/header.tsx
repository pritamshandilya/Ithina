import { useCallback } from "react";

import { NotificationsDropdown } from "@/components/checker";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "@/queries/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";
import type { Notification } from "@/types/checker";

export default function Header() {
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;

  const { data: notifications } = useNotifications(selectedStoreId);

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsRead.mutate(notification.id);
      }
    },
    [markAsRead],
  );

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsRead.mutate(notificationId);
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  return (
    <header className="border-sidebar-border bg-sidebar sticky top-0 z-50 flex h-12 items-center justify-end border-b px-3">
      <div className="flex items-center gap-3">
        {/* {currentUser?.organization.name && (
          <>
            <span className="hidden sm:inline-flex rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
              {currentUser.organization.name}
            </span>
            <span className="h-5 w-px bg-border shrink-0 hidden sm:block" aria-hidden />
          </>
        )}
        <time
          dateTime={new Date().toISOString().slice(0, 10)}
          className="text-sm font-medium text-muted-foreground tabular-nums shrink-0"
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time> */}
        <span
          className="h-5 w-px bg-border shrink-0"
          aria-hidden
        />
        <NotificationsDropdown
          notifications={notifications || []}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </header>
  );
}
