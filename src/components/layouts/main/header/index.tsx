import { Bell, Settings, Shield } from "lucide-react";

import ithinaLogo from "@/assets/ithina_logo.png";

export default function Header() {
  return (
    <header className="relative flex h-[82px] w-full shrink-0 items-center justify-between border-b border-ithina-border/60 bg-ithina-sidebar px-6">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ithina-purple/30 to-transparent" />

      <div className="flex h-full items-center py-3">
        <div className="inline-flex items-center rounded-xl bg-[#0B111F] px-3.5 py-1.5 shadow-inner">
          <img
            src={ithinaLogo}
            alt="Ithina"
            className="h-[50px] w-auto object-contain"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-[13px] font-medium text-slate-300">
        <button className="flex items-center gap-2 rounded-lg border border-ithina-border/60 bg-white/[0.03] px-3.5 py-2 shadow-sm transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-white">
          <Shield className="size-3.5 text-blue-400" />
          Store Manager
        </button>

        <button className="rounded-lg border border-ithina-border/60 bg-white/[0.03] px-3.5 py-2 shadow-sm transition-all duration-200 hover:border-ithina-purple/30 hover:bg-ithina-purple/[0.06] hover:text-white">
          Intensive
        </button>

        <div className="mx-1 h-6 w-px bg-ithina-border/40" />

        <button className="relative p-2 text-slate-400 transition-all duration-200 hover:text-white">
          <Bell className="size-[18px]" />
          <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-[breathe_3s_ease-in-out_infinite]">
            3
          </span>
        </button>

        <button className="p-2 text-slate-400 transition-all duration-200 hover:rotate-45 hover:text-white">
          <Settings className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}
