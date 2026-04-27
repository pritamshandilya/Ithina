import { Check, CloudUpload, Fish, LayoutGrid, Zap } from "lucide-react";

import { AiScanningOverlay } from "@/components/shared/ai-scanning-overlay";
import {
  eslCanvasDimensions,
  eslPreviewAspectClass,
} from "@/features/campaign-studio/esl-preview-aspect";
import EslSvgRenderer, {
  type EslPlaceholders,
} from "@/features/campaign-studio/esl-svg-renderer";
import type { EslLayoutElement } from "@/types/api/campaigns";
import { cn } from "@/lib/utils";

export type StudioTabId = "ai" | "library" | "upload";

export const STUDIO_TABS: { id: StudioTabId; label: string; icon: typeof Zap }[] =
  [
    { id: "ai", label: "AI Generate", icon: Zap },
    { id: "library", label: "Template Library", icon: LayoutGrid },
    { id: "upload", label: "Manual Upload", icon: CloudUpload },
  ];

export interface VariantDef {
  id: "A" | "B" | "C";
  label: string;
  recommended?: boolean;
}

export const ESL_VARIANTS: VariantDef[] = [
  { id: "A", label: "A. PRICE-DOMINANT" },
  { id: "B", label: "B. URGENCY", recommended: true },
  { id: "C", label: "C. BALANCED" },
];

export function EslLivePreview({ variant }: { variant: "A" | "B" | "C" }) {
  return (
    <div className="mx-auto max-w-[108px] overflow-hidden rounded-[5px] border-2 border-slate-400 bg-[#F0F0F0]">
      {variant === "B" ? (
        <>
          <div className="bg-[#cc0000] py-0.5 text-center">
            <span className="text-[6px] font-black uppercase tracking-wide text-white">
              EXPIRING IN 48H
            </span>
          </div>
          <div className="flex min-h-[50px] items-end justify-between px-1 py-1">
            <div>
              <span className="block text-[5.5px] leading-tight text-[#555]">
                Premium
                <br />
                Salmon
              </span>
              <span className="text-[5px] text-[#aaa] line-through">$12.99</span>
            </div>
            <span className="text-[17px] font-black leading-none text-[#111]">
              $10<span className="text-[10px]">.39</span>
            </span>
          </div>
        </>
      ) : variant === "C" ? (
        <div className="flex min-h-[50px] p-0.5">
          <div className="flex w-[38%] items-center justify-center rounded-sm bg-[#dde3ea] text-sm">
            <Fish className="size-3.5 text-slate-600" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="mx-0.5 w-0.5 shrink-0 bg-[#aaa]" />
          <div className="flex min-w-0 flex-1 flex-col justify-between py-px">
            <span className="text-[5px] text-[#555]">Premium Salmon</span>
            <span className="text-[15px] font-black leading-none text-[#111]">
              $10<span className="text-[9px]">.39</span>
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-[#cc0000] py-0.5 text-center">
            <span className="text-[6px] font-black uppercase tracking-wide text-white">
              EXPIRING IN 48H
            </span>
          </div>
          <div className="flex min-h-[50px] flex-col justify-between p-1">
            <span className="text-[6px] font-semibold text-[#555]">
              Premium Salmon Tray
            </span>
            <span className="text-[19px] font-black leading-none text-[#111]">
              $10<span className="text-[11px]">.39</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function LcdLivePreview() {
  return (
    <div className="mx-auto aspect-video max-w-[136px] overflow-hidden rounded-[5px] border-2 border-slate-600">
      <div className="flex h-full flex-col bg-gradient-to-br from-[#1e3a5f] to-[#0f172a]">
        <div className="shrink-0 bg-[#d97706] py-0.5 text-center">
          <span className="text-[6px] font-black tracking-wide text-black">
            FLASH SALE
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end p-1">
          <span className="text-[5.5px] text-slate-400">Premium Salmon Tray</span>
          <span className="text-[15px] font-black leading-none text-white">
            $10<span className="text-[9px]">.39</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function EslVariantCard({
  v,
  selected,
  onSelect,
  previewImageUrl,
  isScanning = false,
  hardwareType,
  elements,
  placeholders,
}: {
  v: VariantDef;
  selected: boolean;
  onSelect: () => void;
  previewImageUrl?: string | null;
  /** AI refine in progress for this card (usually the selected variant) */
  isScanning?: boolean;
  /** ESL hardware target — drives preview aspect (chroma29 296×128, chroma42 400×300) */
  hardwareType?: string | null;
  /** Layout elements from payload_snapshot (preferred over PNG) */
  elements?: EslLayoutElement[] | null;
  /** Product placeholders for {name}/{price}/{was} substitution in SVG renderer */
  placeholders?: EslPlaceholders;
}) {
  const aspectClass = eslPreviewAspectClass(hardwareType);
  const { width: canvasWidth, height: canvasHeight } = eslCanvasDimensions(hardwareType);
  const defaultPlaceholders: EslPlaceholders = { name: "", price: "", was: "", offer_label: "" };
  const resolvedPlaceholders = placeholders ?? defaultPlaceholders;

  /** True when we have actual layout commands to render */
  const hasElements = (elements?.length ?? 0) > 0;

  return (
    <AiScanningOverlay isScanning={isScanning} className="block w-full">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative w-full cursor-pointer overflow-hidden rounded-xl border-2 text-left transition-all hover:-translate-y-0.5",
          selected
            ? "border-ithina-purple shadow-[0_0_16px_rgba(168,85,247,0.2)]"
            : "border-ithina-border hover:border-ithina-purple/50",
        )}
      >
      {v.recommended && (
        <div className="absolute -top-px left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ithina-purple px-2 py-0.5 text-[7px] font-bold text-white">
          AI RECOMMENDED
        </div>
      )}
      <div
        className={cn(
          "flex items-center justify-between bg-ithina-bg/80 px-2 py-1.5",
          v.recommended && "mt-2",
        )}
      >
        <span className="font-mono text-[9px] font-bold text-slate-400">
          {v.label}
        </span>
        {selected && (
          <div className="flex size-3 shrink-0 items-center justify-center rounded-full bg-ithina-purple">
            <Check className="size-2 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Priority 1: SVG renderer from elements (instant, correct aspect, no PNG loading) */}
      {hasElements ? (
        <div className={cn("bg-[#E8ECF0]", aspectClass)}>
          <EslSvgRenderer
            elements={elements!}
            placeholders={resolvedPlaceholders}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        </div>
      ) : previewImageUrl ? (
        /* Priority 2: backend-generated PNG */
        <div className={cn("flex items-center justify-center bg-[#E8ECF0] p-0", aspectClass)}>
          <img
            key={previewImageUrl}
            src={previewImageUrl}
            alt=""
            className="max-h-full max-w-full rounded object-contain"
          />
        </div>
      ) : (
        /* Priority 3: static placeholder sketches */
        <>
          {v.id === "A" && (
            <div className={cn("flex flex-col bg-[#E8ECF0] p-1", aspectClass)}>
              <div className="mb-0.5 bg-[#cc0000] py-0.5 text-center">
                <span className="text-[6px] font-black uppercase tracking-wide text-white">
                  EXPIRING IN 48H
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col justify-end">
                <span className="text-[7px] font-semibold text-[#555]">
                  Premium Salmon Tray
                </span>
                <span className="text-[22px] font-black leading-none text-[#111]">
                  $10<span className="text-[13px]">.39</span>
                </span>
              </div>
            </div>
          )}
          {v.id === "B" && (
            <div className={cn("flex flex-col bg-[#E8ECF0] p-1", aspectClass)}>
              <div className="mb-0.5 bg-[#cc0000] py-0.5 text-center">
                <span className="text-[6px] font-black uppercase tracking-wide text-white">
                  EXPIRING IN 48H
                </span>
              </div>
              <div className="flex min-h-0 flex-1 items-end justify-between px-0.5 pb-0.5">
                <div>
                  <span className="block text-[7px] leading-tight text-[#555]">
                    Premium
                    <br />
                    Salmon Tray
                  </span>
                  <span className="text-[6px] text-[#aaa] line-through">
                    WAS $12.99
                  </span>
                </div>
                <span className="text-[22px] font-black leading-none text-[#111]">
                  $10<span className="text-[13px]">.39</span>
                </span>
              </div>
            </div>
          )}
          {v.id === "C" && (
            <div className={cn("flex bg-[#E8ECF0] p-1", aspectClass)}>
              <div className="flex w-[40%] items-center justify-center rounded-md bg-[#dde3ea]">
                <Fish className="size-5 text-slate-600" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="mx-0.5 w-0.5 shrink-0 bg-[#888]" />
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="rounded-sm bg-[#cc0000] py-0.5 text-center">
                  <span className="text-[5px] font-black text-white">CLEARANCE</span>
                </div>
                <div>
                  <span className="block text-[6px] text-[#555]">
                    Premium Salmon Tray
                  </span>
                  <span className="text-[18px] font-black leading-none text-[#111]">
                    $10<span className="text-[11px]">.39</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </button>
    </AiScanningOverlay>
  );
}

export function LcdVariantCard({
  v,
  selected,
  onSelect,
  previewImageUrl,
  isScanning = false,
}: {
  v: VariantDef;
  selected: boolean;
  onSelect: () => void;
  previewImageUrl?: string | null;
  isScanning?: boolean;
}) {
  return (
    <AiScanningOverlay isScanning={isScanning} className="block w-full">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative w-full cursor-pointer overflow-hidden rounded-xl border-2 text-left transition-all hover:-translate-y-0.5",
          selected
            ? "border-ithina-purple shadow-[0_0_16px_rgba(168,85,247,0.2)]"
            : "border-ithina-border hover:border-ithina-purple/50",
        )}
      >
      {v.recommended && (
        <div className="absolute -top-px left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ithina-purple px-2 py-0.5 text-[7px] font-bold text-white">
          AI RECOMMENDED
        </div>
      )}
      <div className="relative h-[100px] overflow-hidden">
        {previewImageUrl ? (
          <>
            <img
              key={previewImageUrl}
              src={previewImageUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(4,4,14,0.55)_0%,rgba(4,4,14,0.2)_55%,rgba(4,4,14,0.05)_100%)]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(4,4,14,0.94)_0%,rgba(4,4,14,0.65)_50%,rgba(4,4,14,0.08)_100%)]" />
          </>
        )}
        <div
          className={cn(
            "absolute left-2 top-1.5 font-mono text-[8px] uppercase tracking-widest text-slate-400",
            v.recommended && "top-3.5",
          )}
        >
          {v.label}
        </div>
        {selected && (
          <div className="absolute right-2 top-1.5 z-10 flex size-3 items-center justify-center rounded-full bg-ithina-purple">
            <Check className="size-2 text-white" strokeWidth={3} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          {v.id === "B" && (
            <div className="mb-1 inline-flex rounded bg-red-600 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-white">
              EXPIRING IN 48H
            </div>
          )}
          {v.id === "A" && (
            <div className="mb-1 inline-flex rounded border border-white/10 bg-black/50 px-1.5 py-0.5 font-mono text-[7px] tracking-widest text-white">
              CLEARANCE
            </div>
          )}
          {v.id === "C" && (
            <div className="mb-1 inline-flex rounded bg-red-700 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-white">
              CLEARANCE
            </div>
          )}
          <div className="text-[8px] font-semibold leading-tight text-white">
            Premium Salmon Tray
          </div>
          {v.id === "B" && (
            <div className="text-[6px] text-gray-400 line-through">WAS $12.99</div>
          )}
          <div className="text-sm font-black leading-none tracking-tighter text-white">
            $10.39
          </div>
        </div>
        {v.id === "B" && !previewImageUrl && (
          <div className="absolute bottom-2 right-2 text-lg drop-shadow-lg" aria-hidden>
            {"\u{1F363}"}
          </div>
        )}
      </div>
      </button>
    </AiScanningOverlay>
  );
}

export function studioHardwareIsLcd(hardwareType: string): boolean {
  return hardwareType === "lcd";
}
