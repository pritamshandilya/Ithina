import { ESL_DEVICE, LCD_DEVICE } from "../components/nl-hardware-step-parts";
import type { HardwareDeviceId } from "@/types/wizard";

/** Same logic as `designReadyToProgress` in NlHardwareStep (design + at least one size). */
export function isNlScreensStepComplete(
  selectedDevices: HardwareDeviceId[],
  sizeByDevice: Record<HardwareDeviceId, string[]>,
  designConfigured: boolean,
): boolean {
  const eslOn = selectedDevices.includes(ESL_DEVICE);
  const lcdOn = selectedDevices.includes(LCD_DEVICE);
  const eslSizes = sizeByDevice[ESL_DEVICE] ?? [];
  const lcdSizes = sizeByDevice[LCD_DEVICE] ?? [];
  const hasAnySizeSelection =
    (eslOn ? eslSizes.length : 0) + (lcdOn ? lcdSizes.length : 0) > 0;
  return designConfigured && hasAnySizeSelection;
}
