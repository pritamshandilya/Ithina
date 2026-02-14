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
  to: "/maker/dashboard" | "/maker/shelves" | "/maker/audit-review" | "/checker/dashboard" | "/checker/audit-review" | "/checker/shelves" | "/checker/knowledge-center";
  hash?: string;
  icon: typeof LayoutDashboard;
};

function isActiveItem(pathname: string, hash: string, item: NavItem): boolean {
  // Audit Review: active on /checker/audit-review and /checker/review/:id
  if (item.to === "/checker/audit-review") {
    return pathname === "/checker/audit-review" || pathname.startsWith("/checker/review/");
  }
  // My Audits: active on /maker/audit-review and /maker/audit/new (audit creation flow)
  if (item.to === "/maker/audit-review") {
    return pathname === "/maker/audit-review" || pathname.startsWith("/maker/audit/");
  }
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
    { label: "Shelves", to: "/maker/shelves", icon: Rows3 },
    { label: "My Audits", to: "/maker/audit-review", icon: ListChecks },
  ];

  const checkerItems: NavItem[] = [
    { label: "Audit Review", to: "/checker/audit-review", icon: ShieldCheck },
    { label: "Shelves", to: "/checker/shelves", icon: Rows3 },
    { label: "Knowledge Center", to: "/checker/knowledge-center", icon: Library },
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
