import { Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import RoutePageHeader from "./main/route-page-header";
import Sidenav from "./main/sidenav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAppSelector } from "@/store/hooks";

export default function MainLayout() {
  const location = useLocation();
  const isDark = useAppSelector((s) => s.ui.isDarkMode);

  // Sync Redux theme state with the document class used by Tailwind / shadcn
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidenav />

          <SidebarInset className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-ithina-bg">
            <div className="flex shrink-0 items-center gap-2 border-b border-ithina-border/50 bg-ithina-bg px-3 py-2 md:hidden">
              <SidebarTrigger className="text-foreground" />
            </div>

            <RoutePageHeader />

            <AnimatePresence mode="popLayout">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-auto overscroll-y-contain scroll-smooth"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
