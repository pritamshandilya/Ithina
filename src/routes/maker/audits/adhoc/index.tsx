import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { FolderOpen, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdhocAnalyses, useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";
import type { AdhocAnalysis, AdhocAnalysisStatus } from "@/types/maker";

export const Route = createFileRoute("/maker/audits/adhoc/")({
  component: AdhocAnalysisPage,
});

const ADHOC_STATUS_LABELS: Record<AdhocAnalysisStatus, string> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function getAdhocStatusClass(status: AdhocAnalysisStatus): string {
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

const ADHOC_COLUMNS: DataTableColumn<AdhocAnalysis>[] = [
  {
    title: "Name",
    field: "name",
    sorter: "string",
    minWidth: 200,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="font-medium text-foreground">${row.name}</span>`;
    },
  },
  {
    title: "Store",
    field: "storeName",
    sorter: "string",
    minWidth: 180,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm text-muted-foreground">${row.storeName}</span>`;
    },
  },
  {
    title: "Date",
    field: "createdAt",
    sorter: "datetime",
    width: 140,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      const date = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
      return `<span class="text-sm text-muted-foreground">${format(date, "MMM d, yyyy")}</span>`;
    },
  },
  {
    title: "Status",
    field: "status",
    sorter: "string",
    width: 130,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      const label = ADHOC_STATUS_LABELS[row.status] ?? row.status;
      const statusClass = getAdhocStatusClass(row.status);
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
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
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

function AdhocAnalysisPage() {
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);
  const { data: adhocAnalyses, isLoading } = useAdhocAnalyses(selectedStoreId);
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });

  const analyses = adhocAnalyses ?? [];
  const sortedAnalyses = useMemo(() => {
    return [...analyses].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [analyses]);

  const tableVisibleCount = Math.max(
    0,
    Math.min(
      tablePagination.pageSize,
      sortedAnalyses.length - (tablePagination.page - 1) * tablePagination.pageSize
    )
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Adhoc Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Upload a shelf image and let AI analyze your retail space.
              </p>
            </div>
            <Button asChild className="bg-chart-2 text-white hover:opacity-90 shrink-0">
              <Link to="/maker/audits/adhoc/new">
                <Plus className="size-4" aria-hidden />
                New Adhoc Analysis
              </Link>
            </Button>
          </header>

          <div className="min-h-[400px] space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : sortedAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <FolderOpen className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No adhoc analyses yet</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Start by creating a new adhoc analysis. Upload a shelf image and let AI analyze
                  your retail space.
                </p>
                <Button asChild className="mt-6 bg-chart-2 text-white hover:opacity-90">
                  <Link to="/maker/audits/adhoc/new">
                    <Plus className="size-4" aria-hidden />
                    New Adhoc Analysis
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
                    <span className="font-semibold text-foreground">{sortedAnalyses.length}</span>{" "}
                    analyses
                  </p>
                </div>
                <DataTable<AdhocAnalysis>
                  columns={ADHOC_COLUMNS}
                  data={sortedAnalyses}
                  rowIdField="id"
                  initialSort={{ field: "createdAt", dir: "desc" }}
                  emptyMessage="No adhoc analyses yet"
                  pageSize={10}
                  pageSizeSelector={[5, 10, 20, 50]}
                  headerFilters={false}
                  onPaginationChange={setTablePagination}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
