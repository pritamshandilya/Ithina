import {
  Check,
  CloudUpload,
  Fish,
  LayoutGrid,
  Monitor,
  RectangleHorizontal,
  X,
  Zap,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import AiModifyPanel from "./ai-modify-panel";

import { cn } from "@/lib/utils";

export type StudioTabId = "ai" | "library" | "upload";

export interface CampaignStudioModalProps {
  open: boolean;
  onClose: () => void;
  mode: "esl" | "lcd";
  selectedVariant: "A" | "B" | "C";
  onSelectVariant: (v: "A" | "B" | "C") => void;
  onApply: (selection: AppliedDesignSelection) => void;
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

const STUDIO_TABS: { id: StudioTabId; label: string; icon: typeof Zap }[] = [
  { id: "ai", label: "AI Generate", icon: Zap },
  { id: "library", label: "Template Library", icon: LayoutGrid },
  { id: "upload", label: "Manual Upload", icon: CloudUpload },
];

function EslLivePreview({ variant }: { variant: "A" | "B" | "C" }) {
  return (
    <div className="mx-auto max-w-[108px] overflow-hidden rounded-[5px] border-2 border-slate-400 bg-[#F0F0F0]">
      {variant === "B" ? (
        <>
          <div className="bg-[#cc0000] py-0.5 text-center">
            <span className="text-[6px] font-black uppercase tracking-wide text-white">EXPIRING IN 48H</span>
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
            <span className="text-[6px] font-black uppercase tracking-wide text-white">EXPIRING IN 48H</span>
          </div>
          <div className="flex min-h-[50px] flex-col justify-between p-1">
            <span className="text-[6px] font-semibold text-[#555]">Premium Salmon Tray</span>
            <span className="text-[19px] font-black leading-none text-[#111]">
              $10<span className="text-[11px]">.39</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function LcdLivePreview() {
  return (
    <div className="mx-auto aspect-video max-w-[136px] overflow-hidden rounded-[5px] border-2 border-slate-600">
      <div className="flex h-full flex-col bg-gradient-to-br from-[#1e3a5f] to-[#0f172a]">
        <div className="shrink-0 bg-[#d97706] py-0.5 text-center">
          <span className="text-[6px] font-black tracking-wide text-black">FLASH SALE</span>
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

interface VariantDef {
  id: "A" | "B" | "C";
  label: string;
  recommended?: boolean;
}

const ESL_VARIANTS: VariantDef[] = [
  { id: "A", label: "A. PRICE-DOMINANT" },
  { id: "B", label: "B. URGENCY", recommended: true },
  { id: "C", label: "C. BALANCED" },
];

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


function EslVariantCard({
  v,
  selected,
  onSelect,
}: {
  v: VariantDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-xl border-2 text-left transition-all hover:-translate-y-0.5",
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
        <span className="font-mono text-[9px] font-bold text-slate-400">{v.label}</span>
        {selected && (
          <div className="flex size-3 shrink-0 items-center justify-center rounded-full bg-ithina-purple">
            <Check className="size-2 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      {v.id === "A" && (
        <div className="flex aspect-[4/3] flex-col bg-[#E8ECF0] p-1">
          <div className="mb-0.5 bg-[#cc0000] py-0.5 text-center">
            <span className="text-[6px] font-black uppercase tracking-wide text-white">EXPIRING IN 48H</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-end">
            <span className="text-[7px] font-semibold text-[#555]">Premium Salmon Tray</span>
            <span className="text-[22px] font-black leading-none text-[#111]">
              $10<span className="text-[13px]">.39</span>
            </span>
          </div>
        </div>
      )}
      {v.id === "B" && (
        <div className="flex aspect-[4/3] flex-col bg-[#E8ECF0] p-1">
          <div className="mb-0.5 bg-[#cc0000] py-0.5 text-center">
            <span className="text-[6px] font-black uppercase tracking-wide text-white">EXPIRING IN 48H</span>
          </div>
          <div className="flex min-h-0 flex-1 items-end justify-between px-0.5 pb-0.5">
            <div>
              <span className="block text-[7px] leading-tight text-[#555]">
                Premium
                <br />
                Salmon Tray
              </span>
              <span className="text-[6px] text-[#aaa] line-through">WAS $12.99</span>
            </div>
            <span className="text-[22px] font-black leading-none text-[#111]">
              $10<span className="text-[13px]">.39</span>
            </span>
          </div>
        </div>
      )}
      {v.id === "C" && (
        <div className="flex aspect-[4/3] bg-[#E8ECF0] p-1">
          <div className="flex w-[40%] items-center justify-center rounded-md bg-[#dde3ea]">
            <Fish className="size-5 text-slate-600" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="mx-0.5 w-0.5 shrink-0 bg-[#888]" />
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="rounded-sm bg-[#cc0000] py-0.5 text-center">
              <span className="text-[5px] font-black text-white">CLEARANCE</span>
            </div>
            <div>
              <span className="block text-[6px] text-[#555]">Premium Salmon Tray</span>
              <span className="text-[18px] font-black leading-none text-[#111]">
                $10<span className="text-[11px]">.39</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

function LcdVariantCard({
  v,
  selected,
  onSelect,
}: {
  v: VariantDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-xl border-2 text-left transition-all hover:-translate-y-0.5",
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
        <div
          className="absolute inset-0 bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(4,4,14,0.94)_0%,rgba(4,4,14,0.65)_50%,rgba(4,4,14,0.08)_100%)]" />
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
          <div className="text-[8px] font-semibold leading-tight text-white">Premium Salmon Tray</div>
          {v.id === "B" && <div className="text-[6px] text-gray-400 line-through">WAS $12.99</div>}
          <div className="text-sm font-black leading-none tracking-tighter text-white">$10.39</div>
        </div>
        {v.id === "B" && (
          <div className="absolute bottom-2 right-2 text-lg drop-shadow-lg" aria-hidden>
            🍣
          </div>
        )}
      </div>
    </button>
  );
}

function CampaignStudioModal({
  open,
  onClose,
  mode,
  selectedVariant,
  onSelectVariant,
  onApply,
}: CampaignStudioModalProps) {
  const [studioTab, setStudioTab] = useState<StudioTabId>("ai");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATE_LIBRARY[0].id);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [aiResetKey, setAiResetKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
              {isLcd ? <LcdLivePreview /> : <EslLivePreview variant={selectedVariant} />}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {studioTab === "ai" && (
              <>
                <div className="flex min-h-0 flex-1 overflow-hidden">
                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Select a layout variant
                    </p>
                    <div className={cn(isLcd ? "flex flex-col gap-3" : "grid grid-cols-3 gap-4")}>
                      {ESL_VARIANTS.map((v) =>
                        isLcd ? (
                          <LcdVariantCard
                            key={v.id}
                            v={v}
                            selected={selectedVariant === v.id}
                            onSelect={() => onSelectVariant(v.id)}
                          />
                        ) : (
                          <EslVariantCard
                            key={v.id}
                            v={v}
                            selected={selectedVariant === v.id}
                            onSelect={() => onSelectVariant(v.id)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                  <AiModifyPanel resetKey={aiResetKey} />
                </div>
                <div className="flex shrink-0 items-center justify-between border-t border-ithina-border bg-ithina-bg/40 px-5 py-3">
                  <p className="text-xs text-slate-500">
                    Variant <span className="font-semibold text-white">{selectedVariant}</span> selected
                  </p>
                  <button
                    type="button"
                    onClick={() => onApply({ source: "ai" })}
                    className="flex items-center gap-2 rounded-xl bg-ithina-purple px-5 py-2 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover"
                  >
                    Apply to Campaign
                    <Check className="size-4" strokeWidth={2} />
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
