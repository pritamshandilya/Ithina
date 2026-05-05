import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import { profilePathForRole } from "@/lib/profile-routes";
import { ROLE_LABEL, roleBadgePillClassRounded } from "@/lib/role-badge-styles";
import { cn } from "@/lib/utils";

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
  const { isMobile, state } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";
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
      <div
        className={cn(
          "shrink-0 border-t border-white/[0.05] bg-black/20",
          isCollapsed ? "flex justify-center px-0 py-3" : "p-4",
        )}
      >
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="size-9 shrink-0 rounded-full border border-ithina-border bg-ithina-panel" />
          {!isCollapsed ? <p className="text-sm font-medium text-white">Guest</p> : null}
        </div>
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  const fullName = `${user.firstName} ${user.lastName}`;

  const roleLabel = ROLE_LABEL[user.role] ?? user.role;

  return (
    <div className="relative shrink-0" ref={ref}>

      {/* ── Upward popup ── */}
      {open && (
        <div
          className={cn(
            "absolute z-50 overflow-hidden rounded-lg border border-ithina-border bg-ithina-sidebar shadow-2xl",
            /* Fly out to the right of the sidebar (same idea as organization switcher), not above the row */
            "left-full ml-1.5 w-64 max-w-[min(16rem,calc(100vw-1rem))]",
            isCollapsed ? "bottom-1" : "bottom-0",
          )}
        >

          {/* User info header */}
          <div className="flex items-center gap-3 border-b border-ithina-border/60 px-4 py-3.5">
            <Avatar className="size-9 shrink-0 rounded-xl border border-white/6">
              <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">{fullName}</p>
                <span className={roleBadgePillClassRounded(user.role)}>{roleLabel}</span>
              </div>
              <p className="truncate font-mono text-[10px] text-slate-500">{user.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1">
            <MenuItem
              icon={<User className="size-4 text-slate-500" />}
              label="Profile"
              onClick={() => {
                navigate({ to: profilePathForRole(user.role) });
                setOpen(false);
              }}
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

      <p
        className={cn(
          "pb-2 text-center font-mono text-[11px] text-muted-foreground/60 select-none",
          isCollapsed ? "px-0" : "px-4",
        )}
      >
        v 1.0.0.3
      </p>

      {/* ── Profile trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={isCollapsed ? `${fullName}, open account menu` : undefined}
        className={cn(
          "flex w-full min-w-0 items-center border-t border-sidebar-border/60 text-left transition-colors hover:bg-white/5",
          isCollapsed ? "justify-center gap-0 px-0 py-2.5" : "gap-3 p-4",
        )}
      >
        <Avatar
          className={cn(
            "shrink-0 rounded-xl border border-white/6",
            isCollapsed ? "size-8" : "size-9",
          )}
        >
          <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!isCollapsed ? (
          <>
            <div className="grid min-w-0 flex-1 overflow-hidden text-left text-sm leading-tight">
              <span className="truncate font-medium text-sidebar-foreground">{fullName}</span>
              <span className={cn("mt-1 w-fit max-w-full", roleBadgePillClassRounded(user.role))}>
                {roleLabel}
              </span>
            </div>

            <ChevronDown
              className={cn(
                "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </>
        ) : null}
      </button>
    </div>
  );
}
