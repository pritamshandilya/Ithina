import { Image } from "lucide-react";
import { memo } from "react";

import type { AssetInfo } from "@/types/studio";

interface AssetPanelProps {
  asset: AssetInfo;
}

function AssetPanel({ asset }: AssetPanelProps) {
  return (
    <div className="flex h-40 shrink-0 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      <header className="flex items-center justify-between border-b border-ithina-border bg-white/[0.01] px-5 py-3">
        <span className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
          <Image className="size-4 text-ithina-purple" />
          Asset Resolution
        </span>
        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400">
          VERIFIED
        </span>
      </header>
      <div className="flex h-full items-center gap-4 bg-ithina-bg/30 p-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-white p-1 shadow-inner">
          <span className="text-4xl drop-shadow-md">{asset.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 truncate text-xs font-semibold text-white">{asset.name}</p>
          <p className="font-mono text-[10px] text-slate-400">SKU: {asset.sku}</p>
          <p className="my-0.5 font-mono text-[10px] text-slate-400">Source: {asset.source}</p>
          <p className="font-mono text-[10px] text-ithina-purple">{asset.status}</p>
        </div>
      </div>
    </div>
  );
}

export default memo(AssetPanel);
