import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Download, FileBarChart, Package } from "lucide-react";
import { useMemo } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReportPage } from "@/components/shared/ReportPage";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/ui/DataTable";
import { useStoreScopedCheckerRoutes } from "@/hooks/useStoreScopedCheckerRoutes";
import { useStore } from "@/providers/store";
import { useAdhocAnalyses } from "@/queries/maker";
import type { AdhocAnalysis } from "@/types/maker";

export const Route = createFileRoute("/checker/reports/adhoc/")({
  component: AdhocReport,
});

export function AdhocReport() {
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id;
  const { data: analyses = [] } = useAdhocAnalyses(selectedStoreId);

  const stats = useMemo(() => {
    const totalAnalyses = analyses.length;
    const completed = analyses.filter(
      (analysis) => analysis.status === "completed",
    );
    const avgScore =
      completed.length > 0
        ? Math.round(
            completed.reduce(
              (sum, analysis) => sum + (analysis.complianceScore ?? 0),
              0,
            ) / completed.length,
          )
        : 0;
    const failed = analyses.filter(
      (analysis) => analysis.status === "failed",
    ).length;

    return [
      { title: "TOTAL ANALYSES", value: totalAnalyses, icon: FileBarChart },
      { title: "AVG SCORE", value: `${avgScore}%`, icon: Package },
      {
        title: "FAILED",
        value: failed,
        icon: AlertTriangle,
        variant: "warning" as const,
      },
    ];
  }, [analyses]);

  const columns: DataTableColumn<AdhocAnalysis>[] = [
    // { title: "S.NO", field: "sNo", width: 80 },
    { title: "NAME", field: "name", minWidth: 250 },
    {
      title: "ZONE",
      field: "zone",
      width: 100,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => AdhocAnalysis }).getData();
        return `<span class="text-sm font-medium text-foreground">${row.zone ?? "—"}</span>`;
      },
    },
    {
      title: "SECTION",
      field: "section",
      minWidth: 140,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => AdhocAnalysis }).getData();
        return `<span class="text-sm font-medium text-foreground">${row.section ?? "—"}</span>`;
      },
    },
    {
      title: "FIXTURE",
      field: "fixtureType",
      width: 120,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => AdhocAnalysis }).getData();
        const type = row.fixtureType?.replace(/_/g, " ") ?? "—";
        return `<span class="text-sm font-medium text-foreground">${type}</span>`;
      },
    },
    {
      title: "DIMENSIONS",
      field: "dimensions",
      width: 120,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => AdhocAnalysis }).getData();
        return `<span class="text-sm font-medium text-foreground">${row.dimensions ?? "—"}</span>`;
      },
    },
    { title: "DATE", field: "createdAt", width: 140 },
    { title: "SCORE", field: "complianceScore", width: 120 },
    { title: "FIXTURE ID", field: "fixtureId", width: 120 },
    {
      title: "STATUS",
      field: "status",
      width: 120,
      formatter: (cell: unknown) => {
        const cellData = cell as {
          getValue: () => string;
          getData: () => AdhocAnalysis;
        };
        const val = cellData.getValue();
        if (val === "failed") {
          return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border border-destructive/50 bg-destructive/10 text-destructive">Failed</span>`;
        }
        if (val === "processing") {
          return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border border-accent/50 bg-accent/10 text-accent">Processing</span>`;
        }
        return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border border-chart-2/50 bg-chart-2/10 text-chart-2">Completed</span>`;
      },
    },
  ];

  const handleRowClick = (row: AdhocAnalysis) => {
    navigate({ ...routes.toReportsView(row.id) });
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Adhoc Report"
          description="Downtown Flagship — Adhoc analyses not linked to any shelf"
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
            tableTitle="Adhoc Analyses"
            tableColumns={columns}
            tableData={analyses}
            tableProps={{
              layout: "fitData",
              onRowClick: handleRowClick,
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
