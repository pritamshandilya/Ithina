import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StagedSku } from "@/types/wizard";

interface DataStagingGridProps {
  data: StagedSku[];
  isGenerating: boolean;
  onProceed: () => void;
}

export default function DataStagingGrid({ data, isGenerating, onProceed }: DataStagingGridProps) {
  return (
    <div className="flex h-full min-w-0 flex-1 animate-[fadeIn_0.5s_ease-out] flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-5">
        <div>
          <h2 className="text-base font-bold tracking-wide text-white">Data Staging (ROOS)</h2>
          <p className="mt-1 text-xs text-ithina-muted">Review system pricing proposals against margin guardrails.</p>
        </div>
        <button
          onClick={onProceed}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed to Creative Design
          <ArrowRight className="size-3.5" />
        </button>
      </header>

      <div className={cn("flex-1 overflow-auto", isGenerating && "pointer-events-none opacity-50 transition-opacity")}>
        <table className="w-full text-left whitespace-nowrap">
          <thead className="sticky top-0 z-10 border-b border-ithina-border bg-ithina-panel">
            <tr className="font-mono text-[10px] font-medium uppercase tracking-widest text-ithina-muted">
              <th className="px-6 py-4">SKU</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4 text-right">Current</th>
              <th className="px-5 py-4 text-right text-ithina-purple">Proposed</th>
              <th className="px-5 py-4 text-center">Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ithina-border/50 text-sm">
            {data.map((item) => (
              <tr
                key={item.sku}
                className={cn(
                  "transition-colors hover:bg-white/[0.02]",
                  !item.safe && "border-l-2 border-l-rose-400 bg-rose-900/10",
                )}
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.sku}</td>
                <td className="px-5 py-4 text-sm font-medium text-slate-200">{item.name}</td>
                <td className="px-5 py-4 text-right font-mono text-sm text-slate-500 line-through">
                  ${item.current.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right font-mono text-base font-bold text-white">
                  ${item.proposed.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-center">
                  {item.safe ? (
                    <span className="rounded border border-emerald-400/20 bg-emerald-900/40 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
                      PASS
                    </span>
                  ) : (
                    <span className="rounded border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 font-mono text-[10px] text-rose-400">
                      ALERT ({item.margin})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
