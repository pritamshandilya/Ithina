import type { StoreFixtureApiModel } from "@/queries/checker/api/fixtures";

export function groupByFixtureRow(row: { fixtureId?: string }) {
  return row.fixtureId ?? "ungrouped";
}

export function buildFixtureGroupHeader(
  fixtureById: Map<string, StoreFixtureApiModel>,
  value: string,
  count: number,
) {
  const fixture = fixtureById.get(value);
  const fixtureLabel = fixture
    ? `${fixture.code.trim()} (${fixture.type.trim()})`
    : "Fixture";
  const aisle = fixture?.physical_location.aisle ?? "—";
  const zone = fixture?.physical_location.zone ?? "—";
  const section = fixture?.physical_location.section ?? "—";
  return `
    <span class="fixture-group-header inline-flex items-center gap-2 py-1">
      <button
        type="button"
        class="fixture-group-label text-left hover:text-accent transition-colors"
        data-action="fixture-group-open"
        data-fixture-id="${value}"
      >
        ${fixtureLabel} (Aisle ${aisle} · Zone ${zone} · Section ${section})
      </button>
      <div class="flex items-center justify-end gap-2 w-full">
      <span class="fixture-group-count">${count} shelf${count === 1 ? "" : "s"}</span>
      <button
        type="button"
        class="inline-flex items-center rounded-md border border-border/60 bg-card/60 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-accent/50"
        data-action="fixture-group-menu"
        data-fixture-id="${value}"
        aria-label="Fixture actions"
      >
        Actions
      </button>
      </div>
    </span>
  `;
}
