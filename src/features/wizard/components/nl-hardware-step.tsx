import { AlertTriangle, Check, LayoutPanelTop, Plus, Wand2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId } from "@/types/wizard";

import {
  ESL_DEVICE,
  ESL_SIZE_OPTIONS,
  EslPreviewThumb,
  LCD_DEVICE,
  LCD_SIZE_OPTIONS,
  LcdPreviewThumb,
  SizeDropdown,
} from "./nl-hardware-step-parts";

export interface NlHardwareStepProps {
  selectedDevices: HardwareDeviceId[];
  onToggleDevice: (id: HardwareDeviceId) => void;
  activeDevice: HardwareDeviceId | null;
  onSetActiveDevice: (id: HardwareDeviceId | null) => void;
  sizeByDevice: Record<HardwareDeviceId, string[]>;
  onToggleSize: (id: HardwareDeviceId, size: string) => void;
  designConfigured: boolean;
  onSetShowStudio: (value: boolean) => void;
  selectedVariant: "A" | "B" | "C";
  onNext: () => void;
}

function NlHardwareStep({
  selectedDevices,
  onToggleDevice,
  activeDevice,
  onSetActiveDevice,
  sizeByDevice,
  onToggleSize,
  designConfigured,
  onSetShowStudio,
  selectedVariant,
  onNext,
}: NlHardwareStepProps) {
  const [eslDropOpen, setEslDropOpen] = useState(false);
  const [lcdDropOpen, setLcdDropOpen] = useState(false);
  const eslDropRef = useRef<HTMLDivElement>(null);
  const lcdDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      const t = e.target as Node;
      if (eslDropOpen && eslDropRef.current && !eslDropRef.current.contains(t)) setEslDropOpen(false);
      if (lcdDropOpen && lcdDropRef.current && !lcdDropRef.current.contains(t)) setLcdDropOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [eslDropOpen, lcdDropOpen]);

  const eslOn = selectedDevices.includes(ESL_DEVICE);
  const lcdOn = selectedDevices.includes(LCD_DEVICE);
  const eslSizes = sizeByDevice[ESL_DEVICE] ?? [];
  const lcdSizes = sizeByDevice[LCD_DEVICE] ?? [];

  const hasAnySizeSelection = useMemo(() => {
    const eslCount = eslOn ? eslSizes.length : 0;
    const lcdCount = lcdOn ? lcdSizes.length : 0;
    return eslCount + lcdCount > 0;
  }, [eslOn, eslSizes.length, lcdOn, lcdSizes.length]);

  const canConfigure = hasAnySizeSelection;

  const designDevice = useMemo<HardwareDeviceId | null>(() => {
    if (activeDevice && selectedDevices.includes(activeDevice)) return activeDevice;
    if (lcdOn && lcdSizes.length > 0) return LCD_DEVICE;
    if (eslOn && eslSizes.length > 0) return ESL_DEVICE;
    return selectedDevices[0] ?? null;
  }, [activeDevice, eslOn, eslSizes.length, lcdOn, lcdSizes.length, selectedDevices]);

  const designTitle = designDevice === LCD_DEVICE ? "LCD Banner Design" : "ESL Design";
  const eslSizeCount = eslOn ? eslSizes.length : 0;
  const lcdSizeCount = lcdOn ? lcdSizes.length : 0;
  const designSubtitle =
    designDevice === LCD_DEVICE
      ? `${lcdSizeCount || 1} size${lcdSizeCount !== 1 ? "s" : ""} · LCD · RGB`
      : `${eslSizeCount || 1} size${eslSizeCount !== 1 ? "s" : ""} · e-ink · 3-colour`;

  const designReadyToProgress = designConfigured && canConfigure;

  const toggleEslSize = useCallback((size: string) => onToggleSize(ESL_DEVICE, size), [onToggleSize]);
  const toggleLcdSize = useCallback((size: string) => onToggleSize(LCD_DEVICE, size), [onToggleSize]);

  const selectAllEsl = useCallback(() => {
    const allLabels = ESL_SIZE_OPTIONS.map((o) => o.label);
    const allOn = allLabels.every((l) => eslSizes.includes(l));
    if (allOn) {
      eslSizes.forEach((l) => onToggleSize(ESL_DEVICE, l));
    } else {
      allLabels.forEach((l) => {
        if (!eslSizes.includes(l)) onToggleSize(ESL_DEVICE, l);
      });
    }
  }, [eslSizes, onToggleSize]);

  const selectAllLcd = useCallback(() => {
    const allLabels = LCD_SIZE_OPTIONS.map((o) => o.label);
    const allOn = allLabels.every((l) => lcdSizes.includes(l));
    if (allOn) {
      lcdSizes.forEach((l) => onToggleSize(LCD_DEVICE, l));
    } else {
      allLabels.forEach((l) => {
        if (!lcdSizes.includes(l)) onToggleSize(LCD_DEVICE, l);
      });
    }
  }, [lcdSizes, onToggleSize]);

  return (
    <div className="flex min-h-0 flex-1 animate-[fadeIn_0.3s_ease-out] overflow-hidden">
      <div className="flex w-[300px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-ithina-border p-5">
        <div>
          <h3 className="mb-0.5 text-sm font-bold text-white">Select Displays</h3>
          <p className="text-[11px] text-slate-500">Choose hardware and configure sizes.</p>
        </div>

        <div
          className={cn(
            "rounded-2xl border-2 transition-all",
            eslOn ? "border-ithina-purple shadow-[0_0_18px_rgba(168,85,247,0.12)]" : "border-ithina-border",
          )}
        >
          <button
            type="button"
            onClick={() => {
              onToggleDevice(ESL_DEVICE);
              onSetActiveDevice(ESL_DEVICE);
            }}
            className={cn(
              "flex w-full gap-4 rounded-t-2xl p-4 text-left transition-all",
              eslOn ? "bg-ithina-purple/5" : "rounded-2xl bg-ithina-panel",
            )}
          >
            <EslPreviewThumb />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between">
                <span className={cn("text-sm font-bold", eslOn ? "text-white" : "text-slate-300")}>ESL</span>
                <div
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border-2",
                    eslOn ? "border-ithina-purple bg-ithina-purple" : "border-slate-500",
                  )}
                >
                  {eslOn && <Check className="size-2.5 text-white" strokeWidth={3} />}
                </div>
              </div>
              <p className="font-mono text-[10px] text-slate-500">Electronic Shelf Label</p>
              <p className="text-[10px] text-slate-600">e-ink · 3-colour</p>
              {eslSizes.length > 0 && (
                <p className="mt-1 text-[10px] font-medium text-ithina-purple">
                  {eslSizes.length} size{eslSizes.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </button>
          {eslOn && (
            <div className="rounded-b-2xl border-t border-ithina-border/60 bg-ithina-bg/40 px-4 py-3">
              <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Select sizes</p>
              <SizeDropdown
                open={eslDropOpen}
                onOpenChange={setEslDropOpen}
                accent="purple"
                title="ESL sizes"
                options={ESL_SIZE_OPTIONS}
                selected={eslSizes}
                onToggleSize={toggleEslSize}
                onSelectAll={selectAllEsl}
                dropRef={eslDropRef}
              />
            </div>
          )}
        </div>

        <div
          className={cn(
            "rounded-2xl border-2 transition-all",
            lcdOn ? "border-amber-400/60 shadow-[0_0_18px_rgba(251,191,36,0.08)]" : "border-ithina-border",
          )}
        >
          <button
            type="button"
            onClick={() => {
              onToggleDevice(LCD_DEVICE);
              onSetActiveDevice(LCD_DEVICE);
            }}
            className={cn(
              "flex w-full gap-4 rounded-t-2xl p-4 text-left transition-all",
              lcdOn ? "bg-amber-400/5" : "rounded-2xl bg-ithina-panel",
            )}
          >
            <LcdPreviewThumb />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between">
                <span className={cn("text-sm font-bold", lcdOn ? "text-white" : "text-slate-300")}>LCD Banner</span>
                <div
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border-2",
                    lcdOn ? "border-amber-400 bg-amber-400" : "border-slate-500",
                  )}
                >
                  {lcdOn && <Check className="size-2.5 text-black" strokeWidth={3} />}
                </div>
              </div>
              <p className="font-mono text-[10px] text-slate-500">Full-colour banner</p>
              <p className="text-[10px] text-slate-600">LCD · RGB</p>
              {lcdSizes.length > 0 && (
                <p className="mt-1 text-[10px] font-medium text-amber-400">
                  {lcdSizes.length} size{lcdSizes.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </button>
          {lcdOn && (
            <div className="border-t border-ithina-border/60 bg-ithina-bg/40 px-4 py-3">
              <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Select sizes</p>
              <SizeDropdown
                open={lcdDropOpen}
                onOpenChange={setLcdDropOpen}
                accent="amber"
                title="LCD sizes"
                options={LCD_SIZE_OPTIONS}
                selected={lcdSizes}
                onToggleSize={toggleLcdSize}
                onSelectAll={selectAllLcd}
                dropRef={lcdDropRef}
              />
            </div>
          )}
        </div>

        {hasAnySizeSelection && (
          <div className="mt-auto border-t border-ithina-border/40 pt-4">
            {!designReadyToProgress && (
              <div className="mb-2 flex items-center gap-1.5 text-[10px] text-amber-400">
                <AlertTriangle className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                Configure a design for each selected type
              </div>
            )}
            <button
              type="button"
              onClick={onNext}
              disabled={!designReadyToProgress}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
                designReadyToProgress
                  ? "bg-ithina-purple text-white hover:bg-ithina-purple-hover"
                  : "cursor-not-allowed border border-ithina-border bg-ithina-panel text-slate-500 opacity-40",
              )}
            >
              Next: Guard Rails
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        {!hasAnySizeSelection ? (
          <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-3 text-slate-600">
            <LayoutPanelTop className="size-10 text-slate-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-500">Select a display type on the left to configure designs</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
            <div className="flex items-center justify-between border-b border-ithina-border/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    designDevice === LCD_DEVICE ? "bg-amber-400/15 text-amber-300" : "bg-ithina-purple/10 text-ithina-purple",
                  )}
                >
                  <LayoutPanelTop className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{designTitle}</p>
                  <p className="text-[10px] text-slate-500">{designSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSetShowStudio(true)}
                disabled={!canConfigure}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  designDevice === LCD_DEVICE
                    ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                    : "bg-ithina-purple text-white hover:bg-ithina-purple-hover",
                )}
              >
                <Wand2 className="size-3.5" />
                {designConfigured ? "Edit Design" : "Configure Design"}
              </button>
            </div>
            {designConfigured ? (
              <div className="flex items-start gap-5 p-5">
                <div className="shrink-0">
                  <div className="w-[120px] overflow-hidden rounded-md border-2 border-slate-400 bg-[#F0F0F0]">
                    <div className="bg-red-700 py-1 text-center">
                      <span className="text-[7px] font-black uppercase tracking-wide text-white">CLEARANCE</span>
                    </div>
                    <div className="bg-[#F5F5F5] p-2">
                      <p className="text-[7px] font-semibold text-[#555]">Premium Salmon Tray</p>
                      <p className="text-[22px] font-black leading-none text-[#111]">
                        $10<span className="text-[13px]">.39</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-1.5 text-center font-mono text-[9px] text-slate-500">Preview</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      Variant {selectedVariant} —{" "}
                      {selectedVariant === "A" ? "Price-Dominant" : selectedVariant === "B" ? "Urgency" : "Balanced"}
                    </span>
                    <span className="rounded-full border border-ithina-purple/20 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[9px] text-ithina-purple">
                      AI Generated
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-slate-400">
                    Applied to {designDevice === LCD_DEVICE ? lcdSizes.length : eslSizes.length} size
                    {(designDevice === LCD_DEVICE ? lcdSizes.length : eslSizes.length) !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(designDevice === LCD_DEVICE ? lcdSizes : eslSizes).map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-ithina-purple/20 bg-ithina-purple/8 px-2 py-0.5 font-mono text-[9px] text-ithina-purple"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSetShowStudio(true)}
                disabled={!canConfigure}
                className="flex w-full flex-col items-center justify-center gap-3 p-8 transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="flex size-12 items-center justify-center rounded-xl border border-dashed border-ithina-purple/30 bg-ithina-purple/10">
                  <Plus className="size-6 text-ithina-purple/60" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-400">No design configured yet</p>
                  <p className="mt-0.5 text-xs text-slate-600">Click to open Campaign Studio</p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(NlHardwareStep);
