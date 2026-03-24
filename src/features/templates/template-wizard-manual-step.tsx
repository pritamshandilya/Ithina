import type { LucideIcon } from "lucide-react";
import { Monitor, Smartphone, Tv, Upload } from "lucide-react";
import type { ChangeEvent } from "react";

import { cn } from "@/lib/utils";
import type { TemplateHardware } from "@/types/templates";

export type ManualWizardDraft = {
  name: string;
  hw: TemplateHardware;
  fileName: string;
};

/** Matches `hwTypeChoices` + manual panel in `index_3.1.html` (creatorStep===1, manual). */
const HW_CHOICES: { id: TemplateHardware; label: string; dims: string; Icon: LucideIcon }[] = [
  { id: "chroma42", label: "ESL Chroma 42", dims: "400×300 px", Icon: Monitor },
  { id: "chroma29", label: "ESL Chroma 29", dims: "296×128 px", Icon: Smartphone },
  { id: "lcd", label: "LCD Banner", dims: "1920×1080 px", Icon: Tv },
];

type Props = {
  value: ManualWizardDraft;
  onChange: (next: ManualWizardDraft) => void;
};

export function TemplateWizardManualStep({ value, onChange }: Props) {
  const patch = (partial: Partial<ManualWizardDraft>) => {
    onChange({ ...value, ...partial });
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    patch({ fileName: f ? f.name : "" });
  };

  const hasFile = Boolean(value.fileName);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-7">
      <div>
        <label className="mb-3 block text-xs font-medium text-slate-400" htmlFor="tm-manual-name">
          Template Name
        </label>
        <input
          id="tm-manual-name"
          value={value.name}
          onChange={(e) => patch({ name: e.target.value })}
          type="text"
          placeholder="e.g. Weekend Flash – High Urgency"
          className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2.5 text-sm text-white transition-colors placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-3 block text-xs font-medium text-slate-400">Hardware Type</label>
        <div className="grid grid-cols-3 gap-3">
          {HW_CHOICES.map(({ id, label, dims, Icon }) => {
            const selected = value.hw === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => patch({ hw: id })}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                  selected
                    ? "border-ithina-purple bg-ithina-purple/5 text-white"
                    : "border-ithina-border bg-ithina-panel text-slate-400 hover:text-white",
                )}
              >
                <Icon className="size-6 shrink-0" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-slate-600">{dims}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <label
        htmlFor="tm-manual-upload"
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all",
          hasFile ? "border-emerald-500/40 bg-emerald-500/5" : "border-ithina-border/60",
          "hover:border-ithina-purple/40 hover:bg-ithina-purple/5",
        )}
      >
        <input
          id="tm-manual-upload"
          type="file"
          accept=".png,.bmp,.jpg,.jpeg,image/png,image/bmp,image/jpeg"
          className="sr-only"
          onChange={onFile}
        />
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            hasFile ? "bg-emerald-400/10" : "bg-ithina-purple/10",
          )}
        >
          <Upload
            className={cn("size-6", hasFile ? "text-emerald-400" : "text-ithina-purple")}
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
        <p className={cn("text-sm font-semibold", hasFile ? "text-emerald-400" : "text-slate-300")}>
          {value.fileName || "Upload your design file"}
        </p>
        <p className="font-mono text-xs text-slate-500">PNG · BMP · JPG</p>
      </label>
    </div>
  );
}
