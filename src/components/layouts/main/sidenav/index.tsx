import { ChevronDown, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import SidenavFooter from "./footer";
import { NAV_SECTIONS } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setConstraints } from "@/store/slices/wizard-slice";
import { useWizardStores } from "@/hooks/use-wizard";
import type { WizardStore } from "@/types/wizard";

export default function Sidenav() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: stores = [] } = useWizardStores();
  const constraints = useAppSelector((s) => s.wizard.constraints);
  const currentStore = stores.find((s) => s.id === constraints.store) ?? stores[0];

  const [storeOpen, setStoreOpen] = useState(false);
  const storeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(e.target as Node)) {
        setStoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectStore = (s: WizardStore) => {
    dispatch(setConstraints({ ...constraints, store: s.id }));
    setStoreOpen(false);
  };

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-ithina-border bg-ithina-sidebar z-30">

      {/* ── Store selector ── */}
      <div
        className="relative shrink-0 border-b border-ithina-border/50 px-3 pb-2 pt-3"
        ref={storeRef}
      >
        <button
          onClick={() => setStoreOpen((v) => !v)}
          disabled={stores.length === 0}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60",
            storeOpen
              ? "border-ithina-purple/50 bg-ithina-purple/10"
              : "border-ithina-border bg-ithina-bg/60 text-slate-300 hover:bg-ithina-bg",
          )}
        >
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md",
              storeOpen ? "bg-ithina-purple/20" : "bg-ithina-panel",
            )}
          >
            <Store
              className={cn(
                "size-3.5",
                storeOpen ? "text-ithina-purple" : "text-slate-400",
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-xs font-semibold",
                storeOpen ? "text-ithina-purple" : "text-white",
              )}
            >
              {currentStore?.name ?? "Select Store"}
            </p>
            <p
              className={cn(
                "font-mono text-[10px]",
                storeOpen ? "text-ithina-purple/70" : "text-slate-500",
              )}
            >
              {currentStore?.short ?? "—"}
            </p>
          </div>

          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-200",
              storeOpen ? "rotate-180 text-ithina-purple" : "text-slate-600",
            )}
          />
        </button>

        {/* Dropdown — floats above content, does not push nav down */}
        {storeOpen && (
          <div className="absolute left-3 right-3 top-full z-[200] mt-1 overflow-hidden rounded-xl border border-ithina-border bg-ithina-bg shadow-2xl">
            <div className="border-b border-ithina-border/60 px-3 pb-1.5 pt-2.5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                Select Store
              </p>
            </div>
            <div className="p-1">
              {stores.map((s) => {
                const isActive = currentStore?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => selectStore(s)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all",
                      isActive
                        ? "border-ithina-purple/25 bg-ithina-purple/10"
                        : "border-transparent hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-semibold text-white">
                          {s.name}
                        </span>
                        {isActive && (
                          <span className="shrink-0 rounded bg-ithina-purple/10 px-1.5 py-0.5 font-mono text-[8px] text-ithina-purple">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="truncate font-mono text-[10px] text-slate-500">
                        {s.short} · {s.displays} displays
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation sections ── */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate({ to: item.path })}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors",
                      isActive
                        ? "border-ithina-purple/20 bg-ithina-purple/10 font-medium text-ithina-purple shadow-sm"
                        : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center",
                        !isActive && "opacity-60 group-hover:opacity-100",
                      )}
                    >
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
                          isActive
                            ? "bg-ithina-purple/30 text-ithina-purple"
                            : "bg-amber-400/20 text-amber-400",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <SidenavFooter />
    </aside>
  );
}
