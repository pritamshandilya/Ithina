import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { CheckerShelfListPage } from "@/features/shelf/CheckerShelfListPage";
import { ShelfTemplatesContent } from "@/features/shelf/ShelfTemplatesContent";

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
  const [activeTab, setActiveTab] = useState<"shelves" | "templates">("shelves");

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
          description={
            activeTab === "shelves"
              ? "Manage and monitor store shelf compliance."
              : "Create reusable shelf templates for this store."
          }
        >
          {activeTab === "shelves" && (
            <Button
              asChild
              className="bg-chart-2 text-white hover:opacity-90 shrink-0"
            >
              <Link to={asRouterPath(shelfNewPath)} params={asRouterParams({ storeId })}>
                <Plus className="size-4" aria-hidden />
                Add Shelf
              </Link>
            </Button>
          )}
        </PageHeader>
      }
    >
      <div className="px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-5 lg:px-2 lg:pt-4 lg:pb-6">
        <div className="mx-auto w-full max-w-screen-2xl">
          <div className="w-fit rounded-xl border border-border bg-background/40 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("shelves")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "shelves"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              Shelves
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "templates"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              Templates
            </button>
          </div>
        </div>
      </div>
      {activeTab === "shelves" ? (
        <CheckerShelfListPage
          shelfDetailPath={shelfDetailPath}
          shelfNewPath={shelfNewPath}
          adhocNewPath={adhocNewPath}
          pogNewPath={pogNewPath}
        />
      ) : (
        <div className="bg-primary px-2 pb-4 sm:px-2 sm:pb-4 lg:px-2 lg:pb-5">
          <div className="mx-auto w-full max-w-screen-2xl space-y-4">
            <ShelfTemplatesContent />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
