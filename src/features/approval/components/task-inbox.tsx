import { cn } from "@/lib/utils";
import type { InboxItem } from "@/types/approval";

interface TaskInboxProps {
  items: InboxItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function TaskInbox({ items, activeIndex, onSelect }: TaskInboxProps) {
  return (
    <aside className="z-10 flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl" aria-label="Task inbox">
      <div className="flex items-center justify-between border-b border-ithina-border bg-white/[0.01] p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ithina-muted">Task Inbox</h2>
        <span className="rounded border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-[9px] font-bold text-rose-400">
          {items.length} PENDING
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" role="listbox" aria-label="Pending tasks">
        {items.map((item, i) => (
          <div
            key={item.id}
            role="option"
            aria-selected={activeIndex === i}
            tabIndex={0}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(i); } }}
            className={cn(
              "relative cursor-pointer rounded-xl p-4 transition-all",
              activeIndex === i
                ? "border border-ithina-purple/30 bg-ithina-purple/10 shadow-[0_0_15px_rgba(168,85,247,0.05)]"
                : "border border-ithina-border bg-ithina-bg opacity-60 hover:border-slate-600 hover:opacity-100",
            )}
          >
            {item.urgent && (
              <div className="absolute right-4 top-4 size-2 animate-pulse rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
            )}
            <h3 className={cn("mb-1 text-sm font-semibold", activeIndex === i ? "text-white" : "text-slate-300")}>
              {item.title}
              {item.subtitle && <span className="ml-1 text-rose-400">{item.subtitle}</span>}
            </h3>
            <p className={cn("mb-3 font-mono text-[10px]", activeIndex === i ? "text-slate-400" : "text-slate-500")}>
              Initiator: {item.initiator}
            </p>
            <div className={cn("flex items-center justify-between font-mono text-[10px]", activeIndex === i ? "text-slate-400" : "text-slate-500")}>
              <span className="rounded bg-black/30 px-2 py-1">{item.skus} SKUs</span>
              <span className={item.metaVariant === "success" ? "text-emerald-400" : "text-slate-500"}>{item.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
