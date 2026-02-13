import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Library, ListChecks, Rows3, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import SidenavFooter from "./footer";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.avif";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

type NavItem = {
  label: string;
  to: "/maker/dashboard" | "/checker/dashboard" | "/maker/shelves";
  hash?: string;
  icon: typeof LayoutDashboard;
};

function isActiveItem(pathname: string, hash: string, item: NavItem): boolean {
  const sameBase = pathname === item.to || pathname.startsWith(`${item.to}/`);
  if (!sameBase) return false;
  if (!item.hash) return hash.length === 0;
  return hash === `#${item.hash}`;
}

export default function Sidenav() {
  const location = useLocation();
  const currentUser = SimulatedAuthService.getCurrentUser();

  const role = useMemo(() => {
    if (currentUser?.role) return currentUser.role;
    if (location.pathname.startsWith("/checker")) return "checker";
    return "maker";
  }, [currentUser?.role, location.pathname]);

  const dashboardTo = role === "checker" ? "/checker/dashboard" : "/maker/dashboard";

  const makerItems: NavItem[] = [
    { label: "Shelves", to: "/maker/dashboard", hash: "assigned-shelves-heading", icon: Rows3 },
    { label: "My Audits", to: "/maker/dashboard", hash: "my-audits-heading", icon: ListChecks },
    { label: "Shelf Management", to: "/maker/shelves", icon: Rows3 },
  ];

  const checkerItems: NavItem[] = [
    { label: "Audit Review", to: "/checker/dashboard", hash: "audit-queue-heading", icon: ShieldCheck },
    { label: "Shelves", to: "/checker/dashboard", hash: "audit-queue-heading", icon: Rows3 },
    { label: "Knowledge Center", to: "/checker/dashboard", hash: "knowledge-center-heading", icon: Library },
  ];

  const roleItems = role === "checker" ? checkerItems : makerItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <img src={logo} alt="Planogram Assistant" className="h-12 w-auto rounded" />
          </div>
          <SidebarTrigger className="size-8 rounded-md border border-sidebar-border hover:bg-sidebar-accent group-data-[collapsible=icon]:mx-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === "checker" ? "Checker" : "Maker"}</SidebarGroupLabel>
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
              {roleItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveItem(location.pathname, location.hash, item);

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.to} hash={item.hash}>
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
