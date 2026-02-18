import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";
import { ReportPage } from "@/components/shared/report-page";
import { SHELF_LEVEL_MOCK_DATA } from "@/lib/constants/reports-mock-data";
import type { ShelfSummary } from "@/lib/constants/reports-mock-data";
import { FileBarChart, Package, AlertTriangle, Layers } from "lucide-react";
import type { DataTableColumn } from "@/components/ui/data-table";

export const Route = createFileRoute("/checker/reports/shelf-level")({
    component: ShelfLevelReport,
});

function ShelfLevelReport() {
    const stats = [
        { title: "TOTAL SHELVES", value: 2, icon: Layers },
        { title: "TOTAL ANALYSES", value: 20, icon: FileBarChart },
        { title: "TOTAL PRODUCTS", value: 77, icon: Package },
        { title: "TOTAL ISSUES", value: 5, icon: AlertTriangle, variant: "warning" as const },
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

    return (
        <MainLayout>
            <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <ReportPage
                        title="Shelf Level Report"
                        subtitle="Downtown Flagship — Detailed analysis per shelf"
                        stats={stats}
                        tableTitle="Shelf Summary (Latest Run)"
                        tableColumns={columns}
                        tableData={SHELF_LEVEL_MOCK_DATA}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
