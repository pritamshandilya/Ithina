import {
  getMockChatRefineReply,
  getMockHwSwitchReply,
  MOCK_ASSET_INFO,
  MOCK_COMPLIANCE_CHECKS,
  MOCK_ESL_RENDERER_SPEC,
  MOCK_HW_OPTIONS,
  MOCK_INITIAL_MESSAGE,
  MOCK_LCD_RENDERER_SPEC,
  MOCK_RECENT_CAMPAIGNS,
  MOCK_VARIANTS,
} from "@/mocks/studio";
import { apiDelay } from "@/lib/api-delay";
import type {
  AssetInfo,
  ChatMessage,
  ComplianceCheck,
  HardwareDeviceId,
  HwOption,
  LayoutVariant,
  RecentCampaign,
  RendererSpec,
  VariantId,
} from "@/types/studio";

// TODO (backend): replace with axios.get("/api/studio/hardware-options")
export async function getHwOptions(): Promise<HwOption[]> {
  await apiDelay(300);
  return MOCK_HW_OPTIONS;
}

// TODO (backend): replace with axios.get("/api/studio/variants")
export async function getLayoutVariants(): Promise<LayoutVariant[]> {
  await apiDelay(300);
  return MOCK_VARIANTS;
}

// TODO (backend): replace with axios.get("/api/studio/compliance")
export async function getComplianceChecks(): Promise<ComplianceCheck[]> {
  await apiDelay(300);
  return MOCK_COMPLIANCE_CHECKS;
}

// TODO (backend): replace with axios.get("/api/studio/renderer-spec/:hw")
export async function getRendererSpec(hw: HardwareDeviceId): Promise<RendererSpec> {
  await apiDelay(200);
  return hw === "lcd" ? MOCK_LCD_RENDERER_SPEC : { ...MOCK_ESL_RENDERER_SPEC, targetDisplay: `Chroma ${hw === "chroma42" ? "42" : "29"}` };
}

// TODO (backend): replace with axios.get("/api/studio/asset")
export async function getAssetInfo(): Promise<AssetInfo> {
  await apiDelay(200);
  return MOCK_ASSET_INFO;
}

// TODO (backend): replace with axios.get("/api/studio/initial-message")
export async function getInitialMessage(): Promise<ChatMessage> {
  await apiDelay(200);
  return MOCK_INITIAL_MESSAGE;
}

// TODO (backend): replace with axios.post("/api/studio/select-variant")
export async function selectVariant(id: VariantId): Promise<{ user: ChatMessage; ai: ChatMessage }> {
  await apiDelay(500);
  return {
    user: { role: "user", text: `I'll proceed with Variant ${id}.` },
    ai: { role: "ai", text: `Loaded Variant ${id} into the canvas. You can refine this layout using natural language below.` },
  };
}

// TODO (backend): replace with axios.post("/api/studio/refine")
export async function submitChatRefine(
  _userText: string,
  hw: HardwareDeviceId,
): Promise<ChatMessage> {
  await apiDelay(600);
  return getMockChatRefineReply(hw);
}

// TODO (backend): replace with axios.post("/api/studio/switch-hardware")
export async function switchHardware(hwLabel: string): Promise<ChatMessage> {
  await apiDelay(500);
  return getMockHwSwitchReply(hwLabel);
}

// TODO (backend): replace with axios.get("/api/studio/recent-campaigns")
export async function getRecentCampaigns(): Promise<RecentCampaign[]> {
  await apiDelay(300);
  return MOCK_RECENT_CAMPAIGNS;
}
