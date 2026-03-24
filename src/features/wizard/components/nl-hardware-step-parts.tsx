import { Check, ChevronDown } from "lucide-react";
import type { RefObject } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId } from "@/types/wizard";

/** Matches index_3.1.html `eslSizeOptions` */
export const ESL_SIZE_OPTIONS = [
  { label: '1.54"', model: "Chroma 15", dims: "152×152 px" },
  { label: '2.13"', model: "Chroma 21", dims: "250×122 px" },
  { label: '2.9"', model: "Chroma 29", dims: "296×128 px" },
  { label: '4.2"', model: "Chroma 42", dims: "400×300 px" },
  { label: '5.83"', model: "Chroma 58", dims: "648×480 px" },
  { label: '7.5"', model: "Chroma 75", dims: "800×480 px" },
] as const;

/** Matches index_3.1.html `lcdSizeOptions` */
export const LCD_SIZE_OPTIONS = [
  { label: '7"', dims: "1024×600 px" },
  { label: '10"', dims: "1280×800 px" },
  { label: '14"', dims: "1920×1080 px" },
  { label: '21"', dims: "1920×1080 px" },
] as const;

export const ESL_DEVICE: HardwareDeviceId = "chroma42";
export const LCD_DEVICE: HardwareDeviceId = "lcd";

export function EslPreviewThumb() {
  return (
    <div className="flex h-[54px] w-[70px] shrink-0 flex-col overflow-hidden rounded border-2 border-slate-400 bg-[#F0F0F0]">
      <div className="shrink-0 bg-[#cc0000] py-0.5 text-center">
        <span className="text-[5px] font-black uppercase tracking-[0.08em] text-white">CLEARANCE</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between px-1 py-0.5">
        <span className="text-[5.5px] font-semibold leading-tight text-[#444]">Premium Salmon Tray</span>
        <div className="leading-none">
          <span className="text-base font-black text-[#111]">$9</span>
          <span className="text-[10px] font-black text-[#111]">.99</span>
        </div>
      </div>
    </div>
  );
}

export function LcdPreviewThumb() {
  return (
    <div className="h-[42px] w-[70px] shrink-0 overflow-hidden rounded border-2 border-slate-600">
      <div className="flex h-full flex-col bg-gradient-to-br from-[#1e3a5f] to-[#0f172a]">
        <div className="shrink-0 bg-[#d97706] py-0.5 text-center">
          <span className="text-[5px] font-black tracking-wide text-black">FLASH SALE</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end px-0.5 pb-0.5">
          <span className="text-[5px] leading-tight text-slate-400">Premium Range</span>
          <span className="text-[13px] font-black leading-none text-white">
            $9<span className="text-[8px]">.99</span>
          </span>
        </div>
      </div>
    </div>
  );
}

interface SizeDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accent: "purple" | "amber";
  title: string;
  options: readonly { label: string; dims: string; model?: string }[];
  selected: string[];
  onToggleSize: (size: string) => void;
  onSelectAll: () => void;
  dropRef: RefObject<HTMLDivElement | null>;
}

export function SizeDropdown({
  open,
  onOpenChange,
  accent,
  title,
  options,
  selected,
  onToggleSize,
  onSelectAll,
  dropRef,
}: SizeDropdownProps) {
  const allSelected = options.length > 0 && options.every((o) => selected.includes(o.label));
  const accentBtn = accent === "purple" ? "text-ithina-purple hover:text-white" : "text-amber-400 hover:text-white";
  const openBorder = accent === "purple" ? "border-ithina-purple/50" : "border-amber-400/50";
  const countBadge =
    accent === "purple"
      ? "font-bold text-ithina-purple bg-ithina-purple/10"
      : "font-bold text-amber-400 bg-amber-400/10";
  const rowSelectedBg = accent === "purple" ? "bg-ithina-purple/10" : "bg-amber-400/8";
  const cbOn = accent === "purple" ? "bg-ithina-purple border-ithina-purple" : "bg-amber-400 border-amber-400";
  const labelOn = accent === "purple" ? "text-ithina-purple" : "text-amber-400";

  return (
    <div className="relative" ref={dropRef}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-ithina-bg px-3 py-2 text-left transition-all",
          open ? openBorder : "border-ithina-border hover:border-slate-500",
        )}
      >
        <span className={cn("text-xs", selected.length ? "text-white" : "text-slate-600")}>
          {selected.length
            ? options
                .filter((o) => selected.includes(o.label))
                .map((o) => o.label)
                .join(", ")
            : "Choose sizes…"}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {selected.length > 0 && (
            <span className={cn("rounded px-1.5 py-0.5 font-mono text-[9px]", countBadge)}>{selected.length}</span>
          )}
          <ChevronDown className={cn("size-3.5 text-slate-500 transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-ithina-border bg-ithina-sidebar shadow-2xl">
          <div className="flex items-center justify-between border-b border-ithina-border/60 px-3 py-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{title}</span>
            <button type="button" onClick={onSelectAll} className={cn("text-[9px] transition-colors", accentBtn)}>
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-col gap-0.5 p-1.5">
            {options.map((sz) => {
              const isOn = selected.includes(sz.label);
              return (
                <label
                  key={sz.label}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                    isOn ? rowSelectedBg : "hover:bg-white/[0.04]",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded border-2 transition-all",
                      isOn ? cbOn : "border-slate-600",
                    )}
                  >
                    {isOn && <Check className={cn("size-2", accent === "amber" ? "text-black" : "text-white")} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isOn}
                    onChange={() => onToggleSize(sz.label)}
                  />
                  <div className="min-w-0 flex-1">
                    <span className={cn("text-xs font-semibold", isOn ? labelOn : "text-slate-300")}>{sz.label}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-600">{sz.dims}</span>
                  </div>
                  {sz.model != null && (
                    <span className="shrink-0 font-mono text-[9px] text-slate-600">{sz.model}</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
