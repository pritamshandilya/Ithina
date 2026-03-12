import { Check, CheckCircle, Code } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { ComplianceCheck, HardwareDeviceId, RendererSpec } from "@/types/studio";

interface ComplianceSidebarProps {
  checks: ComplianceCheck[];
  spec: RendererSpec;
  hw: HardwareDeviceId;
  isScanning: boolean;
  onSendToApproval: () => void;
}

function ComplianceSidebar({ checks, spec, hw, isScanning, onSendToApproval }: ComplianceSidebarProps) {
  const visibleChecks = checks.filter((c) => !c.eslOnly || hw !== "lcd");

  return (
    <aside className="z-10 flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      {/* Compliance Gate */}
      <div className="border-b border-ithina-border bg-white/[0.01] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-300">
          <CheckCircle className="size-4 text-emerald-400" />
          Compliance Gate
        </h3>
        <div className={cn("space-y-3 transition-opacity duration-500", isScanning ? "opacity-40" : "opacity-100")}>
          {visibleChecks.map((check) => (
            <div key={check.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{check.label}</span>
              <span className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                <Check className="size-3" strokeWidth={3} /> PASS
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Renderer Specification */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-300">
          <Code className="size-4 text-ithina-muted" />
          Renderer Specification
        </h3>

        {hw !== "lcd" ? (
          <div className="space-y-4 rounded-xl border border-ithina-border bg-ithina-bg p-4 shadow-inner">
            <SpecRow label="Target Display" value={spec.targetDisplay} />
            <SpecRow label="DCS Payload Format" value={spec.payloadFormat} />
            <div>
              <span className="mb-2 block text-[10px] uppercase tracking-widest text-slate-500">Restricted Palette</span>
              <div className="flex gap-2">
                {spec.palette?.map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "size-5 rounded border",
                      color === "#000000" && "border-slate-600",
                      color === "#FFFFFF" && "border-slate-400",
                      color === "#FF0000" && "border-red-600 shadow-[0_0_8px_rgba(255,0,0,0.4)]",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-ithina-border bg-ithina-bg p-4 shadow-inner">
            <SpecRow label="Target Display" value={spec.targetDisplay} />
            <SpecRow label="Resolution" value={spec.resolution ?? ""} />
            <SpecRow label="Color Space" value={spec.colorSpace ?? ""} />
          </div>
        )}
      </div>

      {/* Action */}
      <div className="border-t border-ithina-border bg-ithina-bg/50 p-4">
        <button
          onClick={onSendToApproval}
          aria-label="Send design to approval queue"
          className="w-full rounded-lg bg-ithina-purple py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all hover:bg-ithina-purple-hover"
        >
          Send to Approval
        </button>
      </div>
    </aside>
  );
}

export default memo(ComplianceSidebar);

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}
