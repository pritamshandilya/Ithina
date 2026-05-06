import { Bell, Plus, Shield } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { PromoAuthService } from "@/lib/auth/promo-auth";
import { wizardEntryPathForRole } from "@/lib/wizard-route";

export default function Header() {
  const navigate = useNavigate();
  const role = PromoAuthService.getCurrentUser()?.role ?? "maker";

  return (
    <header className="relative flex h-[64px] w-full shrink-0 items-center justify-between border-b border-ithina-border bg-ithina-sidebar px-4 shadow-sm z-40">

      {/* Logo pill — matches prototype .logo-pill style */}
      <div className="flex h-full items-center py-2">
        <div
          className="inline-flex items-center"
          style={{ backgroundColor: "#0F172A", borderRadius: 10, padding: "4px 12px" }}
        >
          <div className="flex h-10 items-center">
            <span
              className="select-none text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.5px" }}
            >
              ithina
            </span>
            <span className="mb-3 ml-1 inline-block size-1.5 rounded-full bg-purple-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[13px] font-medium text-slate-300">

        {/* ROOS Connected */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-mono text-[11px] text-emerald-400">
          <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ROOS Connected
        </div>

        {/* Store Manager */}
        <button className="flex items-center gap-2 rounded-md border border-ithina-border bg-ithina-panel px-3 py-1.5 shadow-sm transition-colors hover:bg-ithina-border">
          <Shield className="size-3.5 text-blue-400" />
          Store Manager
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-400 transition-colors hover:text-white">
          <Bell className="size-[18px]" />
          <div className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full border border-ithina-bg bg-red-500 text-[9px] font-bold text-white">
            3
          </div>
        </button>

        {/* New Campaign — makers and admins */}
        {(role === "maker" || role === "admin") && (
          <button
            onClick={() =>
              navigate({
                to: wizardEntryPathForRole(role),
                search: {},
                replace: true,
              })
            }
            className="flex items-center gap-1.5 rounded-lg bg-ithina-purple px-4 py-2 text-xs font-bold text-white shadow-[0_0_14px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover"
          >
            <Plus className="size-3.5" />
            New Campaign
          </button>
        )}
      </div>
    </header>
  );
}
