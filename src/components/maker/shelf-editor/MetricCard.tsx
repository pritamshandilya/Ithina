import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    color?: string;
    subtitle?: string;
}

export function MetricCard({ label, value, color = "text-white", subtitle }: MetricCardProps) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-24 shadow-lg hover:border-slate-700 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black italic", color)}>{value}</span>
                {subtitle && <span className="text-[10px] text-slate-500 font-medium">{subtitle}</span>}
            </div>
        </div>
    );
}
