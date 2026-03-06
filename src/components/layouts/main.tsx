import type { PropsWithChildren } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";

import Sidenav from "./main/sidenav";
import Header from "./main/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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

export default function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const fullReportView = isFullReportView(location.pathname);
  const stickyTablePage = isStickyTablePage(location.pathname);
  const constrainedHeight = fullReportView || stickyTablePage;

  return (
    <>
      <Sidenav />

      <SidebarInset className="flex min-h-0 flex-col">
        <Header />
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
    </>
  );
}
