import { Building2, CheckCircle2, Clock3, Search, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { useCampaignList } from "@/hooks/use-campaigns";
import { useInboxItems } from "@/hooks/use-approval";
import { useOrganizationOverviewStats } from "@/hooks/use-organization-overview";
import { formatCampaignDateTime } from "@/lib/format-datetime";
import { cn } from "@/lib/utils";

interface AdminReviewRow {
  id: string;
  campaignName: string;
  campaignId: string;
  maker: string;
  reviewedBy: string;
  reviewerRole: "Checker" | "Admin";
  decision: "Approved" | "Rejected";
  guardRails: "All Pass" | "1 warning" | "2 warnings";
  reviewedAt: string;
}

const HISTORY_COLUMNS: IthColumnDef<AdminReviewRow>[] = [
  {
    key: "campaign",
    label: "Campaign",
    sortable: true,
    render: (row) => <IthPrimaryCell primary={row.campaignName} secondary={`ID: ${row.campaignId}`} />,
  },
  {
    key: "maker",
    label: "Maker",
    sortable: true,
    field: "maker",
  },
  {
    key: "reviewedBy",
    label: "Approved/Rejected By",
    render: (row) => (
      <div>
        <p className="text-[13px] font-semibold text-white">{row.reviewedBy}</p>
        <p className="mt-0.5 font-mono text-[10px] text-slate-500">{row.reviewerRole}</p>
      </div>
    ),
  },
  {
    key: "decision",
    label: "Decision",
    render: (row) =>
      row.decision === "Approved" ? (
        <IthBadge label="Approved" variant="emerald" dot pulse />
      ) : (
        <IthBadge label="Rejected" variant="rose" />
      ),
  },
  {
    key: "guardRails",
    label: "Guard Rails",
    render: (row) =>
      row.guardRails === "All Pass" ? (
        <IthBadge label="All Pass" variant="emerald" />
      ) : row.guardRails === "1 warning" ? (
        <IthBadge label="1 Warning" variant="amber" />
      ) : (
        <IthBadge label="2 Warnings" variant="rose" />
      ),
  },
  {
    key: "reviewedAt",
    label: "Reviewed At",
    align: "right",
    sortable: true,
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-slate-400 tabular-nums">
        {formatCampaignDateTime(row.reviewedAt)}
      </span>
    ),
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: campaigns = [] } = useCampaignList();
  const { data: inbox = [] } = useInboxItems();
  const { data: orgStatsData } = useOrganizationOverviewStats();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const reviewHistory = useMemo<AdminReviewRow[]>(() => {
    const reviewed = campaigns.filter((c) => c.submittedForApproval && c.approvalStatus !== "pending");
    return reviewed.map((c, idx) => ({
      id: `r-${idx}-${c.id}`,
      campaignName: c.name,
      campaignId: c.id,
      maker: c.ownerName ?? c.initiator,
      reviewedBy: c.reviewedByName ?? "Checker",
      reviewerRole: c.reviewedByRole === "admin" ? "Admin" : "Checker",
      decision: c.approvalStatus === "approved" ? "Approved" : "Rejected",
      guardRails: "All Pass",
      reviewedAt: c.reviewedAt ?? c.date,
    }));
  }, [campaigns]);

  const pendingApprovals = useMemo(() => inbox.filter((i) => i.status === "pending").length, [inbox]);
  const approvedCount = useMemo(() => reviewHistory.filter((r) => r.decision === "Approved").length, [reviewHistory]);
  const rejectedCount = useMemo(() => reviewHistory.filter((r) => r.decision === "Rejected").length, [reviewHistory]);

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviewHistory;
    return reviewHistory.filter(
      (row) =>
        row.campaignName.toLowerCase().includes(q) ||
        row.campaignId.toLowerCase().includes(q) ||
        row.maker.toLowerCase().includes(q) ||
        row.reviewedBy.toLowerCase().includes(q),
    );
  }, [reviewHistory, search]);

  const orgStats = [
    {
      label: "Total Users",
      value: orgStatsData?.totalUsers ?? 0,
      trend: orgStatsData?.trendUsersText ?? "Org Active",
      trendClass: "text-ithina-purple",
      icon: Users,
    },
    {
      label: "Active Stores",
      value: orgStatsData?.activeStores ?? 0,
      trend: orgStatsData?.trendStoresText ?? "All Online",
      trendClass: "text-emerald-400",
      icon: Building2,
    },
    { label: "Pending Approvals", value: pendingApprovals, trend: "Needs Action", trendClass: "text-amber-400", icon: Clock3 },
    { label: "Reviewed (A/R)", value: approvedCount + rejectedCount, trend: `${approvedCount}A / ${rejectedCount}R`, trendClass: "text-ithina-rose", icon: ShieldCheck },
  ] as const;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto p-6 lg:p-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {orgStats.map((stat) => {
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

      <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
        <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Campaign Approval History</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Full trail of maker submissions reviewed by checker/admin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" aria-hidden />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                type="search"
                placeholder="Search campaigns..."
                aria-label="Search approval history"
                className="w-56 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-8 pr-3 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
            </div>
          </div>
        </header>

        <IthTable<AdminReviewRow>
          data={filteredHistory}
          columns={HISTORY_COLUMNS}
          rowKey={(row) => row.id}
          onRowClick={() => navigate({ to: "/admin/approvals" })}
          rowHighlight={(row) => (row.decision === "Approved" ? "emerald" : "rose")}
          pagination={{
            page,
            pageSize: 6,
            total: filteredHistory.length,
            onPageChange: setPage,
            rowLabel: "campaigns",
          }}
          empty={{ message: "No reviewed campaigns found." }}
          className="rounded-none border-0"
        />
      </div>

      <div className="rounded-xl border border-ithina-border bg-ithina-panel px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Admin sees pending maker submissions and who approved/rejected them (Checker or Admin).
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/approvals" })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ithina-border bg-ithina-bg px-3 py-1.5 text-[10px] font-semibold text-slate-300 transition-colors hover:border-ithina-purple/40 hover:text-white"
          >
            <CheckCircle2 className="size-3.5" aria-hidden />
            Open Approval Queue
          </button>
        </div>
      </div>
    </div>
  );
}
