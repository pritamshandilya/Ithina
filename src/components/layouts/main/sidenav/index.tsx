import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Library, ListChecks, Rows3, ShieldCheck, FileSignature, FileBarChart, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.avif";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

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
  // My Audits: active on /maker/audit-review and /maker/audit/new (audit creation flow)
  if (item.to === "/maker/audit-review") {
    return pathname === "/maker/audit-review" || pathname.startsWith("/maker/audit/");
  }
  if (!item.to) return false;
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
    { label: "Approvals", to: "/maker/manual-audits", icon: FileSignature },
  ];

  const checkerItems: NavItem[] = [
    { label: "Audit Review", to: "/checker/audit-review", icon: ShieldCheck },
    { label: "Shelves", to: "/checker/shelves", icon: Rows3 },
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
  ];

  const roleItems = role === "checker" ? checkerItems : makerItems;

  const [reportsOpen, setReportsOpen] = useState(true);

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
              {roleItems.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = isActiveItem(location.pathname, location.hash, item);

                if (item.items) {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        onClick={() => setReportsOpen(!reportsOpen)}
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
                          {item.items.map((subItem: { label: string; to: string }) => (
                            <SidebarMenuSubItem key={subItem.label}>
                              <SidebarMenuSubButton asChild isActive={location.pathname === subItem.to}>
                                <Link to={subItem.to as any}>{subItem.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.to as any} hash={item.hash}>
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
