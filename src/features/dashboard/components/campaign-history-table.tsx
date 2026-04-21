import { memo } from "react";

import { DataTable, type DataTableCell, type DataTableColumn } from "@/components/ui/data-table";
import { formatCampaignDateTime } from "@/lib/format-datetime";
import type { CampaignRow, CampaignStatus } from "@/types/dashboard";

const STATUS_CHIP: Record<CampaignStatus, string> = {
  live:    `<span class="inline-flex items-center gap-1.5 rounded-full border border-chart-2/20 bg-chart-2/10 px-2.5 py-0.5 text-xs font-semibold text-chart-2"><span class="size-1.5 rounded-full bg-current animate-pulse"></span>`,
  pending: `<span class="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400"><span class="size-1.5 rounded-full bg-current"></span>`,
  draft:   `<span class="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/10 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"><span class="size-1.5 rounded-full bg-current"></span>`,
};

const COLUMNS: DataTableColumn<CampaignRow>[] = [
  {
    title: "Campaign",
    field: "name",
    minWidth: 180,
    headerHozAlign: "left",
    hozAlign: "left",
    formatter: (cell: DataTableCell<CampaignRow>) => {
      const row = cell.getData();
      return `<div class="text-left">
        <p class="text-[13px] font-semibold leading-tight text-white">${row.name}</p>
      </div>`;
    },
  },
  {
    title: "Initiator",
    field: "initiator",
    formatter: (cell: DataTableCell<CampaignRow>) =>
      `<span class="text-[13px] text-slate-300">${String(cell.getValue() ?? "")}</span>`,
  },
  {
    title: "Status",
    field: "status",
    width: 160,
    formatter: (cell: DataTableCell<CampaignRow>) => {
      const row = cell.getData();
      const prefix = STATUS_CHIP[row.status] ?? STATUS_CHIP.draft;
      return `${prefix}${row.statusLabel}</span>`;
    },
  },
  {
    title: "Hardware Targets",
    field: "hardwareTargets",
    formatter: (cell: DataTableCell<CampaignRow>) => {
      const row = cell.getData();
      if (row.status === "draft") {
        return `<span class="font-mono text-xs italic text-slate-500">Not defined</span>`;
      }
      return `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`;
    },
  },
  {
    title: "Last Updated",
    field: "lastUpdated",
    hozAlign: "right",
    headerHozAlign: "right",
    formatter: (cell: DataTableCell<CampaignRow>) =>
      `<span class="whitespace-nowrap text-xs text-slate-400 tabular-nums">${formatCampaignDateTime(String(cell.getValue() ?? ""))}</span>`,
  },
];

interface CampaignHistoryTableProps {
  campaigns: CampaignRow[];
}

function CampaignHistoryTable({ campaigns }: CampaignHistoryTableProps) {
  return (
    <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-4">
        <h3 className="text-sm font-semibold text-white">Campaign History</h3>
      </header>
      <DataTable<CampaignRow>
        data={campaigns}
        columns={COLUMNS}
        rowIdField="id"
        pagination
        pageSize={5}
        pageSizeSelector={[5, 10]}
        emptyMessage="No campaigns found."
        headerFilters={false}
        className="dashboard-history-table rounded-none border-0"
      />
    </div>
  );
}

export default memo(CampaignHistoryTable);
