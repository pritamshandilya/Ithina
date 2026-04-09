import { CalendarIcon, MapPinIcon, WifiIcon, WifiOffIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StoreSelectorDropdown } from "@/components/checker/store-selector-dropdown";
import { cn } from "@/lib/utils";
import { mockUser } from "@/lib/api/mock-data";
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
        "flex flex-wrap items-center gap-3 rounded-lg bg-card border border-border p-4 shadow-sm md:gap-4",
        className
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
          <p className="text-sm font-semibold text-card-foreground truncate">
            {fullName}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-xs font-semibold capitalize">
              {userInfo.role}
            </span>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="hidden h-10 md:block" />

      {/* Store selector or static store */}
      {showStoreDropdown ? (
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs text-muted-foreground">Store</p>
          <StoreSelectorDropdown
            stores={stores}
            selectedStoreId={selectedStoreId}
            onStoreChange={onStoreChange}
            className="min-w-[180px] sm:min-w-[200px]"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          <MapPinIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Store</p>
            <p className="text-sm font-medium text-card-foreground truncate">
              {userInfo.storeName}
            </p>
          </div>
        </div>
      )}

      <Separator orientation="vertical" className="hidden h-10 md:block" />

      {/* Current Date */}
      <div className="flex items-center gap-2 min-w-0">
        <CalendarIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-sm font-medium text-card-foreground truncate">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Sync Status */}
      {showSyncStatus && (
        <>
          <Separator orientation="vertical" className="hidden h-10 md:block" />

          <div className="flex items-center gap-2 ml-auto">
            {isOnline ? (
              <>
                <div
                  className="size-2 rounded-full animate-pulse"
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
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-muted-foreground">
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
