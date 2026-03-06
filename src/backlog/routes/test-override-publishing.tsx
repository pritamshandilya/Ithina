/**
 * Test Page: Override & Publishing Panels (Milestone 7)
 * 
 * This page tests both governance transparency panels:
 * 1. Override Activity Panel - AI transparency metrics
 * 2. Publishing Status Panel - Event bus publishing status
 * 
 * Test Coverage:
 * - Override metrics (today, week, top rule)
 * - Published audits list with status badges
 * - Retry functionality for failed publishes
 * - Loading states and error handling
 * - Empty states
 * - Responsive layouts
 * - Integration with useOverrideActivity and usePublishedAudits hooks
 * 
 * Navigation: http://localhost:5173/test-override-publishing
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  OverrideActivityPanel,
  PublishingStatusPanel,
} from "@/components/checker";
import { useStores } from "@/queries/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/test-override-publishing")({
  component: TestOverridePublishing,
});

function TestOverridePublishing() {
  const { data: stores, isLoading: storesLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("store-1234");

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Override & Publishing Panels Test
          </h1>
          <p className="text-muted-foreground">
            Testing governance transparency panels for Checker dashboard
            (Milestone 7)
          </p>

          {/* User Context */}
          <div className="rounded-lg bg-card/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-foreground">
              <strong>Mock User:</strong> {mockCheckerUser.firstName}{" "}
              {mockCheckerUser.lastName} ({mockCheckerUser.email})
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {mockCheckerUser.role} (Governance
              Oversight)
            </p>
          </div>
        </div>

        {/* Store Selector */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Store Selection
          </h2>
          {storesLoading ? (
            <p className="text-muted-foreground">Loading stores...</p>
          ) : stores ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a store to view governance data:
              </p>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full max-w-md rounded-md border border-border bg-background px-4 py-2 text-foreground"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* Override Activity Panel */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            1. Override Activity Panel
          </h2>
          <OverrideActivityPanel storeId={selectedStoreId} />
        </div>

        {/* Publishing Status Panel */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            2. Publishing Status Panel
          </h2>
          <PublishingStatusPanel storeId={selectedStoreId} />
        </div>

        {/* Component Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Override Activity Features */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                🛡️ Override Activity Panel
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Overrides Today - Daily override count</li>
                <li>✅ Overrides This Week - Weekly total</li>
                <li>✅ Top Overridden Rule - Most frequent rule</li>
                <li>
                  ✅ Orange color scheme (checker-override)
                </li>
                <li>✅ Transparency notice about AI collaboration</li>
                <li>✅ Loading skeletons and error handling</li>
                <li>✅ Integrated with useOverrideActivity hook</li>
              </ul>
            </div>

            {/* Publishing Status Features */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                📤 Publishing Status Panel
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ List of recently published audits</li>
                <li>✅ Status badges (Published, Failed, Pending)</li>
                <li>✅ Color coding (Green, Red, Gray)</li>
                <li>✅ Timestamps with relative formatting</li>
                <li>✅ Event ID display for published audits</li>
                <li>✅ Retry button for failed publishes</li>
                <li>✅ Empty state when no audits</li>
                <li>✅ Summary footer with counts</li>
              </ul>
            </div>

            {/* Status Color Coding */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                🎨 Status Color Coding
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--checker-success)]" />
                  <span className="text-foreground">Published</span>
                  <span className="text-muted-foreground">
                    - Successfully sent to event bus
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="text-foreground">Failed</span>
                  <span className="text-muted-foreground">
                    - Publishing error, retry available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--checker-neutral)]" />
                  <span className="text-foreground">Pending</span>
                  <span className="text-muted-foreground">
                    - Awaiting publish
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--checker-override)]" />
                  <span className="text-foreground">Override</span>
                  <span className="text-muted-foreground">
                    - AI decision manually overridden
                  </span>
                </div>
              </div>
            </div>

            {/* Governance Transparency */}
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-foreground">
                🔍 Governance Transparency
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  ✅ Override tracking builds trust in AI decisions
                </li>
                <li>
                  ✅ High override rates indicate rule refinement needs
                </li>
                <li>
                  ✅ Publishing status ensures event bus reliability
                </li>
                <li>✅ Failed publishes are visible and retryable</li>
                <li>✅ Human oversight is tracked and accountable</li>
                <li>✅ Transparency notices explain purpose</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            🧪 Testing Instructions
          </h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">
                1. Override Activity Metrics
              </p>
              <p>
                Verify the three metrics display correctly: Overrides Today,
                Overrides This Week, and Top Overridden Rule. Check that the
                transparency notice explains the purpose of tracking overrides.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                2. Publishing Status List
              </p>
              <p>
                Confirm that recently published audits appear with correct
                status badges (Published, Failed, Pending). Verify color coding
                matches the status (green for published, red for failed, gray
                for pending).
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                3. Retry Functionality
              </p>
              <p>
                For any failed publishes, click the "Retry" button. Verify the
                console logs the retry action and displays a placeholder alert
                (Phase 2 implementation).
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                4. Timestamp Formatting
              </p>
              <p>
                Check that timestamps show relative time ("2 hours ago") and
                absolute time ("Jan 15, 3:45 PM"). For published audits, verify
                Event ID is displayed.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                5. Empty State
              </p>
              <p>
                If a store has no published audits, verify the empty state
                appears with an icon and helpful message.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                6. Store Switching
              </p>
              <p>
                Change the selected store and verify both panels refresh with
                new data for the selected store.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                7. Loading and Error States
              </p>
              <p>
                Verify loading skeletons appear during data fetch. Simulate an
                error (if possible) to see error state handling.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Notes */}
        <div className="rounded-lg border border-[var(--checker-primary)]/50 bg-[var(--checker-primary)]/10 p-6 backdrop-blur-sm">
          <h3 className="font-semibold text-foreground mb-2">
            🔗 Integration & Next Steps
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Data Hooks:</strong> Both
              panels use TanStack Query hooks (useOverrideActivity,
              usePublishedAudits) with automatic caching and refetching.
            </p>
            <p>
              <strong className="text-foreground">Phase 2 Features:</strong>{" "}
              Retry mutation will be implemented with optimistic updates and
              cache invalidation. Real-time event bus status updates via
              WebSocket.
            </p>
            <p>
              <strong className="text-foreground">Dashboard Integration:</strong>{" "}
              These panels will be integrated into the main Checker dashboard in
              Milestone 8, positioned below the audit review queue.
            </p>
          </div>
        </div>

        {/* Developer Notes */}
        <div className="rounded-lg border border-border bg-muted/30 p-6 backdrop-blur-sm space-y-3">
          <h3 className="font-semibold text-foreground">
            👨‍💻 Developer Notes
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Components:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <code className="text-xs bg-background px-2 py-0.5 rounded">
                  src/components/checker/override-activity-panel.tsx
                </code>
              </li>
              <li>
                <code className="text-xs bg-background px-2 py-0.5 rounded">
                  src/components/checker/publishing-status-panel.tsx
                </code>
              </li>
            </ul>
            <p className="mt-3">
              <strong className="text-foreground">Data Hooks:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <code className="text-xs bg-background px-2 py-0.5 rounded">
                  useOverrideActivity(storeId)
                </code>{" "}
                - 2min cache, refetch on focus
              </li>
              <li>
                <code className="text-xs bg-background px-2 py-0.5 rounded">
                  usePublishedAudits(storeId)
                </code>{" "}
                - 1min cache, refetch on focus
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
