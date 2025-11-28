import { Outlet } from "@tanstack/react-router";

import Header from "./main/header";
import Sidebar from "./main/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <Sidebar />

      <SidebarInset>
        <Header />

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
