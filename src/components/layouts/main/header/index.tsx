import { Bell, Moon, Settings, Shield, Sun } from "lucide-react";

import ithinaLogo from "@/assets/ithina_logo.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/ui-slice";

export default function Header() {
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);
  const dispatch = useAppDispatch();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="flex h-[82px] w-full shrink-0 items-center justify-between border-b border-ithina-border bg-ithina-sidebar px-6 shadow-sm">
      <div className="flex h-full items-center py-3">
        <div className="inline-flex items-center rounded-[10px] bg-[#0F172A] px-3.5 py-1.5">
          <img
            src={ithinaLogo}
            alt="Ithina"
            className="h-[50px] w-auto object-contain"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-[13px] font-medium text-slate-300">
        <button className="flex items-center gap-2 rounded-md border border-ithina-border bg-ithina-panel px-3 py-1.5 shadow-sm transition-colors hover:bg-ithina-border">
          <Shield className="size-3.5 text-blue-400" />
          Store Manager
        </button>

        <button className="rounded-md border border-ithina-border bg-ithina-panel px-3 py-1.5 shadow-sm transition-colors hover:bg-ithina-border">
          Intensive
        </button>

        <button className="relative ml-2 p-1.5 text-slate-400 transition-colors hover:text-white">
          <Bell className="size-[18px]" />
          <span className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full border border-ithina-bg bg-red-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <button className="p-1.5 text-slate-400 transition-colors hover:text-white">
          <Settings className="size-[18px]" />
        </button>

        <button
          onClick={handleToggleTheme}
          title={isDarkMode ? "Light mode" : "Dark mode"}
          className="ml-1 rounded-md border border-ithina-border p-1.5 text-slate-400 transition-colors hover:text-white"
        >
          {isDarkMode ? (
            <Sun className="size-[18px]" />
          ) : (
            <Moon className="size-[18px]" />
          )}
        </button>
      </div>
    </header>
  );
}
