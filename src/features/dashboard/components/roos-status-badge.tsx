import { Check } from "lucide-react";

export default function RoosStatusBadge() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-mono text-[11px] text-emerald-400">
      <Check className="size-3" />
      ROOS Connected
    </div>
  );
}
