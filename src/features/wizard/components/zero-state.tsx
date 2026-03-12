import { MessageCircle } from "lucide-react";

export default function WizardZeroState() {
  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <MessageCircle className="size-8 text-ithina-purple" strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Campaign Intent Engine</h2>
      <p className="mx-auto max-w-md text-sm text-slate-400">
        Describe your promotion in plain language below. I will fetch the live ROOS data, apply margins, and stage the SKUs.
      </p>
    </div>
  );
}
