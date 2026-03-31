import { Building2, Check, ChevronDown, Megaphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import SidenavFooter from "./footer";
import { getNavSectionsForRole } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { PromoAuthService } from "@/lib/auth/promo-auth";

export default function Sidenav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = PromoAuthService.getCurrentUser();
  const role = user?.role ?? "maker";
  const storeRef = useRef<HTMLDivElement | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);

  const stores = useMemo(
    () => [
      { id: "4281", name: "Chicago North", short: "#4281" },
      { id: "3092", name: "Chicago Downtown", short: "#3092" },
      { id: "5410", name: "Milwaukee Central", short: "#5410" },
      { id: "7720", name: "Austin West", short: "#7720" },
    ],
    [],
  );
  const [activeStoreId, setActiveStoreId] = useState(stores[0]?.id ?? "");
  const activeStore = stores.find((s) => s.id === activeStoreId) ?? stores[0];

  const navSections = getNavSectionsForRole(role);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(event.target as Node)) {
        setStoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-ithina-border bg-ithina-sidebar z-30">

      {/* ── App brand header ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-ithina-border/50 px-4 py-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ithina-purple/30 bg-ithina-purple/10">
          <Megaphone className="size-4 text-ithina-purple" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-white uppercase">Promotions</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Assistant</p>
        </div>
      </div>

      {/* ── Store dropdown (prototype-style) ── */}
      <div className="shrink-0 px-3 pt-3" ref={storeRef}>
        <button
          onClick={() => setStoreOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
            storeOpen
              ? "border-ithina-purple/30 bg-ithina-purple/8"
              : "border-ithina-border bg-ithina-panel hover:border-ithina-purple/30",
          )}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-ithina-border/70 bg-ithina-bg/70">
            <Building2 className={cn("size-3 text-slate-500", storeOpen && "text-ithina-purple")} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-xs font-semibold", storeOpen ? "text-ithina-purple" : "text-white")}>
              {activeStore?.name}
            </p>
            <p className={cn("truncate font-mono text-[10px]", storeOpen ? "text-ithina-purple/70" : "text-slate-500")}>
              {activeStore?.short}
            </p>
          </div>
          <ChevronDown className={cn("size-3.5 shrink-0 text-slate-600 transition-transform", storeOpen && "rotate-180 text-ithina-purple")} />
        </button>

        {storeOpen && (
          <div className="mt-1.5 overflow-hidden rounded-xl border border-ithina-border bg-ithina-panel p-1 shadow-xl">
            <div className="max-h-56 overflow-y-auto">
              {stores.map((store) => {
                const isActive = store.id === activeStoreId;
                return (
                  <button
                    key={store.id}
                    onClick={() => {
                      setActiveStoreId(store.id);
                      setStoreOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition-colors",
                      isActive
                        ? "border-ithina-purple/25 bg-ithina-purple/10"
                        : "border-transparent hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn("truncate text-xs font-medium", isActive ? "text-white" : "text-slate-300")}>
                        {store.name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500">{store.short}</p>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[8px] text-ithina-purple bg-ithina-purple/10">
                        <Check className="size-2.5" />
                        ACTIVE
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation sections ── */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-3">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/");
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
                    {item.badge != null && item.badge > 0 && (
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
