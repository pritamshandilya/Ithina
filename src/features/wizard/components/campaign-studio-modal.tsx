import { Check, CloudUpload, Loader2, Monitor, RectangleHorizontal, Sparkles, X } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import AiModifyPanel from "./ai-modify-panel";

import {
  ESL_VARIANTS,
  EslLivePreview,
  EslVariantCard,
  LcdLivePreview,
  LcdVariantCard,
  STUDIO_TABS,
  type StudioTabId,
} from "@/features/campaign-studio/campaign-studio-shared-ui";
import type { EslPlaceholders } from "@/features/campaign-studio/esl-svg-renderer";
import type { LayoutVariant } from "@/types/api/campaigns";
import { cn } from "@/lib/utils";

export type { StudioTabId };

export interface CampaignStudioModalProps {
  open: boolean;
  onClose: () => void;
  mode: "esl" | "lcd";
  selectedVariant: "A" | "B" | "C";
  onSelectVariant: (v: "A" | "B" | "C") => void;
  onApply: (selection: AppliedDesignSelection) => void;
  /** When true an "AI is generating…" overlay fills the modal body */
  isGenerating?: boolean;
  /** Layout rows from timeline events (merged client-side; may include image_url and/or elements) */
  generatedVariants?: LayoutVariant[];
  /** Called when user clicks "Apply to Campaign" in the live AI tab (e.g. save variant on draft, close modal). */
  onSubmitForApproval?: (variantId: string) => void;
  isSubmitting?: boolean;
  /** Live AI Modify wiring */
  isRefining?: boolean;
  onSendChat?: (message: string) => void;
  /** AI reply text to display after each layout_refined event */
  lastAiResponse?: string;
  /** Bumped on each refinement to cache-bust identical image URLs */
  imageCacheBuster?: number;
  apiBaseUrl?: string;
  /** Product placeholders for ESL SVG renderer ({name}/{price}/{was} substitution) */
  placeholders?: EslPlaceholders;
}

export type AppliedDesignSelection = {
  source: "ai" | "template" | "upload";
  templateId?: string;
  templateName?: string;
  templateHeaderColor?: string;
  templateHeaderText?: string;
  templateProductLine?: string;
  uploadedFileName?: string;
};

type TemplateItem = {
  id: string;
  name: string;
  headerColor: string;
  headerText: string;
  productLine: string;
  category?: string;
};

const TEMPLATE_LIBRARY: TemplateItem[] = [
  {
    id: "tpl_clearance",
    name: "Clearance Standard",
    headerColor: "#111111",
    headerText: "CLEARANCE",
    productLine: "Perishables",
    category: "All Category",
  },
  {
    id: "tpl_expiring",
    name: "Expiring 48H",
    headerColor: "#cc0000",
    headerText: "EXPIRING IN 48H",
    productLine: "Fresh",
    category: "Fresh",
  },
  {
    id: "tpl_flash",
    name: "Flash Sale",
    headerColor: "#b91c1c",
    headerText: "FLASH SALE",
    productLine: "All Categories",
    category: "All Category",
  },
  {
    id: "tpl_newarrival",
    name: "New Arrival",
    headerColor: "#065f46",
    headerText: "NEW ARRIVAL",
    productLine: "All Categories",
    category: "All Category",
  },
  {
    id: "tpl_bogo",
    name: "BOGO Special",
    headerColor: "#1d4ed8",
    headerText: "BUY ONE GET ONE",
    productLine: "Snacks & Drinks",
    category: "Snacks & Drink",
  },
  {
    id: "tpl_members",
    name: "Members Only",
    headerColor: "#7c3aed",
    headerText: "MEMBERS ONLY",
    productLine: "Premium",
    category: "Premium",
  },
];

const API_BASE =
  (import.meta.env.VITE_PROMO_API_URL as string | undefined) ??
  "https://backend.promo.creativebits.tech";

function CampaignStudioModal({
  open,
  onClose,
  mode,
  selectedVariant,
  onSelectVariant,
  onApply,
  isGenerating = false,
  generatedVariants,
  onSubmitForApproval,
  isSubmitting = false,
  isRefining = false,
  onSendChat,
  lastAiResponse,
  imageCacheBuster = 0,
  apiBaseUrl = API_BASE,
  placeholders,
}: CampaignStudioModalProps) {
  const [studioTab, setStudioTab] = useState<StudioTabId>("ai");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATE_LIBRARY[0].id);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [aiResetKey, setAiResetKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasLiveLayouts = Boolean(
    generatedVariants?.some(
      (v) => v.image_url != null && String(v.image_url).trim() !== "",
    ),
  );

  useEffect(() => {
    if (open) {
      setStudioTab("ai");
      setSelectedTemplateId(TEMPLATE_LIBRARY[0].id);
      setUploadedFileName("");
      setAiResetKey((k) => k + 1);
    }
  }, [open]);

  if (!open) return null;

  const isLcd = mode === "lcd";

  /** Get the image URL for a given variant letter + current hardware. */
  function livePreviewUrl(variantLetter: string): string | null {
    if (!generatedVariants?.length) return null;
    const match =
      generatedVariants.find(
        (v) =>
          v.variant_id === variantLetter &&
          (isLcd ? v.hardware_type === "lcd" : v.hardware_type !== "lcd"),
      ) ?? generatedVariants.find((v) => v.variant_id === variantLetter);
    const path = match?.image_url;
    if (path == null || String(path).trim() === "") return null;
    const s = String(path).trim();
    const base = s.startsWith("http://") || s.startsWith("https://")
      ? s
      : `${apiBaseUrl}${s.startsWith("/") ? s : `/${s}`}`;
    // Cache-bust: backend regenerates images at the same path after refinement
    return imageCacheBuster > 0 ? `${base}?v=${imageCacheBuster}` : base;
  }

  const selectedPreviewUrl = livePreviewUrl(selectedVariant);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="flex h-[92vh] w-[96vw] max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-ithina-bg/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                isLcd ? "bg-amber-400/15 text-amber-400" : "bg-ithina-purple/15 text-ithina-purple",
              )}
            >
              {isLcd ? (
                <RectangleHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
              ) : (
                <Monitor className="size-4" strokeWidth={1.5} aria-hidden />
              )}
            </div>
            <div>
              <p className="text-base font-bold text-white">Campaign Studio</p>
              <p className="text-[10px] text-slate-500">
                {isLcd ? "LCD Banner · full colour design" : "ESL · e-ink design"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ithina-border p-2 text-slate-500 transition-colors hover:text-white"
            aria-label="Close studio"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex w-56 shrink-0 flex-col border-r border-ithina-border bg-ithina-bg/30">
            <div className="flex-1 space-y-1 p-3">
              <p className="px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Design Method
              </p>
              {STUDIO_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = studioTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStudioTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                      active
                        ? "border-ithina-purple/30 bg-ithina-purple/15 font-semibold text-white"
                        : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-ithina-border/60 p-4">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-slate-600">Live Preview</p>
              {selectedPreviewUrl ? (
                <div
                  className={cn(
                    "mx-auto overflow-hidden rounded-[5px] border-2 bg-black/20",
                    isLcd
                      ? "aspect-video max-w-[136px] border-slate-600"
                      : "max-w-[108px] border-slate-400",
                  )}
                >
                  <img key={selectedPreviewUrl} src={selectedPreviewUrl} alt="" className="size-full object-cover" />
                </div>
              ) : isLcd ? (
                <LcdLivePreview />
              ) : (
                <EslLivePreview variant={selectedVariant} />
              )}
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* ── Generating overlay ── */}
            {isGenerating && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-ithina-sidebar/95 backdrop-blur-sm">
                <div className="relative flex size-20 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10">
                  <Sparkles className="size-8 text-ithina-purple" />
                  <Loader2 className="absolute -inset-2 size-24 animate-spin text-ithina-purple/30" />
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-bold text-white">
                    AI is designing your layouts…
                  </h3>
                  <p className="text-sm text-slate-400">
                    This usually takes 15–30 seconds.
                  </p>
                </div>
                <div className="h-1 w-48 overflow-hidden rounded-full bg-ithina-border">
                  <div className="h-full animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full bg-ithina-purple" />
                </div>
              </div>
            )}

            {studioTab === "ai" && (
              <>
                <div className="flex min-h-0 flex-1 overflow-hidden">
                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Select a layout variant
                    </p>
                    <div className={cn(isLcd ? "flex flex-col gap-3" : "grid grid-cols-3 gap-4")}>
                      {ESL_VARIANTS.map((v) => {
                        const variantLayout = !isLcd
                          ? (generatedVariants?.find(
                              (gv) =>
                                gv.variant_id === v.id &&
                                gv.hardware_type !== "lcd",
                            ) ?? generatedVariants?.find((gv) => gv.variant_id === v.id))
                          : undefined;
                        return isLcd ? (
                          <LcdVariantCard
                            key={v.id}
                            v={v}
                            selected={selectedVariant === v.id}
                            onSelect={() => onSelectVariant(v.id)}
                            previewImageUrl={livePreviewUrl(v.id)}
                            isScanning={isRefining && selectedVariant === v.id}
                          />
                        ) : (
                          <EslVariantCard
                            key={v.id}
                            v={v}
                            selected={selectedVariant === v.id}
                            onSelect={() => onSelectVariant(v.id)}
                            previewImageUrl={livePreviewUrl(v.id)}
                            isScanning={isRefining && selectedVariant === v.id}
                            hardwareType={variantLayout?.hardware_type ?? "chroma29"}
                            elements={variantLayout?.elements ?? null}
                            placeholders={placeholders}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <AiModifyPanel
                    resetKey={aiResetKey}
                    live={
                      onSendChat
                        ? {
                            disabled: !hasLiveLayouts || isSubmitting,
                            isRefining,
                            onSend: onSendChat,
                            lastAiResponse,
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="flex shrink-0 items-center justify-between border-t border-ithina-border bg-ithina-bg/40 px-5 py-3">
                  <p className="text-xs text-slate-500">
                    Variant <span className="font-semibold text-white">{selectedVariant}</span> selected
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSubmitForApproval) {
                        onSubmitForApproval(selectedVariant);
                      } else {
                        onApply({ source: "ai" });
                      }
                    }}
                    disabled={isSubmitting || (!!onSubmitForApproval && !hasLiveLayouts)}
                    className="flex items-center gap-2 rounded-xl bg-ithina-purple px-5 py-2 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" strokeWidth={2} />
                    )}
                    Apply to Campaign
                  </button>
                </div>
              </>
            )}

            {studioTab === "library" && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Choose a saved template
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                  {TEMPLATE_LIBRARY.map((tpl) => {
                    const selected = tpl.id === selectedTemplateId;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={cn(
                          "relative overflow-hidden rounded-xl border text-left transition-all",
                          selected
                            ? "border-ithina-purple bg-ithina-purple/10 shadow-[0_0_0_1px_rgba(168,85,247,0.5)]"
                            : "border-ithina-border bg-ithina-panel hover:border-slate-500",
                        )}
                      >
                        {isLcd ? (
                          <div className="relative h-[170px] overflow-hidden rounded-t-lg border-b border-ithina-border">
                            <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80)] bg-cover bg-center" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#04040e]/95 via-[#04040e]/55 to-[#04040e]/20" />
                            <div
                              className="absolute left-2 top-2 inline-flex rounded px-1.5 py-0.5 text-[7px] font-black tracking-widest text-white"
                              style={{ background: tpl.headerColor }}
                            >
                              {tpl.headerText}
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-[6px] text-slate-300">{tpl.category ?? "All Category"}</p>
                              <div className="text-[30px] font-black leading-none tracking-tighter text-white">
                                $XX<span className="text-[16px]">.xx</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-t-lg border-b border-ithina-border bg-[#E5E7EB]">
                            <div
                              className="flex h-6 items-center justify-center text-[7px] font-bold tracking-widest text-white"
                              style={{ background: tpl.headerColor }}
                            >
                              {tpl.headerText}
                            </div>
                            <div className="h-[170px] bg-[#D1D5DB] p-1.5">
                              <p className="text-[6px] text-black/35">{tpl.productLine}</p>
                              <div className="mt-[120px] text-[34px] font-black leading-none tracking-tighter text-black">
                                $XX<span className="text-[18px]">.xx</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between bg-ithina-bg px-2 py-1.5">
                          <p className="truncate text-[10px] text-white">{tpl.name}</p>
                          {selected && (
                            <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-ithina-purple text-white">
                              <Check className="size-2.5" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                </div>
                <div className="flex shrink-0 items-center justify-between border-t border-ithina-border bg-ithina-bg/50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    {TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId)?.name ?? "No template selected"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const selectedTemplate = TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId);
                      onApply({
                        source: "template",
                        templateId: selectedTemplate?.id,
                        templateName: selectedTemplate?.name,
                        templateHeaderColor: selectedTemplate?.headerColor,
                        templateHeaderText: selectedTemplate?.headerText,
                        templateProductLine: selectedTemplate?.productLine,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ithina-purple px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-ithina-purple-hover"
                  >
                    Apply Template
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {studioTab === "upload" && (
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setUploadedFileName(file?.name ?? "");
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all hover:border-ithina-purple/40 hover:bg-ithina-purple/5",
                    uploadedFileName ? "border-emerald-500/40 bg-emerald-500/5" : "border-ithina-border/60",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full",
                      uploadedFileName ? "bg-emerald-400/10" : "bg-ithina-purple/10",
                    )}
                  >
                    <CloudUpload
                      className={cn("size-6", uploadedFileName ? "text-emerald-400" : "text-ithina-purple")}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="text-center">
                    <p className={cn("text-sm font-semibold", uploadedFileName ? "text-emerald-400" : "text-slate-300")}>
                      {uploadedFileName || "Upload your design file"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {isLcd ? "PNG / JPG · full colour RGB" : "PNG / BMP · 3-colour e-ink"}
                    </p>
                  </div>
                </button>
                {uploadedFileName && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onApply({ source: "upload", uploadedFileName })}
                      className="flex items-center gap-2 rounded-xl bg-ithina-purple px-5 py-2 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover"
                    >
                      Apply Upload
                      <Check className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CampaignStudioModal);
