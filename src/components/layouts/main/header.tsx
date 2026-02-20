import { Link } from "@tanstack/react-router";
import { BookOpen, User } from "lucide-react";
import { useCallback } from "react";

import logo from "@/assets/logo.avif";
import { NotificationsDropdown } from "@/components/checker";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BookOpen, User } from "lucide-react";
import { useCallback } from "react";

import logo from "@/assets/logo.avif";
import { NotificationsDropdown } from "@/components/checker";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  
} from "@/features/checker/hooks";
import { mockCheckerUser } from "@/lib/api/mock-data";
// import { SimulatedAuthService } from "@/lib/auth/simulated-auth";
import { useStore } from "@/providers/store";
import type { Notification } from "@/types/checker";

export default function Header() {
  // const location = useLocation();
  // const currentUser = SimulatedAuthService.getCurrentUser();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;

  const { data: notifications } = useNotifications(selectedStoreId);

  // const role = useMemo(() => {
  //   if (currentUser?.role) return currentUser.role;
  //   if (location.pathname.startsWith("/checker")) return "checker";
  //   return "maker";
  // }, [currentUser?.role, location.pathname]);

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
    <header className="border-sidebar-border bg-sidebar sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4">
      {/* Left section: Logo and App Name */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="border-border bg-card hover:bg-accent/40 size-9 rounded-md border" />
        <div className="relative h-10 p-1 overflow-hidden bg-black rounded-md">
          <img src={logo} alt="Logo" className="w-full h-full object-fill" />
          <div className="absolute inset-0 -translate-x-full animate-shine bg-linear-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>

      {/* Right section: Search, Notifications, User, Real-time */}
      <div className="flex items-center gap-3">
        {/* <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] pl-8 h-9 bg-background/50"
          />
        </div> */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Knowledge Center"
        >
          <Link to="/checker/knowledge-center">
            <BookOpen className="size-5" aria-hidden="true" />
          </Link>
        </Button>
        <NotificationsDropdown
          notifications={notifications || []}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>

        {/* <Button variant="outline" size="sm" className="h-9">
          Real-time
        </Button> */}
      </div>
    </header>
  );
}
