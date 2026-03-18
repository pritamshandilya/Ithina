import { ArrowRight, CloudUpload, MessageCircle } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

export type WizardMode = "nl" | "manual";

interface ModeChooserProps {
  onSelect: (mode: WizardMode) => void;
}

function ModeChooser({ onSelect }: ModeChooserProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
          <svg className="size-8 text-ithina-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Campaign Intent Engine</h2>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          Choose how you want to build this campaign.
        </p>
      </div>

      <div className="flex w-full max-w-2xl gap-5">
        {/* NL Generation */}
        <button
          onClick={() => onSelect("nl")}
          className={cn(
            "group flex-1 rounded-2xl border-2 border-ithina-border bg-ithina-panel p-7 text-left",
            "transition-all hover:-translate-y-0.5 hover:border-ithina-purple/60 hover:bg-ithina-purple/5",
          )}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-ithina-purple shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-110">
            <MessageCircle className="size-6 text-white" />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-white">NL Mediated Generation</h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Describe your promotion in plain language. AI fetches live ROOS data, applies margins and stages SKUs automatically.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ithina-purple">
            Use AI <ArrowRight className="size-3.5" />
          </div>
        </button>

        {/* Manual Creation */}
        <button
          onClick={() => onSelect("manual")}
          className={cn(
            "group flex-1 rounded-2xl border-2 border-ithina-border bg-ithina-panel p-7 text-left",
            "transition-all hover:-translate-y-0.5 hover:border-slate-500",
          )}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-ithina-border bg-ithina-bg transition-all group-hover:scale-110 group-hover:border-slate-500">
            <CloudUpload className="size-6 text-slate-300" />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-white">Manual Creation</h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Select your display screens, upload pre-designed banners per dimension. Full control over creative assets.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-white">
            Upload banners <ArrowRight className="size-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
}

export default memo(ModeChooser);
