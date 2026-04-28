import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";

import { AnalysisFlowPage } from "@/components/maker/analysis-flow-page";
import { useStoreFixtures } from "@/queries/maker";

export const Route = createFileRoute("/maker/audits/adhoc/new/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      fixtureId:
        (search.fixtureId as string) || (search.shelfId as string) || undefined,
      from: (search.from as string) || undefined,
    };
  },
  component: NewAdhocAnalysisPage,
});

function defaultBackPathForAdhocNew(pathname: string): string {
  const marker = "/audits/adhoc/new";
  const i = pathname.indexOf(marker);
  if (i >= 0 && pathname.includes("/admin/")) {
    return `${pathname.slice(0, i)}/shelf`;
  }
  return "/maker/audits/adhoc";
}

export function NewAdhocAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = Route.useSearch();
  const fixtureId = search.fixtureId;
  const fromState = (location.state as { from?: string } | undefined)?.from;
  const backTo =
    search.from ?? fromState ?? defaultBackPathForAdhocNew(location.pathname);

  const { data: fixtures = [] } = useStoreFixtures();
  const fixtureOptions = fixtures.map((fixture) => ({
    id: fixture.id,
    code: fixture.code,
    fixtureName: fixture.type,
  }));
  const isFixtureLocked = Boolean(fixtureId && search.from);

  const handleFixtureSelect = (nextFixtureId: string) => {
    void navigate({
      to: "/maker/audits/adhoc/new",
      search: (prev: { fixtureId?: string; from?: string }) => ({
        ...prev,
        fixtureId: nextFixtureId || undefined,
      }),
      replace: true,
    });
  };

  return (
    <AnalysisFlowPage
      title="New Adhoc Analysis"
      backTo={backTo}
      analysisType="ADHOC"
      showFixtureSelection
      selectedFixtureId={fixtureId ?? ""}
      onFixtureSelect={handleFixtureSelect}
      fixtures={fixtureOptions}
      isFixtureSelectionLocked={isFixtureLocked}
    />
  );
}
