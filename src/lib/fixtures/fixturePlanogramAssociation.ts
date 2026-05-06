import { getFixturePlanogramAssociationsStorageKey } from "@/lib/fixtures/fixturePlanogramStorage";

/**
 * Frontend-only fixture ↔ planogram overrides (localStorage per store).
 *
 * When the API supports linking planograms to fixtures, replace this module
 * with server-backed reads/writes and delete localStorage usage. Search for:
 * `fixture-planogram-association`, `readFixturePlanogramOverridesFromStorage`,
 * or `VITE_LOCAL_FIXTURE_PLANOGRAM_OVERRIDES`.
 */
function localFixturePlanogramOverridesEnabled(): boolean {
  const v = import.meta.env.VITE_LOCAL_FIXTURE_PLANOGRAM_OVERRIDES;
  if (v === "false" || v === "0") return false;
  return true;
}

export function readFixturePlanogramOverridesFromStorage(
  storeId?: string | null,
): Record<string, string | null> {
  if (!localFixturePlanogramOverridesEnabled()) return {};
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      getFixturePlanogramAssociationsStorageKey(storeId),
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string | null>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Resolves the planogram id for a fixture: explicit local override wins when
 * present in storage; otherwise the server-provided value is used.
 */
export function getEffectiveFixturePlanogramId(params: {
  storeId?: string | null;
  fixtureId: string;
  serverPlanogramId?: string | null;
}): string | null {
  const { storeId, fixtureId, serverPlanogramId } = params;
  if (!fixtureId) return serverPlanogramId ?? null;
  const overrides = readFixturePlanogramOverridesFromStorage(storeId);
  if (Object.prototype.hasOwnProperty.call(overrides, fixtureId)) {
    const v = overrides[fixtureId];
    return v == null || v === "" ? null : v;
  }
  return serverPlanogramId ?? null;
}
