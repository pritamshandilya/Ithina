import { memo } from "react";

import { cn } from "@/lib/utils";
import type { PayloadRow } from "@/types/approval";

interface PayloadManifestProps {
  rows: PayloadRow[];
}

function PayloadManifest({ rows }: PayloadManifestProps) {
  return (
    <div className="flex min-h-[150px] flex-1 flex-col">
      <h3 className="mb-3 shrink-0 font-mono text-xs uppercase tracking-widest text-ithina-muted">
        API Payload Manifest
      </h3>
      <div className="flex-1 overflow-auto rounded-xl border border-ithina-border bg-ithina-bg">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="sticky top-0 z-10 border-b border-ithina-border bg-ithina-sidebar">
            <tr className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Product Description</th>
              <th className="px-6 py-3 text-right">Old Price</th>
              <th className="px-6 py-3 text-right text-white">New Price</th>
              <th className="px-6 py-3 text-center">Margin Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ithina-border text-sm">
            {rows.map((row) => (
              <tr
                key={row.sku}
                className={cn(
                  "transition-colors hover:bg-white/[0.02]",
                  row.marginStatus === "alert" && "border-l-2 border-l-rose-400 bg-rose-900/20",
                )}
              >
                <td className={cn("px-6 py-3 font-mono text-xs", row.marginStatus === "alert" ? "pl-5 text-rose-400/80" : "text-slate-400")}>
                  {row.sku}
                </td>
                <td className={cn("px-6 py-3", row.marginStatus === "alert" ? "text-slate-200" : "text-slate-300")}>
                  {row.name}
                </td>
                <td className="px-6 py-3 text-right font-mono text-slate-500 line-through">
                  ${row.oldPrice.toFixed(2)}
                </td>
                <td className={cn("px-6 py-3 text-right font-mono text-white", row.marginStatus === "alert" ? "font-bold" : "font-medium")}>
                  ${row.newPrice.toFixed(2)}
                </td>
                <td className="px-6 py-3 text-center">
                  {row.marginStatus === "pass" ? (
                    <span className="font-mono text-[10px] text-emerald-400">PASS</span>
                  ) : (
                    <span className="rounded border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400">
                      ALERT ({row.marginValue})
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

export default memo(PayloadManifest);
