import { CalendarIcon, MapPinIcon, WifiIcon, WifiOffIcon } from "lucide-react";

import { StoreSelectorDropdown } from "@/components/checker/StoreSelectorDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { mockUser } from "@/lib/api/mockData";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/checker";

/**
 * Props for the HeaderContextBar component
 */
export interface HeaderContextBarProps {
  className?: string;
  /**
   * Show/hide sync status indicator (Online/Offline)
   * @default false - hidden since profile is accessible via sidebar
   */
  showSyncStatus?: boolean;
  /**
   * Stores available to the maker (when set, shows store dropdown instead of static store name)
   */
  stores?: Store[];
  /**
   * Currently selected store ID
   */
  selectedStoreId?: string;
  /**
   * Callback when store selection changes
   */
  onStoreChange?: (storeId: string) => void;
}

/**
 * Format the current date for display
 */
function formatCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get user initials from first and last name
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * HeaderContextBar Component
 *
 * Displays contextual information at the top of the Maker dashboard:
 * - Logged-in user name with avatar
 * - Selected store location
 * - Current date
 * - Sync status (Online/Offline indicator)
 *
 * This component uses mock user data for now and will integrate with
 * the AuthProvider in future iterations.
 *
 * @example
 * ```tsx
 * <HeaderContextBar />
 * <HeaderContextBar showSyncStatus={false} />
 * ```
 */
export function HeaderContextBar({
  className,
  showSyncStatus = false,
  stores = [],
  selectedStoreId,
  onStoreChange,
}: HeaderContextBarProps) {
  // TODO: Replace with real auth context in future iteration
  // const { userInfo } = useAuth();
  const userInfo = mockUser;

  const initials = getInitials(userInfo.firstName, userInfo.lastName);
  const fullName = `${userInfo.firstName} ${userInfo.lastName}`;
  const currentDate = formatCurrentDate();

  const showStoreDropdown =
    stores.length > 0 &&
    selectedStoreId != null &&
    typeof onStoreChange === "function";

  // Mock sync status - will be replaced with real offline detection
  const isOnline = true;

  return (
    <div
      className={cn(
        "bg-card border-border flex flex-wrap items-center gap-3 rounded-lg border p-4 shadow-sm md:gap-4",
        className,
      )}
      role="banner"
      aria-label="Dashboard context information"
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
          <p className="text-card-foreground truncate text-sm font-semibold">
            {fullName}
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-accent text-accent-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize">
              {userInfo.role}
            </span>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="hidden h-10 md:block" />

      {/* Store selector or static store */}
      {showStoreDropdown ? (
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-muted-foreground text-xs">Store</p>
          <StoreSelectorDropdown
            stores={stores}
            selectedStoreId={selectedStoreId}
            onStoreChange={onStoreChange}
            className="min-w-[180px] sm:min-w-[200px]"
          />
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <MapPinIcon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Store</p>
            <p className="text-card-foreground truncate text-sm font-medium">
              {userInfo.storeName}
            </p>
          </div>
        </div>
      )}

      <Separator orientation="vertical" className="hidden h-10 md:block" />

      {/* Current Date */}
      <div className="flex min-w-0 items-center gap-2">
        <CalendarIcon
          className="text-muted-foreground size-4 shrink-0"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">Date</p>
          <p className="text-card-foreground truncate text-sm font-medium">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Sync Status */}
      {showSyncStatus && (
        <>
          <Separator orientation="vertical" className="hidden h-10 md:block" />

          <div className="ml-auto flex items-center gap-2">
            {isOnline ? (
              <>
                <div
                  className="size-2 animate-pulse rounded-full"
                  style={{ backgroundColor: "var(--maker-approved)" }}
                  aria-hidden="true"
                />
                <WifiIcon
                  className="size-4 shrink-0"
                  style={{ color: "var(--maker-approved)" }}
                  aria-hidden="true"
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--maker-approved)" }}
                >
                  Online
                </span>
              </>
            ) : (
              <>
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: "var(--muted-foreground)" }}
                  aria-hidden="true"
                />
                <WifiOffIcon
                  className="text-muted-foreground size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground text-sm font-medium">
                  Offline
                </span>
              </>
            )}
            <span className="sr-only">
              Connection status: {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
