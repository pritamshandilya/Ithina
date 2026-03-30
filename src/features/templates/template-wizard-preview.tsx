import { cn } from "@/lib/utils";
import type { TemplateItem } from "@/types/templates";

/** Large ESL / LCD preview for template wizard — dimensions match `index_3.1.html` step 2. */
export function TemplatePreviewLarge({ template }: { template: TemplateItem }) {
  if (template.hw === "chroma42") {
    return (
      <div className="template-preview-esl-pixelated flex h-[210px] w-[280px] flex-col border border-slate-400 bg-[#F9F9F9]">
        <div
          className={cn(
            "flex h-[38px] w-full items-center justify-center text-[13px] font-bold tracking-widest text-white",
            template.headerBg,
          )}
        >
          {template.headerText}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center text-black">
          <div className="text-xs font-bold">Product Name</div>
          <div className="mt-1 text-[52px] font-black leading-none tracking-tighter">$XX.XX</div>
        </div>
      </div>
    );
  }
  if (template.hw === "chroma29") {
    const headerSlice = template.headerText.slice(0, 7);
    return (
      <div className="template-preview-esl-pixelated flex h-[128px] w-[296px] border border-slate-400 bg-[#F9F9F9]">
        <div
          className={cn(
            "flex w-1/3 items-center justify-center text-[10px] font-bold tracking-widest text-white",
            template.headerBg,
          )}
        >
          {headerSlice}
        </div>
        <div className="flex flex-1 flex-col items-end justify-center pr-4 text-black">
          <div className="text-[11px] font-bold">Product Name</div>
          <div className="text-[38px] font-black leading-none tracking-tighter">$XX.XX</div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-[225px] w-[400px] overflow-hidden rounded bg-gray-900">
      <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/90 to-transparent p-6">
        <div className="text-white">
          <div className={cn("mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold", template.headerBg)}>
            {template.headerText}
          </div>
          <div className="text-lg font-bold">Product Name</div>
          <div className="text-4xl font-black tracking-tighter">$XX.XX</div>
        </div>
      </div>
    </div>
  );
}
