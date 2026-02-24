import { useCallback } from "react";

import logo from "@/assets/logo.avif";
import { NotificationsDropdown } from "@/components/checker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  
} from "@/features/checker/hooks";
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

      if (
        notification.type === "new_audit" ||
        notification.type === "critical_audit"
      ) {
        console.log("Navigate to audit:", notification.auditId);
      } else if (notification.type === "rule_change") {
       console.log("Navigate to rule change:", notification.auditId); 
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
    <header className="border-sidebar-border bg-sidebar sticky top-0 z-50 flex h-12 items-center justify-between border-b px-3">
      {/* Left section: Logo and App Name */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="border-border bg-card hover:bg-accent/40 size-9 rounded-md border" />
        <div className="relative h-10 p-1 overflow-hidden bg-black rounded-md">
          <img src={logo} alt="Logo" className="w-full h-full object-fill" />
          <div className="absolute inset-0 -translate-x-full animate-shine bg-linear-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>

      {/* Right section: Date and Notifications */}
      <div className="flex items-center gap-3">
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
        </time>
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
