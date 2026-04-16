import type { Shelf } from "@/types/maker";

export interface FixtureAnalysisGroup {
  fixtureId: string;
  fixtureName: string;
  fixtureType?: string;
  zone?: string;
  section?: string;
  dimensions?: string;
  shelves: Shelf[];
}

export function getShelfFixtureId(shelf: Shelf): string {
  if (shelf.fixtureId && shelf.fixtureId.trim().length > 0) {
    return shelf.fixtureId;
  }

  const aisle = shelf.aisleCode ?? String(shelf.aisleNumber ?? "na");
  const bay = shelf.bayCode ?? String(shelf.bayNumber ?? "na");
  return `fixture-${aisle}-${bay}`.toLowerCase();
}

export function getFixtureDisplayName(
  _fixtureId: string,
  shelves: Shelf[],
): string {
  const firstShelf = shelves[0];
  const type = firstShelf?.fixtureType?.replace(/_/g, " ").trim();
  return type && type.length > 0 ? type : "Fixture";
}

export function groupShelvesByFixture(shelves: Shelf[]): FixtureAnalysisGroup[] {
  const grouped = new Map<string, Shelf[]>();
  for (const shelf of shelves) {
    const fixtureId = getShelfFixtureId(shelf);
    const existing = grouped.get(fixtureId) ?? [];
    existing.push(shelf);
    grouped.set(fixtureId, existing);
  }

  return [...grouped.entries()].map(([fixtureId, fixtureShelves]) => {
    const first = fixtureShelves[0];
    return {
      fixtureId,
      fixtureName: getFixtureDisplayName(fixtureId, fixtureShelves),
      fixtureType: first?.fixtureType,
      zone: first?.zone,
      section: first?.section,
      dimensions: first?.dimensions,
      shelves: fixtureShelves,
    };
  });
}
