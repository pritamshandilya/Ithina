import { CloudUpload, MessageCircle } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

export type WizardMode = "nl" | "manual";
export type WizardEntryInput = "ai" | "csv";

interface ModeChooserProps {
  onSelect: (mode: WizardMode, input: WizardEntryInput) => void;
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
        <h2 className="mb-2 text-2xl font-bold text-white">New Campaign</h2>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          How do you want to stage product data for this campaign?
        </p>
      </div>

      <div className="flex w-full max-w-2xl gap-5">
        {/* NL Generation */}
        <button
          onClick={() => onSelect("nl", "ai")}
          className={cn(
            "group flex-1 rounded-2xl border-2 border-ithina-border bg-ithina-panel p-7 text-left",
            "transition-all hover:-translate-y-0.5 hover:border-ithina-purple/60 hover:bg-ithina-purple/5",
          )}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-ithina-purple shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-110">
            <MessageCircle className="size-6 text-white" />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-white">NL / AI Assisted</h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Describe your promotion. ROOS stages SKUs and AI generates layouts automatically.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-ithina-purple/30 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[9px] text-ithina-purple">
              Auto SKU Staging
            </span>
            <span className="rounded border border-ithina-purple/20 bg-ithina-purple/8 px-2 py-0.5 font-mono text-[9px] text-ithina-purple/80">
              AI Layouts
            </span>
          </div>
        </button>

        {/* Manual Creation */}
        <button
          onClick={() => onSelect("nl", "csv")}
          className={cn(
            "group flex-1 rounded-2xl border-2 border-ithina-border bg-ithina-panel p-7 text-left",
            "transition-all hover:-translate-y-0.5 hover:border-slate-500",
          )}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-ithina-border bg-ithina-bg transition-all group-hover:scale-110 group-hover:border-slate-500">
            <CloudUpload className="size-6 text-slate-300" />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-white">CSV Upload</h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Upload a SKU CSV with prices. Then choose display sizes and upload your own banner files.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] text-slate-400">
              CSV Import
            </span>
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] text-slate-400">
              Manual Upload
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default memo(ModeChooser);
