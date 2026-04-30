import { Plus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import HeaderNotificationsTrigger from "@/components/header-notifications-trigger";
import { NAV_ITEMS_FLAT, type NavItemFlat } from "@/constants/navigation";
import { UserFormModal } from "@/features/admin-users/components/UserFormModal";
import type { UserFormData } from "@/features/admin-users/types";
import { useCreateAdminUser } from "@/hooks/use-admin-users";
import { toast } from "@/hooks/use-toast";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { wizardEntryPathFromPathname } from "@/lib/wizard-route";
import { cn } from "@/lib/utils";

const HIDE_FOR_PATHS = new Set<string>(["/admin/dashboard", "/admin/stores/new"]);

/** Wizard renders its own title/shell — hide the global strip to avoid duplicate “New Campaign” headings. */
function isWizardPath(pathname: string): boolean {
  return (
    pathname === "/maker/wizard" ||
    pathname.startsWith("/maker/wizard/") ||
    pathname === "/wizard" ||
    pathname.startsWith("/wizard/")
  );
}

/**
 * POG-style strip: title + description from nav config, with global actions.
 * Hidden for routes that render a full custom header (e.g. org overview).
 */
const PROFILE_NAV: NavItemFlat = {
  id: "account-profile",
  label: "Profile",
  path: "/maker/profile",
  title: "Profile",
  subtitle: "Manage your account information and preferences.",
  crumbSection: "Account",
  crumbParent: "Account",
};

function navItemForPath(pathname: string): NavItemFlat | undefined {
  if (
    pathname === "/maker/profile" ||
    pathname === "/checker/profile" ||
    pathname === "/admin/profile"
  ) {
    return { ...PROFILE_NAV, path: pathname };
  }
  const exact = NAV_ITEMS_FLAT.find((item) => item.path === pathname);
  if (exact) return exact;
  const nested = NAV_ITEMS_FLAT.filter(
    (item) => item.path !== "/admin/dashboard" && pathname.startsWith(`${item.path}/`),
  );
  nested.sort((a, b) => b.path.length - a.path.length);
  return nested[0];
}

export default function RoutePageHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = PromoAuthService.getCurrentUser();
  const role = user?.role ?? "maker";
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const createUser = useCreateAdminUser();

  const nav = useMemo(() => navItemForPath(location.pathname), [location.pathname]);

  if (isWizardPath(location.pathname)) return null;
  if (!nav) return null;
  if (HIDE_FOR_PATHS.has(location.pathname)) return null;

  const isProfilePage =
    location.pathname === "/maker/profile" ||
    location.pathname === "/checker/profile" ||
    location.pathname === "/admin/profile";
  const isAdminOrganizationSettingsPage = location.pathname === "/admin/organization-settings";
  const isWizardRoute = isWizardPath(location.pathname);
  const showNewCampaign =
    (role === "maker" || role === "admin") &&
    !isProfilePage &&
    !isAdminOrganizationSettingsPage &&
    !isWizardRoute;
  const isAdminUsersPage = location.pathname === "/admin/users";
  const isAdminStoresPage = location.pathname === "/admin/stores";
  const isGuardRailsPage = location.pathname === "/admin/settings";
  return (
    <>
    <header className="shrink-0 border-b border-border/40 bg-ithina-bg py-2.5">
      <div className="flex w-full flex-col gap-3 px-4 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-start gap-2 sm:gap-3">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">{nav.title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{nav.subtitle}</p>
          </div>
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
          ) : isGuardRailsPage ? (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("promo:open-guard-rail-modal"))}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              )}
            >
              <Plus className="size-3.5" />
              Add Guard Rail
            </button>
          ) : isAdminUsersPage ? (
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              title="Invite a user"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              )}
            >
              <UserPlus className="size-3.5" />
              Invite User
            </button>
          ) : showNewCampaign ? (
            <button
              type="button"
              onClick={() => navigate({ to: wizardEntryPathFromPathname(location.pathname) })}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              )}
            >
              <Plus className="size-3.5" />
              New Campaign
            </button>
          ) : null}
          <div className="flex h-9 items-center border-l border-border/60 pl-3">
            <HeaderNotificationsTrigger />
          </div>
        </div>
      </div>
    </header>

    {isAdminUsersPage && inviteModalOpen ? (
      <UserFormModal
        onClose={() => setInviteModalOpen(false)}
        isSubmitting={createUser.isPending}
        onSave={async (data: UserFormData) => {
          try {
            await createUser.mutateAsync({
              first_name: data.firstName.trim(),
              last_name: data.lastName.trim(),
              email: data.email.trim().toLowerCase(),
              password: data.password,
              role: data.role,
              is_active: data.status === "active",
            });
            toast({
              title: "User invited",
              description: `${data.firstName} ${data.lastName} can sign in with the email and password you set.`,
            });
            setInviteModalOpen(false);
          } catch (e) {
            toast({
              title: "Could not invite user",
              description: (e as Error)?.message ?? "Please try again.",
              variant: "destructive",
            });
          }
        }}
      />
    ) : null}
    </>
  );
}
