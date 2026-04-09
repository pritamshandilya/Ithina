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

export function LayoutNotificationsAction() {
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
    <NotificationsDropdown
      className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/10"
      notifications={notifications || []}
      onNotificationClick={handleNotificationClick}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}
