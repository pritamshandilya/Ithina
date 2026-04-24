import { Check } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { HardwareDeviceId } from "@/types/wizard";
import { useHardwareDevices } from "@/hooks/use-wizard";

import type { WizardMode } from "./mode-chooser";
import type { AppliedDesignSelection } from "./campaign-studio-modal";
import type { EslPlaceholders } from "@/features/campaign-studio/esl-svg-renderer";
import type { LayoutVariant } from "@/types/api/campaigns";
import NlHardwareStep from "./nl-hardware-step";
import { defaultPromoApiBase } from "@/features/wizard/lib/preview-layout";

interface ScreenSelectorProps {
  mode: WizardMode;
  stepNumber: number;
  totalSteps: number;
  selectedDevices: HardwareDeviceId[];
  onToggleDevice: (id: HardwareDeviceId) => void;
  activeDevice: HardwareDeviceId | null;
  onSetActiveDevice: (id: HardwareDeviceId | null) => void;
  designConfigured: boolean;
  onSetDesignConfigured: (value: boolean) => void;
  showStudio: boolean;
  onSetShowStudio: (value: boolean) => void;
  selectedVariant: "A" | "B" | "C";
  onSetSelectedVariant: (variant: "A" | "B" | "C") => void;
  sizeByDevice: Record<HardwareDeviceId, string[]>;
  onToggleSize: (id: HardwareDeviceId, size: string) => void;
  onNext: () => void;
  storeNumber?: string;
  /** NL Step 2: POST /campaigns/generate + open real Campaign Studio route. */
  onConfigureDesign?: () => void | Promise<void>;
  isGeneratingLayouts?: boolean;
  /** Last apply from Campaign Studio (template/upload/ai); null uses generated layout only. */
  selectedDesign?: AppliedDesignSelection | null;
  generatedVariants?: LayoutVariant[];
  eslPreviewPlaceholders?: EslPlaceholders;
  imageCacheBuster?: number;
  apiBaseUrl?: string;
  /** When false, bottom primary is omitted (lives in WizardStepHeader). */
  showFooterPrimary?: boolean;
}

const previewStyles: Record<HardwareDeviceId, string> = {
  chroma29: "aspect-[296/128] border-2 border-slate-400 bg-[#F9F9F9] text-black",
  chroma42: "aspect-[400/300] border-2 border-slate-400 bg-[#F9F9F9] text-black",
  lcd: "aspect-video border border-slate-600 bg-gradient-to-br from-blue-900 to-slate-900 text-white",
};

function ScreenSelector({
  mode,
  stepNumber,
  totalSteps,
  selectedDevices,
  onToggleDevice,
  activeDevice,
  onSetActiveDevice,
  designConfigured,
  onSetDesignConfigured: _onSetDesignConfigured,
  showStudio: _showStudio,
  onSetShowStudio,
  selectedVariant,
  onSetSelectedVariant: _onSetSelectedVariant,
  sizeByDevice,
  onToggleSize,
  onNext,
  storeNumber = "4281",
  onConfigureDesign,
  isGeneratingLayouts = false,
  selectedDesign = null,
  generatedVariants = [],
  eslPreviewPlaceholders,
  imageCacheBuster = 0,
  apiBaseUrl = defaultPromoApiBase(),
  showFooterPrimary = true,
}: ScreenSelectorProps) {
  const { data: devices = [] } = useHardwareDevices();

  const isNl = mode === "nl";
  const title = isNl ? "Select Target Screens" : "Select Your Screens";
  const subtitle = isNl
    ? `Choose which display types to generate layouts for. Based on Store #${storeNumber} hardware profile.`
    : "Choose which display types you'll be uploading banners for.";
  const nextLabel = isNl ? "Generate Creative Layouts" : "Next: Upload Banners";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col animate-[fadeIn_0.4s_ease-out]",
        isNl ? "overflow-hidden" : "overflow-y-auto",
      )}
    >
      {/* Step context bar */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b border-ithina-border px-8 py-3",
          isNl ? "bg-ithina-purple/5" : "bg-white/[0.03]",
        )}
      >
        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full",
            isNl ? "bg-ithina-purple" : "border-2 border-slate-500 bg-ithina-bg",
          )}
        >
          <span className={cn("text-[9px] font-bold", isNl ? "text-white" : "text-slate-300")}>
            {stepNumber}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div>
            <span className="text-xs font-semibold text-white">{title}</span>
            <span className="ml-2 text-[10px] text-slate-500">{subtitle}</span>
          </div>
          {isNl ? (
            <p className="mt-1 max-w-2xl text-[10px] leading-snug text-slate-500">
              <span className="font-medium text-slate-400">Design formats:</span> ESL (Chroma e‑ink) and LCD
              Banner — select hardware targets and sizes below, then continue to generate AI layouts.
            </p>
          ) : null}
        </div>
        <span className="rounded-full border border-ithina-border px-2 py-0.5 font-mono text-[9px] text-slate-600">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      {isNl ? (
        <NlHardwareStep
          selectedDevices={selectedDevices}
          onToggleDevice={onToggleDevice}
          activeDevice={activeDevice}
          onSetActiveDevice={onSetActiveDevice}
          sizeByDevice={sizeByDevice}
          onToggleSize={onToggleSize}
          designConfigured={designConfigured}
          onSetShowStudio={onSetShowStudio}
          onConfigureDesign={onConfigureDesign}
          isGeneratingLayouts={isGeneratingLayouts}
          selectedVariant={selectedVariant}
          selectedDesign={selectedDesign}
          generatedVariants={generatedVariants}
          eslPreviewPlaceholders={eslPreviewPlaceholders}
          imageCacheBuster={imageCacheBuster}
          apiBaseUrl={apiBaseUrl}
          onNext={onNext}
          showFooterNext={showFooterPrimary}
        />
      ) : (
      <div className="flex flex-1 flex-col items-center gap-6 p-8">
        <div className="text-center">
          <h3 className="mb-1 text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-3 gap-5">
          {devices.map((device) => {
            const isSelected = selectedDevices.includes(device.id);
            return (
              <div
                key={device.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onToggleDevice(device.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleDevice(device.id);
                  }
                }}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5",
                  isSelected
                    ? "border-ithina-purple bg-ithina-purple/5 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                    : "border-ithina-border bg-ithina-panel hover:border-slate-500",
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "absolute right-4 top-4 flex size-5 items-center justify-center rounded border-2 transition-all",
                    isSelected ? "border-ithina-purple bg-ithina-purple" : "border-slate-500",
                  )}
                >
                  {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                </div>

                {/* Device preview */}
                <div
                  className={cn(
                    "mb-4 flex w-full items-center justify-center rounded font-bold font-mono shadow-inner",
                    previewStyles[device.id],
                  )}
                >
                  <span className="text-[10px]">{device.resolution}</span>
                </div>

                <h4 className="text-sm font-bold text-white">{device.name}</h4>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">{device.resolution} · {device.track}</p>
              </div>
            );
          })}
        </div>

        {showFooterPrimary && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              {selectedDevices.length} screen{selectedDevices.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={onNext}
              disabled={selectedDevices.length === 0}
              className={cn(
                "flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white",
                "shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "bg-ithina-purple hover:bg-ithina-purple-hover",
              )}
            >
              {nextLabel}
              {!isNl && (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      )}

    </div>
  );
}

export default memo(ScreenSelector);
