import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  showIcon?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  warning:
    "text-amber-500 bg-amber-500/10 border-amber-500/20",
  danger:
    "text-rose-400 bg-rose-400/10 border-rose-400/20",
  info:
    "text-blue-400 bg-blue-400/10 border-blue-400/20",
  neutral:
    "text-slate-400 bg-white/5 border-white/10",
};

export default function StatusBadge({
  label,
  variant = "neutral",
  showIcon = false,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px]",
        variantStyles[variant],
      )}
    >
      {showIcon && variant === "success" && <Check className="size-3" />}
      {label}
    </span>
  );
}
