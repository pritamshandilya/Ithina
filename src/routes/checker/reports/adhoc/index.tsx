import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import MainLayout from "@/components/layouts/main";
import { ReportPage } from "@/components/shared/report-page";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ADHOC_REPORT_MOCK_DATA } from "@/lib/constants/reports-mock-data";
import type { AdhocAnalysis } from "@/lib/constants/reports-mock-data";
import { FileBarChart, Package, AlertTriangle, Download } from "lucide-react";
import type { DataTableColumn } from "@/components/ui/data-table";

export const Route = createFileRoute("/checker/reports/adhoc/")({
    component: AdhocReport,
});

export function AdhocReport() {
    const navigate = useNavigate();
    const routes = useStoreScopedCheckerRoutes();

    const stats = [
        { title: "TOTAL ANALYSES", value: 1, icon: FileBarChart },
        { title: "TOTAL PRODUCTS", value: 101, icon: Package },
        { title: "TOTAL ISSUES", value: 5, icon: AlertTriangle, variant: "warning" as const },
    ];

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
        { title: "DATE", field: "date", width: 140 },
        { title: "PRODUCTS", field: "products", width: 120 },
        { title: "ISSUES", field: "issues", width: 120 },
        {
            title: "STATUS",
            field: "status",
            width: 120,
            formatter: (cell: unknown) => {
                const cellData = cell as { getValue: () => string; getData: () => AdhocAnalysis };
                const val = cellData.getValue();
                const issues = cellData.getData().issues;
                if (issues > 0) {
                    return `
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded border border-destructive/50 bg-destructive/10 text-destructive text-xs font-medium w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              ${issues}
            </div>
          `;
                }
                return val;
            }
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
                    <Button variant="outline" size="sm" className="gap-2 shrink-0">
                        <Download className="size-4" />
                        Export PDF
                    </Button>
                </PageHeader>
            }
        >
            <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
                <div className="mx-auto w-full max-w-screen-2xl space-y-4">
                    <ReportPage
                        stats={stats}
                        tableTitle="Adhoc Analyses"
                        tableColumns={columns}
                        tableData={ADHOC_REPORT_MOCK_DATA}
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
