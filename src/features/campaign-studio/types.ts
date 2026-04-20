import type { ApiCampaignEventResponse, LayoutVariant } from "@/types/api/campaigns";

export type StudioPhase = "generating" | "preview" | "submitted" | "failed";

export interface GroupedVariant {
  variantId: string;
  images: Record<string, LayoutVariant>;
}

const variantCompositeKey = (v: Pick<LayoutVariant, "variant_id" | "hardware_type">) =>
  `${v.variant_id}::${v.hardware_type}`;

/** Normalize API `variants` field: array, or plain object map of rows. */
function normalizeIncomingVariants(incoming: unknown): LayoutVariant[] {
  if (Array.isArray(incoming)) return incoming as LayoutVariant[];
  if (incoming != null && typeof incoming === "object") {
    const vals = Object.values(incoming as Record<string, unknown>);
    if (
      vals.length > 0 &&
      vals.every((x) => x != null && typeof x === "object" && !Array.isArray(x))
    ) {
      return vals as LayoutVariant[];
    }
  }
  return [];
}

/**
 * Merge incoming layout rows into previous state by variant_id + hardware_type.
 * Preserves image_url (and other fields) when the API sends partial rows (e.g. only `elements`).
 */
export function mergeLayoutVariants(
  prev: LayoutVariant[] | unknown,
  incoming: LayoutVariant[] | unknown,
): LayoutVariant[] {
  const safePrev = Array.isArray(prev) ? prev : [];
  const list = normalizeIncomingVariants(incoming);
  if (list.length === 0 && !Array.isArray(incoming)) {
    return safePrev.map((v) => ({ ...v }));
  }

  const map = new Map<string, LayoutVariant>();
  for (const v of safePrev) {
    if (v.variant_id && v.hardware_type) {
      map.set(variantCompositeKey(v), { ...v });
    }
  }
  for (const inc of list) {
    if (!inc.variant_id || !inc.hardware_type) continue;
    const k = variantCompositeKey(inc);
    const existing = map.get(k);
    const hasNewImage =
      inc.image_url != null && String(inc.image_url).trim() !== "";
    const merged: LayoutVariant = {
      variant_id: inc.variant_id,
      hardware_type: inc.hardware_type,
      elements: inc.elements !== undefined ? inc.elements : existing?.elements,
      background_candidates:
        inc.background_candidates !== undefined
          ? inc.background_candidates
          : existing?.background_candidates,
      image_url: hasNewImage ? inc.image_url : existing?.image_url,
    };
    map.set(k, merged);
  }
  return Array.from(map.values());
}

export function extractVariantsFromEvents(
  events: ApiCampaignEventResponse[] | unknown,
): LayoutVariant[] {
  if (!Array.isArray(events)) return [];
  const layoutEvents = events.filter(
    (e) =>
      e.event_type === "layout_generated" || e.event_type === "layout_refined",
  );
  const sorted = [...layoutEvents].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  let merged: LayoutVariant[] = [];
  for (const ev of sorted) {
    const raw = ev.payload_snapshot?.variants;
    if (raw == null) continue;
    merged = mergeLayoutVariants(merged, raw);
  }
  return merged;
}

export function groupVariantsByLetter(
  variants: LayoutVariant[] | unknown,
): GroupedVariant[] {
  if (!Array.isArray(variants)) return [];
  const map = new Map<string, Record<string, LayoutVariant>>();
  for (const v of variants) {
    if (!v?.variant_id || !v?.hardware_type) continue;
    const existing = map.get(v.variant_id) ?? {};
    existing[v.hardware_type] = v;
    map.set(v.variant_id, existing);
  }
  return Array.from(map.entries()).map(([variantId, images]) => ({
    variantId,
    images,
  }));
}

export function getSubmittedVariantId(
  events: ApiCampaignEventResponse[] | unknown,
): string | null {
  if (!Array.isArray(events)) return null;
  const submitEvent = [...events]
    .reverse()
    .find((e) => e.event_type === "submitted_for_approval");
  if (!submitEvent?.payload_snapshot) return null;
  return (
    (submitEvent.payload_snapshot.selected_variant_id as string) ?? null
  );
}

export function hasEventType(
  events: ApiCampaignEventResponse[] | unknown,
  type: string,
): boolean {
  if (!Array.isArray(events)) return false;
  return events.some((e) => e.event_type === type);
}
