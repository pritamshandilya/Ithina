import { createContext, type PropsWithChildren, useContext } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";

import Sidenav from "./main/sidenav";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const MainLayoutContext = createContext(false);

interface MainLayoutProps extends PropsWithChildren {
  pageHeader?: React.ReactNode;
  pageHeaderClassName?: string;
}

/** Full report views where header/metrics/tabs stay fixed and only tab content scrolls */
function isFullReportView(pathname: string): boolean {
  if (pathname.includes("maker/reports/view")) return true;
  if (pathname.includes("checker/audit-report/")) return true;
  if (
    pathname.includes("checker/reports/view") &&
    !pathname.match(/checker\/reports\/view\/[^/]+/)
  )
    return true;
  return false;
}

/** Pages where header/search stay fixed and only the table scrolls */
function isStickyTablePage(pathname: string): boolean {
  if (pathname === "/maker/audits/planogram" || pathname === "/maker/audits/planogram/")
    return true;
  if (pathname === "/checker/shelf" || pathname === "/checker/shelf/") return true;
  if (pathname === "/checker/audit-review" || pathname === "/checker/audit-review/") return true;
  if (pathname === "/checker/knowledge-center" || pathname === "/checker/knowledge-center/")
    return true;
  if (pathname === "/maker/audits/adhoc" || pathname === "/maker/audits/adhoc/") return true;
  if (pathname === "/maker/manual-audits" || pathname === "/maker/manual-audits/") return true;
  if (pathname.startsWith("/maker/historical-analysis")) return true;
  return false;
}

export default function MainLayout({
  children,
  pageHeader,
  pageHeaderClassName,
}: MainLayoutProps) {
  const isNestedMainLayout = useContext(MainLayoutContext);
  const location = useLocation();
  const fullReportView = isFullReportView(location.pathname);
  const stickyTablePage = isStickyTablePage(location.pathname);
  const constrainedHeight = fullReportView || stickyTablePage;

  if (isNestedMainLayout) {
    return (
      <>
        {pageHeader ? (
          <div className={cn("mb-4 shrink-0 px-3 py-3 sm:px-4 lg:px-6", pageHeaderClassName)}>{pageHeader}</div>
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

      <SidebarInset className="flex min-h-0 flex-col">
        {pageHeader ? (
          <div className="shrink-0 border-b border-border/40 bg-background/50 px-3 py-3 backdrop-blur-md sm:px-4 lg:px-6">
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
