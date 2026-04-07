import { LayoutGrid, Sparkles, Upload, X, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type StudioMethod = "ai" | "library" | "manual";
type TemplateItem = {
  id: string;
  name: string;
  headerColor: string;
  headerText: string;
  productLine: string;
};

const TEMPLATE_LIBRARY: TemplateItem[] = [
  { id: "tpl_clearance", name: "Clearance Standard", headerColor: "#111111", headerText: "CLEARANCE", productLine: "Perishables" },
  { id: "tpl_expiring", name: "Expiring 48H", headerColor: "#cc0000", headerText: "EXPIRING IN 48H", productLine: "Fresh" },
  { id: "tpl_flash", name: "Flash Sale", headerColor: "#b91c1c", headerText: "FLASH SALE", productLine: "All Categories" },
  { id: "tpl_newarrival", name: "New Arrival", headerColor: "#065f46", headerText: "NEW ARRIVAL", productLine: "All Categories" },
  { id: "tpl_bogo", name: "BOGO Special", headerColor: "#1d4ed8", headerText: "BUY ONE GET ONE", productLine: "Snacks & Drinks" },
  { id: "tpl_members", name: "Members Only", headerColor: "#7c3aed", headerText: "MEMBERS ONLY", productLine: "Premium" },
];

export default function Studio() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<StudioMethod>("library");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATE_LIBRARY[0].id);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
      <div className="h-[88vh] w-full overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-[0_20px_70px_rgba(0,0,0,0.7)]">
        <header className="flex items-center justify-between border-b border-ithina-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-5 items-center justify-center rounded border border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple">
              <Sparkles className="size-3" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Campaign Studio</h2>
              <p className="text-xs text-slate-500">ESL e-ink design</p>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/campaigns" })}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close studio"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grid h-[calc(88vh-55px)] min-h-0 grid-cols-[190px_1fr]">
          <aside className="flex min-h-0 flex-col border-r border-ithina-border">
            <div className="overflow-y-auto p-3">
              <p className="mb-3 font-mono text-[9px] tracking-widest text-slate-600">DESIGN METHOD</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMethod("ai")}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    method === "ai"
                      ? "bg-ithina-purple/20 font-semibold text-white"
                      : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  <Zap className="size-3.5" />
                  AI Generate
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("library")}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    method === "library"
                      ? "bg-ithina-purple/20 font-semibold text-white"
                      : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                  Template Library
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("manual")}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    method === "manual"
                      ? "bg-ithina-purple/20 font-semibold text-white"
                      : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  <Upload className="size-3.5" />
                  Manual Upload
                </button>
              </div>
            </div>

            <div className="mt-auto border-t border-ithina-border p-3">
              <p className="mb-2 font-mono text-[9px] tracking-widest text-slate-600">LIVE PREVIEW</p>
              <div className="w-[96px] rounded border border-ithina-border bg-[#E5E7EB] p-1">
                <div className="h-[10px] bg-red-700" />
                <div className="bg-[#F5F5F5] p-1">
                  <p className="text-[6px] text-black">Premium</p>
                  <p className="text-[20px] font-black leading-none text-black">$10.39</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col">
            <div className="flex flex-1 p-6">
              {method === "library" ? (
                <div className="flex h-full w-full flex-col">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white">Template Library</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Pick a template and then continue with design edits.</p>
                  </div>

                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Choose a saved template
                  </p>

                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                    {TEMPLATE_LIBRARY.map((tpl) => {
                      const selected = tpl.id === selectedTemplateId;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`rounded-xl border p-2 text-left transition-all ${
                            selected
                              ? "border-ithina-purple bg-ithina-purple/10"
                              : "border-ithina-border bg-ithina-panel hover:border-slate-500"
                          }`}
                        >
                          <p className="mb-1 text-xs font-semibold text-white">{tpl.name}</p>
                          <div className="overflow-hidden rounded border border-slate-400 bg-[#E5E7EB]">
                            <div
                              className="flex h-5 items-center justify-center text-[7px] font-bold tracking-widest text-white"
                              style={{ background: tpl.headerColor }}
                            >
                              {tpl.headerText}
                            </div>
                            <div className="bg-[#F5F5F5] p-1">
                              <p className="text-[6px] text-black">{tpl.productLine}</p>
                              <p className="text-right text-[18px] font-black leading-none text-black">$10.39</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-t border-ithina-border pt-3">
                    <p className="text-xs text-slate-500">
                      Selected:{" "}
                      <span className="text-white">
                        {TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId)?.name ?? "No template selected"}
                      </span>
                    </p>
                  </div>
                </div>
              ) : method === "ai" ? (
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                    AI GENERATE
                  </p>
                  <p className="mt-2 text-slate-500">Use AI to generate a design variant.</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                    MANUAL UPLOAD
                  </p>
                  <p className="mt-2 text-slate-500">Upload your own creative assets here.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
