import { AlertTriangle, CheckCircle2, Clock3, Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { useCampaignList } from "@/hooks/use-campaigns";
import { cn } from "@/lib/utils";

interface CheckerHistoryRow {
  id: string;
  campaignName: string;
  campaignId: string;
  initiator: string;
  decision: "approved" | "rejected";
  guardRails: "pass" | "warning";
  reviewedAt: string;
}

const DEFAULT_HISTORY_ROWS: CheckerHistoryRow[] = [
  { id: "ch-1", campaignName: "Weekend Beverage Promo", campaignId: "CMP-9941-A", initiator: "System (Auto)", decision: "approved", guardRails: "pass", reviewedAt: "Today, 08:45 AM" },
  { id: "ch-2", campaignName: "Electronics Flash Sale", campaignId: "CMP-8810-B", initiator: "Sarah J.", decision: "approved", guardRails: "warning", reviewedAt: "Yesterday, 14:22 PM" },
  { id: "ch-3", campaignName: "Dairy & Bakery Weekend", campaignId: "CMP-9937-E", initiator: "Marcus T.", decision: "approved", guardRails: "pass", reviewedAt: "Mar 14, 10:05 AM" },
  { id: "ch-4", campaignName: "Q2 Electronics Flash Sale", campaignId: "CMP-9939-C", initiator: "James O.", decision: "rejected", guardRails: "warning", reviewedAt: "Mar 13, 17:12 PM" },
  { id: "ch-5", campaignName: "Spring Produce Launch", campaignId: "CMP-9938-D", initiator: "Auto-Scheduled", decision: "approved", guardRails: "pass", reviewedAt: "Mar 12, 09:15 AM" },
  { id: "ch-6", campaignName: "Valentine's Day Special", campaignId: "CMP-9935-G", initiator: "Sarah J.", decision: "approved", guardRails: "pass", reviewedAt: "Feb 14, 12:10 PM" },
];

interface CheckerStat {
  label: string;
  value: number;
  icon: typeof Clock3;
  trend: string;
  trendClass: string;
}

const COLUMNS: IthColumnDef<CheckerHistoryRow>[] = [
  {
    key: "campaign",
    label: "Campaign ID & Name",
    sortable: true,
    render: (row) => <IthPrimaryCell primary={row.campaignName} secondary={`ID: ${row.campaignId}`} />,
  },
  {
    key: "initiator",
    label: "Initiator",
    field: "initiator",
    sortable: true,
  },
  {
    key: "decision",
    label: "Decision",
    render: (row) =>
      row.decision === "approved" ? (
        <IthBadge label="Approved" variant="emerald" dot pulse />
      ) : (
        <IthBadge label="Rejected" variant="rose" />
      ),
  },
  {
    key: "guardRails",
    label: "Guard Rails",
    render: (row) =>
      row.guardRails === "pass" ? (
        <IthBadge label="All Pass" variant="emerald" />
      ) : (
        <IthBadge label="1 Warning" variant="amber" />
      ),
  },
  {
    key: "reviewedAt",
    label: "Reviewed At",
    field: "reviewedAt",
    align: "right",
    sortable: true,
  },
];

export default function CheckerDashboard() {
  const navigate = useNavigate();
  const { data: campaigns = [] } = useCampaignList();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const historyRows = useMemo<CheckerHistoryRow[]>(() => {
    const reviewed = campaigns.filter((c) => c.submittedForApproval && c.approvalStatus !== "pending");
    if (reviewed.length === 0) return DEFAULT_HISTORY_ROWS;
    return reviewed.map((c, idx) => ({
      id: `ch-${idx}-${c.id}`,
      campaignName: c.name,
      campaignId: c.id,
      initiator: c.ownerName ?? c.initiator,
      decision: c.approvalStatus === "approved" ? "approved" : "rejected",
      guardRails: "pass",
      reviewedAt: c.reviewedAt ?? c.date,
    }));
  }, [campaigns]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return historyRows;
    return historyRows.filter(
      (row) =>
        row.campaignName.toLowerCase().includes(q) ||
        row.campaignId.toLowerCase().includes(q) ||
        row.initiator.toLowerCase().includes(q),
    );
  }, [historyRows, search]);

  const approvedCount = filteredRows.filter((r) => r.decision === "approved").length;
  const rejectedCount = filteredRows.filter((r) => r.decision === "rejected").length;

  const stats: CheckerStat[] = [
    {
      label: "Pending Review",
      value: 7,
      icon: Clock3,
      trend: "+2 This Week",
      trendClass: "text-emerald-400",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle2,
      trend: "On Track",
      trendClass: "text-ithina-purple",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: AlertTriangle,
      trend: "Needs Revision",
      trendClass: "text-ithina-rose",
    },
    {
      label: "Total Reviewed",
      value: filteredRows.length,
      icon: TrendingUp,
      trend: "This Month",
      trendClass: "text-ithina-purple",
    },
  ];

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto p-6 lg:p-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-ithina-border bg-ithina-panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{stat.value}</span>
                    <span className={cn("mb-1 text-xs font-medium", stat.trendClass)}>{stat.trend}</span>
                  </div>
                </div>
                <div className="flex size-9 items-center justify-center rounded-xl border border-ithina-border bg-ithina-bg/60">
                  <Icon className="size-4 text-slate-400" aria-hidden />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
        <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Campaign History (Previously Reviewed)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search campaigns..."
              aria-label="Search reviewed campaigns"
              className="w-52 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-9 pr-3 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>
        </header>

        <IthTable<CheckerHistoryRow>
          data={filteredRows}
          columns={COLUMNS}
          rowKey={(row) => row.id}
          onRowClick={() => navigate({ to: "/checker/campaigns" })}
          rowHighlight={(row) => (row.decision === "approved" ? "emerald" : row.decision === "rejected" ? "rose" : null)}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filteredRows.length,
            onPageChange: setPage,
            rowLabel: "campaigns",
          }}
          empty={{ message: "No reviewed campaigns found." }}
          className="rounded-none border-0"
        />
      </div>
    </div>
  );
}
