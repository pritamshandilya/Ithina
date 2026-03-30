import { useLocation, useNavigate } from "@tanstack/react-router";

import SidenavFooter from "./footer";
import { NAV_ITEMS, SIDEBAR_HEADER } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export default function Sidenav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-ithina-border bg-ithina-sidebar">
      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-4">
        <div className="pt-2">
          <div className="flex w-full cursor-default items-center justify-between px-3 py-3 text-slate-300">
            <div className="flex items-center gap-3">
              {SIDEBAR_HEADER.icon}
              <div className="flex flex-col text-left text-[13px] font-medium uppercase leading-[1.2] tracking-wide">
                <span>{SIDEBAR_HEADER.title}</span>
                <span>{SIDEBAR_HEADER.subtitle}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1 pl-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate({ to: item.path })}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                    isActive
                      ? "border-ithina-purple/20 bg-ithina-purple/10 font-medium text-ithina-purple shadow-sm"
                      : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white",
                  )}
                >
                  <div className={cn(!isActive && "opacity-70")}>
                    {item.icon}
                  </div>
                  {item.label}
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
