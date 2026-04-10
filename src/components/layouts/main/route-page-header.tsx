import { Bell, Plus, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { NAV_ITEMS_FLAT } from "@/constants/navigation";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { cn } from "@/lib/utils";

const HIDE_FOR_PATHS = new Set<string>([
  "/admin/dashboard",
  "/admin/stores/new",
  "/admin/settings",
  "/maker/guard-rails",
]);

/** Matches current promo API: org user CRUD not wired yet. */
const INVITE_USER_DISABLED = true;

/**
 * POG-style strip: title + description from nav config, with global actions.
 * Hidden for routes that render a full custom header (e.g. org overview).
 */
export default function RoutePageHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = PromoAuthService.getCurrentUser();
  const role = user?.role ?? "maker";

  const nav = NAV_ITEMS_FLAT.find((item) => item.path === location.pathname);

  if (!nav) return null;
  if (HIDE_FOR_PATHS.has(location.pathname)) return null;

  const showNewCampaign = role === "maker" || role === "admin";
  const isAdminUsersPage = location.pathname === "/admin/users";
  const isAdminStoresPage = location.pathname === "/admin/stores";
  return (
    <header className="shrink-0 border-b border-border/80 bg-sidebar/70 py-2.5 backdrop-blur-xl">
      <div className="flex w-full flex-col gap-3 px-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">{nav.title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{nav.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {isAdminStoresPage ? (
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/stores/new" })}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              )}
            >
              <Plus className="size-3.5" />
              Create Store
            </button>
          ) : isAdminUsersPage ? (
            <button
              type="button"
              disabled={INVITE_USER_DISABLED}
              title={
                INVITE_USER_DISABLED
                  ? "User invite and role management is not available from the API yet."
                  : "Invite a user"
              }
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <UserPlus className="size-3.5" />
              Invite User
            </button>
          ) : showNewCampaign ? (
            <button
              type="button"
              onClick={() => navigate({ to: "/wizard" })}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              )}
            >
              <Plus className="size-3.5" />
              New Campaign
            </button>
          ) : null}
          <div className="flex h-9 items-center border-l border-border/60 pl-3">
            <button
              type="button"
              className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full border border-background bg-destructive text-[9px] font-bold text-destructive-foreground">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
