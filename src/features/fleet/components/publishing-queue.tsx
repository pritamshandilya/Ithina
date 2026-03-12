import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QueueRow } from "@/types/fleet";

interface PublishingQueueProps {
  rows: QueueRow[];
  progressCount: number;
  totalCount: number;
  isComplete: boolean;
}

export default function PublishingQueue({ rows, progressCount, totalCount, isComplete }: PublishingQueueProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl xl:col-span-2">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-5">
        <h3 className="text-base font-semibold tracking-wide text-white">Publishing Queue</h3>
      </header>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="sticky top-0 z-10 border-b border-ithina-border bg-ithina-sidebar">
            <tr className="font-medium text-[10px] uppercase tracking-widest text-ithina-muted">
              <th className="px-6 py-4 pl-8">Payload Sub-Batch</th>
              <th className="px-6 py-4">State</th>
              <th className="px-6 py-4">API / RF Progress</th>
              <th className="px-6 py-4 text-center">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ithina-border/50 text-sm">
            {rows.map((row, i) => {
              const isAnimated = row.animated;
              const pct = isAnimated
                ? Math.floor((progressCount / totalCount) * 100)
                : Math.floor((row.completedTags / row.totalTags) * 100);
              const count = isAnimated ? progressCount : row.completedTags;
              const complete = isAnimated ? isComplete : row.state === "live" || row.state === "completed";

              return (
                <tr key={i} className={cn("transition-colors hover:bg-white/[0.02]", !isAnimated && "opacity-80")}>
                  <td className="px-6 py-5 pl-8">
                    <span className={cn("mb-1 block font-medium", isAnimated ? "text-white" : "text-slate-300")}>{row.name}</span>
                    <span className="block font-mono text-[10px] text-slate-500">Target: {row.target}</span>
                  </td>
                  <td className="px-6 py-5">
                    {!complete ? (
                      <span className="inline-flex items-center gap-2 rounded border border-ithina-purple/30 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[10px] text-ithina-purple">
                        <div className="size-1.5 animate-pulse rounded-full bg-ithina-purple" />
                        Publishing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                        <Check className="size-3" strokeWidth={3} />
                        {row.state === "live" ? "Live" : "Completed"}
                      </span>
                    )}
                  </td>
                  <td className="w-72 px-6 py-5">
                    <div className="mb-1.5 flex justify-between font-mono text-[10px] text-slate-400">
                      <span>{count.toLocaleString()} / {row.totalTags.toLocaleString()}</span>
                      <span className={complete ? "text-emerald-400" : "text-white"}>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-ithina-border bg-black/50">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000 ease-out",
                          complete ? "bg-emerald-500 shadow-[0_0_8px_#34d399]" : "bg-ithina-purple shadow-[0_0_8px_#a855f7]",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-slate-300">{row.totalTags.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
