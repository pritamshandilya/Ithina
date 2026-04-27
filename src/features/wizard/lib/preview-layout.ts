import type { LayoutVariant } from "@/types/api/campaigns";

/** Same mapping as `buildHardwareTargetsForApi` in wizard/index.tsx */
export const ESL_SIZE_LABEL_TO_HARDWARE: Record<string, string> = {
  '1.54"': "chroma15",
  '2.13"': "chroma21",
  '2.9"': "chroma29",
  '4.2"': "chroma42",
  '5.83"': "chroma58",
  '7.5"': "chroma75",
};

export function firstEslHardwareFromSizes(eslSizeLabels: string[]): string | null {
  if (eslSizeLabels.length === 0) return null;
  return ESL_SIZE_LABEL_TO_HARDWARE[eslSizeLabels[0]] ?? null;
}

const DEFAULT_API_BASE =
  (import.meta.env.VITE_PROMO_API_URL as string | undefined) ??
  "https://backend.promo.creativebits.tech";

export function defaultPromoApiBase(): string {
  return DEFAULT_API_BASE;
}

/**
 * Picks the `LayoutVariant` row for Step 2 / modal preview: match variant letter,
 * prefer hardware-specific row for ESL when `hardwareSlug` is known.
 */
export function resolveWizardPreviewLayout(
  variants: LayoutVariant[] | undefined | null,
  variantLetter: string,
  hardwareSlug: string | null,
  isLcd: boolean,
): LayoutVariant | null {
  if (!variants?.length) return null;
  if (isLcd) {
    const lcd =
      variants.find((v) => v.variant_id === variantLetter && v.hardware_type === "lcd") ??
      variants.find((v) => v.variant_id === variantLetter);
    return lcd ?? null;
  }
  if (hardwareSlug) {
    const exact = variants.find(
      (v) => v.variant_id === variantLetter && v.hardware_type === hardwareSlug,
    );
    if (exact) return exact;
  }
  return (
    variants.find(
      (v) => v.variant_id === variantLetter && v.hardware_type && v.hardware_type !== "lcd",
    ) ?? variants.find((v) => v.variant_id === variantLetter) ?? null
  );
}

export function absoluteCampaignAssetUrl(
  path: string | null | undefined,
  apiBaseUrl: string,
): string | null {
  if (path == null || String(path).trim() === "") return null;
  const s = String(path).trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${apiBaseUrl}${s.startsWith("/") ? s : `/${s}`}`;
}

export function previewUrlWithCacheBuster(
  path: string | null | undefined,
  apiBaseUrl: string,
  imageCacheBuster: number,
): string | null {
  const base = absoluteCampaignAssetUrl(path, apiBaseUrl);
  if (!base) return null;
  return imageCacheBuster > 0 ? `${base}?v=${imageCacheBuster}` : base;
}
