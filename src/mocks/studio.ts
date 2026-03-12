import type {
  AssetInfo,
  ComplianceCheck,
  HwOption,
  LayoutVariant,
  RecentCampaign,
  RendererSpec,
} from "@/types/studio";
import type { ChatMessage, HardwareDeviceId } from "@/types/wizard";

export const MOCK_HW_OPTIONS: HwOption[] = [
  { id: "chroma42", label: "ESL: Chroma 42", sub: "400×300 · 3-colour e-ink" },
  { id: "chroma29", label: "ESL: Chroma 29", sub: "296×128 · 3-colour e-ink" },
  { id: "lcd", label: "Screen: LCD Banner", sub: "1920×1080 · full colour" },
];

export const MOCK_VARIANTS: LayoutVariant[] = [
  { id: "A", name: "Price-Dominant" },
  { id: "B", name: "Urgency-Dominant", recommended: true },
  { id: "C", name: "Balanced + Visual" },
];

export const MOCK_COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { label: "Layout Dimensions", passed: true },
  { label: "1-Bit Color Strictness", passed: true, eslOnly: true },
  { label: "Price Contrast Ratio", passed: true },
];

export const MOCK_ESL_RENDERER_SPEC: RendererSpec = {
  targetDisplay: "Chroma",
  payloadFormat: "1-bit .BMP (3-Color)",
  palette: ["#000000", "#FFFFFF", "#FF0000"],
};

export const MOCK_LCD_RENDERER_SPEC: RendererSpec = {
  targetDisplay: "LCD Banner",
  resolution: "1920x1080 (16:9)",
  colorSpace: "Full Color (PNG)",
  payloadFormat: "PNG",
};

export const MOCK_ASSET_INFO: AssetInfo = {
  name: "Premium Salmon Tray",
  sku: "SUSHI-019A",
  source: "Mfg API",
  status: "Background Removed",
  emoji: "🍣",
};

export const MOCK_INITIAL_MESSAGE: ChatMessage = {
  role: "ai",
  text: "The Promo Assistant has composed 3 layout variants for the Sushi Clearance campaign.<br><br>Please select a starting point on the right.",
};

export const MOCK_RECENT_CAMPAIGNS: RecentCampaign[] = [
  { id: "CMP-9941-A", name: "Weekend Beverage Promo", skus: 42, hw: "Chroma 42", status: "Active", statusCls: "text-ithina-purple bg-ithina-purple/10 border border-ithina-purple/20" },
  { id: "CMP-9940-B", name: "Sushi Clearance — Urgent", skus: 4, hw: "Chroma 42", status: "Completed", statusCls: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" },
  { id: "CMP-9938-D", name: "Spring Produce Launch", skus: 76, hw: "LCD Banner", status: "Scheduled", statusCls: "text-amber-400 bg-amber-400/10 border border-amber-400/20" },
  { id: "CMP-9939-C", name: "Electronics Flash Sale", skus: 18, hw: "LCD Banner", status: "Draft", statusCls: "text-slate-400 bg-white/5 border border-white/10" },
];

export function getMockChatRefineReply(hw: HardwareDeviceId): ChatMessage {
  const replies: Record<HardwareDeviceId, string> = {
    lcd: "Generated a new atmospheric background. Compliance gate verified — no unintended text present.",
    chroma29: "Chroma 29 layout re-composed. Text condensed for 296×128 — OCR scan passed.",
    chroma42: "Layout updated. OCR scan passed — all dimensions comply with hardware limits.",
  };
  return { role: "ai", text: replies[hw] };
}

export function getMockHwSwitchReply(hwLabel: string): ChatMessage {
  return {
    role: "ai",
    text: `Layout re-calculated for ${hwLabel} — dimensions and colour constraints re-applied.`,
  };
}
