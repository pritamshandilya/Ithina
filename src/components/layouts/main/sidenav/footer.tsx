import { Building2, ChevronDown, LogOut, Moon, Sun, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/ui-slice";

// ─── Small helper — avoids repeating button layout ──────────────────────────
function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        variant === "danger"
          ? "text-rose-400 hover:bg-rose-400/[0.08] hover:text-rose-300"
          : "text-slate-300 hover:bg-white/[0.05] hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function SidenavFooter() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((s) => s.ui.isDarkMode);
  const user = PromoAuthService.getCurrentUser();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    PromoAuthService.logout().finally(() => {
      navigate({ to: "/login" });
    });
  };

  if (!user) {
    return (
      <div className="shrink-0 border-t border-white/[0.05] bg-black/20 p-4">
        <div className="flex items-center gap-3">
          <div className="size-9 shrink-0 rounded-full border border-ithina-border bg-ithina-panel" />
          <p className="text-sm font-medium text-white">Guest</p>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  const fullName = `${user.firstName} ${user.lastName}`;

  const ROLE_LABEL: Record<string, string> = {
    admin: "Admin",
    maker: "Maker",
    checker: "Checker",
  };

  const ROLE_COLOR: Record<string, string> = {
    admin: "text-ithina-rose bg-ithina-rose/10 border-ithina-rose/20",
    maker: "text-ithina-purple bg-ithina-purple/10 border-ithina-purple/20",
    checker: "text-ithina-emerald bg-ithina-emerald/10 border-ithina-emerald/20",
  };

  const roleLabel = ROLE_LABEL[user.role] ?? user.role;
  const roleColor = ROLE_COLOR[user.role] ?? "text-slate-400 bg-white/5 border-white/10";

  return (
    <div className="relative shrink-0" ref={ref}>

      {/* ── Upward popup ── */}
      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-1 overflow-hidden rounded-xl border border-ithina-border bg-ithina-sidebar shadow-2xl z-50">

          {/* User info header */}
          <div className="flex items-center gap-3 border-b border-ithina-border/60 px-4 py-3.5">
            <Avatar className="size-9 shrink-0 rounded-full border border-ithina-purple/30">
              <AvatarFallback className="rounded-full bg-ithina-purple/20 text-xs font-bold text-ithina-purple">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">{fullName}</p>
                <span className={cn("shrink-0 rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest", roleColor)}>
                  {roleLabel}
                </span>
              </div>
              <p className="truncate font-mono text-[10px] text-slate-500">{user.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1">
            <MenuItem
              icon={<User className="size-4 text-slate-500" />}
              label="Profile"
            />
            <MenuItem
              icon={<Building2 className="size-4 text-slate-500" />}
              label="Store Settings"
              onClick={() => {
                navigate({ to: "/store-settings" });
                setOpen(false);
              }}
            />
            <MenuItem
              icon={
                isDark ? (
                  <Sun className="size-4 text-slate-500" />
                ) : (
                  <Moon className="size-4 text-slate-500" />
                )
              }
              label={isDark ? "Light Mode" : "Dark Mode"}
              onClick={() => dispatch(toggleTheme())}
            />
          </div>

          <div className="border-t border-ithina-border/60 p-1">
            <MenuItem
              icon={<LogOut className="size-4" />}
              label="Log out"
              onClick={handleLogout}
              variant="danger"
            />
          </div>
        </div>
      )}

      {/* ── Profile trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 border-t border-white/[0.05] bg-black/20 p-4 text-left transition-colors hover:bg-black/30"
      >
        <Avatar className="size-9 shrink-0 rounded-full border border-ithina-purple/30">
          <AvatarFallback className="rounded-full bg-ithina-purple/20 text-xs font-bold text-ithina-purple">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium leading-tight text-white">{fullName}</p>
          <p className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest", roleColor)}>
            {roleLabel}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-slate-600 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
