import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ className, label = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)} role="status" aria-label={label}>
      <Loader2 className="size-6 animate-spin text-ithina-purple" />
      <span className="font-mono text-xs text-slate-500">{label}</span>
    </div>
  );
}
