import { memo } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId, HwOption, LayoutVariant, VariantId } from "@/types/studio";

import HardwareSelector from "./hardware-selector";

interface VariantChooserProps {
  variants: LayoutVariant[];
  hwOptions: HwOption[];
  activeHw: HardwareDeviceId;
  onHwSelect: (id: HardwareDeviceId) => void;
  onVariantSelect: (id: VariantId) => void;
}

function VariantChooser({ variants, hwOptions, activeHw, onHwSelect, onVariantSelect }: VariantChooserProps) {
  return (
    <section className="flex flex-1 flex-col items-center overflow-y-auto py-6 animate-[fadeIn_0.5s_ease-out_0.2s_both]">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">Select a Layout Variant</h2>
        <p className="text-sm text-slate-400">The Promo Assistant has composed 3 distinct structures based on the Sushi data.</p>
      </div>

      <div className="mb-8 flex items-center gap-3 rounded-xl border border-ithina-border bg-ithina-sidebar px-4 py-3 shadow-lg">
        <span className="font-mono text-[10px] uppercase text-ithina-muted">Target Hardware:</span>
        <HardwareSelector options={hwOptions} active={activeHw} onSelect={onHwSelect} />
        <span className="font-mono text-[10px] text-slate-500">· preview will render for selected hardware</span>
      </div>

      <div className={cn("flex flex-wrap justify-center gap-5", activeHw === "lcd" && "w-full max-w-4xl")}>
        {variants.map((v) => (
          <VariantCard key={v.id} variant={v} hw={activeHw} onSelect={onVariantSelect} />
        ))}
      </div>
    </section>
  );
}

export default memo(VariantChooser);

function VariantCard({ variant, hw, onSelect }: { variant: LayoutVariant; hw: HardwareDeviceId; onSelect: (id: VariantId) => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select variant ${variant.id}: ${variant.name}${variant.recommended ? " (AI recommended)" : ""}`}
      onClick={() => onSelect(variant.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(variant.id); } }}
      className={cn(
        "relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-5 transition-all hover:-translate-y-1",
        variant.recommended
          ? "border-2 border-ithina-purple bg-ithina-panel shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          : "border border-ithina-border bg-ithina-panel shadow-lg hover:border-ithina-purple",
        hw === "lcd" && "min-w-[260px] flex-1",
      )}
    >
      {variant.recommended && (
        <div className="absolute -top-3 z-10 rounded-full bg-ithina-purple px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
          AI Recommended
        </div>
      )}
      <span className={cn("font-mono text-xs uppercase tracking-widest", variant.recommended ? "text-ithina-purple" : "text-slate-400")}>
        {variant.id}. {variant.name}
      </span>
      <VariantPreview variant={variant.id} hw={hw} />
    </div>
  );
}

function VariantPreview({ variant, hw }: { variant: VariantId; hw: HardwareDeviceId }) {
  if (hw === "chroma42") return <Chroma42Thumb variant={variant} />;
  if (hw === "chroma29") return <Chroma29Thumb variant={variant} />;
  return <LcdThumb variant={variant} />;
}

function Chroma42Thumb({ variant }: { variant: VariantId }) {
  if (variant === "A") {
    return (
      <div className="flex h-[180px] w-[240px] items-center justify-center rounded border border-slate-500 bg-[#E2E8F0] p-3">
        <div className="flex h-full w-full flex-col border border-slate-300 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" }}>
          <div className="flex h-5 w-full items-center justify-center bg-black text-[9px] font-bold tracking-widest text-white">CLEARANCE</div>
          <div className="flex flex-1 flex-col items-center justify-center px-2 text-center text-black">
            <span className="text-[10px] font-bold">Premium Salmon Tray</span>
            <span className="mt-1 text-[44px] font-bold leading-none tracking-tighter">$10.39</span>
          </div>
        </div>
      </div>
    );
  }
  if (variant === "B") {
    return (
      <div className="flex h-[180px] w-[240px] items-center justify-center rounded border border-ithina-border bg-[#E2E8F0] p-3">
        <div className="flex h-full w-full flex-col border border-slate-300 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" }}>
          <div className="flex h-8 w-full items-center justify-center border-b-2 border-black bg-[#FF0000] text-sm font-bold tracking-widest text-white">EXPIRING IN 48H</div>
          <div className="flex h-full items-end justify-between p-2 text-black">
            <div className="flex w-3/5 flex-col pb-1">
              <span className="text-[11px] font-bold leading-tight">Premium<br />Salmon Tray</span>
              <span className="mt-1 text-[8px] font-bold line-through">WAS $12.99</span>
            </div>
            <span className="text-[32px] font-bold leading-none tracking-tighter">$10.39</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-[180px] w-[240px] items-center justify-center rounded border border-slate-500 bg-[#E2E8F0] p-3">
      <div className="flex h-full w-full border border-slate-300 bg-[#F9F9F9] text-black" style={{ imageRendering: "pixelated" }}>
        <div className="flex w-1/3 items-center justify-center border-r-2 border-black text-3xl grayscale">🍣</div>
        <div className="flex w-2/3 flex-col justify-between p-2">
          <div className="bg-[#FF0000] py-0.5 text-center text-[8px] font-bold text-white">CLEARANCE</div>
          <span className="mt-1 text-[9px] font-bold leading-tight">Premium Salmon Tray</span>
          <span className="mt-auto text-right text-[28px] font-bold leading-none tracking-tighter">$10.39</span>
        </div>
      </div>
    </div>
  );
}

function Chroma29Thumb({ variant }: { variant: VariantId }) {
  if (variant === "A") {
    return (
      <div className="flex h-[96px] w-[222px] items-center justify-center rounded border border-slate-500 bg-[#E2E8F0] p-2">
        <div className="flex h-full w-full border border-slate-300 bg-[#F9F9F9] text-black" style={{ imageRendering: "pixelated" }}>
          <div className="flex w-1/3 items-center justify-center bg-black text-[10px] font-bold tracking-widest text-white" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>CLEAR</div>
          <div className="flex flex-1 flex-col items-end justify-center pr-2 text-black">
            <span className="text-[8px] font-bold">Salmon Tray</span>
            <span className="text-[28px] font-bold leading-none tracking-tighter">$10.39</span>
          </div>
        </div>
      </div>
    );
  }
  if (variant === "B") {
    return (
      <div className="flex h-[96px] w-[222px] items-center justify-center rounded border border-ithina-border bg-[#E2E8F0] p-2">
        <div className="flex h-full w-full flex-col border border-slate-300 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" }}>
          <div className="flex h-4 w-full items-center justify-center border-b border-black bg-[#FF0000] text-[8px] font-bold tracking-widest text-white">EXPIRING IN 48H</div>
          <div className="flex flex-1 items-center justify-between p-1.5 text-black">
            <div className="flex flex-col"><span className="text-[8px] font-bold leading-tight">Prem. Salmon</span><span className="text-[6px] line-through">$12.99</span></div>
            <span className="text-[22px] font-bold leading-none tracking-tighter">$10.39</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-[96px] w-[222px] items-center justify-center rounded border border-slate-500 bg-[#E2E8F0] p-2">
      <div className="flex h-full w-full border border-slate-300 bg-[#F9F9F9] text-black" style={{ imageRendering: "pixelated" }}>
        <div className="flex w-1/4 items-center justify-center bg-black text-sm text-white grayscale">🍣</div>
        <div className="flex flex-1 flex-col justify-between p-1 text-black">
          <div className="bg-[#FF0000] py-0.5 text-center text-[6px] font-bold text-white">CLEAR</div>
          <span className="text-[7px] font-bold">Salmon Tray</span>
          <span className="text-right text-[20px] font-bold leading-none tracking-tighter">$10.39</span>
        </div>
      </div>
    </div>
  );
}

function LcdThumb({ variant }: { variant: VariantId }) {
  const tag = variant === "A" ? "CLEARANCE" : variant === "B" ? "EXPIRING IN 48H" : "CLEARANCE";
  const tagBg = variant === "B" ? "bg-red-600" : variant === "C" ? "bg-red-700" : "bg-black/50";

  return (
    <div className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-slate-400 bg-[#D1D5DB] p-2.5 pb-4">
      <div className="relative flex h-[130px] w-full items-center overflow-hidden rounded bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent" />
        {variant === "C" && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-4xl opacity-70 grayscale">🍣</div>}
        <div className="relative z-10 p-4 text-white">
          <div className={cn("mb-1.5 inline-block rounded px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest", tagBg)}>{tag}</div>
          <div className="text-xs font-bold">Premium Salmon Tray</div>
          {variant === "B" && <div className="text-[8px] text-gray-400 line-through">WAS $12.99</div>}
          <div className="text-2xl font-black tracking-tighter">$10.39</div>
        </div>
      </div>
      <div className="mt-0.5 h-1 w-6 rounded-full bg-slate-400" />
    </div>
  );
}
