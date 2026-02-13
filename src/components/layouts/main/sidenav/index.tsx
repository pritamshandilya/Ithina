import { Link } from "@tanstack/react-router";

import SidenavFooter from "./footer";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function Sidenav() {
  return (
    <Sidebar>
      <SidebarHeader>
        <p className="px-2 text-sm font-semibold text-sidebar-foreground">
          Planogram Assistant
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/maker">Maker Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/checker">Checker Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidenavFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
