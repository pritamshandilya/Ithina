import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { CheckerShelfListPage } from "@/features/shelf/CheckerShelfListPage";
import {
  ShelvesPageTabs,
  type ShelvesPageTabId,
} from "@/features/shelf/shelves-page-tabs";
import { ShelfTemplatesContent } from "@/features/shelf/ShelfTemplatesContent";
import { useStore } from "@/providers/store";

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
  const { selectedStore } = useStore();
  const [activeTab, setActiveTab] = useState<ShelvesPageTabId>("shelves");

  const isAdmin = location.pathname.includes("/admin/");
  const storeId =
    getOptionalStoreId(params) ?? (isAdmin ? selectedStore?.id : undefined);

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

  const pageDescription =
    activeTab === "shelves"
      ? "Manage and monitor store shelf compliance."
      : "Preset fixture layouts and dimensions—same templates as in Store Defaults.";

  return (
    <MainLayout
      pageHeader={
        <PageHeader title="Shelves" description={pageDescription}>
          {activeTab === "shelves" ? (
            <Button
              asChild
              className="bg-chart-2 text-white hover:opacity-90 shrink-0"
            >
              <Link
                to={asRouterPath(shelfNewPath)}
                params={asRouterParams({ storeId })}
              >
                <Plus className="size-4" aria-hidden />
                Add Shelf
              </Link>
            </Button>
          ) : null}
        </PageHeader>
      }
    >
      <div className="mx-auto max-w-screen-2xl px-2 pb-10 pt-4 sm:px-4">
        <ShelvesPageTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          shelvesPanel={
            <CheckerShelfListPage
              shelfDetailPath={shelfDetailPath}
              shelfNewPath={shelfNewPath}
              adhocNewPath={adhocNewPath}
              pogNewPath={pogNewPath}
            />
          }
          templatesPanel={<ShelfTemplatesContent showHeaderCard />}
        />
      </div>
    </MainLayout>
  );
}
