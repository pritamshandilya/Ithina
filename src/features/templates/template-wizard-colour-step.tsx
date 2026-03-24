import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { TmEditFields, TmEditTemplate } from "@/store/slices/templates-slice";
import type { TemplateItem } from "@/types/templates";

import {
  defaultTemplateVariations,
  TEMPLATE_HEADER_COLORS,
  type TemplateVariationRow,
} from "./template-variations-columns";
import { TemplatePreviewLarge } from "./template-wizard-preview";

type Props = {
  editTemplate: TmEditTemplate;
  editFields: TmEditFields;
  setEf: <K extends keyof TmEditFields>(key: K, value: TmEditFields[K]) => void;
  allTags: string[];
};

export function TemplateWizardColourStep({ editTemplate, editFields, setEf, allTags }: Props) {
  const [templateName, setTemplateName] = useState(editTemplate.name);
  const [variations, setVariations] = useState<TemplateVariationRow[]>(() =>
    defaultTemplateVariations(editFields.headerBg, editFields.headerText),
  );
  const [activeVariationId, setActiveVariationId] = useState("v1");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
    const next = new Set<string>();
    if (allTags.includes("Clearance")) next.add("Clearance");
    return next;
  });

  useEffect(() => {
    setTemplateName(editTemplate.name);
    setVariations(defaultTemplateVariations(editFields.headerBg, editFields.headerText));
    setActiveVariationId("v1");
    const next = new Set<string>();
    if (allTags.includes("Clearance")) next.add("Clearance");
    setSelectedTags(next);
  }, [editTemplate.id, allTags]);

  const active = useMemo(
    () => variations.find((v) => v.id === activeVariationId) ?? variations[0],
    [variations, activeVariationId],
  );

  const updateActiveVariation = useCallback(
    (patch: Partial<Pick<TemplateVariationRow, "headerText" | "headerBg">>) => {
      setVariations((prev) =>
        prev.map((v) => (v.id === activeVariationId ? { ...v, ...patch } : v)),
      );
      if (patch.headerText !== undefined) setEf("headerText", patch.headerText);
      if (patch.headerBg !== undefined) setEf("headerBg", patch.headerBg);
    },
    [activeVariationId, setEf],
  );

  const selectVariation = useCallback(
    (row: TemplateVariationRow) => {
      setActiveVariationId(row.id);
      setEf("headerText", row.headerText);
      setEf("headerBg", row.headerBg);
    },
    [setEf],
  );

  const previewTemplate = useMemo(
    (): TemplateItem => ({
      id: editTemplate.id,
      name: templateName,
      hw: editTemplate.hw as TemplateItem["hw"],
      hwLabel: editTemplate.hwLabel,
      headerText: active?.headerText ?? editFields.headerText,
      headerBg: active?.headerBg ?? editFields.headerBg,
      productLine: editTemplate.productLine,
      tags: [],
      isDefault: false,
      usedCount: 0,
    }),
    [editTemplate, templateName, active, editFields.headerText, editFields.headerBg],
  );

  const addVariation = useCallback(() => {
    const n = variations.length + 1;
    const id = `v-${Date.now()}`;
    const row: TemplateVariationRow = {
      id,
      label: `Variation ${n}`,
      headerText: active?.headerText ?? "CLEARANCE",
      headerBg: active?.headerBg ?? "bg-black",
    };
    setVariations((prev) => [...prev, row]);
    setActiveVariationId(id);
    setEf("headerText", row.headerText);
    setEf("headerBg", row.headerBg);
  }, [variations.length, active, setEf]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Left column: `index_3.1.html` creatorStep===2 — w-80 p-6 gap-5 */}
      <div className="flex w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r border-ithina-border p-6">
        <div>
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Template Name
          </label>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            type="text"
            placeholder="e.g. Weekend Flash – High Urgency"
            className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Header Text
          </label>
          <input
            value={active?.headerText ?? ""}
            onChange={(e) => updateActiveVariation({ headerText: e.target.value })}
            type="text"
            className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Header Colour
          </label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_HEADER_COLORS.map((c) => (
              <button
                key={c.cls}
                type="button"
                title={c.label}
                onClick={() => updateActiveVariation({ headerBg: c.cls })}
                className={cn(
                  "size-8 rounded-lg border-2 transition-all hover:scale-110",
                  c.cls,
                  (active?.headerBg ?? "") === c.cls
                    ? "border-white ring-2 ring-ithina-purple"
                    : "border-transparent",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Colour Variations
          </label>
          <div className="flex flex-col gap-2">
            {variations.map((v) => {
              const isActive = v.id === activeVariationId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVariation(v)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-left transition-all",
                    isActive
                      ? "border-ithina-purple/40 bg-ithina-purple/5"
                      : "border-ithina-border hover:border-slate-500",
                  )}
                >
                  <span className={cn("h-5 w-5 shrink-0 rounded", v.headerBg)} aria-hidden />
                  <span
                    className={cn(
                      "flex-1 text-xs font-semibold",
                      isActive ? "text-white" : "text-slate-300",
                    )}
                  >
                    {v.label}
                  </span>
                  <span className="ml-auto shrink-0 text-right font-mono text-[9px] text-slate-600">
                    {v.headerText}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={addVariation}
              className="flex items-center gap-2 rounded-xl border border-dashed border-ithina-border px-3 py-2 text-xs text-slate-500 transition-colors hover:border-slate-500 hover:text-white"
            >
              <Plus className="size-3.5 shrink-0" aria-hidden />
              Add Variation
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Category Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const on = selectedTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-all",
                    on
                      ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                      : "border-ithina-border text-slate-400 hover:text-white",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-ithina-bg/20 p-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Live Preview</p>
        <div className="flex items-center justify-center rounded-2xl bg-[#E2E8F0] p-8">
          <TemplatePreviewLarge template={previewTemplate} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {variations.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => selectVariation(v)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all",
                v.id === activeVariationId
                  ? "border-ithina-purple/40 bg-ithina-purple/5"
                  : "border-ithina-border/60 hover:border-slate-500",
              )}
            >
              <span className={cn("size-3 rounded-sm", v.headerBg)} aria-hidden />
              <span className="text-[10px] text-slate-400">{v.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
