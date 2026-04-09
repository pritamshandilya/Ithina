import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  FileBarChart,
  FileSignature,
  History,
  LayoutDashboard,
  LayoutGrid,
  LayoutPanelLeft,
  Library,
  ListChecks,
  Rows3,
  Settings,
  ShieldCheck,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { CORE_NAV } from "@/app/nav";
import logo from "@/assets/logo.avif";
import { hasAnyPermission, hasPermission } from "@/auth/authorization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarToggle,
  useSidebar,
} from "@/components/ui/sidebar";
import { AuthSessionService, type UserRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import { useStores as useCheckerStores, useOrgStores } from "@/queries/checker";
import { useStores as useMakerStores } from "@/queries/maker";
import SidenavFooter from "./footer";
import { TeamSwitcher } from "./header-switch";
import { isActiveItem, isMyAuditsActive, type NavItem } from "./nav-utils";

export default function Sidenav() {
  const location = useLocation();
  const currentUser = useSyncExternalStore(
    (onStoreChange) => AuthSessionService.subscribe(onStoreChange),
    () => AuthSessionService.getSnapshot().user,
    () => null,
  );
  const { state: sidebarState } = useSidebar();
  const { selectedStore, setSelectedStore } = useStore();

  const role: UserRole = currentUser?.role ?? "maker";

  const isOrgContext = useMemo(() => {
    if (role !== "admin") return false;
    const segments = location.pathname.split("/").filter(Boolean);
    // If it's just /admin or /admin/dashboard or /dashboard, it's org context
    // If it's /admin/something/... where something is NOT stores/users/organization-settings, it's store context
    if (location.pathname === "/dashboard" || location.pathname === "/admin" || segments[1] === "dashboard") return true;
    if (segments[0] === "admin" && (segments[1] === "stores" || segments[1] === "users" || segments[1] === "organization-settings")) return true;
    if (location.pathname === "/stores" || location.pathname === "/users") return true;
    
    return false;
  }, [role, location.pathname]);

  const enabledCoreNav = useMemo(() => {
    const nav = new Set<string>();

    for (const item of CORE_NAV) {
      if (item.requires && hasPermission(currentUser, item.requires)) {
        nav.add(item.key);
        continue;
      }

      if (item.requiresAny && hasAnyPermission(currentUser, item.requiresAny)) {
        nav.add(item.key);
      }
    }

    return nav;
  }, [currentUser]);

  const [myAuditsExpanded, setMyAuditsExpanded] = useState(() =>
    isMyAuditsActive(location.pathname)
  );

  useEffect(() => {
    if (!isMyAuditsActive(location.pathname)) return;
    const t = setTimeout(() => setMyAuditsExpanded(true), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const roleItems = useMemo<NavItem[]>(() => {
    const isStoreContext = location.pathname.startsWith("/checker") || (role === "admin" && selectedStore && !isOrgContext);

    if (role === "admin" && !isStoreContext) {
      const items: NavItem[] = [];
      if (enabledCoreNav.has("stores")) {
        items.push({ label: "Stores", to: "/stores", icon: Store });
      }
      if (enabledCoreNav.has("users")) {
        items.push({ label: "Users", to: "/users", icon: Users });
      }
      if (enabledCoreNav.has("dashboard")) {
        items.push({
          label: "Organization Settings",
          to: "/admin/organization-settings",
          icon: Settings,
        });
      }
      return items;
    }

    if (role === "maker") {
      const items: NavItem[] = [];
      if (enabledCoreNav.has("approvals")) {
        items.push({
          label: "Approvals",
          to: "/approvals",
          icon: FileSignature,
        });
      }
      // Maker store settings (view-only)
      items.push({
        label: "Store Settings",
        to: "/maker/store-settings",
        icon: Settings,
      });
      return items;
    }

    // Checker role or Admin in store context
    const items: NavItem[] = [];
    const isAdminStoreView = role === "admin" && selectedStore;
    // We use the store name as the ID in the URL as requested
    const storePrefix = isAdminStoreView ? `/admin/${selectedStore.name}` : "/checker";

    if (enabledCoreNav.has("approvals")) {
      items.push({ 
        label: "Audit Review", 
        to: (isAdminStoreView ? `${storePrefix}/audit-review` : "/approvals") as never, 
        icon: ShieldCheck 
      });
    }
    if (isAdminStoreView) {
      items.push({
        label: "Fixtures",
        to: `${storePrefix}/fixture-types` as never,
        icon: LayoutPanelLeft,
      });
    } else {
      items.push({
        label: "Fixtures",
        to: "/checker/fixture-types",
        icon: LayoutPanelLeft,
      });
    }
    items.push({ label: "Shelves", to: `${storePrefix}/shelf` as never, icon: Rows3 });
    if (enabledCoreNav.has("knowledge-center")) {
      items.push({
        label: "Knowledge Center",
        to: (isAdminStoreView ? `${storePrefix}/knowledge-center` : "/knowledge-center") as never,
        icon: Library,
      });
    }
    items.push({
      label: "Reports",
      icon: FileBarChart,
      items: [
        { label: "Store Level", to: `${storePrefix}/reports/store-level` as never },
        { label: "Shelf Level", to: `${storePrefix}/reports/shelf-level` as never },
        { label: "Adhoc Report", to: `${storePrefix}/reports/adhoc` as never },
      ],
    });
    if (isAdminStoreView) {
      items.push({
        label: "Store Settings",
        to: `${storePrefix}/store-settings` as never,
        icon: Settings,
      });
    } else {
      items.push({
        label: "Store Settings",
        to: "/checker/store-settings",
        icon: Settings,
      });
    }
    return items;
  }, [enabledCoreNav, role, isOrgContext, selectedStore, location.pathname]);

  const [reportsOpen, setReportsOpen] = useState(true);

  const { data: makerStores } = useMakerStores();
  const { data: checkerStores } = useCheckerStores();
  const { data: orgStores } = useOrgStores();

  const stores =
    role === "maker"
      ? makerStores
      : role === "admin"
        ? orgStores
        : checkerStores;

  useEffect(() => {
    if (role === "admin") return;
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  }, [role, stores, selectedStore, setSelectedStore]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "gap-3",
          sidebarState === "collapsed" && "items-center px-2"
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-3",
            sidebarState === "collapsed"
              ? "justify-center"
              : "justify-start"
          )}
        >
          {sidebarState !== "collapsed" && (
            <div className="relative h-14 min-w-0 flex-1">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/6 bg-card p-2 shadow-[0_12px_28px_rgba(3,8,20,0.22)]">
                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                <div className="absolute inset-0 rounded-[inherit] border border-white/6" />
              </div>
            </div>
          )}
          <SidebarToggle
            className={cn(
              "static inset-auto right-auto top-auto shrink-0 border-sidebar-border bg-card shadow-none",
              sidebarState === "collapsed"
                ? "size-9 rounded-xl"
                : "size-8 rounded-full"
            )}
          />
        </div>
        {currentUser && (
          <TeamSwitcher
            organization={currentUser?.organization || { name: "My Organization", id: "default-org" }}
            stores={stores ?? []}
            currentRole={role}
            isOrgDashboard={isOrgContext}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <Separator className="group-data-[collapsible=icon]:hidden" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={isActiveItem(location.pathname, location.hash, {
                    label: "Dashboard",
                    to: "/dashboard",
                    icon: LayoutDashboard,
                  })}
                >
                  <Link to={(role === "admin" && selectedStore && !isOrgContext ? `/admin/${selectedStore.name}/dashboard` : "/dashboard") as never}>
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {role === "maker" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveItem(location.pathname, location.hash, {
                      label: "Shelves",
                      to: "/maker/shelf",
                      icon: Rows3,
                    })}
                    tooltip="Shelves"
                  >
                    <Link to="/maker/shelf">
                      <Rows3 className="size-4 shrink-0" />
                      Shelves
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {role === "maker" && (
                <SidebarMenuItem>
                  {sidebarState === "collapsed" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          isActive={isMyAuditsActive(location.pathname)}
                          tooltip="My Audits"
                          className="cursor-pointer"
                        >
                          <ListChecks className="size-4 shrink-0 stroke-2 text-sidebar-foreground group-data-[collapsible=icon]:stroke-[2.5]" />
                          <span className="flex-1 truncate group-data-[collapsible=icon]:hidden">My Audits</span>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-56">
                        <DropdownMenuItem asChild>
                          <Link to="/maker/audits/planogram" className="flex items-center gap-2">
                            <LayoutGrid className="size-4" />
                            Planogram based analysis
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/maker/audits/adhoc" className="flex items-center gap-2">
                            <Zap className="size-4" />
                            Adhoc Analysis
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <SidebarMenuButton
                        isActive={isMyAuditsActive(location.pathname)}
                        tooltip="My Audits"
                        onClick={() => setMyAuditsExpanded((e) => !e)}
                        className="cursor-pointer"
                        asChild={false}
                      >
                        <span className="flex w-full items-center gap-2">
                          <ListChecks className="size-4 shrink-0 stroke-2 text-sidebar-foreground group-data-[collapsible=icon]:stroke-[2.5]" />
                          <span className="flex-1 truncate">My Audits</span>
                          <ChevronDown
                            className={`size-4 shrink-0 transition-transform ${myAuditsExpanded ? "rotate-180" : ""}`}
                          />
                        </span>
                      </SidebarMenuButton>
                      {myAuditsExpanded && (
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location.pathname.startsWith("/maker/audits/planogram")}
                            >
                              <Link to="/maker/audits/planogram">
                                <LayoutGrid />
                                Planogram based analysis
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location.pathname.startsWith("/maker/audits/adhoc")}
                            >
                              <Link to="/maker/audits/adhoc">
                                <Zap />
                                Adhoc Analysis
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      )}
                    </>
                  )}
                </SidebarMenuItem>
              )}

              {role === "maker" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/maker/historical-analysis")}
                    tooltip="Historical Analysis"
                  >
                    <Link to="/maker/historical-analysis">
                      <History className="size-4 shrink-0" />
                      Historical Analysis
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {roleItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveItem(location.pathname, location.hash, item);

                if (item.items) {
                  return (
                    <SidebarMenuItem key={item.label}>
                      {sidebarState === "collapsed" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.label}
                              isActive={isActive}
                            >
                              <Icon />
                              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="w-56">
                            {item.items.map((subItem) => (
                              <DropdownMenuItem key={subItem.label} asChild>
                                <Link to={subItem.to}>{subItem.label}</Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <>
                          <SidebarMenuButton
                            tooltip={item.label}
                            onClick={() => setReportsOpen(!reportsOpen)}
                            isActive={isActive}
                          >
                            <Icon />
                            <span>{item.label}</span>
                            <ChevronRight className={cn(
                              "ml-auto transition-transform duration-200",
                              reportsOpen && "rotate-90"
                            )} />
                          </SidebarMenuButton>
                          {reportsOpen && (
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.label}>
                                  <SidebarMenuSubButton asChild isActive={location.pathname === subItem.to}>
                                    <Link to={subItem.to}>{subItem.label}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.to!} hash={item.hash}>
                        <Icon />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="pb-1 text-center group-data-[collapsible=icon]:hidden">
          <span className="font-mono text-[11px] text-muted-foreground/60 select-none">
            v{__APP_VERSION__}
          </span>
        </div>
        <SidenavFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
