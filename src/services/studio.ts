import {
  getMockChatRefineReply,
  getMockHwSwitchReply,
  MOCK_ASSET_INFO,
  MOCK_COMPLIANCE_CHECKS,
  MOCK_ESL_RENDERER_SPEC,
  MOCK_HW_OPTIONS,
  MOCK_INITIAL_MESSAGE,
  MOCK_LCD_RENDERER_SPEC,
  MOCK_VARIANTS,
} from "@/mocks/studio";
import type {
  AssetInfo,
  ChatMessage,
  ComplianceCheck,
  HardwareDeviceId,
  HwOption,
  LayoutVariant,
  RendererSpec,
  VariantId,
} from "@/types/studio";

export async function getHwOptions(): Promise<HwOption[]> {
  return MOCK_HW_OPTIONS;
}

export async function getLayoutVariants(): Promise<LayoutVariant[]> {
  return MOCK_VARIANTS;
}

export async function getComplianceChecks(): Promise<ComplianceCheck[]> {
  return MOCK_COMPLIANCE_CHECKS;
}

export async function getRendererSpec(hw: HardwareDeviceId): Promise<RendererSpec> {
  return hw === "lcd" ? MOCK_LCD_RENDERER_SPEC : { ...MOCK_ESL_RENDERER_SPEC, targetDisplay: `Chroma ${hw === "chroma42" ? "42" : "29"}` };
}

export async function getAssetInfo(): Promise<AssetInfo> {
  return MOCK_ASSET_INFO;
}

export async function getInitialMessage(): Promise<ChatMessage> {
  return MOCK_INITIAL_MESSAGE;
}

export async function selectVariant(id: VariantId): Promise<{ user: ChatMessage; ai: ChatMessage }> {
  return {
    user: { role: "user", text: `I'll proceed with Variant ${id}.` },
    ai: { role: "ai", text: `Loaded Variant ${id} into the canvas. You can refine this layout using natural language below.` },
  };
}

export async function submitChatRefine(
  _userText: string,
  hw: HardwareDeviceId,
): Promise<ChatMessage> {
  return getMockChatRefineReply(hw);
}

export async function switchHardware(hwLabel: string): Promise<ChatMessage> {
  return getMockHwSwitchReply(hwLabel);
}
