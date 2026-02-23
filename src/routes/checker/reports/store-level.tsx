import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ReportPage } from "@/components/shared/report-page";
import { STORE_LEVEL_MOCK_DATA } from "@/lib/constants/reports-mock-data";
import type { ShelfSummary } from "@/lib/constants/reports-mock-data";
import { FileBarChart, Package, AlertTriangle, Layers } from "lucide-react";
import type { DataTableColumn } from "@/components/ui/data-table";

export const Route = createFileRoute("/checker/reports/store-level")({
    component: StoreLevelReport,
});

function StoreLevelReport() {
    const navigate = useNavigate();

    const stats = [
        { title: "TOTAL SHELVES", value: 1, icon: Layers },
        { title: "TOTAL ANALYSES", value: 0, icon: FileBarChart },
        { title: "TOTAL PRODUCTS", value: 0, icon: Package },
        { title: "TOTAL ISSUES", value: 0, icon: AlertTriangle, variant: "warning" as const },
    ];

    const columns: DataTableColumn<ShelfSummary>[] = [
        { title: "S.NO", field: "sNo", width: 80 },
        { title: "SHELF", field: "shelf" },
        { title: "LATEST ANALYSIS", field: "latestAnalysis" },
        { title: "LAST UPDATED", field: "lastUpdated" },
        { title: "PRODUCTS", field: "products" },
        { title: "ISSUES", field: "issues" },
        { title: "RUNS", field: "runs" },
        { title: "STATUS", field: "status" },
    ];

    const handleRowClick = (row: ShelfSummary) => {
        // eslint-disable-next-line no-console
        console.log("Store level row clicked:", row);
        navigate({ to: "/checker/reports/view/1" });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
                <div className="mx-auto max-w-screen-2xl">
                    <ReportPage
                        title="Store Level Report"
                        subtitle="Downtown Flagship — Consolidated from latest analysis per shelf"
                        stats={stats}
                        tableTitle="Shelf Summary"
                        tableColumns={columns}
                        tableData={STORE_LEVEL_MOCK_DATA}
                        tableProps={{
                            onRowClick: handleRowClick,
                        }}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
