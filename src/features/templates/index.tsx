import { AlertTriangle, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { activateCampaign } from "@/store/slices/campaign-slice";
import type { TemplateItem } from "@/types/templates";
import { useTemplateHwFilters, useTemplateList, useTemplateTags } from "@/hooks/use-templates";

export default function TemplateManager() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: templates = [], isLoading: listLoading, isError } = useTemplateList();
  const { data: hwFilters = [], isLoading: filtersLoading } = useTemplateHwFilters();
  const { data: allTags = [], isLoading: tagsLoading } = useTemplateTags();

  const isLoading = listLoading || filtersLoading || tagsLoading;

  const [search, setSearch] = useState("");
  const [activeHw, setActiveHw] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHw, setNewHw] = useState("chroma42");
  const [newTags, setNewTags] = useState<string[]>([]);

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
                onClick={() => setActiveHw(hw.id)}
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
                onChange={(e) => setSearch(e.target.value)}
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
                        <button onClick={(e) => { e.stopPropagation(); }} className="rounded border border-white/10 px-2 py-1 text-[9px] font-medium text-slate-400 transition-all hover:text-white">Edit</button>
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
