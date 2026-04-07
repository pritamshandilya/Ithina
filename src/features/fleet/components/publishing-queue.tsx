import { memo, useMemo } from "react";

import type { QueueRow } from "@/types/fleet";

interface PublishingQueueProps {
  rows: QueueRow[];
  progressCount: number;
  totalCount: number;
  isComplete: boolean;
}

function PublishingQueue({ rows, progressCount, totalCount, isComplete }: PublishingQueueProps) {
  const queue = useMemo(() => {
    const first = rows[0] ?? {
      name: "Sushi Clearance - Track 1",
      target: "1-Bit BMP (Chroma 42)",
      totalTags: totalCount,
      completedTags: progressCount,
      state: "publishing" as const,
      animated: true,
    };

    const second = rows[1] ?? {
      name: "Sushi Clearance - Track 2",
      target: "1080p PNG (Endcap)",
      totalTags: 5,
      completedTags: 5,
      state: "live" as const,
    };

    const progressPct = Math.max(0, Math.min(100, Math.floor((progressCount / totalCount) * 100)));
    const firstComplete = isComplete || first.state === "live" || first.state === "completed";

    return {
      first: {
        ...first,
        shownCompleted: first.animated ? progressCount : first.completedTags,
        shownPct: first.animated ? progressPct : Math.floor((first.completedTags / first.totalTags) * 100),
        complete: firstComplete,
      },
      second: {
        ...second,
        shownCompleted: second.completedTags,
        shownPct: Math.floor((second.completedTags / second.totalTags) * 100),
      },
    };
  }, [rows, progressCount, totalCount, isComplete]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl xl:col-span-2">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-5">
        <h3 className="text-base font-semibold tracking-wide text-white">Publishing Queue</h3>
      </header>
      <div className="flex-1 overflow-auto">
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
            <tr className="group transition-colors hover:bg-white/[0.02]">
              <td className="px-6 py-5 pl-8">
                <span className="mb-1 block font-medium text-white">{queue.first.name}</span>
                <span className="block font-mono text-[10px] text-slate-500">
                  Target: {queue.first.target}
                </span>
              </td>
              <td className="px-6 py-5">
                {!queue.first.complete ? (
                  <span className="inline-flex items-center gap-2 rounded border border-ithina-purple/30 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[10px] text-ithina-purple">
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-ithina-purple" />
                    Publishing
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                    ✓ Completed
                  </span>
                )}
              </td>
              <td className="w-72 px-6 py-5">
                <div className="mb-1.5 flex justify-between font-mono text-[10px] text-slate-400">
                  <span>
                    {queue.first.shownCompleted.toLocaleString()} / {queue.first.totalTags.toLocaleString()}
                  </span>
                  <span className={queue.first.complete ? "text-emerald-400" : "text-white"}>
                    {queue.first.shownPct}%
                  </span>
                </div>
                <progress
                  className={`h-1.5 w-full overflow-hidden rounded-full border border-ithina-border bg-black/50 [&::-webkit-progress-bar]:bg-black/50 ${
                    queue.first.complete
                      ? "[&::-webkit-progress-value]:bg-emerald-500 [&::-webkit-progress-value]:shadow-[0_0_8px_#34d399]"
                      : "[&::-webkit-progress-value]:bg-ithina-purple [&::-webkit-progress-value]:shadow-[0_0_8px_#a855f7]"
                  }`}
                  value={queue.first.shownCompleted}
                  max={queue.first.totalTags}
                />
              </td>
              <td className="px-6 py-5 text-center font-mono text-slate-300">
                {queue.first.totalTags.toLocaleString()}
              </td>
            </tr>

            <tr className="group opacity-80 transition-colors hover:bg-white/[0.02]">
              <td className="px-6 py-5 pl-8">
                <span className="mb-1 block font-medium text-slate-300">{queue.second.name}</span>
                <span className="block font-mono text-[10px] text-slate-500">
                  Target: {queue.second.target}
                </span>
              </td>
              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                  ✓ Live
                </span>
              </td>
              <td className="w-72 px-6 py-5">
                <div className="mb-1.5 flex justify-between font-mono text-[10px] text-slate-500">
                  <span>
                    {queue.second.shownCompleted.toLocaleString()} / {queue.second.totalTags.toLocaleString()}
                  </span>
                  <span className="text-emerald-400">{queue.second.shownPct}%</span>
                </div>
                <progress
                  className="h-1.5 w-full overflow-hidden rounded-full border border-ithina-border bg-black/50 [&::-webkit-progress-bar]:bg-black/50 [&::-webkit-progress-value]:bg-emerald-500 [&::-webkit-progress-value]:shadow-[0_0_8px_#34d399]"
                  value={queue.second.shownCompleted}
                  max={queue.second.totalTags}
                />
              </td>
              <td className="px-6 py-5 text-center font-mono text-slate-300">
                {queue.second.totalTags.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(PublishingQueue);
