import { Check, ChevronDown, Monitor, Smartphone, Tv } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId, HwOption } from "@/types/studio";

interface HardwareSelectorProps {
  options: HwOption[];
  active: HardwareDeviceId;
  onSelect: (id: HardwareDeviceId) => void;
}

const hwIcons: Record<HardwareDeviceId, React.ReactNode> = {
  chroma42: <Monitor className="size-4" />,
  chroma29: <Smartphone className="size-4" />,
  lcd: <Tv className="size-4" />,
};

function HardwareSelector({ options, active, onSelect }: HardwareSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeOption = options.find((h) => h.id === active);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select target hardware"
        className="flex min-w-[190px] items-center justify-between gap-2 rounded-lg border border-ithina-border bg-ithina-bg px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-ithina-purple"
      >
        <span className="flex items-center gap-2">
          <span className="shrink-0 text-slate-400">{hwIcons[active]}</span>
          {activeOption?.label}
        </span>
        <ChevronDown className={cn("size-3 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-ithina-border bg-ithina-sidebar shadow-2xl" role="listbox" aria-label="Hardware options">
          {options.map((hw) => (
            <button
              key={hw.id}
              role="option"
              aria-selected={active === hw.id}
              onClick={() => { onSelect(hw.id); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                active === hw.id && "bg-ithina-purple/10",
              )}
            >
              <span className="shrink-0 text-slate-400">{hwIcons[hw.id]}</span>
              <div>
                <div className="text-xs font-bold text-white">{hw.label}</div>
                <div className="font-mono text-[10px] text-slate-500">{hw.sub}</div>
              </div>
              {active === hw.id && <Check className="ml-auto size-3.5 shrink-0 text-ithina-purple" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(HardwareSelector);
