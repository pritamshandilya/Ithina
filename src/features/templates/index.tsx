import { AlertTriangle, AlignLeft, Check, Code, DollarSign, LayoutTemplate, Pencil, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { activateCampaign } from "@/store/slices/campaign-slice";
import {
  closeTmEdit,
  openTmEdit,
  setTmActiveHw,
  setTmEditField,
  setTmSearch,
} from "@/store/slices/templates-slice";
import type { TmEditFields } from "@/store/slices/templates-slice";
import type { TemplateItem } from "@/types/templates";
import { useTemplateHwFilters, useTemplateList, useTemplateTags } from "@/hooks/use-templates";

// ── ESL restricted palette ────────────────────────────────────────────────
const ESL_PALETTE = [
  { hex: "#000000", cls: "bg-black", label: "Black" },
  { hex: "#FFFFFF", cls: "bg-white", label: "White" },
  { hex: "#FF0000", cls: "bg-red-600", label: "Red" },
];

const LAYOUT_OPTIONS = [
  { id: "price-right",    label: "Name · Price" },
  { id: "price-center",   label: "Centred" },
  { id: "stacked",        label: "Stacked" },
  { id: "price-dominant", label: "Price Focus" },
];

export default function TemplateManager() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: templates = [], isLoading: listLoading, isError } = useTemplateList();
  const { data: hwFilters = [], isLoading: filtersLoading } = useTemplateHwFilters();
  const { data: allTags = [], isLoading: tagsLoading } = useTemplateTags();

  const isLoading = listLoading || filtersLoading || tagsLoading;

  // ── Persisted state (Redux) ────────────────────────────────────────────
  const { search, activeHw, editTemplate, editFields } = useAppSelector((s) => s.templates);

  // ── Transient state (local — OK to reset on navigate) ─────────────────
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHw, setNewHw] = useState("chroma42");
  const [newTags, setNewTags] = useState<string[]>([]);

  const openEdit = (t: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openTmEdit({
      template: {
        id: t.id,
        name: t.name,
        hw: t.hw,
        hwLabel: t.hwLabel,
        headerText: t.headerText,
        headerBg: t.headerBg,
        productLine: t.productLine ?? null,
      },
      fields: {
        headerText: t.headerText,
        headerBg: t.headerBg,
        headerHex: ESL_PALETTE.find((p) => t.headerBg.includes("red"))?.hex ?? "#FF0000",
        headerFontSize: 24,
        productName: t.productLine ?? "Product Name",
        nameFontSize: 14,
        nameColor: "#000000",
        price: "$10.99",
        priceFontSize: 48,
        priceColor: "#000000",
        showWas: false,
        wasPrice: "",
        lcdBg: "#1e293b",
        layout: "price-right",
      },
    }));
  };

  const setEf = <K extends keyof TmEditFields>(key: K, value: TmEditFields[K]) => {
    dispatch(setTmEditField({ key, value }));
  };

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const hw = activeHw === "all" || t.hw === activeHw;
      const s = !search || t.name.toLowerCase().includes(search.toLowerCase());
      return hw && s;
    });
  }, [templates, activeHw, search]);

  const toggleTag = (tag: string) => {
    setNewTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const useTemplate = (t: TemplateItem) => {
    dispatch(activateCampaign(t.name));
    navigate({ to: "/studio" });
    setPreviewTemplate(null);
  };

  const pageHeader = (
    <PageHeader
      breadcrumbs={[{ label: "Promotions Assistant" }, { label: "Template Manager", isActive: true }]}
      title="Manage Layouts & Styles"
      actions={
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all hover:bg-ithina-purple-hover"
        >
          <Plus className="size-4" />
          New Template
        </button>
      }
    />
  );

  if (isError) {
    return (
      <>
        {pageHeader}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <AlertTriangle className="size-10 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Failed to load templates</h3>
          <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {pageHeader}

      {isLoading ? (
        <LoadingSpinner label="Loading templates..." className="flex-1" />
      ) : (
        <div className="relative flex flex-1 flex-col gap-5 overflow-hidden p-6 animate-[fadeIn_0.4s_ease-out] lg:p-8">
          <div className="flex shrink-0 items-center gap-2">
            {hwFilters.map((hw) => (
              <button
                key={hw.id}
                onClick={() => dispatch(setTmActiveHw(hw.id))}
                className={cn(
                  "rounded-xl border px-4 py-2 text-xs font-medium transition-all",
                  activeHw === hw.id
                    ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                    : "border-ithina-border bg-ithina-panel text-slate-400 hover:text-white",
                )}
              >
                {hw.label}
              </button>
            ))}
            <div className="relative ml-auto max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => dispatch(setTmSearch(e.target.value))}
                type="text"
                placeholder="Search templates..."
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-2 pl-9 pr-3 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
                aria-label="Search templates"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-5 pb-4 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setPreviewTemplate(t)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-sm transition-all hover:border-ithina-purple/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]"
                >
                  <TemplateThumbnail template={t} />
                  <div className="p-4">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <span className="mt-0.5 shrink-0 font-mono text-[9px] text-slate-500">{t.hwLabel}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {t.tags.map((tag) => (
                        <span key={tag} className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-slate-400">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-ithina-border pt-3">
                      <span className="text-[10px] text-slate-500">Used {t.usedCount}×</span>
                      <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        {t.isDefault ? (
                          <span className="rounded border border-ithina-purple/40 bg-ithina-purple/10 px-2 py-1 text-[9px] font-medium text-ithina-purple">✓ Default</span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); }} className="rounded border border-white/10 px-2 py-1 text-[9px] font-medium text-slate-400 transition-all hover:border-ithina-purple/30 hover:text-ithina-purple">Set Default</button>
                        )}
                        <button onClick={(e) => openEdit(t, e)} className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[9px] font-medium text-slate-400 transition-all hover:border-ithina-purple/30 hover:text-ithina-purple">
                          <Pencil className="size-2.5" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {previewTemplate && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-ithina-bg/80 p-8 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}>
              <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-ithina-border px-6 py-5">
                  <div>
                    <h3 className="text-base font-bold text-white">{previewTemplate.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">{previewTemplate.hwLabel} · {previewTemplate.tags.join(" · ")}</p>
                  </div>
                  <button onClick={() => setPreviewTemplate(null)} className="p-1 text-slate-400 transition-colors hover:text-white">
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-5 p-6">
                  <div className="flex w-full items-center justify-center rounded-xl bg-[#E2E8F0] p-6">
                    <TemplatePreviewLarge template={previewTemplate} />
                  </div>
                  <div className="flex w-full gap-3">
                    <button onClick={() => useTemplate(previewTemplate)} className="flex-1 rounded-lg bg-ithina-purple py-2.5 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover">
                      Use in Campaign Studio
                    </button>
                    <button onClick={() => setPreviewTemplate(null)} className="rounded-lg border border-ithina-border px-5 py-2.5 text-sm text-slate-300 transition-colors hover:text-white">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EDIT TEMPLATE MODAL ── */}
          {editTemplate && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-md overflow-y-auto"
              onClick={() => dispatch(closeTmEdit())}
            >
              <div
                className="flex w-full max-w-[820px] max-h-[90vh] overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left: live preview */}
                <div className="flex flex-1 flex-col items-center justify-center gap-4 border-r border-ithina-border bg-ithina-bg/60 p-8">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Live Preview</p>

                  {editTemplate.hw === "chroma42" && (
                    <div className="flex h-[210px] w-[280px] flex-col border-2 border-slate-400 bg-[#F9F9F9]">
                      <div
                        className={cn("flex items-center justify-center font-bold tracking-widest text-white", editTemplate.headerBg)}
                        style={{ height: 36, fontSize: editFields.headerFontSize * 0.45 }}
                      >
                        {editFields.headerText}
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center gap-1 p-3 text-center" style={{ color: editFields.nameColor }}>
                        <div className="font-bold" style={{ fontSize: editFields.nameFontSize * 0.75 }}>{editFields.productName}</div>
                        {editFields.showWas && <div className="text-slate-400 line-through" style={{ fontSize: 10 }}>{editFields.wasPrice}</div>}
                        <div className="font-black leading-none tracking-tighter" style={{ fontSize: editFields.priceFontSize * 0.45, color: editFields.priceColor }}>{editFields.price}</div>
                      </div>
                    </div>
                  )}

                  {editTemplate.hw === "chroma29" && (
                    <div className="flex h-[128px] w-[296px] border-2 border-slate-400 bg-[#F9F9F9]">
                      <div className={cn("flex w-1/3 items-center justify-center border-r border-black font-bold text-white", editTemplate.headerBg)} style={{ fontSize: 9 }}>
                        {editFields.headerText.slice(0, 8)}
                      </div>
                      <div className="flex flex-1 flex-col items-end justify-center pr-3" style={{ color: editFields.nameColor }}>
                        <div className="font-bold" style={{ fontSize: editFields.nameFontSize * 0.65 }}>{editFields.productName}</div>
                        {editFields.showWas && <div className="text-slate-400 line-through" style={{ fontSize: 9 }}>{editFields.wasPrice}</div>}
                        <div className="font-black leading-none tracking-tighter" style={{ fontSize: editFields.priceFontSize * 0.45, color: editFields.priceColor }}>{editFields.price}</div>
                      </div>
                    </div>
                  )}

                  {editTemplate.hw === "lcd" && (
                    <div className="relative h-[160px] w-full max-w-xs overflow-hidden rounded-lg" style={{ background: editFields.lcdBg }}>
                      <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/80 to-transparent p-5">
                        <div>
                          <div className={cn("mb-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold text-white", editTemplate.headerBg)}>{editFields.headerText}</div>
                          <div className="font-bold text-white" style={{ fontSize: editFields.nameFontSize * 0.75 }}>{editFields.productName}</div>
                          <div className="font-black tracking-tighter" style={{ fontSize: editFields.priceFontSize * 0.45, color: editFields.priceColor }}>{editFields.price}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-full border border-ithina-border bg-ithina-panel px-3 py-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[9px] text-slate-400">Live preview</span>
                  </div>
                </div>

                {/* Right: editor controls */}
                <div className="flex w-80 shrink-0 flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-ithina-border px-5 py-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Edit Template — {editTemplate.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">{editTemplate.hwLabel}</p>
                    </div>
                    <button
                      onClick={() => dispatch(closeTmEdit())}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Scrollable controls */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-3">

                      {/* ESL palette notice */}
                      {editTemplate.hw !== "lcd" && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2.5">
                          <svg className="mt-0.5 size-3.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                          <div>
                            <p className="text-[10px] font-semibold text-amber-400">ESL 3-Colour Palette</p>
                            <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">Black, White and Red only.</p>
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
                              value={editFields.headerText}
                              onChange={(e) => setEf("headerText", e.target.value)}
                              className="w-full rounded-lg border border-ithina-purple/30 bg-ithina-bg/80 px-3 py-2 text-xs text-white focus:border-ithina-purple focus:outline-none"
                            />
                          </div>
                          {editTemplate.hw !== "lcd" ? (
                            <div>
                              <label className="mb-1.5 block text-[10px] text-slate-400">Background Colour</label>
                              <div className="flex gap-3">
                                {ESL_PALETTE.map((c) => (
                                  <button
                                    key={c.hex}
                                    title={c.label}
                                    onClick={() => setEf("headerHex", c.hex)}
                                    className="flex flex-col items-center gap-1 group"
                                  >
                                    <div
                                      className={cn("size-8 rounded-lg border-[3px] transition-all group-hover:scale-110", c.cls, editFields.headerHex === c.hex ? "border-ithina-purple shadow-[0_0_12px_rgba(168,85,247,0.6)] scale-110" : "border-slate-600")}
                                    />
                                    <span className={cn("font-mono text-[8px]", editFields.headerHex === c.hex ? "text-ithina-purple" : "text-slate-600")}>{c.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="mb-1 block text-[10px] text-slate-400">Background Colour</label>
                              <input type="color" value={editFields.headerHex} onChange={(e) => setEf("headerHex", e.target.value)} className="h-9 w-full cursor-pointer rounded-lg border border-ithina-border bg-transparent" />
                            </div>
                          )}
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <label className="text-[10px] text-slate-400">Font Size</label>
                              <span className="font-mono text-[10px] text-ithina-purple">{editFields.headerFontSize}px</span>
                            </div>
                            <input type="range" min={8} max={52} step={2} value={editFields.headerFontSize} onChange={(e) => setEf("headerFontSize", Number(e.target.value))} className="w-full accent-purple-500" />
                          </div>
                        </div>
                      </div>

                      {/* Product Zone */}
                      <div className="ml-4 rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                          <Code className="size-3" /> Product Zone
                        </p>
                        <div className="flex flex-col gap-2.5">
                          <div>
                            <label className="mb-1 block text-[10px] text-slate-400">Product Name</label>
                            <input
                              value={editFields.productName}
                              onChange={(e) => setEf("productName", e.target.value)}
                              className="w-full rounded-lg border border-ithina-border bg-ithina-bg/80 px-3 py-2 text-xs text-white focus:border-ithina-purple focus:outline-none"
                            />
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <label className="text-[10px] text-slate-400">Font Size</label>
                              <span className="font-mono text-[10px] text-slate-400">{editFields.nameFontSize}px</span>
                            </div>
                            <input type="range" min={8} max={28} step={1} value={editFields.nameFontSize} onChange={(e) => setEf("nameFontSize", Number(e.target.value))} className="w-full accent-purple-500" />
                          </div>
                        </div>
                      </div>

                      {/* Price Zone */}
                      <div className="rounded-2xl rounded-tl-sm border border-ithina-purple/20 bg-ithina-purple/10 p-4">
                        <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ithina-purple">
                          <DollarSign className="size-3" /> Price Zone
                        </p>
                        <div className="flex flex-col gap-2.5">
                          <div>
                            <label className="mb-1 block text-[10px] text-slate-400">Price</label>
                            <input
                              value={editFields.price}
                              onChange={(e) => setEf("price", e.target.value)}
                              className="w-full rounded-lg border border-ithina-purple/30 bg-ithina-bg/80 px-3 py-2 text-xs text-white focus:border-ithina-purple focus:outline-none"
                            />
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <label className="text-[10px] text-slate-400">Font Size</label>
                              <span className="font-mono text-[10px] text-ithina-purple">{editFields.priceFontSize}px</span>
                            </div>
                            <input type="range" min={24} max={90} step={2} value={editFields.priceFontSize} onChange={(e) => setEf("priceFontSize", Number(e.target.value))} className="w-full accent-purple-500" />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="tmplShowWas" checked={editFields.showWas} onChange={(e) => setEf("showWas", e.target.checked)} className="accent-purple-500" />
                            <label htmlFor="tmplShowWas" className="cursor-pointer text-[10px] text-slate-400">Show "Was" price</label>
                            {editFields.showWas && (
                              <input
                                value={editFields.wasPrice}
                                onChange={(e) => setEf("wasPrice", e.target.value)}
                                placeholder="$12.99"
                                className="ml-1 flex-1 rounded-lg border border-ithina-border bg-ithina-bg/80 px-2 py-1 text-[10px] text-white focus:border-ithina-purple focus:outline-none"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Layout Zones */}
                      <div className="ml-4 rounded-2xl rounded-tr-sm border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                          <LayoutTemplate className="size-3" /> Layout Zones
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {LAYOUT_OPTIONS.map((lo) => (
                            <button
                              key={lo.id}
                              onClick={() => setEf("layout", lo.id)}
                              className={cn(
                                "rounded-xl border px-2 py-2.5 text-[10px] font-medium transition-all",
                                editFields.layout === lo.id
                                  ? "border-ithina-purple bg-ithina-purple/10 text-ithina-purple"
                                  : "border-ithina-border text-slate-400 hover:border-slate-500 hover:text-white",
                              )}
                            >
                              {lo.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-ithina-border bg-ithina-bg/50 px-5 py-4">
                    <button
                      onClick={() => dispatch(closeTmEdit())}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => dispatch(closeTmEdit())}
                      className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all hover:bg-ithina-purple-hover"
                    >
                      <Check className="size-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showNewModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-ithina-bg/80 p-8 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-ithina-border px-6 py-5">
                  <h3 className="text-base font-bold text-white">New Template</h3>
                  <button onClick={() => setShowNewModal(false)} className="p-1 text-slate-400 hover:text-white"><X className="size-5" /></button>
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Template Name</label>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} type="text" placeholder="e.g. Clearance - High Urgency" className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Target Hardware</label>
                    <div className="grid grid-cols-3 gap-2">
                      {hwFilters.filter((h) => h.id !== "all").map((hw) => (
                        <button
                          key={hw.id}
                          onClick={() => setNewHw(hw.id)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all",
                            newHw === hw.id ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple" : "border-ithina-border bg-ithina-bg text-slate-400 hover:text-white",
                          )}
                        >
                          {hw.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Category Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-all",
                            newTags.includes(tag) ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple" : "border-ithina-border text-slate-400 hover:text-white",
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { if (newName) { setShowNewModal(false); setNewName(""); setNewTags([]); } }}
                    className="mt-2 w-full rounded-lg bg-ithina-purple py-2.5 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TemplateThumbnail({ template }: { template: TemplateItem }) {
  if (template.hw === "chroma42") {
    return (
      <div className="relative flex items-center justify-center bg-[#E2E8F0] p-4" style={{ height: 150 }}>
        <div className="flex h-[120px] w-[160px] flex-col border border-slate-400 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" as const }}>
          <div className={cn("flex h-5 w-full items-center justify-center text-[8px] font-bold tracking-widest text-white", template.headerBg)}>{template.headerText}</div>
          <div className="flex flex-1 flex-col items-center justify-center p-1 text-center text-black">
            <div className="text-[7px] font-bold">{template.productLine ?? "Promotion"}</div>
            <div className="text-[22px] font-black leading-none tracking-tighter">$XX.XX</div>
          </div>
        </div>
        {template.isDefault && <div className="absolute right-2 top-2 rounded bg-ithina-purple px-1.5 py-0.5 text-[8px] font-bold text-white">DEFAULT</div>}
      </div>
    );
  }
  if (template.hw === "chroma29") {
    return (
      <div className="relative flex items-center justify-center bg-[#E2E8F0] p-4" style={{ height: 150 }}>
        <div className="flex h-[64px] w-[148px] border border-slate-400 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" as const }}>
          <div className={cn("flex w-1/3 items-center justify-center text-[7px] font-bold text-white", template.headerBg)}>{template.headerText.slice(0, 5)}</div>
          <div className="flex flex-1 flex-col items-end justify-center pr-2 text-black">
            <div className="text-[6px] font-bold">Product</div>
            <div className="text-[18px] font-black leading-none">$XX</div>
          </div>
        </div>
        {template.isDefault && <div className="absolute right-2 top-2 rounded bg-ithina-purple px-1.5 py-0.5 text-[8px] font-bold text-white">DEFAULT</div>}
      </div>
    );
  }
  return (
    <div className="relative flex items-center justify-center bg-[#E2E8F0] p-4" style={{ height: 130 }}>
      <div className="relative h-[90px] w-full overflow-hidden rounded bg-gray-900">
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/90 to-transparent p-3">
          <div className="text-white">
            <div className={cn("mb-1 inline-block rounded px-1.5 py-0.5 text-[7px] font-bold", template.headerBg)}>{template.headerText}</div>
            <div className="text-[8px] font-bold">Product Name</div>
            <div className="text-[16px] font-black tracking-tighter">$XX.XX</div>
          </div>
        </div>
      </div>
      {template.isDefault && <div className="absolute right-2 top-2 rounded bg-ithina-purple px-1.5 py-0.5 text-[8px] font-bold text-white">DEFAULT</div>}
    </div>
  );
}

function TemplatePreviewLarge({ template }: { template: TemplateItem }) {
  if (template.hw === "chroma42") {
    return (
      <div className="flex h-[210px] w-[280px] flex-col border border-slate-400 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" as const }}>
        <div className={cn("flex items-center justify-center text-[11px] font-bold tracking-widest text-white", template.headerBg)} style={{ height: 32 }}>{template.headerText}</div>
        <div className="flex flex-1 flex-col items-center justify-center p-3 text-center text-black">
          <div className="text-xs font-bold">Product Name</div>
          <div className="mt-1 text-[52px] font-black leading-none tracking-tighter">$XX.XX</div>
        </div>
      </div>
    );
  }
  if (template.hw === "chroma29") {
    return (
      <div className="flex h-[128px] w-[296px] border border-slate-400 bg-[#F9F9F9]" style={{ imageRendering: "pixelated" as const }}>
        <div className={cn("flex w-1/3 items-center justify-center border-r border-black text-[9px] font-bold tracking-widest text-white", template.headerBg)}>{template.headerText.slice(0, 8)}</div>
        <div className="flex flex-1 flex-col items-end justify-center pr-3 text-black">
          <div className="text-[10px] font-bold">Product Name</div>
          <div className="text-[36px] font-black leading-none tracking-tighter">$XX.XX</div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-[160px] w-full overflow-hidden rounded bg-gray-900">
      <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/90 to-transparent p-6">
        <div className="text-white">
          <div className={cn("mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold", template.headerBg)}>{template.headerText}</div>
          <div className="text-sm font-bold">Product Name</div>
          <div className="text-3xl font-black tracking-tighter">$XX.XX</div>
        </div>
      </div>
    </div>
  );
}
