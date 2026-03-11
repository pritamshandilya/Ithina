import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";

import MainLayout from "@/components/layouts/main";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoricalAnalyses } from "@/queries/maker";
import type { AdhocAnalysisStatus } from "@/types/maker";
import type { HistoricalAnalysisRow } from "@/types/maker";
import { getRelativePath } from "@/lib/utils";

export const Route = createFileRoute("/maker/historical-analysis/")({
  component: HistoricalAnalysisPage,
});

const STATUS_LABELS: Record<AdhocAnalysisStatus | "completed", string> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function getStatusClass(status: HistoricalAnalysisRow["status"]): string {
  switch (status) {
    case "completed":
      return "bg-chart-2/20 text-chart-2 border-chart-2/30";
    case "processing":
      return "bg-accent/20 text-accent border-accent/30";
    case "failed":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

const COLUMNS: DataTableColumn<HistoricalAnalysisRow>[] = [
  {
    title: "Type",
    field: "type",
    width: 120,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => HistoricalAnalysisRow }).getData();
      const label = row.type === "adhoc" ? "Adhoc" : "Planogram";
      const cls =
        row.type === "adhoc"
          ? "bg-accent/20 text-accent border-accent/30"
          : "bg-chart-1/20 text-chart-1 border-chart-1/30";
      return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${cls}">${label}</span>`;
    },
  },
  {
    title: "Name",
    field: "name",
    minWidth: 200,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => HistoricalAnalysisRow }).getData();
      return `<span class="font-medium text-foreground">${row.name}</span>`;
    },
  },
  {
    title: "Store",
    field: "storeName",
    minWidth: 160,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => HistoricalAnalysisRow }).getData();
      return `<span class="text-sm text-muted-foreground">${row.storeName}</span>`;
    },
  },
  {
    title: "Date",
    field: "runDate",
    sorter: "date",
    width: 140,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => HistoricalAnalysisRow }).getData();
      const date = row.runDate instanceof Date ? row.runDate : new Date(row.runDate);
      return `<span class="text-sm text-muted-foreground">${format(date, "MMM d, yyyy")}</span>`;
    },
  },
  {
    title: "Status",
    field: "status",
    sorter: "string",
    width: 120,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => HistoricalAnalysisRow }).getData();
      const label = STATUS_LABELS[row.status] ?? row.status;
      const statusClass = getStatusClass(row.status);
      return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${statusClass}">${label}</span>`;
    },
  },
  {
    title: "Score",
    field: "complianceScore",
    sorter: "number",
    width: 100,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => HistoricalAnalysisRow }).getData();
      if (row.status !== "completed" || row.complianceScore == null) {
        return "—";
      }
      const color =
        row.complianceScore >= 90
          ? "text-chart-2"
          : row.complianceScore >= 75
            ? "text-accent"
            : "text-destructive";
      return `<span class="tabular-nums font-semibold ${color}">${row.complianceScore}%</span>`;
    },
  },
];

function HistoricalAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: analyses, isLoading } = useHistoricalAnalyses();
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });

  const handleRowClick = (row: HistoricalAnalysisRow) => {
    navigate({
      to: "/maker/historical-analysis/$analysisId",
      params: { analysisId: row.id },
      search: { type: row.type, backTo: getRelativePath(location.pathname) },
    });
  };

  const tableVisibleCount = Math.max(
    0,
    Math.min(
      tablePagination.pageSize,
      analyses.length - (tablePagination.page - 1) * tablePagination.pageSize
    )
  );

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Historical Analysis"
          description="Compare current shelf state with past audits to track performance over time."
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">

          {analyses.length > 0 && (
            <p className="mt-4 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
              <span className="font-semibold text-foreground">{analyses.length}</span> analyses
            </p>
          )}

          <div className="mt-4 flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <FolderOpen className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No analyses yet</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Run adhoc or planogram analyses to see them here.
                </p>
              </div>
            ) : (
              <DataTable<HistoricalAnalysisRow>
                columns={COLUMNS}
                data={analyses}
                rowIdField="id"
                initialSort={{ field: "runDate", dir: "desc" }}
                emptyMessage="No analyses yet"
                pageSize={10}
                pageSizeSelector={[5, 10, 20, 50]}
                headerFilters={false}
                onPaginationChange={setTablePagination}
                onRowClick={handleRowClick}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
