import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ReportPage } from "@/components/shared/report-page";
import { ADHOC_REPORT_MOCK_DATA } from "@/lib/constants/reports-mock-data";
import type { AdhocAnalysis } from "@/lib/constants/reports-mock-data";
import { FileBarChart, Package, AlertTriangle } from "lucide-react";
import type { DataTableColumn } from "@/components/ui/data-table";

export const Route = createFileRoute("/checker/reports/adhoc")({
    component: AdhocReport,
});

function AdhocReport() {
    const navigate = useNavigate();

    const stats = [
        { title: "TOTAL ANALYSES", value: 1, icon: FileBarChart },
        { title: "TOTAL PRODUCTS", value: 101, icon: Package },
        { title: "TOTAL ISSUES", value: 5, icon: AlertTriangle, variant: "warning" as const },
    ];

    const columns: DataTableColumn<AdhocAnalysis>[] = [
        { title: "S.NO", field: "sNo", width: 80 },
        { title: "NAME", field: "name", minWidth: 250 },
        { title: "DATE", field: "date" },
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
        // eslint-disable-next-line no-console
        console.log("Adhoc row clicked:", row);
        navigate({ to: `/checker/reports/view/${row.id}` });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
                <div className="mx-auto w-full max-w-screen-2xl space-y-4">
                    <ReportPage
                        title="Adhoc Report"
                        subtitle="Downtown Flagship — Adhoc analyses not linked to any shelf"
                        stats={stats}
                        tableTitle="Adhoc Analyses"
                        tableColumns={columns}
                        tableData={ADHOC_REPORT_MOCK_DATA}
                        tableProps={{
                            onRowClick: handleRowClick,
                        }}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
