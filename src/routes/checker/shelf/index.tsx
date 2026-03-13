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

export function PlanogramAnalysisPage() {
  const location = useLocation();
  const params = useParams({ strict: false }) as any;

  const isAdmin = location.pathname.includes("/admin/");
  const storeId = params.storeId as string | undefined;

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
            <Link to={shelfNewPath as any} params={{ storeId } as any}>
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
