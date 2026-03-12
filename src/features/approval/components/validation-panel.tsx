import { AlertTriangle, Check, Shield } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { ValidationCheck } from "@/types/approval";

interface ValidationPanelProps {
  checks: ValidationCheck[];
}

function ValidationPanel({ checks }: ValidationPanelProps) {
  return (
    <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-ithina-bg p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
      <div className="mb-4 flex items-center gap-2 text-emerald-400">
        <Shield className="size-5" />
        <h3 className="text-sm font-bold uppercase tracking-widest">Agent 6: OCR Validation Passed</h3>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {checks.map((check) => (
          <div
            key={check.label}
            className={cn(
              "relative overflow-hidden rounded-lg border p-3",
              check.isException
                ? "border-rose-400/30 bg-ithina-panel"
                : "border-ithina-border bg-ithina-panel",
            )}
          >
            {check.isException && <div className="absolute bottom-0 left-0 top-0 w-1 bg-rose-400" />}
            <span
              className={cn(
                "mb-1 block font-mono text-[10px] uppercase tracking-widest",
                check.isException ? "pl-2 text-rose-400" : "text-slate-500",
              )}
            >
              {check.label}
            </span>
            <p className={cn("flex items-center gap-1.5 text-xs text-white", check.isException && "pl-2")}>
              {check.passed ? (
                <Check className="size-3 text-emerald-400" strokeWidth={3} />
              ) : (
                <AlertTriangle className="size-3 text-amber-400" />
              )}
              {check.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ValidationPanel);
