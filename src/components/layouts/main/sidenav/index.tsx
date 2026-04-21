import { useMemo, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import logo from "@/assets/logo.avif";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarToggle,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAdminNavSections, getNavSectionsForRole } from "@/constants/navigation";
import { useInboxItems } from "@/hooks/use-approval";
import { StoreContext } from "@/lib/store-context";
import { cn } from "@/lib/utils";

import SidenavFooter from "./footer";
import { TeamSwitcher } from "./team-switcher";

const ADMIN_ORG_NAV_PATHS = new Set([
  "/admin/dashboard",
  "/admin/stores",
  "/admin/users",
  "/admin/organization-settings",
]);

function navItemIsActive(pathname: string, itemPath: string): boolean {
  if (itemPath === "/admin/dashboard") {
    return pathname === itemPath;
  }
  if (itemPath === "/admin/store-dashboard") {
    return pathname === itemPath;
  }
  if (itemPath === "/admin/campaigns") {
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function Sidenav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, state } = useSidebar();
  const sidebarCollapsed = !isMobile && state === "collapsed";
  const user = PromoAuthService.getCurrentUser();
  const role = user?.role ?? "maker";

  const activeStoreId = useSyncExternalStore(
    StoreContext.subscribe,
    () => StoreContext.getStoreId(),
    () => null,
  );
  const adminInStoreContext = role === "admin" && !!activeStoreId;

  const { data: inboxItems = [] } = useInboxItems();
  const pendingApprovalCount = inboxItems.length;

  const navSections = useMemo(() => {
    const sections =
      role === "admin" ? getAdminNavSections(adminInStoreContext) : getNavSectionsForRole(role);
    if (role !== "admin" && role !== "checker") return sections;

    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === "approval-review" ? { ...item, badge: pendingApprovalCount } : item,
      ),
    }));
  }, [role, adminInStoreContext, pendingApprovalCount]);

  return (
    <Sidebar collapsible="icon" className="z-30 border-sidebar-border bg-sidebar">
      <SidebarHeader
        className={cn(
          "gap-3 pb-3 pt-2",
          sidebarCollapsed ? "items-center px-2" : "px-2",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-3 py-1.5",
            sidebarCollapsed ? "justify-center px-0" : "justify-start px-2",
          )}
        >
          {!sidebarCollapsed ? (
            <div className="relative h-14 min-w-0 flex-1">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/6 bg-card p-2 shadow-[0_12px_28px_rgba(3,8,20,0.22)]">
                <img src={logo} alt="Ithina" className="h-full w-full object-contain" />
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/6" />
              </div>
            </div>
          ) : null}
          <SidebarToggle
            className={cn(
              "static inset-auto shrink-0 border-sidebar-border bg-card shadow-none hover:bg-card/90",
              sidebarCollapsed ? "size-9 rounded-xl" : "size-8 rounded-full",
            )}
          />
        </div>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-0 px-1 py-2">
        <Separator className="group-data-[collapsible=icon]:hidden" />
        {navSections.map((section) => (
          <SidebarGroup key={section.label || "nav-section"}>
            {section.label ? (
              <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
                {section.label}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const active = navItemIsActive(location.pathname, item.path);
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={
                          sidebarCollapsed && item.badge != null && item.badge > 0
                            ? `${item.label} (${item.badge} pending)`
                            : item.label
                        }
                        isActive={active}
                        onClick={() => {
                          if (role === "admin" && ADMIN_ORG_NAV_PATHS.has(item.path)) {
                            StoreContext.clearStoreId();
                          }
                          navigate({ to: item.path });
                        }}
                        className="h-auto min-h-10"
                      >
                        {item.icon}
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        {item.badge != null && item.badge > 0 && !sidebarCollapsed ? (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
                              active ? "bg-primary/30 text-primary" : "bg-amber-400/20 text-amber-400",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-0">
        <SidenavFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
