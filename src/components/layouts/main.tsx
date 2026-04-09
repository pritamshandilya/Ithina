import { createContext, type PropsWithChildren, useContext } from "react";
import { Outlet, useRouter } from "@tanstack/react-router";

import Sidenav from "./main/sidenav";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const MainLayoutContext = createContext(false);

interface MainLayoutProps extends PropsWithChildren {
  pageHeader?: React.ReactNode;
  pageHeaderClassName?: string;
}

type LayoutMode = "default" | "fullReport" | "stickyTable";

export default function MainLayout({
  children,
  pageHeader,
  pageHeaderClassName,
}: MainLayoutProps) {
  const isNestedMainLayout = useContext(MainLayoutContext);
  const router = useRouter();

  // Derive layout mode from the current route's meta instead of hard-coded path checks.
  const matches = router.state.matches;
  const currentMatch = matches[matches.length - 1];
  const layoutMode: LayoutMode =
    (currentMatch?.meta as { layoutMode?: LayoutMode } | undefined)
      ?.layoutMode ?? "default";
  const constrainedHeight =
    layoutMode === "fullReport" || layoutMode === "stickyTable";

  if (isNestedMainLayout) {
    return (
      <>
        {pageHeader ? (
          <div className={cn("mb-4 shrink-0 border-b border-border px-3 py-3 sm:px-4 lg:px-6", pageHeaderClassName)}>{pageHeader}</div>
        ) : null}
        <div className="mt-4 flex-1">
          {children ?? <Outlet />}
        </div>
      </>
    );
  }

  return (
    <MainLayoutContext.Provider value={true}>
      <Sidenav />

      <SidebarInset className="flex min-h-0 flex-col bg-background">
        {pageHeader ? (
          <div className="shrink-0 border-b border-border/80 bg-sidebar/70 px-3 py-4 backdrop-blur-xl sm:px-4 lg:px-6">
            <div className={cn("mx-auto w-full max-w-screen-2xl", pageHeaderClassName)}>
              {pageHeader}
            </div>
          </div>
        ) : null}
        <div
          className={cn(
            "min-h-0 flex-1",
            constrainedHeight
              ? "flex flex-col overflow-hidden"
              : "overflow-auto"
          )}
        >
          {children ?? <Outlet />}
        </div>
      </SidebarInset>
    </MainLayoutContext.Provider>
  );
}
