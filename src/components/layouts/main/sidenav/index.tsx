import { useLocation, useNavigate } from "@tanstack/react-router";

import SidenavFooter from "./footer";
import { NAV_ITEMS, SIDEBAR_HEADER } from "@/constants/navigation";
import type { NavItem } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export default function Sidenav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-ithina-border/60 bg-ithina-sidebar">
      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-4">
        <div className="pt-2">
          <div className="flex w-full cursor-default items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-ithina-purple/10 shadow-[0_0_12px_rgba(168,85,247,0.12)]">
                {SIDEBAR_HEADER.icon}
              </div>
              <div className="flex flex-col text-left text-[11px] font-bold uppercase leading-[1.3] tracking-[0.12em] text-slate-300">
                <span>{SIDEBAR_HEADER.title}</span>
                <span className="text-ithina-purple">{SIDEBAR_HEADER.subtitle}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-0.5 pl-1">
            {NAV_ITEMS.map((entry, idx) => {
              if ("divider" in entry && entry.divider) {
                return (
                  <div key={`divider-${idx}`} className="mx-2 my-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-ithina-border to-transparent" />
                  </div>
                );
              }

              const item = entry as NavItem;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate({ to: item.path })}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[13px] transition-all duration-200",
                    isActive
                      ? "bg-ithina-purple/10 font-semibold text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.15)]"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-ithina-purple shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  )}

                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md transition-all duration-200",
                      isActive
                        ? "bg-ithina-purple/20 text-ithina-purple"
                        : "text-slate-500 group-hover:text-slate-300",
                    )}
                  >
                    {item.icon}
                  </div>

                  <span className="flex-1">{item.label}</span>

                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums transition-colors",
                        isActive
                          ? "bg-ithina-purple/25 text-ithina-purple"
                          : "bg-amber-400/15 text-amber-400",
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
      </nav>

      <SidenavFooter />
    </aside>
  );
}
