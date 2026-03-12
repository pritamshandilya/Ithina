import { Search } from "lucide-react";
import { useState } from "react";

import StatusBadge from "@/components/shared/status-badge";
import type { CampaignRow, CampaignStatus } from "@/types/dashboard";

const statusVariantMap: Record<CampaignStatus, "success" | "warning" | "neutral"> = {
  live: "success",
  pending: "warning",
  draft: "neutral",
};

interface CampaignHistoryTableProps {
  campaigns: CampaignRow[];
}

export default function CampaignHistoryTable({ campaigns }: CampaignHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-4">
        <h3 className="text-sm font-semibold text-white">Campaign History</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search campaigns"
            className="w-48 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-9 pr-3 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
          />
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="sticky top-0 z-10 border-b border-ithina-border bg-ithina-sidebar">
            <tr className="font-medium text-[10px] uppercase tracking-widest text-ithina-muted">
              <th className="px-6 py-3 pl-8">Campaign ID & Name</th>
              <th className="px-4 py-3">Initiator</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Hardware Targets</th>
              <th className="px-6 py-3 text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ithina-border/50 text-sm">
            {filteredCampaigns.map((campaign) => (
              <CampaignTableRow key={campaign.id} campaign={campaign} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-ithina-border bg-ithina-bg/50 px-6 py-3 text-xs text-slate-500">
        <span>
          Showing {filteredCampaigns.length} of {campaigns.length} Campaigns
        </span>
        <div className="flex items-center gap-2">
          <button className="transition-colors hover:text-white" aria-label="Previous page">&larr; Prev</button>
          <span className="rounded bg-white/5 px-2 py-0.5 font-mono">1</span>
          <button className="transition-colors hover:text-white" aria-label="Next page">Next &rarr;</button>
        </div>
      </div>
    </div>
  );
}

function CampaignTableRow({ campaign }: { campaign: CampaignRow }) {
  return (
    <tr
      className={`group cursor-pointer transition-colors hover:bg-white/[0.02] ${
        campaign.status === "pending" ? "border-l-2 border-l-amber-500" : ""
      } ${campaign.status === "draft" ? "opacity-70 hover:opacity-100" : ""}`}
    >
      <td className="px-6 py-4 pl-8">
        <span className="mb-0.5 block font-medium text-white">{campaign.name}</span>
        <span className="block font-mono text-[10px] text-slate-500">ID: {campaign.campaignId}</span>
      </td>
      <td className="px-4 py-4 text-xs text-slate-400">{campaign.initiator}</td>
      <td className="px-4 py-4">
        <StatusBadge label={campaign.statusLabel} variant={statusVariantMap[campaign.status]} showIcon={campaign.status === "live"} />
      </td>
      <td className={`px-4 py-4 text-xs ${campaign.status === "draft" ? "italic text-slate-500" : "text-slate-400"}`}>
        {campaign.hardwareTargets}
      </td>
      <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">{campaign.lastUpdated}</td>
    </tr>
  );
}
