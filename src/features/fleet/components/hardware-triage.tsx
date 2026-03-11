import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HardwareAlert } from "@/types/fleet";

interface HardwareTriageProps {
  alert: HardwareAlert | null;
  hasAlert: boolean;
  isResolving: boolean;
  onResolve: () => void;
}

export default function HardwareTriage({ alert, hasAlert, isResolving, onResolve }: HardwareTriageProps) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
      {hasAlert && (
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-full bg-gradient-to-b from-rose-400/10 to-transparent transition-opacity duration-500" />
      )}

      <header
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-between border-b px-6 py-5 transition-colors duration-500",
          hasAlert ? "border-rose-400/20 bg-rose-900/10" : "border-ithina-border bg-white/[0.01]",
        )}
      >
        <h3 className="text-sm font-semibold tracking-wide text-white">Hardware Triage</h3>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors",
            hasAlert
              ? "border-rose-400/30 bg-rose-400/20 text-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.2)]"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
          )}
        >
          {hasAlert ? "1 Active" : "All Clear"}
        </span>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto bg-ithina-bg/30 p-5">
        {hasAlert && alert ? (
          <div className="relative overflow-hidden rounded-xl border border-rose-400/30 bg-ithina-panel p-4 shadow-sm">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-rose-400" />
            <div className="pl-1">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                </div>
                <span className="rounded border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-400">
                  {alert.code}
                </span>
              </div>

              <div className="mb-3 flex gap-3 rounded border border-ithina-border bg-black/30 p-2 font-mono text-[10px] text-slate-400">
                <span>Store: <span className="text-white">{alert.store}</span></span>
                <span>Tag Count: <span className="text-white">{alert.tagCount}</span></span>
              </div>

              <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{alert.description}</p>

              <button
                onClick={onResolve}
                disabled={isResolving}
                aria-label="Retry hardware API ping"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-400 transition-colors hover:bg-rose-400/20 disabled:opacity-50"
              >
                {isResolving ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
                {isResolving ? "Pinging API..." : "Retry API Ping"}
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle className="mb-3 size-12 text-slate-600" strokeWidth={1.5} />
            <p className="text-xs font-medium">All systems operational.</p>
            <p className="mt-1 font-mono text-[10px]">No hardware alerts detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
