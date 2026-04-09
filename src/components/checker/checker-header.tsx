/**
 * Checker Header Component
 * 
 * Main header for Checker Dashboard with:
 * - User information with avatar
 * - Store selector dropdown
 * - Role indicator badge
 * - Notifications dropdown
 * - Knowledge Center link
 * 
 * This header provides context and navigation for the checker role.
 */

import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Notification, Store } from "@/types/checker";

import { StoreSelectorDropdown } from "./store-selector-dropdown";
import { NotificationsDropdown } from "./notifications-dropdown";

export interface CheckerHeaderProps {
  /**
   * Current user information
   */
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  
  /**
   * List of stores available to this checker
   */
  stores: Store[];
  
  /**
   * Currently selected store ID
   */
  selectedStoreId: string;
  
  /**
   * Callback when store selection changes
   */
  onStoreChange: (storeId: string) => void;
  
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
 * Get user initials from first and last name
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * CheckerHeader Component
 * 
 * Displays contextual information and controls at the top of the Checker dashboard:
 * - User info with avatar and role badge
 * - Store selector for multi-store management
 * - Notifications with unread count
 * - Knowledge Center access
 * 
 * Responsive: Stacks on mobile, inline on desktop
 */
export function CheckerHeader({
  user,
  stores,
  selectedStoreId,
  onStoreChange,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: CheckerHeaderProps) {
  const routes = useStoreScopedCheckerRoutes();
  const initials = getInitials(user.firstName, user.lastName);
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg bg-card border border-border p-4 shadow-sm md:gap-4",
        className
      )}
      role="banner"
      aria-label="Checker dashboard context information"
    >
      {/* User Info */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={undefined} // No image for mock user
            alt={fullName}
          />
          <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-card-foreground truncate">
            {fullName}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-xs font-semibold">
              Checker
            </span>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="hidden h-10 md:block" />

      {/* Store Selector */}
      <div className="flex items-center gap-2">
        <StoreSelectorDropdown
          stores={stores}
          selectedStoreId={selectedStoreId}
          onStoreChange={onStoreChange}
        />
      </div>

      <Separator orientation="vertical" className="hidden h-10 md:block" />

      {/* Actions - Right Side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Knowledge Center */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Knowledge Center"
        >
          <Link {...routes.toKnowledgeCenter()}>
            <BookOpen className="size-5" aria-hidden="true" />
          </Link>
        </Button>

        {/* Notifications */}
        <NotificationsDropdown
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
        />
      </div>
    </div>
  );
}
