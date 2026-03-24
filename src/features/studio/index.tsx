import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPendingApproval } from "@/store/slices/campaign-slice";
import { resetStudio } from "@/store/slices/studio-slice";

export default function Studio() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const campaign = useAppSelector((s) => s.campaign);
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B" | "C">("A");

  const handleApplyToCampaign = () => {
    dispatch(setPendingApproval(true));
    dispatch(resetStudio());
    navigate({ to: "/approval" });
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
      <div className="h-[88vh] w-full overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-[0_20px_70px_rgba(0,0,0,0.7)]">
        <header className="flex items-center justify-between border-b border-ithina-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-5 items-center justify-center rounded border border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple">
              <Sparkles className="size-3" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Campaign Studio</h2>
              <p className="text-xs text-slate-500">ESL e-ink design</p>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/campaigns" })}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close studio"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grid h-[calc(88vh-55px)] min-h-0 grid-cols-[160px_1fr_220px]">
          <aside className="flex min-h-0 flex-col border-r border-ithina-border">
            <div className="overflow-y-auto p-3">
              <p className="mb-3 font-mono text-[9px] tracking-widest text-slate-600">DESIGN METHOD</p>
              <div className="space-y-2">
                <button className="w-full rounded-xl bg-ithina-purple/20 px-3 py-2 text-left text-sm font-semibold text-white">
                  AI Generate
                </button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/[0.04]">
                  Template Library
                </button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/[0.04]">
                  Manual Upload
                </button>
              </div>
            </div>

            <div className="mt-auto border-t border-ithina-border p-3">
              <p className="mb-2 font-mono text-[9px] tracking-widest text-slate-600">LIVE PREVIEW</p>
              <div className="w-[96px] rounded border border-ithina-border bg-[#E5E7EB] p-1">
                <div className="h-[10px] bg-red-700" />
                <div className="bg-[#F5F5F5] p-1">
                  <p className="text-[6px] text-black">Premium</p>
                  <p className="text-[20px] font-black leading-none text-black">$10.39</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col">
            <div className="flex-1 overflow-y-auto p-3">
              <p className="mb-2 font-mono text-[9px] tracking-widest text-slate-600">
                SELECT A LAYOUT VARIANT
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "A", label: "PRICE-DOMINANT", rec: false },
                  { id: "B", label: "URGENCY", rec: true },
                  { id: "C", label: "BALANCED", rec: false },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v.id as "A" | "B" | "C")}
                    className={cn(
                      "relative rounded-xl border p-1.5 text-left transition-all",
                      selectedVariant === v.id
                        ? "border-ithina-purple bg-ithina-purple/10 shadow-[0_0_18px_rgba(168,85,247,0.25)]"
                        : "border-ithina-border bg-ithina-panel hover:border-slate-500",
                    )}
                  >
                    {v.rec && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-ithina-purple px-2 py-0.5 font-mono text-[8px] font-bold text-white">
                        AI RECOMMENDED
                      </span>
                    )}
                    <p className="mb-1 font-mono text-[9px] text-slate-500">
                      {v.id}. {v.label}
                    </p>
                    <div className="h-36 rounded bg-[#E5E7EB]">
                      <div className="h-5 bg-red-700" />
                      <div className="p-2 text-right text-xl font-black text-black">$10.39</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-ithina-border px-4 py-2">
              <span className="text-xs text-slate-500">Variant {selectedVariant} selected</span>
            </div>
          </main>

          <aside className="flex min-h-0 flex-col border-l border-ithina-border p-3">
            <div className="overflow-y-auto">
              <p className="mb-3 text-sm font-semibold text-white">AI Modify</p>
              <textarea
                placeholder="Describe changes to apply..."
                className="h-24 w-full rounded-xl border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button className="rounded-lg bg-ithina-purple px-3 py-1.5 text-xs font-semibold text-white">
                  Apply
                </button>
              </div>
            </div>

            <div className="mt-auto border-t border-ithina-border pt-3">
              <button
                type="button"
                onClick={handleApplyToCampaign}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ithina-purple-hover"
              >
                Apply to Campaign
                <Check className="size-4" />
              </button>
              <p className="mt-2 truncate text-center text-[10px] text-slate-600">
                {campaign.name || "Untitled Campaign"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
