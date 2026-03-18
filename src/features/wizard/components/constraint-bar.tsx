import { Building2, ChevronDown, Clock, Shield } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  MarginRisk,
  WizardConstraints,
  WizardDuration,
  WizardMargin,
  WizardStore,
} from "@/types/wizard";
import {
  useWizardDurations,
  useWizardMargins,
  useWizardStores,
} from "@/hooks/use-wizard";
import { useAppSelector } from "@/store/hooks";

type DropdownKey = "margin" | "duration" | null;

interface ConstraintBarProps {
  disabled?: boolean;
  onChange: (constraints: WizardConstraints) => void;
}

const riskColor: Record<MarginRisk, string> = {
  Safe: "text-emerald-400",
  Moderate: "text-amber-400",
  Strict: "text-rose-400",
};

const riskBg: Record<MarginRisk, string> = {
  Safe: "bg-emerald-900/40",
  Moderate: "bg-amber-900/40",
  Strict: "bg-rose-900/40",
};

const riskBadge: Record<MarginRisk, string> = {
  Safe: "text-emerald-400 bg-emerald-900/40",
  Moderate: "text-amber-400 bg-amber-900/30",
  Strict: "text-rose-400 bg-rose-900/30",
};

function ConstraintBar({ disabled, onChange }: ConstraintBarProps) {
  const { data: stores = [] } = useWizardStores();
  const { data: margins = [] } = useWizardMargins();
  const { data: durations = [] } = useWizardDurations();

  const constraintsStoreId = useAppSelector((s) => s.wizard.constraints.store);

  const [selectedStore, setSelectedStore] = useState<WizardStore | null>(null);
  const [selectedMargin, setSelectedMargin] = useState<WizardMargin | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<WizardDuration | null>(null);
  const [open, setOpen] = useState<DropdownKey>(null);
  const marginRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stores.length === 0) return;
    const fromConstraints = stores.find((s) => s.id === constraintsStoreId);
    const target = fromConstraints ?? stores[0];
    if (!selectedStore || selectedStore.id !== target.id) {
      setSelectedStore(target);
    }
  }, [stores, selectedStore, constraintsStoreId]);

  useEffect(() => {
    if (margins.length > 0 && !selectedMargin) setSelectedMargin(margins[0]);
  }, [margins, selectedMargin]);

  useEffect(() => {
    if (durations.length > 0 && !selectedDuration) setSelectedDuration(durations[0]);
  }, [durations, selectedDuration]);

  const emitChange = useCallback(
    (s: WizardStore, m: WizardMargin, d: WizardDuration) => {
      onChange({ store: s.id, marginFloor: m.value, duration: d.id });
    },
    [onChange],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const refs = [marginRef.current, durationRef.current];
      if (!refs.some((r) => r?.contains(e.target as Node))) setOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (key: DropdownKey) => setOpen((prev) => (prev === key ? null : key));

  if (!selectedStore || !selectedMargin || !selectedDuration) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", disabled && "pointer-events-none opacity-40")}>

      {/* Margin Floor */}
      <div className="relative" ref={marginRef}>
        <button
          type="button"
          onClick={() => toggle("margin")}
          aria-haspopup="listbox"
          aria-expanded={open === "margin"}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-all",
            open === "margin"
              ? "border-ithina-purple/50 bg-ithina-purple/5"
              : "border-ithina-border bg-white/[0.02] hover:border-slate-600 hover:bg-white/[0.05]",
          )}
        >
          <Shield className={cn("size-3.5 shrink-0 transition-colors", open === "margin" ? "text-ithina-purple" : riskColor[selectedMargin.risk])} />
          <div className="text-left leading-none">
            <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-widest text-slate-500">Margin Floor</span>
            <span className={cn("block font-mono text-xs font-bold", riskColor[selectedMargin.risk])}>{selectedMargin.value}</span>
          </div>
          <ChevronDown className={cn("ml-0.5 size-3 shrink-0 text-slate-600 transition-transform duration-200", open === "margin" && "rotate-180 text-ithina-purple")} />
        </button>

        {open === "margin" && (
          <div className="absolute bottom-full left-0 z-50 mb-2 w-[17.5rem] overflow-hidden rounded-xl border border-ithina-border bg-ithina-sidebar shadow-2xl">
            <div className="border-b border-ithina-border/60 px-4 pb-2 pt-3">
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Margin Guardrail</p>
              <p className="mt-0.5 text-[10px] text-slate-400">AI flags any SKU that falls below this floor.</p>
            </div>
            <div className="p-1.5">
              {margins.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => { setSelectedMargin(m); setOpen(null); emitChange(selectedStore, m, selectedDuration); }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                    selectedMargin.value === m.value ? "border border-ithina-purple/25 bg-ithina-purple/10" : "border border-transparent hover:bg-white/[0.04]",
                  )}
                >
                  <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", riskBg[m.risk])}>
                    <span className={cn("font-mono text-xs font-black", riskColor[m.risk])}>%</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{m.value}</span>
                      <span className={cn("rounded px-1.5 py-0.5 font-mono text-[9px]", riskBadge[m.risk])}>{m.risk}</span>
                    </div>
                    <p className="truncate text-[10px] text-slate-500">{m.desc}</p>
                    <p className={cn("mt-0.5 font-mono text-[10px]", riskColor[m.risk])}>{m.impact}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="relative" ref={durationRef}>
        <button
          type="button"
          onClick={() => toggle("duration")}
          aria-haspopup="listbox"
          aria-expanded={open === "duration"}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-all",
            open === "duration"
              ? "border-ithina-purple/50 bg-ithina-purple/5"
              : "border-ithina-border bg-white/[0.02] hover:border-slate-600 hover:bg-white/[0.05]",
          )}
        >
          <Clock className={cn("size-3.5 shrink-0 transition-colors", open === "duration" ? "text-ithina-purple" : "text-slate-500")} />
          <div className="text-left leading-none">
            <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-widest text-slate-500">Duration</span>
            <span className="block font-mono text-xs font-semibold text-white">{selectedDuration.short}</span>
          </div>
          <ChevronDown className={cn("ml-0.5 size-3 shrink-0 text-slate-600 transition-transform duration-200", open === "duration" && "rotate-180 text-ithina-purple")} />
        </button>

        {open === "duration" && (
          <div className="absolute bottom-full left-0 z-50 mb-2 w-60 overflow-hidden rounded-xl border border-ithina-border bg-ithina-sidebar shadow-2xl">
            <div className="border-b border-ithina-border/60 px-4 pb-2 pt-3">
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Campaign Window</p>
            </div>
            <div className="p-1.5">
              {durations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setSelectedDuration(d); setOpen(null); emitChange(selectedStore, selectedMargin, d); }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all",
                    selectedDuration.id === d.id ? "border border-ithina-purple/25 bg-ithina-purple/10" : "border border-transparent hover:bg-white/[0.04]",
                  )}
                >
                  <div>
                    <span className="block text-xs font-semibold text-white">{d.label}</span>
                    <span className="text-[10px] text-slate-500">{d.desc}</span>
                  </div>
                  <span className="ml-2 shrink-0 rounded border border-ithina-border bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] text-slate-400">{d.short}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ConstraintBar);
