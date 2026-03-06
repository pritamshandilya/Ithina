import { Outlet } from "@tanstack/react-router";

import Header from "./main/header";
import Sidenav from "./main/sidenav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <Sidenav />

      <SidebarInset>
        <Header />

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
