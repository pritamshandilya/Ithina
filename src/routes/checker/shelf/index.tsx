import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { CheckerShelfListPage } from "@/features/shelf/CheckerShelfListPage";

export const Route = createFileRoute("/checker/shelf/")({
  component: PlanogramAnalysisPage,
  meta: {
    layoutMode: "stickyTable",
  },
});

function getOptionalStoreId(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const { storeId } = params as { storeId?: unknown };
  return typeof storeId === "string" ? storeId : undefined;
}

function asRouterPath(path: string): never {
  return path as never;
}

function asRouterParams(params: Record<string, string | undefined>): never {
  return params as never;
}

export function PlanogramAnalysisPage() {
  const location = useLocation();
  const params = useParams({ strict: false });

  const isAdmin = location.pathname.includes("/admin/");
  const storeId = getOptionalStoreId(params);

  const shelfDetailPath = isAdmin
    ? "/admin/$storeId/shelf/$shelfId"
    : "/checker/shelf/$shelfId";
  const shelfNewPath = isAdmin
    ? "/admin/$storeId/shelf/new"
    : "/checker/shelf/new";
  const adhocNewPath = isAdmin
    ? "/admin/$storeId/audits/adhoc/new"
    : "/maker/audits/adhoc/new";
  const pogNewPath = isAdmin
    ? "/admin/$storeId/audits/planogram/new"
    : "/maker/audits/planogram/new";

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Shelves"
          description="Manage and monitor store shelf compliance."
        >
          <Button
            asChild
            className="bg-chart-2 text-white hover:opacity-90 shrink-0"
          >
            <Link to={asRouterPath(shelfNewPath)} params={asRouterParams({ storeId })}>
              <Plus className="size-4" aria-hidden />
              Add Shelf
            </Link>
          </Button>
        </PageHeader>
      }
    >
      <CheckerShelfListPage
        shelfDetailPath={shelfDetailPath}
        shelfNewPath={shelfNewPath}
        adhocNewPath={adhocNewPath}
        pogNewPath={pogNewPath}
      />
    </MainLayout>
  );
}
