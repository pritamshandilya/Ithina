/**
 * Tailwind `aspect-*` classes matching ESL pixel canvases.
 * chroma29: 296×128, chroma42: 400×300.
 * Used so preview frames match hardware aspect and eliminate letterboxing.
 */
export function eslPreviewAspectClass(hardwareType: string | undefined | null): string {
  const hw = (hardwareType ?? "chroma29").toLowerCase().trim();
  if (hw === "chroma42") return "aspect-[400/300]";
  return "aspect-[296/128]";
}

/** Canvas pixel dimensions for a given ESL hardware type. */
export function eslCanvasDimensions(hardwareType: string | undefined | null): {
  width: number;
  height: number;
} {
  const hw = (hardwareType ?? "chroma29").toLowerCase().trim();
  if (hw === "chroma42") return { width: 400, height: 300 };
  return { width: 296, height: 128 };
}
