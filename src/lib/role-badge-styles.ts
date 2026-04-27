import { cn } from "@/lib/utils";

/** Short title-case labels for sidebar + tables (matches POG Users table). */
export const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  maker: "Maker",
  checker: "Checker",
};

/**
 * Translucent role chips (POG color tokens); pill shape reads closer to POG’s “soft” chips than sharp corners.
 * @see DD-POG-Frontend/src/routes/admin/users/index.tsx getRoleBadgeClasses
 * Checker uses `primary` here because Promo's `--accent` is slate; `--primary` is purple like POG's accent.
 */
const ROLE_BADGE_BASE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

const ROLE_BADGE_VARIANT: Record<string, string> = {
  admin: "border-amber-500/30 bg-amber-500/15 text-amber-500",
  maker: "border-blue-500/30 bg-blue-500/15 text-blue-500",
  checker: "border-primary/30 bg-primary/15 text-primary",
};

const ROLE_BADGE_FALLBACK = "border-border/40 bg-muted/15 text-muted-foreground";

export function roleBadgeClass(role: string): string {
  return cn(ROLE_BADGE_BASE, ROLE_BADGE_VARIANT[role] ?? ROLE_BADGE_FALLBACK);
}

/** Kept for existing imports; same as roleBadgeClass. */
export function roleBadgePillClass(role: string): string {
  return roleBadgeClass(role);
}

/** Sidebar + profile dropdown (same visual as POG table chips). */
export function roleBadgePillClassRounded(role: string): string {
  return roleBadgeClass(role);
}

/** Users table ROLE column — title case via ROLE_LABEL, not uppercase. */
export function roleBadgeTableClass(role: string): string {
  return roleBadgeClass(role);
}

/**
 * POG admin users table: `rounded-md` chips (see DD-POG-Frontend getRoleBadgeClasses).
 * Same colors as `roleBadgeClass` but not pill-shaped.
 */
const ROLE_BADGE_POG_BASE =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold";

export function roleBadgePogTableClass(role: string): string {
  return cn(ROLE_BADGE_POG_BASE, ROLE_BADGE_VARIANT[role] ?? ROLE_BADGE_FALLBACK);
}
