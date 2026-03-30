import { Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  breadcrumbs: { label: string; isActive?: boolean }[];
  title: string;
  actions?: ReactNode;
}

const RoosConnected = () => (
  <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 font-mono text-[11px] text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.1)] animate-[fadeIn_0.6s_ease-out]">
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
      <Check className="relative size-2" strokeWidth={3} />
    </span>
    ROOS Connected
  </div>
);

export default function PageHeader({
  breadcrumbs,
  title,
  actions,
}: PageHeaderProps) {
  return (
    <header className="relative flex shrink-0 items-end justify-between px-8 py-6">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-ithina-purple/20 via-ithina-border/60 to-transparent" />

      <div>
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="size-3 text-slate-600" />}
              <span className={crumb.isActive ? "text-slate-400" : "text-ithina-purple"}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white animate-[slideInLeft_0.3s_ease-out]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <RoosConnected />
      </div>
    </header>
  );
}
