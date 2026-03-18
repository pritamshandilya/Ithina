import { Bell, ChevronDown, Settings, Shield, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ithinaLogo from "@/assets/ithina_logo.png";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setConstraints } from "@/store/slices/wizard-slice";
import { useWizardStores } from "@/hooks/use-wizard";
import type { WizardStore } from "@/types/wizard";

export default function Header() {
  const dispatch = useAppDispatch();
  const { data: stores = [] } = useWizardStores();
  const constraints = useAppSelector((s) => s.wizard.constraints);

  const currentStore = stores.find((s) => s.id === constraints.store) ?? stores[0];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectStore = (s: WizardStore) => {
    dispatch(setConstraints({ ...constraints, store: s.id }));
    setOpen(false);
  };

  return (
    <header className="relative flex h-[82px] w-full shrink-0 items-center justify-between border-b border-ithina-border/60 bg-ithina-sidebar px-6">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ithina-purple/30 to-transparent" />

      <div className="flex h-full items-center py-3">
        <div className="inline-flex items-center rounded-xl bg-[#0B111F] px-3.5 py-1.5 shadow-inner">
          <img src={ithinaLogo} alt="Ithina" className="h-[50px] w-auto object-contain" />
        </div>
      </div>

      <div className="flex items-center gap-3 text-[13px] font-medium text-slate-300">

        {/* ── Store selector ── */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={stores.length === 0}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
              open
                ? "border-ithina-purple/50 bg-ithina-purple/10 text-ithina-purple"
                : "border-ithina-border bg-ithina-panel text-slate-300 hover:bg-ithina-border",
            )}
          >
            <Store className="size-3.5 shrink-0" />
            <span className="font-mono text-[13px] font-semibold">
              {currentStore ? currentStore.short : "Select Store"}
            </span>
            <ChevronDown
              className={cn("size-3 shrink-0 text-slate-500 transition-transform duration-200", open && "rotate-180")}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-[100] mt-2 w-80 overflow-hidden rounded-xl border border-ithina-border bg-ithina-sidebar shadow-2xl">
              <div className="border-b border-ithina-border/60 px-4 pb-2 pt-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Select Target Store</p>
              </div>
              <div className="p-1.5">
                {stores.map((s) => {
                  const isActive = currentStore?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectStore(s)}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                        isActive
                          ? "border-ithina-purple/25 bg-ithina-purple/10"
                          : "border-transparent hover:bg-white/[0.04]",
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                          isActive ? "bg-ithina-purple/15" : "bg-white/[0.04]",
                        )}
                      >
                        <Store
                          className={cn("size-3.5", isActive ? "text-ithina-purple" : "text-slate-500")}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">{s.name}</span>
                          {isActive && (
                            <span className="rounded bg-ithina-purple/10 px-1.5 py-0.5 font-mono text-[9px] text-ithina-purple">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="mb-1.5 truncate text-[10px] text-slate-500">{s.address}</p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                            {s.displays} displays
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span className="inline-block size-1.5 rounded-full bg-ithina-purple" />
                            {s.activePromos} promos
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Store Manager */}
        <button className="flex items-center gap-2 rounded-lg border border-ithina-border/60 bg-white/[0.03] px-3.5 py-2 shadow-sm transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-white">
          <Shield className="size-3.5 text-blue-400" />
          Store Manager
        </button>

        <div className="mx-1 h-6 w-px bg-ithina-border/40" />

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 transition-all duration-200 hover:text-white">
          <Bell className="size-[18px]" />
          <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-[breathe_3s_ease-in-out_infinite]">
            3
          </span>
        </button>

        {/* Settings */}
        <button className="p-2 text-slate-400 transition-all duration-200 hover:rotate-45 hover:text-white">
          <Settings className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}
