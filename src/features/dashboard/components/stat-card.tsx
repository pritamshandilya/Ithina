import { memo } from "react";

import { cn } from "@/lib/utils";
import type { StatCardData } from "@/types/dashboard";

const trendVariantStyles = {
  success: "text-emerald-400",
  warning: "text-amber-500",
  info: "text-slate-400",
  purple: "text-ithina-purple",
} as const;

const valueVariantStyles = {
  success: "text-white",
  warning: "text-white",
  info: "text-white",
  purple: "text-ithina-purple",
} as const;

interface StatCardProps {
  data: StatCardData;
}

function StatCard({ data }: StatCardProps) {
  return (
    <div className="rounded-xl border border-ithina-border bg-ithina-panel p-5 shadow-sm">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {data.label}
      </p>
      <div className="mt-2 flex items-end gap-3">
        <span
          className={cn(
            "text-3xl font-bold tracking-tight",
            valueVariantStyles[data.trend.variant],
          )}
        >
          {data.value}
        </span>
        <span
          className={cn(
            "mb-1 text-xs font-medium",
            trendVariantStyles[data.trend.variant],
          )}
        >
          {data.trend.text}
        </span>
      </div>
    </div>
  );
}

export default memo(StatCard);
