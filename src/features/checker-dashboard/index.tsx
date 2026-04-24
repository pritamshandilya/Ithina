import { AlertTriangle, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { useMemo } from "react";

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

interface CheckerStat {
  label: string;
  value: number;
  icon: typeof Clock3;
  trend: string;
  trendClass: string;
}

export default function CheckerDashboard() {
  const { data: campaigns = [] } = useCampaignList();

  const historyRows = useMemo<CheckerHistoryRow[]>(() => {
    const reviewed = campaigns.filter((c) => c.submittedForApproval && c.approvalStatus !== "pending");
    return reviewed.map((c, idx) => ({
      id: `ch-${idx}-${c.id}`,
      campaignName: c.name,
      campaignId: c.id,
      initiator: c.ownerName ?? c.initiator,
      decision: c.approvalStatus === "approved" ? "approved" : "rejected",
      guardRails: c.guardrailsStatus === "warn" ? "warning" : "pass",
      reviewedAt: c.reviewedAt ?? c.date,
    }));
  }, [campaigns]);

  const approvedCount = historyRows.filter((r) => r.decision === "approved").length;
  const rejectedCount = historyRows.filter((r) => r.decision === "rejected").length;

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
      value: historyRows.length,
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
    </div>
  );
}
