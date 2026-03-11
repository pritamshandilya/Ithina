import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InsightCardData, InsightSeverity } from "@/types/dashboard";

const severityConfig: Record<
  InsightSeverity,
  { badgeClass: string; barClass: string; label: string }
> = {
  "time-sensitive": {
    badgeClass:
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
    barClass: "bg-amber-500/50",
    label: "Time Sensitive",
  },
  "velocity-drop": {
    badgeClass:
      "bg-rose-500/10 text-rose-400 border-rose-500/20",
    barClass: "bg-rose-500/50",
    label: "Velocity Drop",
  },
  "high-stock": {
    badgeClass:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    barClass: "bg-emerald-500/50",
    label: "High Stock",
  },
};

interface InsightCardProps {
  data: InsightCardData;
  onAction?: () => void;
}

export default function InsightCard({ data, onAction }: InsightCardProps) {
  const config = severityConfig[data.severity];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-ithina-border bg-ithina-panel p-5 transition-colors hover:border-white/20">
      <div className={cn("absolute left-0 top-0 h-1 w-full", config.barClass)} />

      <div className="mb-3 flex items-start justify-between">
        <span
          className={cn(
            "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
            config.badgeClass,
          )}
        >
          {config.label}
        </span>
        {data.timestamp && (
          <span className="text-xs text-slate-500">{data.timestamp}</span>
        )}
      </div>

      <h3 className="mb-2 text-base font-bold text-white">{data.title}</h3>
      <p className="mb-5 text-xs leading-relaxed text-slate-400">
        {data.description}
      </p>

      <button
        onClick={onAction}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 shadow-sm transition-colors hover:bg-ithina-purple hover:text-white"
      >
        {data.actionLabel}
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}
