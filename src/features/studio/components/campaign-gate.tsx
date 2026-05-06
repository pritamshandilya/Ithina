import { Archive, ChevronRight, Plus, SquareKanban } from "lucide-react";
import { memo } from "react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import type { RecentCampaign } from "@/types/studio";

interface CampaignGateProps {
  showPicker: boolean;
  recentCampaigns: RecentCampaign[];
  onShowPicker: () => void;
  onHidePicker: () => void;
  onLoadCampaign: (c: RecentCampaign) => void;
}

function CampaignGate({ showPicker, recentCampaigns, onShowPicker, onHidePicker, onLoadCampaign }: CampaignGateProps) {
  const navigate = useNavigate();

  if (!showPicker) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-2xl border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <SquareKanban className="size-10 text-ithina-purple" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Campaign Studio</h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
            Design and refine ESL & LCD layouts for your promotions. Start a new campaign through the Wizard, or open an existing one to modify.
          </p>
        </div>
        <div className="flex w-full max-w-2xl gap-5">
          <button
            onClick={() =>
              navigate({ to: "/maker/wizard", search: {}, replace: true })
            }
            className="group relative flex-1 rounded-2xl border-2 border-ithina-border bg-ithina-panel p-7 text-left transition-all hover:-translate-y-0.5 hover:border-ithina-purple/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-ithina-purple shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-110">
              <Plus className="size-6 text-white" />
            </div>
            <h3 className="mb-1.5 text-base font-bold text-white">New Campaign</h3>
            <p className="text-xs leading-relaxed text-slate-400">Use the Campaign Wizard to describe your promotion, stage SKUs, and auto-generate layouts.</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ithina-purple">
              Open Wizard <ChevronRight className="size-3.5" />
            </div>
          </button>
          <button
            onClick={onShowPicker}
            className="group relative flex-1 rounded-2xl border-2 border-ithina-border bg-ithina-panel p-7 text-left transition-all hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-ithina-border bg-ithina-bg transition-colors group-hover:scale-110 group-hover:border-slate-500">
              <Archive className="size-6 text-slate-300" />
            </div>
            <h3 className="mb-1.5 text-base font-bold text-white">Open Existing</h3>
            <p className="text-xs leading-relaxed text-slate-400">Pick from a recent campaign to edit its layout, swap templates, or adjust SKUs.</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-white">
              Browse campaigns <ChevronRight className="size-3.5" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-5 flex shrink-0 items-center gap-3">
        <button onClick={onHidePicker} className="rounded-xl border border-ithina-border p-2 text-slate-400 transition-colors hover:text-white">
          <ChevronRight className="size-4 rotate-180" />
        </button>
        <div>
          <h3 className="text-base font-bold text-white">Open Existing Campaign</h3>
          <p className="text-xs text-slate-400">Select a campaign to load into Studio</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {recentCampaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => onLoadCampaign(c)}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-ithina-border bg-ithina-panel px-4 py-3 text-left transition-all hover:border-ithina-purple/50 hover:bg-ithina-purple/5"
          >
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{c.name}</span>
              <span className="mt-0.5 block font-mono text-[10px] text-slate-500">{c.skus} SKUs · {c.hw}</span>
            </div>
            <span className={cn("shrink-0 rounded px-2 py-0.5 font-mono text-[9px]", c.statusCls)}>{c.status}</span>
            <ChevronRight className="size-3.5 shrink-0 text-slate-500" />
          </button>
        ))}
        <button onClick={() => navigate({ to: "/campaigns" })} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-ithina-border px-4 py-3 text-slate-500 transition-all hover:border-slate-500 hover:text-white">
          <Archive className="size-4" />
          <span className="text-xs font-medium">View all campaigns</span>
        </button>
      </div>
    </div>
  );
}

export default memo(CampaignGate);
