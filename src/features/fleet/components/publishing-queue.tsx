import { memo, useMemo } from "react";

import { cn } from "@/lib/utils";
import type { QueueRow } from "@/types/fleet";

interface PublishingQueueProps {
  rows: QueueRow[];
}

function StateBadge({ row }: { row: QueueRow }) {
  if (row.state === "live") {
    return (
      <span className="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
        ✓ Live
      </span>
    );
  }
  if (row.state === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
        ✓ Completed
      </span>
    );
  }
  if (row.fleetState === "scheduled") {
    return (
      <span className="inline-flex items-center gap-2 rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">
        {row.animated && (
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-amber-400" />
        )}
        Scheduled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded border border-ithina-purple/30 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[10px] text-ithina-purple">
      {row.animated && (
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-ithina-purple" />
      )}
      Publishing
    </span>
  );
}

function PublishingQueue({ rows }: PublishingQueueProps) {
  const prepared = useMemo(
    () =>
      rows.map((row) => {
        const pct = Math.max(0, Math.min(100, Math.floor((row.completedTags / row.totalTags) * 100)));
        const isTerminal = row.state === "live" || row.state === "completed";
        return { row, pct, isTerminal };
      }),
    [rows],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl xl:col-span-2">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-5">
        <h3 className="text-base font-semibold tracking-wide text-white">Publishing Queue</h3>
      </header>
      <div className="flex-1 overflow-auto">
        {prepared.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-400">No campaigns in the publishing queue yet.</p>
            <p className="mt-2 font-mono text-[10px] text-slate-600">
              Approved, scheduled, or active campaigns appear here as they move through fleet execution.
            </p>
          </div>
        ) : (
          <table className="w-full whitespace-nowrap text-left">
            <thead className="sticky top-0 z-10 border-b border-ithina-border bg-ithina-sidebar">
              <tr className="text-[10px] font-medium uppercase tracking-widest text-ithina-muted">
                <th className="px-6 py-4 pl-8">Payload Sub-Batch</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">API / RF Progress</th>
                <th className="px-6 py-4 text-center">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ithina-border/50 text-sm">
              {prepared.map(({ row, pct, isTerminal }) => (
                <tr key={row.id ?? `${row.name}-${row.target}`} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-5 pl-8">
                    <span className="mb-1 block font-medium text-white">{row.name}</span>
                    <span className="block font-mono text-[10px] text-slate-500">Target: {row.target}</span>
                  </td>
                  <td className="px-6 py-5">
                    <StateBadge row={row} />
                  </td>
                  <td className="w-72 px-6 py-5">
                    <div className="mb-1.5 flex justify-between font-mono text-[10px] text-slate-400">
                      <span>
                        {row.completedTags.toLocaleString()} / {row.totalTags.toLocaleString()}
                      </span>
                      <span className={isTerminal ? "text-emerald-400" : "text-white"}>{pct}%</span>
                    </div>
                    <progress
                      className={cn(
                        "h-1.5 w-full overflow-hidden rounded-full border border-ithina-border bg-black/50 [&::-webkit-progress-bar]:bg-black/50",
                        isTerminal
                          ? "[&::-webkit-progress-value]:bg-emerald-500 [&::-webkit-progress-value]:shadow-[0_0_8px_#34d399]"
                          : "[&::-webkit-progress-value]:bg-ithina-purple [&::-webkit-progress-value]:shadow-[0_0_8px_#a855f7]",
                      )}
                      value={row.completedTags}
                      max={row.totalTags}
                    />
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-slate-300">
                    {row.totalTags.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default memo(PublishingQueue);
