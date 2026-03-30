import {
  AlertTriangle,
  AlignLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Library,
  Monitor,
  Plus,
  Search,
  Square,
  Upload,
  X,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

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
import type { TemplateHardware, TemplateItem } from "@/types/templates";
import { useTemplateHwFilters, useTemplateList, useTemplateTags } from "@/hooks/use-templates";

import { TemplateWizardColourStep } from "./template-wizard-colour-step";
import {
  TemplateWizardManualStep,
  type ManualWizardDraft,
} from "./template-wizard-manual-step";
import { TemplatePreviewLarge } from "./template-wizard-preview";

const TM_HW_LABEL: Record<TemplateHardware, string> = {
  chroma42: "ESL Chroma 42",
  chroma29: "ESL Chroma 29",
  lcd: "LCD Banner",
};

function initialManualDraft(): ManualWizardDraft {
  return { name: "", hw: "chroma42", fileName: "" };
}

const TM_WIZARD_STEPS = [
  { id: 1 as const, label: "Select Template" },
  { id: 2 as const, label: "Colour Scheme" },
  { id: 3 as const, label: "Review & Publish" },
];

export default function TemplateManager() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: templates = [], isLoading: listLoading, isError } = useTemplateList();
  const { isLoading: filtersLoading } = useTemplateHwFilters();
  const { data: allTags = [], isLoading: tagsLoading } = useTemplateTags();

  const isLoading = listLoading || filtersLoading || tagsLoading;

  // ── Persisted state (Redux) ────────────────────────────────────────────
  const { search, activeHw, editTemplate, editFields } = useAppSelector((s) => s.templates);
  const toolbarFilters = [
    { id: "all", label: "All", icon: AlignLeft },
    { id: "esl", label: "ESL", icon: Square },
    { id: "lcd", label: "LCD", icon: Monitor },
  ] as const;

  // ── Transient state (local — OK to reset on navigate) ─────────────────
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [tmWizardStep, setTmWizardStep] = useState<1 | 2 | 3>(1);
  const [tmWizardSource, setTmWizardSource] = useState<"library" | "manual">("library");
  const [libraryPickedStep2, setLibraryPickedStep2] = useState(false);
  const [manualDraft, setManualDraft] = useState<ManualWizardDraft>(initialManualDraft);

  const resetTmWizardLocal = () => {
    setTmWizardStep(1);
    setTmWizardSource("library");
    setLibraryPickedStep2(false);
    setManualDraft(initialManualDraft());
  };

  const closeEditModal = () => {
    dispatch(closeTmEdit());
    resetTmWizardLocal();
  };

  const openEdit = (t: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setTmWizardStep(3);
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
        headerHex: "#FF0000",
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

  const openNewTemplateWizard = () => {
    const seed = templates[0];
    if (!seed) return;
    resetTmWizardLocal();
    dispatch(openTmEdit({
      template: {
        id: seed.id,
        name: seed.name,
        hw: seed.hw,
        hwLabel: seed.hwLabel,
        headerText: seed.headerText,
        headerBg: seed.headerBg,
        productLine: seed.productLine ?? null,
      },
      fields: {
        headerText: seed.headerText,
        headerBg: seed.headerBg,
        headerHex: "#FF0000",
        headerFontSize: 24,
        productName: seed.productLine ?? "Product Name",
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
      const hw =
        activeHw === "all" ||
        (activeHw === "esl" ? t.hw === "chroma42" || t.hw === "chroma29" : t.hw === activeHw);
      const s = !search || t.name.toLowerCase().includes(search.toLowerCase());
      return hw && s;
    });
  }, [templates, activeHw, search]);

  /** `index_3.1.html`: Next disabled on library step until a template is selected. */
  const tmWizardNextDisabled = useMemo(
    () => tmWizardStep === 2 && tmWizardSource === "library" && !libraryPickedStep2,
    [tmWizardStep, tmWizardSource, libraryPickedStep2],
  );

  const useTemplate = (t: TemplateItem) => {
    dispatch(activateCampaign(t.name));
    navigate({ to: "/studio" });
    setPreviewTemplate(null);
  };

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <AlertTriangle className="size-10 text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Failed to load templates</h3>
        <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <LoadingSpinner label="Loading templates..." className="flex-1" />
      ) : (
        <div className="relative flex flex-1 flex-col gap-5 overflow-hidden p-6 animate-[fadeIn_0.4s_ease-out] lg:p-8">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-xl border border-ithina-border bg-ithina-panel p-1">
            {toolbarFilters.map((hw) => {
              const Icon = hw.icon;
              return (
              <button
                key={hw.id}
                onClick={() => dispatch(setTmActiveHw(hw.id))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  activeHw === hw.id
                    ? "bg-ithina-purple text-white"
                    : "text-slate-400 hover:text-white",
                )}
              >
                <Icon className="size-3.5" />
                {hw.label}
              </button>
              );
            })}
            </div>
            <div className="relative ml-1 mr-2 max-w-xs flex-1">
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
            <button
              onClick={openNewTemplateWizard}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-ithina-purple px-5 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all hover:bg-ithina-purple-hover"
            >
              <Plus className="size-3.5" />
              New Template
            </button>
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
                      <div className="flex gap-1.5">
                        {t.isDefault ? (
                          <span className="rounded border border-ithina-purple/40 bg-ithina-purple/10 px-2 py-1 text-[9px] font-medium text-ithina-purple">✓ Default</span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); }} className="rounded border border-white/10 bg-ithina-bg/60 px-2 py-1 text-[9px] font-medium text-slate-400 transition-all hover:border-ithina-purple/30 hover:text-ithina-purple">Set Default</button>
                        )}
                        <button onClick={(e) => openEdit(t, e)} className="flex items-center gap-1 rounded border border-white/10 bg-ithina-bg/60 px-2 py-1 text-[9px] font-medium text-slate-400 transition-all hover:border-ithina-purple/30 hover:text-ithina-purple">
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
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-md"
              onClick={closeEditModal}
            >
              <div
                className="flex h-[90vh] max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[20px] border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-ithina-border px-7 py-5">
                  <div className="flex items-center gap-4">
                    <h3 className="text-base font-bold text-white">New Template</h3>
                    <div className="flex items-center gap-1.5">
                      {TM_WIZARD_STEPS.map((step, idx) => (
                        <Fragment key={step.id}>
                          <div
                            className={cn(
                              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                              tmWizardStep === step.id
                                ? "border border-ithina-purple/30 bg-ithina-purple/15 text-white"
                                : tmWizardStep > step.id
                                  ? "text-ithina-purple"
                                  : "text-slate-600",
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold",
                                tmWizardStep > step.id
                                  ? "bg-ithina-purple text-white"
                                  : tmWizardStep === step.id
                                    ? "border-2 border-ithina-purple text-ithina-purple"
                                    : "border border-ithina-border/60 text-slate-600",
                              )}
                            >
                              {tmWizardStep > step.id ? (
                                <Check className="size-2.5" strokeWidth={3} aria-hidden />
                              ) : (
                                step.id
                              )}
                            </div>
                            {step.label}
                          </div>
                          {idx < TM_WIZARD_STEPS.length - 1 && (
                            <div
                              className={cn(
                                "h-px w-5",
                                tmWizardStep > step.id ? "bg-ithina-purple" : "bg-ithina-border/60",
                              )}
                            />
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {tmWizardStep === 1 && (
                    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-7">
                      <div>
                        <p className="mb-5 text-sm text-slate-400">
                          How would you like to create this template?
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setTmWizardSource("library");
                              setLibraryPickedStep2(false);
                              setTmWizardStep(2);
                            }}
                            className="group rounded-2xl border-2 border-ithina-border bg-ithina-panel p-6 text-left transition-all hover:border-ithina-purple/60 hover:bg-ithina-purple/5"
                          >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-ithina-purple/20 bg-ithina-purple/10 transition-transform group-hover:scale-110">
                              <Library className="size-6 text-ithina-purple" strokeWidth={1.5} aria-hidden />
                            </div>
                            <h4 className="mb-1.5 text-sm font-bold text-white">From Library</h4>
                            <p className="text-xs leading-relaxed text-slate-400">
                              Start from an existing ESL or LCD template and customise colours, text
                              and layout variants.
                            </p>
                            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-ithina-purple">
                              Browse library
                              <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTmWizardSource("manual");
                              setManualDraft(initialManualDraft());
                              setTmWizardStep(2);
                            }}
                            className="group rounded-2xl border-2 border-ithina-border bg-ithina-panel p-6 text-left transition-all hover:border-slate-500"
                          >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-ithina-border bg-ithina-bg transition-all group-hover:scale-110 group-hover:border-slate-500">
                              <Upload className="size-6 text-slate-300" strokeWidth={1.5} aria-hidden />
                            </div>
                            <h4 className="mb-1.5 text-sm font-bold text-white">Manual Upload</h4>
                            <p className="text-xs leading-relaxed text-slate-400">
                              Upload pre-designed banner files for ESL or LCD display modes. Full
                              control over design assets.
                            </p>
                            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors group-hover:text-white">
                              Upload files
                              <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {tmWizardStep === 2 && tmWizardSource === "manual" && (
                    <TemplateWizardManualStep value={manualDraft} onChange={setManualDraft} />
                  )}

                  {tmWizardStep === 2 && tmWizardSource === "library" && (
                    <div className="grid min-h-0 flex-1 grid-cols-[16rem_1fr]">
                      <div className="w-64 shrink-0 overflow-y-auto border-r border-ithina-border bg-ithina-bg/30 p-4">
                        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-slate-600">
                          Template Library
                        </p>
                        <p className="mb-2 text-xs font-semibold text-slate-300">ESL Templates</p>
                        <div className="space-y-1.5">
                          {templates.filter((t) => t.hw !== "lcd").map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setLibraryPickedStep2(true);
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
                                    ...editFields,
                                    headerText: t.headerText,
                                    headerBg: t.headerBg,
                                    productName: t.productLine ?? "Product Name",
                                  },
                                }));
                              }}
                              className={cn(
                                "w-full rounded-xl border px-3 py-2 text-left text-sm transition-all",
                                editTemplate.id === t.id
                                  ? "border-ithina-purple/40 bg-ithina-purple/12 text-white"
                                  : "border-transparent text-slate-300 hover:bg-white/[0.04]",
                              )}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                        <p className="mb-2 mt-6 text-xs font-semibold text-slate-300">LCD Templates</p>
                        <div className="space-y-1.5">
                          {templates.filter((t) => t.hw === "lcd").map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setLibraryPickedStep2(true);
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
                                    ...editFields,
                                    headerText: t.headerText,
                                    headerBg: t.headerBg,
                                    productName: t.productLine ?? "Product Name",
                                  },
                                }));
                              }}
                              className={cn(
                                "w-full rounded-xl border px-3 py-2 text-left text-sm transition-all",
                                editTemplate.id === t.id
                                  ? "border-ithina-purple/40 bg-ithina-purple/12 text-white"
                                  : "border-transparent text-slate-300 hover:bg-white/[0.04]",
                              )}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
                        <div className="flex flex-col items-center gap-5">
                          <div className="flex items-center justify-center rounded-2xl bg-[#E2E8F0] p-8">
                            <TemplatePreviewLarge template={editTemplate as TemplateItem} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-white">{editTemplate.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{editTemplate.hwLabel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tmWizardStep === 3 && (
                    <TemplateWizardColourStep
                      editTemplate={editTemplate}
                      editFields={editFields}
                      setEf={setEf}
                      allTags={allTags}
                    />
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between border-t border-ithina-border px-7 py-5">
                  <button
                    type="button"
                    onClick={() => {
                      if (tmWizardStep === 1) {
                        dispatch(closeTmEdit());
                        setTmWizardStep(1);
                      } else {
                        setTmWizardStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3));
                      }
                    }}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {tmWizardStep > 1 && <ChevronLeft className="size-4" aria-hidden />}
                    {tmWizardStep > 1 ? "Back" : "Cancel"}
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-slate-600">
                      Step {tmWizardStep} of 3
                    </span>
                    {tmWizardStep < 3 ? (
                      <button
                        type="button"
                        disabled={tmWizardNextDisabled}
                        onClick={() => {
                          if (tmWizardStep === 2 && tmWizardSource === "manual" && editTemplate) {
                            dispatch(
                              openTmEdit({
                                template: {
                                  ...editTemplate,
                                  name: manualDraft.name.trim() || editTemplate.name,
                                  hw: manualDraft.hw,
                                  hwLabel: TM_HW_LABEL[manualDraft.hw],
                                },
                                fields: editFields,
                              }),
                            );
                          }
                          setTmWizardStep((s) => (Math.min(3, s + 1) as 1 | 2 | 3));
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-ithina-purple px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ArrowRight className="size-4" aria-hidden />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(closeTmEdit());
                          setTmWizardStep(1);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500"
                      >
                        <Check className="size-4" aria-hidden />
                        Publish Template
                      </button>
                    )}
                  </div>
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
