import { CloudUpload, MessageCircle } from "lucide-react";
import { memo } from "react";

interface WizardZeroStateProps {
  onSwitchToCsv: () => void;
}

function WizardZeroState({ onSwitchToCsv }: WizardZeroStateProps) {
  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <MessageCircle className="size-8 text-ithina-purple" strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Campaign Intent Engine</h2>
      <p className="mx-auto mb-6 max-w-md text-sm text-slate-400">
        Describe your promotion in plain language, or upload a SKU list directly.
      </p>
      <button
        onClick={onSwitchToCsv}
        className="flex items-center gap-2 rounded-xl border border-ithina-border bg-ithina-panel px-4 py-2.5 text-xs font-medium text-slate-400 transition-all hover:border-ithina-purple/30 hover:text-ithina-purple"
      >
        <CloudUpload className="size-4" />
        Or upload a SKU CSV instead
      </button>
    </div>
  );
}

export default memo(WizardZeroState);
