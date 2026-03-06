import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  FileBarChart,
  FileSignature,
  History,
  LayoutDashboard,
  LayoutGrid,
  Library,
  ListChecks,
  Rows3,
  ShieldCheck,
  Settings,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TeamSwitcher } from "./header-switch";
import logo from "@/assets/logo.avif";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/providers/store";
import { useStores as useMakerStores } from "@/features/maker/hooks";
import { useStores as useCheckerStores } from "@/features/checker/hooks";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthSessionService } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import SidenavFooter from "./footer";

type NavItem = {
  label: string;
  to?: string;
  hash?: string;
  icon: typeof LayoutDashboard;
  items?: { label: string; to: string }[];
};

function isActiveItem(pathname: string, hash: string, item: NavItem): boolean {
  // Audit Review: active on /checker/audit-review and /checker/review/:id
  if (item.to === "/checker/audit-review") {
    return pathname === "/checker/audit-review" || pathname.startsWith("/checker/review/");
  }
  // Shelves: active on /checker/shelf and all sub-routes
  if (item.to === "/checker/shelf") {
    return pathname === "/checker/shelf" || pathname.startsWith("/checker/shelf/");
  }
  // My Audits: active on /maker/audits/*
  if (item.to === "/maker/audits" || item.to === "/maker/audits/planogram" || item.to === "/maker/audits/adhoc") {
    return pathname.startsWith("/maker/audits");
  }
  if (!item.to) return false;
  const sameBase = pathname === item.to || pathname.startsWith(`${item.to}/`);
  if (!sameBase) return false;
  if (!item.hash) return hash.length === 0;
  return hash === `#${item.hash}`;
}

function isMyAuditsActive(pathname: string): boolean {
  return pathname.startsWith("/maker/audits");
}

export default function Sidenav() {
  const location = useLocation();
  const currentUser = AuthSessionService.getCurrentUser();
  const { state: sidebarState } = useSidebar();
  const { selectedStore, setSelectedStore } = useStore();

  const role = useMemo(() => {
    if (currentUser?.role) return currentUser.role;
    if (location.pathname.startsWith("/checker")) return "checker";
    return "maker";
  }, [currentUser?.role, location.pathname]);

  const isOrgContext = useMemo(() => {
    if (role !== "checker") return false;
    const orgPaths = ["/checker/org-", "/checker/stores"];
    return orgPaths.some(p => location.pathname.startsWith(p)) || location.pathname === "/checker/org-dashboard";
  }, [role, location.pathname]);

  const dashboardTo = role === "checker" ? (isOrgContext ? "/checker/org-dashboard" : "/checker/dashboard") : "/maker/dashboard";

  const [myAuditsExpanded, setMyAuditsExpanded] = useState(() =>
    isMyAuditsActive(location.pathname)
  );

  useEffect(() => {
    if (!isMyAuditsActive(location.pathname)) return;
    const t = setTimeout(() => setMyAuditsExpanded(true), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const makerItems: NavItem[] = [
    // Shelves - commented out, no longer necessary for maker
    // { label: "Shelves", to: "/maker/shelves", icon: Rows3 },
    { label: "Approvals", to: "/maker/manual-audits", icon: FileSignature },
  ];

  const orgItems: NavItem[] = [
    { label: "Stores", to: "/checker/stores", icon: Store },
    { label: "Staff", to: "/checker/org-staff", icon: Users },
  ];

  const storeItems: NavItem[] = [
    { label: "Audit Review", to: "/checker/audit-review", icon: ShieldCheck },
    { label: "Shelves", to: "/checker/shelf", icon: Rows3 },
    { label: "Knowledge Center", to: "/checker/knowledge-center", icon: Library },
    {
      label: "Reports",
      icon: FileBarChart,
      items: [
        { label: "Store Level", to: "/checker/reports/store-level" },
        { label: "Shelf Level", to: "/checker/reports/shelf-level" },
        { label: "Adhoc Report", to: "/checker/reports/adhoc" },
      ],
    },
    { label: "Store Settings", to: "/checker/store-settings", icon: Settings },
  ];


  const roleItems = useMemo(() => {
    if (role === "maker") return makerItems;
    if (isOrgContext) return orgItems;
    return storeItems;
  }, [role, isOrgContext, makerItems, orgItems, storeItems]);

  const [reportsOpen, setReportsOpen] = useState(true);

  const { data: makerStores } = useMakerStores();
  const { data: checkerStores } = useCheckerStores();

  const stores = role === "checker" ? checkerStores : makerStores;

  useEffect(() => {
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  }, [stores, selectedStore, setSelectedStore]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center py-4">
          <div className="relative h-12 w-full px-1 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0.5">
            <div className="relative h-full w-full overflow-hidden bg-black rounded-md flex items-center justify-center p-1">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              <div className="absolute inset-0 -translate-x-full animate-shine bg-linear-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>
        {(currentUser || role === "checker") && (
          <TeamSwitcher
            organization={currentUser?.organization || { name: "My Organization", id: "default-org" }}
            stores={stores ?? []}
            currentRole={role as "maker" | "checker"}
            isOrgDashboard={isOrgContext}
          />
        )}
      </SidebarHeader>
      <SidebarToggle />
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
                    to: dashboardTo,
                    icon: LayoutDashboard,
                  })}
                >
                  <Link to={dashboardTo}>
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
        <SidenavFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
