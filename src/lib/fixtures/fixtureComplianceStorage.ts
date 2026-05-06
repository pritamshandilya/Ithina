/** localStorage key base for frontend-only fixture ↔ compliance rule set associations */
export const FIXTURE_COMPLIANCE_ASSOCIATIONS_STORAGE_KEY =
  "checker-fixture-compliance-associations";

export function getFixtureComplianceAssociationsStorageKey(
  storeId?: string | null,
): string {
  return storeId
    ? `${FIXTURE_COMPLIANCE_ASSOCIATIONS_STORAGE_KEY}:${storeId}`
    : FIXTURE_COMPLIANCE_ASSOCIATIONS_STORAGE_KEY;
}
