import { memo } from "react";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { formatCampaignDateTime } from "@/lib/format-datetime";
import type { CampaignRow, CampaignStatus } from "@/types/dashboard";

const STATUS_VARIANT: Record<CampaignStatus, "emerald" | "amber" | "slate"> = {
  live:    "emerald",
  pending: "amber",
  draft:   "slate",
};

const COLUMNS: IthColumnDef<CampaignRow>[] = [
  {
    key: "name",
    label: "Campaign ID & Name",
    sortable: true,
    render: (row) => (
      <IthPrimaryCell primary={row.name} secondary={`ID: ${row.campaignId}`} />
    ),
  },
  {
    key: "initiator",
    label: "Initiator",
    field: "initiator",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <IthBadge
        label={row.statusLabel}
        variant={STATUS_VARIANT[row.status]}
        dot={row.status === "live"}
        pulse={row.status === "live"}
      />
    ),
  },
  {
    key: "hardwareTargets",
    label: "Hardware Targets",
    render: (row) =>
      row.status === "draft" ? (
        <span className="font-mono text-xs italic text-slate-500">Not defined</span>
      ) : (
        <span className="text-xs text-slate-400">{row.hardwareTargets}</span>
      ),
  },
  {
    key: "lastUpdated",
    label: "Last Updated",
    align: "right",
    sortable: true,
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-slate-400 tabular-nums">
        {formatCampaignDateTime(row.lastUpdated)}
      </span>
    ),
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
      <IthTable<CampaignRow>
        data={campaigns}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        pagination={{
          page: 1,
          pageSize: 5,
          total: campaigns.length,
          onPageChange: () => undefined,
          rowLabel: "campaigns",
        }}
        empty={{ message: "No campaigns found." }}
        className="rounded-none border-0"
      />
    </div>
  );
}

export default memo(CampaignHistoryTable);
