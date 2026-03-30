import type { BuiltinTemplate, HwFilterOption, TemplateItem } from "@/types/templates";

export const MOCK_TEMPLATES: TemplateItem[] = [
  { id: "t1", name: "Clearance Standard", hw: "chroma42", hwLabel: "ESL Chroma 42", headerBg: "bg-black", headerText: "CLEARANCE", tags: ["Clearance"], isDefault: true, usedCount: 34 },
  { id: "t2", name: "High Urgency Expiry", hw: "chroma42", hwLabel: "ESL Chroma 42", headerBg: "bg-red-600", headerText: "EXPIRING IN 48H", tags: ["Urgency", "Clearance"], isDefault: false, usedCount: 21 },
  { id: "t3", name: "Flash Sale Bang", hw: "chroma42", hwLabel: "ESL Chroma 42", headerBg: "bg-red-700", headerText: "FLASH SALE", tags: ["Flash Sale"], isDefault: false, usedCount: 12 },
  { id: "t4", name: "New Arrival Spotlight", hw: "chroma42", hwLabel: "ESL Chroma 42", headerBg: "bg-emerald-700", headerText: "NEW ARRIVAL", tags: ["New Arrival"], isDefault: false, usedCount: 8 },
  { id: "t5", name: "Compact Clearance", hw: "chroma29", hwLabel: "ESL Chroma 29", headerBg: "bg-black", headerText: "CLEARANCE", tags: ["Clearance"], isDefault: true, usedCount: 18 },
  { id: "t6", name: "Tiny Urgency", hw: "chroma29", hwLabel: "ESL Chroma 29", headerBg: "bg-red-600", headerText: "EXPIRING", tags: ["Urgency"], isDefault: false, usedCount: 9 },
  { id: "t7", name: "Banner Clearance", hw: "lcd", hwLabel: "LCD Banner", headerBg: "bg-black", headerText: "CLEARANCE", tags: ["Clearance"], isDefault: true, usedCount: 15 },
  { id: "t8", name: "Banner Flash Sale", hw: "lcd", hwLabel: "LCD Banner", headerBg: "bg-red-600", headerText: "FLASH SALE", tags: ["Flash Sale"], isDefault: false, usedCount: 6 },
];

export const MOCK_BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "t1", name: "Clearance Standard", hw: "chroma42", headerBg: "bg-black", headerText: "CLEARANCE", tags: ["Clearance"],
    variants: [
      { id: "A", label: "Price-Dominant", headerBg: "bg-black", headerText: "CLEARANCE", subText: "centered price" },
      { id: "B", label: "Name-Dominant", headerBg: "bg-black", headerText: "CLEARANCE", subText: "product name large" },
      { id: "C", label: "Split Layout", headerBg: "bg-slate-800", headerText: "CLEARANCE", subText: "side-by-side" },
    ],
  },
  {
    id: "t2", name: "High Urgency Expiry", hw: "chroma42", headerBg: "bg-red-600", headerText: "EXPIRING IN 48H", tags: ["Urgency"],
    variants: [
      { id: "A", label: "Full Red Banner", headerBg: "bg-red-600", headerText: "EXPIRING IN 48H", subText: "bold red header" },
      { id: "B", label: "Compact Urgency", headerBg: "bg-red-700", headerText: "48H ONLY", subText: "compact format" },
      { id: "C", label: "Countdown Style", headerBg: "bg-red-800", headerText: "LAST CHANCE", subText: "dramatic tone" },
    ],
  },
  {
    id: "t3", name: "Flash Sale Bang", hw: "chroma42", headerBg: "bg-red-700", headerText: "FLASH SALE", tags: ["Flash Sale"],
    variants: [
      { id: "A", label: "Impact Header", headerBg: "bg-red-700", headerText: "FLASH SALE", subText: "full-width banner" },
      { id: "B", label: "Price Focus", headerBg: "bg-red-600", headerText: "SALE NOW", subText: "price dominant" },
      { id: "C", label: "Minimal", headerBg: "bg-slate-900", headerText: "FLASH", subText: "understated" },
    ],
  },
  {
    id: "t4", name: "New Arrival Spotlight", hw: "chroma42", headerBg: "bg-emerald-700", headerText: "NEW ARRIVAL", tags: ["New Arrival"],
    variants: [
      { id: "A", label: "Green Accent", headerBg: "bg-emerald-700", headerText: "NEW ARRIVAL", subText: "fresh & bold" },
      { id: "B", label: "Soft Launch", headerBg: "bg-emerald-800", headerText: "JUST IN", subText: "softer tone" },
      { id: "C", label: "Featured Item", headerBg: "bg-teal-700", headerText: "FEATURED", subText: "teal palette" },
    ],
  },
];

export const MOCK_TEMPLATE_TAGS: string[] = [
  "Clearance", "Urgency", "Seasonal", "Flash Sale", "New Arrival", "BOGO", "Brand",
];

export const MOCK_TEMPLATE_HW_FILTERS: HwFilterOption[] = [
  { id: "all", label: "All" },
  { id: "chroma42", label: "Chroma 42" },
  { id: "chroma29", label: "Chroma 29" },
  { id: "lcd", label: "LCD Banner" },
];
