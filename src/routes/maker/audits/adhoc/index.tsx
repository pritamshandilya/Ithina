import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { FolderOpen, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdhocAnalyses } from "@/queries/maker";
import { mockUser } from "@/lib/api/mock-data";
import type { AdhocAnalysis, AdhocAnalysisStatus } from "@/types/maker";
import { getRelativePath } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { useStore } from "@/providers/store";

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
    title: "Shelf ID",
    field: "shelfId",
    width: 140,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm tabular-nums font-medium text-foreground">${row.shelfId ?? "—"}</span>`;
    },
  },
  {
    title: "Shelf Name",
    field: "shelfName",
    minWidth: 160,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm font-medium text-foreground">${row.shelfName ?? "—"}</span>`;
    },
  },
  {
    title: "Store",
    field: "storeName",
    sorter: "string",
    minWidth: 160,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm font-medium text-foreground">${row.storeName}</span>`;
    },
  },
  {
    title: "Zone",
    field: "zone",
    width: 100,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm font-medium text-foreground">${row.zone ?? "—"}</span>`;
    },
  },
  {
    title: "Section",
    field: "section",
    minWidth: 140,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm font-medium text-foreground truncate block">${row.section ?? "—"}</span>`;
    },
  },
  {
    title: "Fixture",
    field: "fixtureType",
    width: 130,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      const type = row.fixtureType?.replace(/_/g, " ") ?? "—";
      return `<span class="text-sm font-medium text-foreground">${type}</span>`;
    },
  },
  {
    title: "Dimensions",
    field: "dimensions",
    width: 120,
    sorter: "string",
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      return `<span class="text-sm tabular-nums font-medium text-foreground">${row.dimensions ?? "—"}</span>`;
    },
  },
  {
    title: "Date",
    field: "createdAt",
    sorter: "datetime",
    width: 120,
    headerSort: true,
    headerFilter: false,
    formatter: (cell: unknown) => {
      const row = (cell as { getData: () => AdhocAnalysis }).getData();
      const date = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
      return `<span class="text-sm font-medium text-foreground">${format(date, "MMM d, yyyy")}</span>`;
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
        return `<span class="text-sm font-medium text-foreground">—</span>`;
      }
      const color =
        row.complianceScore >= 90
          ? "text-chart-2"
          : row.complianceScore >= 75
            ? "text-accent"
            : "text-destructive";
      return `<span class="text-sm tabular-nums font-medium ${color}">${row.complianceScore}%</span>`;
    },
  },
];

function AdhocAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id || mockUser.storeId;
  const { data: adhocAnalyses, isLoading } = useAdhocAnalyses(selectedStoreId);
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });

  const handleRowClick = (row: AdhocAnalysis) => {
    navigate({
      to: "/maker/historical-analysis/$analysisId",
      params: { analysisId: row.id },
      search: { type: "adhoc", backTo: getRelativePath(location.pathname) },
    });
  };

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
    <MainLayout
      pageHeader={
        <PageHeader
          title="Adhoc Analysis"
          description="Upload a shelf image and let AI analyze your retail space without a planogram."
        >
          <Button asChild variant="success" className="shrink-0">
            <Link
              to="/maker/audits/adhoc/new"
              search={{ shelfId: undefined }}
            >
              <Plus className="size-4" aria-hidden />
              New Adhoc Analysis
            </Link>
          </Button>
        </PageHeader>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">

          {sortedAnalyses.length > 0 && (
            <p className="mt-4 shrink-0 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{tableVisibleCount}</span> of{" "}
              <span className="font-semibold text-foreground">{sortedAnalyses.length}</span>{" "}
              analyses
            </p>
          )}

          <div className="mt-4 flex-1 min-h-0 overflow-auto">
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
                <Button asChild variant="success" className="mt-6">
                  <Link
                    to="/maker/audits/adhoc/new"
                    search={{ shelfId: undefined }}
                  >
                    <Plus className="size-4" aria-hidden />
                    New Adhoc Analysis
                  </Link>
                </Button>
              </div>
            ) : (
              <DataTable<AdhocAnalysis>
                columns={ADHOC_COLUMNS}
                data={sortedAnalyses}
                rowIdField="id"
                initialSort={{ field: "createdAt", dir: "desc" }}
                emptyMessage="No adhoc analyses yet"
                pageSize={10}
                pageSizeSelector={[5, 10, 20, 50]}
                headerFilters={false}
                layout="fitData"
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
