import { createFileRoute } from "@tanstack/react-router";

import { HeaderContextBar } from "@/components/maker";

/**
 * Test page for the HeaderContextBar component
 * Access at: /test-header
 */
export const Route = createFileRoute("/test-header")({
  component: TestHeader,
});

function TestHeader() {
  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Header Context Bar Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual testing for the HeaderContextBar component
          </p>
        </div>

        {/* Default Header */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Default Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Shows all information: User, Store, Date, and Online status
          </p>
          <HeaderContextBar showSyncStatus />
        </section>

        {/* Without Sync Status */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Without Sync Status
          </h2>
          <p className="text-sm text-muted-foreground">
            Hide the online/offline indicator
          </p>
          <HeaderContextBar showSyncStatus={false} />
        </section>

        {/* Responsive Behavior */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Responsive Behavior
          </h2>
          <p className="text-sm text-muted-foreground">
            Try resizing your browser window to see how the component adapts
          </p>

          <div className="space-y-6">
            {/* Desktop simulation */}
            <div>
              <p className="text-sm font-medium text-card-foreground mb-2">
                Desktop View (full width):
              </p>
              <HeaderContextBar showSyncStatus />
            </div>

            {/* Tablet simulation */}
            <div>
              <p className="text-sm font-medium text-card-foreground mb-2">
                Tablet View (768px):
              </p>
              <div className="max-w-[768px]">
                <HeaderContextBar showSyncStatus />
              </div>
            </div>

            {/* Mobile simulation */}
            <div>
              <p className="text-sm font-medium text-card-foreground mb-2">
                Mobile View (375px):
              </p>
              <div className="max-w-[375px]">
                <HeaderContextBar showSyncStatus />
              </div>
            </div>
          </div>
        </section>

        {/* Component Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="rounded-lg bg-card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                User Information:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Avatar with initials fallback</li>
                <li>Full name display</li>
                <li>Role indicator (capitalized)</li>
                <li>Truncates long names gracefully</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Store Information:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Store ID and location name</li>
                <li>Map pin icon for visual clarity</li>
                <li>Truncates long store names</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Date Display:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Current date in readable format</li>
                <li>Includes weekday, month, day, and year</li>
                <li>Calendar icon for visual clarity</li>
                <li>Updates automatically (refresh page to see)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Sync Status (Online Mode):
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Green pulsing dot indicator</li>
                <li>WiFi icon with green color</li>
                <li>"Online" text label</li>
                <li>Screen reader accessible</li>
                <li>UI-only for now (no actual offline detection)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Role="banner" for semantic HTML</li>
                <li>ARIA label for context</li>
                <li>Screen reader text for sync status</li>
                <li>Icon aria-hidden attributes</li>
                <li>Proper color contrast</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Responsive Design:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Wraps on small screens</li>
                <li>Vertical separators hidden on mobile</li>
                <li>Consistent spacing with gap utilities</li>
                <li>Truncates long text to prevent overflow</li>
                <li>Flex layout adapts to container width</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Integration Notes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Integration Notes
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-card-foreground">
                Current Implementation:
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Using mock user data from <code className="bg-muted px-1 py-0.5 rounded text-xs">mockUser</code>
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                Future Integration (TODO):
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-1">
                <li>Replace mockUser with real auth context (useAuth hook)</li>
                <li>Implement actual offline detection using navigator.onLine</li>
                <li>Add store selection dropdown (if user manages multiple stores)</li>
                <li>Sync pending changes count indicator</li>
                <li>Last sync timestamp display</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Usage Example
          </h2>

          <div className="rounded-lg bg-muted p-4">
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              <code>{`import { HeaderContextBar } from "@/components/maker";

function MakerDashboard() {
  return (
    <div className="min-h-screen bg-primary p-6">
      <HeaderContextBar />
      
      {/* Rest of dashboard content */}
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
