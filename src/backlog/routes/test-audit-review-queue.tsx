/**
 * Test Page: Audit Review Queue Component
 * 
 * Route: /test-audit-review-queue
 * 
 * Purpose: Visual testing and documentation for the AuditReviewQueue component
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuditReviewQueue } from "@/components/checker";
import { generateMockPendingAudits } from "@/lib/api/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/test-audit-review-queue")({
  component: TestAuditReviewQueuePage,
});

function TestAuditReviewQueuePage() {
  const [audits, setAudits] = useState(generateMockPendingAudits("store-1234"));
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAudits(generateMockPendingAudits("store-1234"));
      setIsLoading(false);
    }, 1000);
  };

  const handleToggleError = () => {
    setHasError(!hasError);
  };

  const handleAuditClick = (auditId: string) => {
    console.log("Audit clicked:", auditId);
    alert(`Navigate to review page: /checker/review/${auditId}`);
  };

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">
            Audit Review Queue Component
          </h1>
          <p className="text-muted-foreground">
            Test page for the main audit queue with filtering and sorting
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Test Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button onClick={handleToggleError} variant="outline">
              {hasError ? "Clear Error" : "Show Error"}
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Total audits loaded: <span className="font-semibold text-card-foreground">{audits.length}</span></p>
          </div>
        </div>

        {/* Live Component */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Live Component
          </h2>
          <AuditReviewQueue
            audits={hasError ? undefined : audits}
            isLoading={isLoading}
            error={hasError ? new Error("Failed to fetch pending audits") : null}
            onAuditClick={handleAuditClick}
          />
        </section>

        {/* Documentation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Component Documentation
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Features */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Six filter tabs with badge counts</li>
                <li>Search by shelf ID or submitter name</li>
                <li>Six sort options (compliance, time, violations)</li>
                <li>Default sort: Lowest compliance first</li>
                <li>Responsive grid: 1→2→3 columns</li>
                <li>Loading skeletons</li>
                <li>Empty states with clear messages</li>
                <li>Result count display</li>
              </ul>
            </div>

            {/* Filter Options */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Filter Options:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>All Pending</strong>: Shows all audits (default)</li>
                <li><strong>Critical</strong>: Compliance less than 50%</li>
                <li><strong>Needs Attention</strong>: Compliance 50-79%</li>
                <li><strong>Good</strong>: Compliance 80% or higher</li>
                <li><strong>Vision Edge</strong>: AI camera mode only</li>
                <li><strong>Assist Mode</strong>: Manual entry mode only</li>
              </ul>
            </div>

            {/* Sort Options */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Sort Options:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>Lowest Compliance First</strong>: Default (most critical at top)</li>
                <li><strong>Highest Compliance First</strong>: Best scores at top</li>
                <li><strong>Newest First</strong>: Recently submitted</li>
                <li><strong>Oldest First</strong>: Waiting longest</li>
                <li><strong>Most Violations First</strong>: Most issues</li>
                <li><strong>Least Violations First</strong>: Fewest issues</li>
              </ul>
            </div>

            {/* Audit Card Features */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Audit Card Shows:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Shelf ID (Aisle X, Bay Y - Name)</li>
                <li>Large compliance score (color-coded)</li>
                <li>Submitter name with avatar</li>
                <li>Relative timestamp (e.g., "2 hours ago")</li>
                <li>Audit mode badge (Vision Edge / Assist)</li>
                <li>Rule version used</li>
                <li>Violation count with icon</li>
                <li>"Review Audit" button (blue)</li>
              </ul>
            </div>

            {/* Color Coding */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Color Coding:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Critical (less than 50%): Red border on card</li>
                <li>Warning (50-79%): Orange score</li>
                <li>Good (80%+): Green score</li>
                <li>Vision Edge badge: Blue background</li>
                <li>Assist Mode badge: Gray background</li>
                <li>Active filter: Blue background</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Entire card is clickable (role="button")</li>
                <li>Keyboard navigation (Tab, Enter, Space)</li>
                <li>Filter buttons with aria-pressed</li>
                <li>Search input with aria-label</li>
                <li>Sort select with aria-label</li>
                <li>Badge counts for screen readers</li>
                <li>Focus states on all interactive elements</li>
              </ul>
            </div>

            {/* User Flow */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                User Flow:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Checker sees queue sorted by lowest compliance</li>
                <li>Critical audits appear at top (red border)</li>
                <li>Can filter by status or mode</li>
                <li>Can search for specific shelves</li>
                <li>Can change sort order</li>
                <li>Clicks card or "Review" button</li>
                <li>Navigates to /checker/review/:auditId</li>
              </ol>
            </div>

            {/* Design Philosophy */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Design Philosophy:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Critical audits prioritized (default sort)</li>
                <li>Visual hierarchy by importance</li>
                <li>Quick triage with color coding</li>
                <li>All essential info visible</li>
                <li>One-click to review workspace</li>
                <li>Governance-focused, not analytical</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Usage Example
          </h2>
          <div className="rounded-lg bg-card border border-border p-6">
            <pre className="overflow-x-auto text-sm text-muted-foreground">
              <code>{`import { AuditReviewQueue } from "@/components/checker";
import { usePendingAudits } from "@/queries/checker";

function CheckerDashboard() {
  const { data: audits, isLoading, error } = usePendingAudits(storeId);
  
  return (
    <AuditReviewQueue
      audits={audits}
      isLoading={isLoading}
      error={error}
      onAuditClick={(auditId) => 
        navigate({ to: "/checker/review/$auditId", params: { auditId } })
      }
    />
  );
}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
