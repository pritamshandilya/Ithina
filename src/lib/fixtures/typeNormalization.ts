const FIXTURE_TYPE_ALIASES: Record<string, string> = {
  gondola: "gondola",
  gondolastandard: "gondola",
  standardgondola: "gondola",
  wallshelving: "wall-unit",
  wallunit: "wall-unit",
  endcap: "end-cap",
  endcaps: "end-cap",
  checkoutlane: "checkout-lane",
  cooler: "cooler-chiller",
  chiller: "cooler-chiller",
  coolerchiller: "cooler-chiller",
  freezer: "freezer",
};

export function fixtureTypeKey(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_\s/-]+/g, "")
    .replace(/[^a-z0-9]/g, "");

  if (!normalized) return "";
  return FIXTURE_TYPE_ALIASES[normalized] ?? normalized;
}
