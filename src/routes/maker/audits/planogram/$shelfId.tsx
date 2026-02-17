/**
 * Planogram Preview Route
 *
 * Visual preview of a saved planogram shelf.
 * Access at: /maker/audits/planogram/:shelfId
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanogramShelfPreview, useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/maker/audits/planogram/$shelfId")({
  component: PlanogramPreviewPage,
});

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  const { data: preview, isLoading, error } = usePlanogramShelfPreview(shelfId);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/maker/audits/planogram">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : error ? (
                <h1 className="text-2xl font-bold text-destructive">Error loading planogram</h1>
              ) : preview ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {preview.shelf.shelfName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {preview.planogramPayload.metadata?.location ?? "—"} ·{" "}
                    {preview.planogramPayload.metadata?.status ?? "active"}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">Planogram not found</h1>
              )}
            </div>
          </header>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive font-medium">Failed to load planogram</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This shelf may not have planogram data, or it could not be loaded.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/maker/audits/planogram">Back to list</Link>
              </Button>
            </div>
          )}

          {preview && !isLoading && (
            <div className="rounded-xl border border-border bg-card/80 p-6">
              <p className="text-sm text-muted-foreground">
                Planogram preview with stats and shelf layout coming in next milestones.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {preview.planogramPayload.planogram.fixture.shelfCount} shelves ·{" "}
                {preview.planogramPayload.metadata?.totalSKUs ?? 0} SKUs
              </p>
            </div>
          )}

          {!preview && !isLoading && !error && (
            <div className="rounded-xl border border-border bg-card/80 p-6 text-center">
              <p className="text-muted-foreground">Planogram not found.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/maker/audits/planogram">Back to list</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
