import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  breadcrumbs: { label: string; isActive?: boolean }[];
  title: string;
  actions?: ReactNode;
}

export default function PageHeader({
  breadcrumbs,
  title,
  actions,
}: PageHeaderProps) {
  const resolvedActions =
    actions ??
    (
      <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-mono text-[11px] text-emerald-400">
        <Check className="h-3 w-3" strokeWidth={2} />
        ROOS Connected
      </div>
    );

  return (
    <header className="flex shrink-0 items-end justify-between border-b border-ithina-border/50 px-8 py-6">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ithina-purple">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-slate-500">/</span>}
              <span className={crumb.isActive ? "text-slate-300" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">{resolvedActions}</div>
    </header>
  );
}
