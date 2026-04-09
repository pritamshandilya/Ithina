import { createFileRoute } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared";
import {
  useAssignedShelves,
  useQuickStats,
  useReturnedAudits,
} from "@/queries/maker";

/**
 * Test page for verifying TanStack Query data layer
 * This route is temporary and can be deleted after verifying functionality
 * Access at: /test-data-layer
 */
export const Route = createFileRoute("/test-data-layer")({
  component: TestDataLayer,
});

function TestDataLayer() {
  const {
    data: shelves,
    isLoading: shelvesLoading,
    error: shelvesError,
  } = useAssignedShelves();

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuickStats();

  const {
    data: returnedAudits = [],
    isLoading: returnedLoading,
    error: returnedError,
  } = useReturnedAudits();

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Data Layer Test (TanStack Query)
          </h1>
          <p className="mt-2 text-muted-foreground">
            Testing API functions and React Query hooks with mock data
          </p>
        </div>

        {/* Quick Stats Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Quick Stats Hook (useQuickStats)
          </h2>

          {statsLoading && (
            <div className="rounded-lg bg-card p-6">
              <Skeleton className="h-8 w-32" />
            </div>
          )}

          {statsError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive p-6 text-destructive">
              Error loading stats: {(statsError as Error).message}
            </div>
          )}

          {stats && (
            <div className="rounded-lg bg-card p-6 space-y-2">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Audits Submitted Today
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.auditsSubmittedToday}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {stats.pendingReviewCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Returned Audits
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--maker-returned)" }}>
                    {stats.returnedAuditsCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Assigned Shelves Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Assigned Shelves Hook (useAssignedShelves)
          </h2>

          {shelvesLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg bg-card p-4 space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          )}

          {shelvesError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive p-6 text-destructive">
              Error loading shelves: {(shelvesError as Error).message}
            </div>
          )}

          {shelves && (
            <>
              <div className="rounded-lg bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Total Shelves: <span className="font-bold text-foreground">{shelves.length}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Never Audited:{" "}
                  <span className="font-bold text-foreground">
                    {shelves.filter((s) => s.status === "never-audited").length}
                  </span>
                  , Pending:{" "}
                  <span className="font-bold text-foreground">
                    {shelves.filter((s) => s.status === "pending").length}
                  </span>
                  , Approved:{" "}
                  <span className="font-bold text-foreground">
                    {shelves.filter((s) => s.status === "approved").length}
                  </span>
                  , Returned:{" "}
                  <span className="font-bold text-foreground">
                    {shelves.filter((s) => s.status === "returned").length}
                  </span>
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shelves.map((shelf) => (
                  <div
                    key={shelf.id}
                    className="rounded-lg bg-card border border-border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          Aisle {shelf.aisleNumber} - Bay {shelf.bayNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {shelf.shelfName}
                        </p>
                      </div>
                      <StatusBadge status={shelf.status} size="sm" />
                    </div>

                    {shelf.lastAuditDate && (
                      <p className="text-xs text-muted-foreground">
                        Last audit:{" "}
                        {new Date(shelf.lastAuditDate).toLocaleDateString()}
                      </p>
                    )}

                    {shelf.complianceScore !== undefined && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Compliance Score
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{
                            color:
                              shelf.complianceScore >= 90
                                ? "var(--maker-approved)"
                                : shelf.complianceScore >= 75
                                  ? "var(--accent)"
                                  : "var(--maker-returned)",
                          }}
                        >
                          {shelf.complianceScore}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Returned Audits Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Returned Audits Hook (useReturnedAudits)
          </h2>

          {returnedLoading && (
            <div className="rounded-lg bg-card p-4">
              <Skeleton className="h-6 w-full" />
            </div>
          )}

          {returnedError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive p-6 text-destructive">
              Error loading returned audits: {(returnedError as Error).message}
            </div>
          )}

          {returnedAudits.length === 0 && !returnedLoading && (
            <div className="rounded-lg bg-card p-6 text-center">
              <p className="text-muted-foreground">
                No returned audits - All clear! 🎉
              </p>
            </div>
          )}

          {returnedAudits.length > 0 && (
            <div
              className="rounded-lg border p-6 space-y-4"
              style={{
                backgroundColor: "color-mix(in oklch, var(--maker-returned) 5%, var(--card))",
                borderColor: "color-mix(in oklch, var(--maker-returned) 30%, transparent)",
              }}
            >
              <p className="font-semibold" style={{ color: "var(--maker-returned)" }}>
                ⚠️ {returnedAudits.length} Audit(s) Requiring Attention
              </p>

              {returnedAudits.map((audit) => {
                const shelf = shelves?.find((s) => s.id === audit.shelfId);
                return (
                  <div
                    key={audit.id}
                    className="rounded-lg bg-card border border-border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {shelf
                            ? `${shelf.shelfName} (Aisle ${shelf.aisleNumber})`
                            : audit.shelfId}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Returned{" "}
                          {audit.rejectedAt &&
                            new Date(audit.rejectedAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status="returned" size="sm" />
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-medium text-card-foreground">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {audit.rejectionReason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Cache Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Caching Information
          </h2>
          <div className="rounded-lg bg-card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                TanStack Query Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Automatic caching with configurable stale times</li>
                <li>Refetch on window focus (try switching tabs and coming back)</li>
                <li>Auto-refetch for stats every 2 minutes</li>
                <li>Loading and error states handled automatically</li>
                <li>Type-safe with TypeScript</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-card-foreground mb-2">
                Stale Times:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Quick Stats: 2 minutes (refreshes automatically)</li>
                <li>Assigned Shelves: 5 minutes</li>
                <li>Returned Audits: 3 minutes</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
