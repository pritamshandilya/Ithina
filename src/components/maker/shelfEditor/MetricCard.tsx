import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export function MetricCard({
  label,
  value,
  color = "text-white",
  subtitle,
}: MetricCardProps) {
  return (
    <div className="flex h-24 flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-lg transition-colors hover:border-slate-700">
      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-2xl font-black italic", color)}>{value}</span>
        {subtitle && (
          <span className="text-[10px] font-medium text-slate-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
