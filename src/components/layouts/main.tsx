import type { PropsWithChildren } from "react";
import { Outlet } from "@tanstack/react-router";

import Sidenav from "./main/sidenav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidenav />

      <SidebarInset>
        {children ?? <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  );
}
