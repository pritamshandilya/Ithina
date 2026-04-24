import { ArrowRight, Zap } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignList } from "@/hooks/use-campaigns";
import { MOCK_ROOS_INSIGHTS } from "@/mocks/dashboard-roos-insights";
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

type Props = {
  /** Use `admin` when shown under `/admin/store-dashboard` so links stay in admin + `/wizard`. */
  variant?: MakerDashboardVariant;
};

export default function MakerDashboard({ variant = "maker" }: Props) {
  const navigate = useNavigate();
  const routes = ROUTES_BY_VARIANT[variant];
  const { data: campaigns = [], isPending: campaignsPending } = useCampaignList();

  const statCards = useMemo(() => buildDashboardStatCards(campaigns), [campaigns]);

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

      {/* ── Proactive ROOS Insights (mock — swap for API when ROOS backend is ready) ── */}
      <div className="shrink-0">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Zap className="size-4 text-ithina-purple" />
          Proactive ROOS Insights
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {MOCK_ROOS_INSIGHTS.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-ithina-border bg-ithina-panel p-5 transition-colors",
                insight.hoverBorderClass,
              )}
            >
              <div className={cn("absolute left-0 top-0 h-1 w-full", insight.barClass)} />
              <div className="mb-3 flex items-start justify-between">
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                    insight.badgeClass,
                  )}
                >
                  {insight.label}
                </span>
                {insight.timestamp ? (
                  <span className="text-xs text-slate-500">{insight.timestamp}</span>
                ) : null}
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
    </div>
  );
}
