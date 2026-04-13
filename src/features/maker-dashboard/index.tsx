import { ArrowRight, Search, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignList } from "@/hooks/use-campaigns";
import { formatCampaignDateTime } from "@/lib/format-datetime";
import type { CampaignListItem } from "@/types/campaigns";
import { cn } from "@/lib/utils";

const MS_WEEK = 7 * 86400000;

function createdTimeMs(c: CampaignListItem): number {
  const t = new Date(c.createdAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function buildDashboardStatCards(campaigns: CampaignListItem[]) {
  const activeCount = campaigns.filter((c) => c.status === "Active" || c.status === "Scheduled").length;
  const pendingCount = campaigns.filter((c) => c.status === "Pending").length;
  const rejectedCount = campaigns.filter((c) => c.status === "Rejected").length;

  const weekAgo = Date.now() - MS_WEEK;
  const newActiveOrScheduledThisWeek = campaigns.filter(
    (c) => (c.status === "Active" || c.status === "Scheduled") && createdTimeMs(c) >= weekAgo,
  ).length;

  return [
    {
      label: "Active Campaigns",
      value: String(activeCount),
      trend:
        newActiveOrScheduledThisWeek > 0
          ? `+${newActiveOrScheduledThisWeek} this week`
          : "No new this week",
      trendClass: newActiveOrScheduledThisWeek > 0 ? "text-emerald-400" : "text-slate-500",
    },
    {
      label: "Pending Approvals",
      value: String(pendingCount),
      trend: pendingCount > 0 ? "Requires Action" : "All clear",
      trendClass: pendingCount > 0 ? "text-amber-500" : "text-emerald-400",
    },
    {
      label: "Rejected Campaigns",
      value: String(rejectedCount),
      trend: rejectedCount > 0 ? "Needs revision" : "None yet",
      trendClass: rejectedCount > 0 ? "text-rose-400" : "text-slate-500",
    },
  ];
}

const INSIGHTS = [
  {
    id: "ins-1",
    severity: "time-sensitive" as const,
    label: "Time Sensitive",
    barClass: "bg-amber-500/50",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hoverBorderClass: "hover:border-amber-500/50",
    timestamp: "Just Now",
    title: "12 Sushi Trays Expiring",
    description:
      "ROOS detects 12 SKUs in the Perishables category reaching expiration in 48 hours. Estimated waste value: $892.",
    actionLabel: "Draft Clearance Campaign",
    prompt: "Draft an urgent clearance campaign for the expiring Premium Sushi SKUs. Apply a 20% markdown.",
  },
  {
    id: "ins-2",
    severity: "velocity-drop" as const,
    label: "Velocity Drop",
    barClass: "bg-rose-500/50",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    hoverBorderClass: "hover:border-white/20",
    timestamp: null,
    title: "Beverage Category −8%",
    description:
      "Sales velocity for summer beverages has dropped 8% week-over-week. Inventory is backing up.",
    actionLabel: "Draft Weekend Promo",
    prompt: "Draft a weekend promotional campaign for the summer beverages category.",
  },
  {
    id: "ins-3",
    severity: "high-stock" as const,
    label: "High Stock",
    barClass: "bg-emerald-500/50",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    hoverBorderClass: "hover:border-white/20",
    timestamp: null,
    title: "Premium Electronics",
    description:
      "High stock levels detected on high-margin headphones. Suggestion: Bundle or Flash Sale.",
    actionLabel: "Draft Flash Sale",
    prompt: "Draft a flash sale campaign for the high-margin premium electronics range.",
  },
];

type HistoryStatus = "live" | "pending" | "draft";

interface CampaignRow {
  id: string;
  name: string;
  campaignId: string;
  initiator: string;
  status: HistoryStatus;
  statusLabel: string;
  hardwareTargets: string;
  lastUpdated: string;
}

const DEFAULT_HISTORY_ROWS: CampaignRow[] = [
  { id: "r1", name: "Weekend Beverage Promo",    campaignId: "CMP-9941-A", initiator: "System (Auto)", status: "live",    statusLabel: "Live (100% Synced)",   hardwareTargets: "Chroma 42, LCD Banners",    lastUpdated: "Today, 08:45 AM" },
  { id: "r2", name: "Electronics Flash Sale",     campaignId: "CMP-8810-B", initiator: "Sarah J.",      status: "pending", statusLabel: "Pending Approval",     hardwareTargets: "Chroma 29, Chroma 16",      lastUpdated: "Yesterday, 14:22 PM" },
  { id: "r3", name: "Seasonal Apparel Markdowns", campaignId: "CMP-7705-C", initiator: "Marcus P.",     status: "draft",   statusLabel: "Draft",                hardwareTargets: "—",                         lastUpdated: "Oct 12, 11:05 AM" },
  { id: "r4", name: "Dairy & Bakery Weekend",     campaignId: "CMP-9937-E", initiator: "Marcus T.",     status: "pending", statusLabel: "Pending Approval",     hardwareTargets: "ESL 2.9\"",                  lastUpdated: "Mar 14, 10:05 AM" },
  { id: "r5", name: "Spring Produce Launch",      campaignId: "CMP-9938-D", initiator: "Auto-Scheduled",status: "live",    statusLabel: "Live (Scheduled)",     hardwareTargets: "ESL 4.2\", LCD 10\"",       lastUpdated: "Mar 15, 08:00 AM" },
  { id: "r6", name: "BOGO Snacks Promotion",      campaignId: "CMP-9936-F", initiator: "Sarah J.",      status: "live",    statusLabel: "Live (100% Synced)",   hardwareTargets: "ESL 4.2\"",                  lastUpdated: "Mar 3, 09:30 AM" },
];

const ROUTES_BY_VARIANT = {
  maker: {
    live: "/maker/fleet",
    pending: "/maker/approvals",
    draft: "/maker/wizard",
    wizard: "/maker/wizard",
  },
  admin: {
    live: "/admin/fleet",
    pending: "/admin/approvals",
    draft: "/wizard",
    wizard: "/wizard",
  },
} as const;

export type MakerDashboardVariant = keyof typeof ROUTES_BY_VARIANT;

const HISTORY_COLUMNS: IthColumnDef<CampaignRow>[] = [
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
    render: (row) => {
      const variants = { live: "emerald", pending: "amber", draft: "slate" } as const;
      return (
        <IthBadge
          label={row.statusLabel}
          variant={variants[row.status]}
          dot={row.status === "live"}
          pulse={row.status === "live"}
        />
      );
    },
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

type Props = {
  /** Use `admin` when shown under `/admin/store-dashboard` so links stay in admin + `/wizard`. */
  variant?: MakerDashboardVariant;
};

export default function MakerDashboard({ variant = "maker" }: Props) {
  const navigate = useNavigate();
  const routes = ROUTES_BY_VARIANT[variant];
  const { data: campaigns = [], isPending: campaignsPending } = useCampaignList();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const statCards = useMemo(() => buildDashboardStatCards(campaigns), [campaigns]);

  const historyRows = useMemo<CampaignRow[]>(() => {
    if (campaigns.length === 0) return DEFAULT_HISTORY_ROWS;
    return campaigns.map((c, idx) => {
      const status: HistoryStatus =
        c.status === "Draft" ? "draft" : c.approvalStatus === "pending" ? "pending" : "live";
      return {
        id: `hist-${c.id}-${idx}`,
        name: c.name,
        campaignId: c.id,
        initiator: c.ownerName ?? c.initiator,
        status,
        statusLabel: status === "draft" ? "Draft" : status === "pending" ? "Pending Approval" : "Live (100% Synced)",
        hardwareTargets: c.hardware.length ? c.hardware.join(", ") : "—",
        lastUpdated: c.reviewedAt ?? c.date,
      };
    });
  }, [campaigns]);

  const filteredRows = useMemo(
    () =>
      historyRows.filter(
        (r) =>
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.campaignId.toLowerCase().includes(search.toLowerCase()),
      ),
    [historyRows, search],
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto p-6 lg:p-8 animate-[fadeIn_0.3s_ease-out]">

      {/* ── Stat cards (from GET /campaigns) ── */}
      <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-3">
        {campaignsPending
          ? Array.from({ length: 3 }, (_, i) => (
              <div
                key={`stat-skel-${i}`}
                className="rounded-xl border border-ithina-border bg-ithina-panel p-5 shadow-sm"
              >
                <Skeleton className="mb-3 h-3 w-28 rounded bg-ithina-border/50" />
                <Skeleton className="h-9 w-20 rounded bg-ithina-border/50" />
              </div>
            ))
          : statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-ithina-border bg-ithina-panel p-5 shadow-sm"
              >
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {card.label}
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-3xl font-bold tracking-tight text-white">{card.value}</span>
                  <span className={cn("mb-1 text-xs font-medium", card.trendClass)}>{card.trend}</span>
                </div>
              </div>
            ))}
      </div>

      {/* ── Proactive ROOS Insights ── */}
      <div className="shrink-0">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Zap className="size-4 text-ithina-purple" />
          Proactive ROOS Insights
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {INSIGHTS.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-ithina-border bg-ithina-panel p-5 transition-colors",
                insight.hoverBorderClass,
              )}
            >
              <div className={cn("absolute left-0 top-0 h-1 w-full", insight.barClass)} />
              <div className="mb-3 flex items-start justify-between">
                <span className={cn("rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest", insight.badgeClass)}>
                  {insight.label}
                </span>
                {insight.timestamp && <span className="text-xs text-slate-500">{insight.timestamp}</span>}
              </div>
              <h3 className="mb-2 text-base font-bold text-white">{insight.title}</h3>
              <p className="mb-5 text-xs leading-relaxed text-slate-400">{insight.description}</p>
              <button
                type="button"
                onClick={() => navigate({ to: routes.wizard })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 shadow-sm transition-colors hover:bg-ithina-purple hover:text-white"
              >
                {insight.actionLabel}
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Campaign History ── */}
      <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel lg:min-h-[520px]">
        <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Campaign History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search campaigns..."
              aria-label="Search campaign history"
              className="w-48 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-9 pr-3 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>
        </header>

        <IthTable<CampaignRow>
          data={filteredRows}
          columns={HISTORY_COLUMNS}
          rowKey={(r) => r.id}
          onRowClick={(row) => navigate({ to: routes[row.status] as never })}
          rowHighlight={(row) => {
            if (row.status === "live")    return "emerald";
            if (row.status === "pending") return "amber";
            return null;
          }}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filteredRows.length,
            onPageChange: setPage,
            rowLabel: "campaigns",
          }}
          className="rounded-none border-0"
        />
      </div>
    </div>
  );
}
