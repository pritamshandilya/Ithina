import { CloudUpload, MessageCircle } from "lucide-react";
import { memo } from "react";

interface WizardZeroStateProps {
  onSwitchToCsv: () => void;
}

function WizardZeroState({ onSwitchToCsv }: WizardZeroStateProps) {
  return (
    <div className="relative flex w-full shrink-0 flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out]">
      <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ithina-purple/[0.03] blur-3xl" />
      <div className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ithina-purple/[0.06]" />
      <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ithina-purple/[0.03]" />

      <div className="relative mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-[float_4s_ease-in-out_infinite]">
        <MessageCircle className="size-9 text-ithina-purple" strokeWidth={1.5} />
      </div>

      <h2 className="relative mb-3 text-2xl font-bold tracking-tight text-white">
        Campaign Intent Engine
      </h2>
      <p className="relative mx-auto mb-8 max-w-md text-sm leading-relaxed text-slate-400">
        Describe your promotion in plain language, or upload a SKU list directly.
      </p>

      <button
        onClick={onSwitchToCsv}
        className="relative flex items-center gap-2.5 rounded-xl border border-ithina-border bg-ithina-panel px-5 py-3 text-xs font-medium text-slate-400 transition-all duration-300 hover:border-ithina-purple/30 hover:bg-ithina-purple/[0.06] hover:text-ithina-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
      >
        <CloudUpload className="size-4" />
        Or upload a SKU CSV instead
      </button>
    </div>
  );
}

export default memo(WizardZeroState);
