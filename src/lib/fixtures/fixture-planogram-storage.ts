/** localStorage key base for frontend-only fixture ↔ planogram associations */
export const FIXTURE_PLANOGRAM_ASSOCIATIONS_STORAGE_KEY =
  "checker-fixture-planogram-associations";

export function getFixturePlanogramAssociationsStorageKey(
  storeId?: string | null,
): string {
  return storeId
    ? `${FIXTURE_PLANOGRAM_ASSOCIATIONS_STORAGE_KEY}:${storeId}`
    : FIXTURE_PLANOGRAM_ASSOCIATIONS_STORAGE_KEY;
}
