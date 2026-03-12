import { memo } from "react";

import { cn } from "@/lib/utils";
import type { FleetStat } from "@/types/fleet";

interface FleetStatsProps {
  stats: FleetStat[];
  batchStartedAt: string;
  alertCount: number;
  hasAlert: boolean;
  tagsInTransit: number;
  successRate: number;
}

function FleetStats({ stats, batchStartedAt, alertCount, hasAlert, tagsInTransit, successRate }: FleetStatsProps) {
  const dynamicValues: Record<string, { value: string; trend: string }> = {
    "Active Batches": { value: "1", trend: "Running" },
    "Tags In Transit (RF)": { value: tagsInTransit.toLocaleString(), trend: "Queued" },
    "Hardware Success Rate": { value: String(successRate), trend: "Last 24h" },
    "Hardware Alerts": { value: String(alertCount), trend: hasAlert ? "Requires Action" : "All Clear" },
  };

  return (
    <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const dv = dynamicValues[stat.label];
        const isAlertCard = stat.isAlert && hasAlert;

        return (
          <div
            key={stat.label}
            className={cn(
              "rounded-xl p-5 shadow-sm",
              isAlertCard
                ? "border border-rose-400/30 bg-rose-900/10 shadow-[0_0_20px_rgba(251,113,133,0.05)]"
                : "border border-ithina-border bg-ithina-panel",
            )}
          >
            <p className={cn("mb-1 font-mono text-[10px] uppercase tracking-widest", isAlertCard ? "text-rose-400" : "text-slate-400")}>
              {stat.label}
            </p>
            <div className="mt-2 flex items-end gap-3">
              <span className={cn("text-3xl font-bold tracking-tight", isAlertCard ? "text-rose-400" : stat.label === "Hardware Alerts" && !hasAlert ? "text-emerald-400" : "text-white")}>
                {dv?.value ?? stat.value}
                {stat.suffix && <span className="text-xl text-slate-500">{stat.suffix}</span>}
              </span>
              <span className={cn(
                "mb-1 text-xs font-medium",
                stat.trendVariant === "purple" && "animate-pulse text-ithina-purple",
                stat.trendVariant === "success" && "text-emerald-400",
                stat.trendVariant === "danger" && "text-slate-400",
                stat.trendVariant === "muted" && "text-slate-500",
              )}>
                {dv?.trend ?? stat.trend}
              </span>
            </div>
            {stat.label === "Active Batches" && (
              <p className="mt-2 font-mono text-[9px] text-slate-600">Initiated: {batchStartedAt}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(FleetStats);
