import { AlignLeft, Check, CheckCircle, Code, DollarSign, LayoutTemplate, Pencil } from "lucide-react";
import { memo, useEffect } from "react";

import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setEink29PriceText,
  setEink29ProductText,
  setEinkHeaderBg,
  setEinkHeaderClass,
  setEinkHeaderText,
  setEinkProductFontSize,
  setEinkProductColor,
  setEinkPriceFontSize,
  setEinkPriceColor,
  setEinkLayout,
  setEinkPriceText,
  setEinkProductText,
  setSidebarTab,
  setEditFields,
} from "@/store/slices/studio-slice";
import type { StudioEditFields } from "@/store/slices/studio-slice";
import type { ComplianceCheck, HardwareDeviceId, RendererSpec } from "@/types/studio";

// ── ESL restricted palette ────────────────────────────────────────────────
const ESL_PALETTE = [
  { hex: "#000000", cls: "bg-black",   label: "Black" },
  { hex: "#FFFFFF", cls: "bg-white",   label: "White" },
  { hex: "#FF0000", cls: "bg-red-600", label: "Red"   },
];

const LAYOUT_OPTIONS = [
  { id: "price-right",    label: "Name · Price" },
  { id: "price-center",   label: "Centred" },
  { id: "stacked",        label: "Stacked" },
  { id: "price-dominant", label: "Price Focus" },
];

interface ComplianceSidebarProps {
  checks: ComplianceCheck[];
  spec: RendererSpec;
  hw: HardwareDeviceId;
  isScanning: boolean;
  onSendToApproval: () => void;
}

function ComplianceSidebar({ checks, spec, hw, isScanning, onSendToApproval }: ComplianceSidebarProps) {
  const dispatch = useAppDispatch();
  const { sidebarTab: tab, editFields: edit } = useAppSelector((s) => s.studio);
  const visibleChecks = checks.filter((c) => !c.eslOnly || hw !== "lcd");

  const syncPreview = (next: StudioEditFields) => {
    dispatch(setEinkHeaderText(next.headerText));
    dispatch(setEinkHeaderBg(next.headerHex));

    if (hw === "chroma42") {
      const cls =
        next.headerFontSize <= 16
          ? "h-12 text-xl"
          : next.headerFontSize <= 26
          ? "h-16 text-3xl"
          : next.headerFontSize <= 36
          ? "h-20 text-4xl"
          : "h-24 text-5xl";
      dispatch(setEinkHeaderClass(cls));
      dispatch(setEinkProductText(next.productName));
      dispatch(setEinkPriceText(next.price));
      dispatch(setEinkProductFontSize(next.nameFontSize));
      dispatch(setEinkProductColor(next.nameColor));
      dispatch(setEinkPriceFontSize(next.priceFontSize));
      dispatch(setEinkPriceColor(next.priceColor));
    }

    if (hw === "chroma29") {
      dispatch(setEink29ProductText(next.productName));
      dispatch(setEink29PriceText(next.price));
    }

    if (hw !== "lcd") {
      dispatch(setEinkLayout(next.layout));
    }
  };

  const setE = <K extends keyof StudioEditFields>(key: K, value: StudioEditFields[K]) => {
    const next = { ...edit, [key]: value };
    dispatch(setEditFields({ [key]: value }));
    syncPreview(next);
  };

  // keep preview in sync on first render / when hardware changes
  useEffect(() => {
    syncPreview(edit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hw]);

  return (
    <aside className="z-10 flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">

      {/* ── Tab bar ── */}
      <div className="flex shrink-0 border-b border-ithina-border">
        <button
          onClick={() => dispatch(setSidebarTab("compliance"))}
          className={cn(
            "-mb-px flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3.5 text-[10px] font-semibold uppercase tracking-widest transition-all",
            tab === "compliance" ? "border-ithina-purple text-white" : "border-transparent text-slate-500 hover:text-slate-300",
          )}
        >
          <CheckCircle className="size-3.5" />
          Compliance
        </button>
        <button
          onClick={() => dispatch(setSidebarTab("edit"))}
          className={cn(
            "-mb-px flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3.5 text-[10px] font-semibold uppercase tracking-widest transition-all",
            tab === "edit" ? "border-ithina-purple text-white" : "border-transparent text-slate-500 hover:text-slate-300",
          )}
        >
          <Pencil className="size-3.5" />
          Edit Layout
        </button>
      </div>

      {/* ── COMPLIANCE TAB ── */}
      {tab === "compliance" && (
        <>
          <div className="border-b border-ithina-border bg-white/[0.01] p-5">
            <div className={cn("space-y-3 transition-opacity duration-500", isScanning ? "opacity-40" : "opacity-100")}>
              {visibleChecks.map((check) => (
                <div key={check.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{check.label}</span>
                  <span className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                    <Check className="size-3" strokeWidth={3} /> PASS
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-300">
              <Code className="size-4 text-ithina-muted" />
              Renderer Specification
            </h3>

            {hw !== "lcd" ? (
              <div className="space-y-4 rounded-xl border border-ithina-border bg-ithina-bg p-4 shadow-inner">
                <SpecRow label="Target Display" value={spec.targetDisplay} />
                <SpecRow label="DCS Payload Format" value={spec.payloadFormat} />
                <div>
                  <span className="mb-2 block text-[10px] uppercase tracking-widest text-slate-500">Restricted Palette</span>
                  <div className="flex gap-2">
                    {spec.palette?.map((color) => (
                      <div
                        key={color}
                        className={cn(
                          "size-5 rounded border",
                          color === "#000000" && "border-slate-600",
                          color === "#FFFFFF" && "border-slate-400",
                          color === "#FF0000" && "border-red-600 shadow-[0_0_8px_rgba(255,0,0,0.4)]",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-ithina-border bg-ithina-bg p-4 shadow-inner">
                <SpecRow label="Target Display" value={spec.targetDisplay} />
                <SpecRow label="Resolution" value={spec.resolution ?? ""} />
                <SpecRow label="Color Space" value={spec.colorSpace ?? ""} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── EDIT LAYOUT TAB ── */}
      {tab === "edit" && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0 p-4">

            {/* ESL palette notice */}
            {hw !== "lcd" && (
              <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2.5">
                <svg className="mt-0.5 size-3.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-amber-400">ESL 3-Colour Palette</p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">Chroma displays are restricted to Black, White and Red only.</p>
                </div>
              </div>
            )}

            {/* Header Zone */}
            <div className="rounded-2xl rounded-tl-sm border border-ithina-purple/20 bg-ithina-purple/10 p-4">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ithina-purple">
                <AlignLeft className="size-3" /> Header Zone
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[10px] text-slate-400">Banner Text</label>
                  <input
                    value={edit.headerText}
                    onChange={(e) => setE("headerText", e.target.value)}
                    className="w-full rounded-lg border border-ithina-purple/30 bg-ithina-bg/80 px-3 py-2 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
                  />
                </div>
                {hw !== "lcd" ? (
                  <div>
                    <label className="mb-1.5 block text-[10px] text-slate-400">Background Colour</label>
                    <div className="flex gap-3">
                      {ESL_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          title={c.label}
                          onClick={() => setE("headerHex", c.hex)}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div
                            className={cn(
                              "size-9 rounded-xl ring-1 transition-all group-hover:scale-110",
                              edit.headerHex === c.hex
                                ? "ring-ithina-purple ring-offset-2 ring-offset-ithina-panel shadow-[0_0_14px_rgba(168,85,247,0.5)] scale-110"
                                : "ring-slate-600",
                            )}
                            style={{ background: c.hex }}
                          />
                          <span
                            className={cn(
                              "font-mono text-[8px]",
                              edit.headerHex === c.hex ? "text-ithina-purple" : "text-slate-600",
                            )}
                          >
                            {c.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-[10px] text-slate-400">Background Colour</label>
                    <input type="color" value={edit.headerHex} onChange={(e) => setE("headerHex", e.target.value)} className="h-9 w-full cursor-pointer rounded-lg border border-ithina-border bg-transparent" />
                  </div>
                )}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[10px] text-slate-400">Font Size</label>
                    <span className="font-mono text-[10px] text-ithina-purple">{edit.headerFontSize}px</span>
                  </div>
                  <input type="range" min={8} max={52} step={2} value={edit.headerFontSize} onChange={(e) => setE("headerFontSize", Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
              </div>
            </div>

            {/* Product Zone */}
            <div className="ml-4 mt-3 rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                <Code className="size-3" /> Product Zone
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[10px] text-slate-400">Product Name</label>
                  <input
                    value={edit.productName}
                    onChange={(e) => setE("productName", e.target.value)}
                    className="w-full rounded-lg border border-ithina-border bg-ithina-bg/80 px-3 py-2 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[10px] text-slate-400">Font Size</label>
                    <span className="font-mono text-[10px] text-slate-400">{edit.nameFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={28}
                    step={1}
                    value={edit.nameFontSize}
                    onChange={(e) => setE("nameFontSize", Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] text-slate-400">Text Colour</label>
                  {hw !== "lcd" ? (
                    <div className="flex items-end gap-3">
                      {ESL_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          title={c.label}
                          onClick={() => setE("nameColor", c.hex)}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div
                            className={cn(
                              "h-10 w-10 rounded-xl ring-1 transition-all group-hover:scale-110",
                              edit.nameColor === c.hex
                                ? "ring-ithina-purple ring-offset-2 ring-offset-ithina-panel shadow-[0_0_14px_rgba(168,85,247,0.5)] scale-110"
                                : "ring-slate-600",
                            )}
                            style={{ background: c.hex }}
                          />
                          <span
                            className={cn(
                              "font-mono text-[8px]",
                              edit.nameColor === c.hex ? "text-ithina-purple" : "text-slate-600",
                            )}
                          >
                            {c.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="color"
                      value={edit.nameColor}
                      onChange={(e) => setE("nameColor", e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-lg border border-ithina-border bg-transparent"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Price Zone */}
            <div className="mt-3 rounded-2xl rounded-tl-sm border border-ithina-purple/20 bg-ithina-purple/10 p-4">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ithina-purple">
                <DollarSign className="size-3" /> Price Zone
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[10px] text-slate-400">Price</label>
                  <input
                    value={edit.price}
                    onChange={(e) => setE("price", e.target.value)}
                    className="w-full rounded-lg border border-ithina-purple/30 bg-ithina-bg/80 px-3 py-2 text-xs text-white transition-colors focus:border-ithina-purple focus:outline-none"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[10px] text-slate-400">Font Size</label>
                    <span className="font-mono text-[10px] text-ithina-purple">{edit.priceFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={72}
                    step={2}
                    value={edit.priceFontSize}
                    onChange={(e) => setE("priceFontSize", Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] text-slate-400">Price Colour</label>
                  {hw !== "lcd" ? (
                    <div className="flex items-end gap-3">
                      {ESL_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          title={c.label}
                          onClick={() => setE("priceColor", c.hex)}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div
                            className={cn(
                              "h-10 w-10 rounded-xl ring-1 transition-all group-hover:scale-110",
                              edit.priceColor === c.hex
                                ? "ring-ithina-purple ring-offset-2 ring-offset-ithina-panel shadow-[0_0_14px_rgba(168,85,247,0.5)] scale-110"
                                : "ring-slate-600",
                            )}
                            style={{ background: c.hex }}
                          />
                          <span
                            className={cn(
                              "font-mono text-[8px]",
                              edit.priceColor === c.hex ? "text-ithina-purple" : "text-slate-600",
                            )}
                          >
                            {c.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="color"
                      value={edit.priceColor}
                      onChange={(e) => setE("priceColor", e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-lg border border-ithina-border bg-transparent"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="studioShowWas" checked={edit.showWas} onChange={(e) => setE("showWas", e.target.checked)} className="accent-purple-500" />
                  <label htmlFor="studioShowWas" className="cursor-pointer text-[10px] text-slate-400">Show "Was" price</label>
                  {edit.showWas && (
                    <input
                      value={edit.wasPrice}
                      onChange={(e) => setE("wasPrice", e.target.value)}
                      placeholder="$12.99"
                      className="ml-1 flex-1 rounded-lg border border-ithina-border bg-ithina-bg/80 px-2 py-1 text-[10px] text-white focus:border-ithina-purple focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* LCD background overlay colour */}
            {hw === "lcd" && (
              <div className="ml-4 mt-3 rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Background Overlay
                </p>
                <input
                  type="color"
                  value={edit.lcdBg}
                  onChange={(e) => setE("lcdBg", e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-ithina-border bg-transparent"
                />
              </div>
            )}

            {/* Layout Zones (ESL only) */}
            {hw !== "lcd" && (
              <div className="ml-4 mt-3 rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  <LayoutTemplate className="size-3" /> Layout Zones
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_OPTIONS.map((lo) => (
                    <button
                      key={lo.id}
                      onClick={() => setE("layout", lo.id)}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-[10px] font-medium transition-all",
                        edit.layout === lo.id
                          ? "border-ithina-purple bg-ithina-purple/10 text-ithina-purple"
                          : "border-ithina-border text-slate-400 hover:border-slate-500 hover:text-white",
                      )}
                    >
                      {lo.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Action ── */}
      <div className="border-t border-ithina-border bg-ithina-bg/50 p-4">
        <button
          onClick={onSendToApproval}
          aria-label="Send design to approval queue"
          className="w-full rounded-lg bg-ithina-purple py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all hover:bg-ithina-purple-hover"
        >
          Send to Approval
        </button>
      </div>
    </aside>
  );
}

export default memo(ComplianceSidebar);

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}
