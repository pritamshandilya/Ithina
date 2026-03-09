import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ReportPage } from "@/components/shared/report-page";
import { SHELF_LEVEL_MOCK_DATA } from "@/lib/constants/reports-mock-data";
import type { ShelfSummary } from "@/lib/constants/reports-mock-data";
import { FileBarChart, Package, AlertTriangle } from "lucide-react";
import type { DataTableColumn } from "@/components/ui/data-table";

export const Route = createFileRoute("/checker/reports/shelf-level/")({
    component: ShelfLevelReport,
});

export function ShelfLevelReport() {
    const navigate = useNavigate();

    const stats = [
        { title: "TOTAL ANALYSES", value: 1, icon: FileBarChart },
        { title: "TOTAL PRODUCTS", value: 215, icon: Package },
        { title: "TOTAL ISSUES", value: 3, icon: AlertTriangle, variant: "warning" as const },
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
        // eslint-disable-next-line no-console
        console.log("Row clicked:", row);
        // Only navigate if it's a child row (analysis row)
        if (row.id.includes("-")) {
            const reportId = row.id.split("-")[1] || "1";
            // eslint-disable-next-line no-console
            console.log("Navigating to report:", reportId);
            navigate({ to: `/checker/reports/view/${reportId}` });
        } else {
            // eslint-disable-next-line no-console
            console.log("Parent row clicked, not navigating");
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
                <div className="mx-auto w-full max-w-screen-2xl space-y-4">
                    <ReportPage
                        title="Shelf Level Report"
                        subtitle="Downtown Flagship — Detailed analysis per shelf"
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
