export type TemplateVariationRow = {
  id: string;
  label: string;
  headerText: string;
  headerBg: string;
};

/** Matches `headerColors` in `index_3.1.html` (w-8 h-8 swatches, row layout). */
export const TEMPLATE_HEADER_COLORS: { cls: string; label: string }[] = [
  { cls: "bg-black", label: "Black" },
  { cls: "bg-red-600", label: "Red" },
  { cls: "bg-red-800", label: "Dark Red" },
  { cls: "bg-orange-500", label: "Orange" },
  { cls: "bg-amber-500", label: "Amber" },
  { cls: "bg-emerald-700", label: "Green" },
  { cls: "bg-blue-700", label: "Blue" },
  { cls: "bg-purple-700", label: "Purple" },
  { cls: "bg-slate-700", label: "Grey" },
];

export function defaultTemplateVariations(
  headerBg: string,
  headerText: string,
): TemplateVariationRow[] {
  return [
    { id: "v1", label: "Default", headerText: headerText || "CLEARANCE", headerBg: headerBg || "bg-black" },
    { id: "v2", label: "Urgent", headerText: "EXPIRING IN 48H", headerBg: "bg-red-600" },
    { id: "v3", label: "Flash", headerText: "FLASH SALE", headerBg: "bg-amber-500" },
  ];
}
