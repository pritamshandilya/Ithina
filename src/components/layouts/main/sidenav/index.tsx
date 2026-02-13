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
} from "@/components/ui/sidebar";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

type NavItem = {
  label: string;
  to: "/maker" | "/checker";
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

  const dashboardTo = role === "checker" ? "/checker" : "/maker";

  const makerItems: NavItem[] = [
    { label: "Shelves", to: "/maker", hash: "assigned-shelves-heading", icon: Rows3 },
    { label: "My Audits", to: "/maker", hash: "my-audits-heading", icon: ListChecks },
  ];

  const checkerItems: NavItem[] = [
    { label: "Audit Review", to: "/checker", hash: "audit-queue-heading", icon: ShieldCheck },
    { label: "Shelves", to: "/checker", hash: "audit-queue-heading", icon: Rows3 },
    { label: "Knowledge Center", to: "/checker", hash: "knowledge-center-heading", icon: Library },
  ];

  const roleItems = role === "checker" ? checkerItems : makerItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <img src="/logo.avif" alt="Planogram Assistant" className="h-7 w-auto rounded" />
          <p className="text-sm font-semibold text-sidebar-foreground">Planogram Assistant</p>
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
                    <SidebarMenuButton asChild isActive={isActive}>
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
