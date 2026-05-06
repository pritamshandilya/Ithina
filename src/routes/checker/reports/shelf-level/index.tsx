import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Download, FileBarChart, Package } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReportPage } from "@/components/shared/ReportPage";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/ui/DataTable";
import { useStoreScopedCheckerRoutes } from "@/hooks/useStoreScopedCheckerRoutes";
import { SHELF_LEVEL_MOCK_DATA } from "@/lib/constants/reportsMockData";
import type { ShelfSummary } from "@/lib/constants/reportsMockData";

export const Route = createFileRoute("/checker/reports/shelf-level/")({
  component: ShelfLevelReport,
  meta: {
    layoutMode: "stickyTable",
  },
});

export function ShelfLevelReport() {
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();

  const stats = [
    { title: "TOTAL ANALYSES", value: 1, icon: FileBarChart },
    { title: "TOTAL PRODUCTS", value: 215, icon: Package },
    {
      title: "TOTAL ISSUES",
      value: 3,
      icon: AlertTriangle,
      variant: "warning" as const,
    },
  ];

  const columns: DataTableColumn<ShelfSummary>[] = [
    // { title: "S.NO", field: "sNo", width: 80, responsive: 0 },
    { title: "NAME", field: "shelf" },
    { title: "LAST UPDATED", field: "lastUpdated" },
    { title: "PRODUCTS", field: "products" },
    { title: "ISSUES", field: "issues" },
    { title: "RUNS", field: "runs" },
    { title: "STATUS", field: "status" },
  ];

  const handleRowClick = (row: ShelfSummary) => {
    // Only navigate if it's a child row (analysis row)
    if (row.id.includes("-")) {
      const reportId = row.id.split("-")[1] || "1";
      navigate({ ...routes.toReportsView(reportId) });
    }
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Shelf Level Report"
          description="Downtown Flagship — Detailed analysis per shelf"
        >
          <Button variant="outline" size="sm" className="shrink-0 gap-2">
            <Download className="size-4" />
            Export PDF
          </Button>
        </PageHeader>
      }
    >
      <div className="bg-primary min-h-screen px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <ReportPage
            stats={stats}
            tableTitle="Shelf level Summary"
            tableColumns={columns}
            tableData={SHELF_LEVEL_MOCK_DATA}
            tableProps={{
              dataTree: true,
              dataTreeStartExpanded: false,
              dataTreeElementColumn: "shelf",
              onRowClick: handleRowClick,
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
