import { Check, X } from "lucide-react";
import { memo, useState } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId } from "@/types/wizard";
import { useHardwareDevices } from "@/hooks/use-wizard";

interface HardwareModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (deviceIds: HardwareDeviceId[]) => void;
}

const previewStyles: Record<HardwareDeviceId, string> = {
  chroma29: "aspect-[296/128] border-2 border-slate-400 bg-[#F9F9F9] text-black text-[8px]",
  chroma42: "aspect-[400/300] border-2 border-slate-400 bg-[#F9F9F9] text-black text-[10px]",
  lcd: "aspect-video border border-slate-600 bg-gradient-to-br from-blue-900 to-slate-900 text-white text-[10px]",
};

function HardwareModal({ open, onClose, onConfirm }: HardwareModalProps) {
  const { data: devices = [] } = useHardwareDevices();
  const [selected, setSelected] = useState<HardwareDeviceId[]>(["chroma42", "lcd"]);

  if (!open) return null;

  const toggle = (id: HardwareDeviceId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-ithina-bg/80 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Select target hardware">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-2xl">
        <header className="flex items-center justify-between border-b border-ithina-border bg-white/[0.02] px-8 py-5">
          <div>
            <h2 className="text-xl font-bold text-white">Select Target Hardware</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select the display types to generate layouts for.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close hardware selection" className="text-slate-500 transition-colors hover:text-white">
            <X className="size-6" />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-6 bg-ithina-bg/50 p-8" role="group" aria-label="Hardware options">
          {devices.map((device) => {
            const isSelected = selected.includes(device.id);
            return (
              <div
                key={device.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggle(device.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(device.id); } }}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-5 transition-all",
                  isSelected
                    ? "border-ithina-purple bg-ithina-purple/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                    : "border-ithina-border bg-ithina-panel hover:border-slate-500",
                )}
              >
                <div
                  className={cn(
                    "absolute right-4 top-4 flex size-5 items-center justify-center rounded border transition-colors",
                    isSelected ? "border-ithina-purple bg-ithina-purple" : "border-slate-500",
                  )}
                >
                  {isSelected && <Check className="size-3.5 text-white" />}
                </div>

                <div
                  className={cn(
                    "mb-4 flex w-full items-center justify-center rounded font-bold shadow-inner",
                    previewStyles[device.id],
                  )}
                >
                  {device.resolution}
                </div>

                <h3 className="text-sm font-bold text-white">{device.name}</h3>
                <p className="mt-1 font-mono text-[10px] text-slate-400">{device.track}</p>
              </div>
            );
          })}
        </div>

        <footer className="flex items-center justify-between border-t border-ithina-border bg-white/[0.02] p-6">
          <span className="text-xs text-slate-400">{selected.length} display types selected.</span>
          <button
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
            className="rounded-lg bg-ithina-purple px-6 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Hardware
          </button>
        </footer>
      </div>
    </div>
  );
}

export default memo(HardwareModal);
