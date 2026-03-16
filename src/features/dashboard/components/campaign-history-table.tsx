import { memo, useMemo } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { CampaignRow, CampaignStatus } from "@/types/dashboard";

const statusVariantStyles: Record<CampaignStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-400",
  draft: "border-slate-600 bg-white/5 text-slate-400",
};

interface CampaignHistoryTableProps {
  campaigns: CampaignRow[];
}

function CampaignHistoryTable({ campaigns }: CampaignHistoryTableProps) {
  const columns = useMemo<DataTableColumn<CampaignRow>[]>(() => [
    {
      title: "Campaign ID & Name",
      field: "name",
      minWidth: 200,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => CampaignRow }).getData();
        return `<div><span class="block font-medium text-white">${row.name}</span><span class="block font-mono text-[10px] text-slate-500">ID: ${row.campaignId}</span></div>`;
      },
    },
    {
      title: "Initiator",
      field: "initiator",
      width: 120,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="text-xs text-slate-400">${val}</span>`;
      },
    },
    {
      title: "Status",
      field: "status",
      width: 110,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => CampaignRow }).getData();
        const cls = statusVariantStyles[row.status] ?? "";
        const dot = row.status === "live" ? `<span class="size-1.5 animate-pulse rounded-full bg-current inline-block mr-1"></span>` : "";
        return `<span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] ${cls}">${dot}${row.statusLabel}</span>`;
      },
    },
    {
      title: "Hardware Targets",
      field: "hardwareTargets",
      minWidth: 150,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => CampaignRow }).getData();
        const cls = row.status === "draft" ? "italic text-slate-500" : "text-slate-400";
        return `<span class="text-xs ${cls}">${row.hardwareTargets}</span>`;
      },
    },
    {
      title: "Last Updated",
      field: "lastUpdated",
      width: 140,
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-mono text-xs text-slate-500">${val}</span>`;
      },
    },
  ], []);

  return (
    <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-4">
        <h3 className="text-sm font-semibold text-white">Campaign History</h3>
      </header>
      <DataTable<CampaignRow>
        columns={columns}
        data={campaigns}
        rowIdField="id"
        emptyMessage="No campaigns found"
        pageSize={5}
        pageSizeSelector={[5, 10, 20]}
        showRowNumber
        layout="fitColumns"
      />
    </div>
  );
}

export default memo(CampaignHistoryTable);
