import { useMemo } from "react";

import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { Shelf } from "@/types/maker";
import type { StoreFixtureApiModel } from "@/queries/checker/api/fixtures";

interface UseFixtureShelfRowsParams {
  fixtures: StoreFixtureApiModel[];
  shelves: Shelf[];
  ruleSets: ComplianceRuleSetSummary[];
  searchQuery: string;
  planogramNameById: Map<string, string>;
  fixturePlanogramOverrides: Record<string, string | null>;
  fixtureComplianceOverrides: Record<string, string>;
  fixtureCategorizeOverrides: Record<string, string>;
}

export function useFixtureShelfRows({
  fixtures,
  shelves,
  ruleSets,
  searchQuery,
  planogramNameById,
  fixturePlanogramOverrides,
  fixtureComplianceOverrides,
  fixtureCategorizeOverrides,
}: UseFixtureShelfRowsParams) {
  const shelvesByFixtureId = useMemo(() => {
    const map = new Map<string, Shelf[]>();
    shelves.forEach((shelf) => {
      if (!shelf.fixtureId) return;
      const arr = map.get(shelf.fixtureId) ?? [];
      arr.push(shelf);
      map.set(shelf.fixtureId, arr);
    });
    return map;
  }, [shelves]);

  const filteredFixtures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return fixtures;
    return fixtures.filter((fixture) => {
      const code = fixture.code?.toLowerCase() ?? "";
      const type = fixture.type.toLowerCase();
      const section = fixture.physical_location.section.toLowerCase();
      const aisle = fixture.physical_location.aisle.toLowerCase();
      const zone = fixture.physical_location.zone.toLowerCase();
      const planogramId = fixture.planogram_id?.toLowerCase() ?? "";
      const planogramName = planogramNameById.get(fixture.planogram_id ?? "")?.toLowerCase() ?? "";
      return (
        type.includes(query) ||
        code.includes(query) ||
        section.includes(query) ||
        aisle.includes(query) ||
        zone.includes(query) ||
        planogramId.includes(query) ||
        planogramName.includes(query)
      );
    });
  }, [fixtures, planogramNameById, searchQuery]);

  const defaultRuleSetName = useMemo(
    () => ruleSets.find((set) => set.isDefault)?.name ?? "Default Rules",
    [ruleSets],
  );

  const fixtureById = useMemo(
    () => new Map(filteredFixtures.map((fixture) => [fixture.id, fixture])),
    [filteredFixtures],
  );

  const effectivePlanogramByFixtureId = useMemo(() => {
    const map = new Map<string, string | null>();
    filteredFixtures.forEach((fixture) => {
      map.set(
        fixture.id,
        fixturePlanogramOverrides[fixture.id] ?? fixture.planogram_id ?? null,
      );
    });
    return map;
  }, [filteredFixtures, fixturePlanogramOverrides]);

  const fixtureShelfRows = useMemo(() => {
    return filteredFixtures.flatMap((fixture) => {
      const fixtureShelves = shelvesByFixtureId.get(fixture.id) ?? [];
      return fixtureShelves.map((shelf) => ({
        ...shelf,
        fixtureId: fixture.id,
        planogramId: effectivePlanogramByFixtureId.get(fixture.id) ?? undefined,
        complianceRuleSet: fixtureComplianceOverrides[fixture.id] ?? defaultRuleSetName,
        categorizeBy: fixtureCategorizeOverrides[fixture.id] ?? "By Category",
        fixtureType: fixture.type,
        zone: shelf.zone ?? fixture.physical_location.zone,
        section: shelf.section ?? fixture.physical_location.section,
        aisleCode: shelf.aisleCode ?? fixture.physical_location.aisle,
        dimensions:
          shelf.dimensions ??
          `${fixture.dimensions.width}×${fixture.dimensions.height}×${fixture.dimensions.depth} ${fixture.dimension_unit}`,
        productsCount: 0,
        issuesCount: 0,
      }));
    });
  }, [
    defaultRuleSetName,
    effectivePlanogramByFixtureId,
    filteredFixtures,
    fixtureCategorizeOverrides,
    fixtureComplianceOverrides,
    shelvesByFixtureId,
  ]);

  const rowIdToFixtureId = useMemo(() => {
    const map = new Map<string, string>();
    fixtureShelfRows.forEach((row) => {
      if (row.fixtureId) {
        map.set(row.id, row.fixtureId);
      }
    });
    return map;
  }, [fixtureShelfRows]);

  return {
    defaultRuleSetName,
    fixtureById,
    effectivePlanogramByFixtureId,
    fixtureShelfRows,
    rowIdToFixtureId,
    shelvesByFixtureId,
  };
}
