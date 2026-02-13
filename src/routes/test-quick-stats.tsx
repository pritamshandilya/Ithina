import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

import { QuickStatsPanel } from "@/components/maker";

/**
 * DEVELOPMENT ONLY
 * Test page for the QuickStatsPanel component
 * This can be removed before production deployment
 * Access at: /test-quick-stats
 */
export const Route = createFileRoute("/test-quick-stats")({
  component: TestQuickStats,
});

function TestQuickStats() {
  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quick Stats Panel Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visual testing for the QuickStatsPanel component
          </p>
        </div>

        {/* Default Panel */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Live Quick Stats Panel
          </h2>
          <p className="text-sm text-muted-foreground">
            Uses real TanStack Query hook with auto-refresh every 2 minutes
          </p>
          <QuickStatsPanel />
        </section>

        {/* Component Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Component Features
          </h2>

          <div className="rounded-lg bg-card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Three Key Metrics:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-card-foreground">Audits Submitted Today</span> - 
                  Daily productivity metric (green/success variant)
                </li>
                <li>
                  <span className="font-medium text-card-foreground">Pending Review</span> - 
                  Work awaiting checker approval (purple/accent variant)
                </li>
                <li>
                  <span className="font-medium text-card-foreground">Returned Audits</span> - 
                  Items requiring resubmission (red/warning if {'>'} 0, default if 0)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Data Source:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Uses <code className="bg-muted px-1 py-0.5 rounded text-xs">useQuickStats()</code> hook</li>
                <li>Auto-refetches every 2 minutes for fresh data</li>
                <li>Refetches on window focus (user returns to tab)</li>
                <li>Cached for 2 minutes (stale time)</li>
                <li>Shows loading skeletons during fetch</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Visual Design:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Uses StatCard component (reusable across app)</li>
                <li>Icons for quick visual scanning</li>
                <li>Color-coded by status (success/accent/warning)</li>
                <li>Responsive grid layout (1→2→3 columns)</li>
                <li>Large numbers for at-a-glance reading</li>
                <li>Descriptive text below each metric</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                State Management:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Loading: Shows 3 skeleton cards</li>
                <li>Error: Red alert with error message</li>
                <li>Success: Displays all three metrics</li>
                <li>Empty: Returns null (shouldn't happen with mock data)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Operational Focus (Not Analytical):
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>No charts or graphs - just key numbers</li>
                <li>No historical trends or comparisons</li>
                <li>No performance analytics or KPIs</li>
                <li>Focus: "What do I need to do today?"</li>
                <li>Action-oriented, not insight-oriented</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Metric Details */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Metric Details
          </h2>

          <div className="space-y-4">
            {/* Metric 1 */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <CheckCircleIcon 
                  className="size-5" 
                  style={{ color: "var(--maker-approved)" }}
                />
                Audits Submitted Today
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Counts audits submitted within the last 24 hours</li>
                <li>Resets at midnight (based on client timezone)</li>
                <li>Green color indicates productivity/success</li>
                <li>Positive reinforcement: "Keep up the great work!"</li>
                <li>Helps workers track daily progress</li>
              </ul>
            </div>

            {/* Metric 2 */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <ClockIcon 
                  className="size-5" 
                  style={{ color: "var(--maker-primary)" }}
                />
                Pending Review
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Shows audits submitted but not yet reviewed by checker</li>
                <li>Purple/accent color - neutral, informational</li>
                <li>Workers can't take action on these (checker's responsibility)</li>
                <li>Useful for understanding workload in pipeline</li>
                <li>Description: "Awaiting checker approval"</li>
              </ul>
            </div>

            {/* Metric 3 */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <AlertTriangleIcon 
                  className="size-5" 
                  style={{ color: "var(--maker-returned)" }}
                />
                Returned Audits
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Audits rejected by checker that need resubmission</li>
                <li>Red/warning color when count {'>'} 0 (requires attention)</li>
                <li>Default/neutral color when count = 0 (all clear)</li>
                <li>Dynamic description based on count</li>
                <li>Most important metric - indicates blocking work</li>
                <li>Links to Returned Audits section below</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Auto-Refresh Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Auto-Refresh Behavior
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              The Quick Stats Panel automatically refreshes to keep data current:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-card-foreground">Auto-refresh interval:</span> 
                Every 2 minutes (120 seconds)
              </li>
              <li>
                <span className="font-medium text-card-foreground">Window focus:</span> 
                Refetches when you return to the tab (try switching tabs and coming back)
              </li>
              <li>
                <span className="font-medium text-card-foreground">Stale time:</span> 
                Data considered fresh for 2 minutes
              </li>
              <li>
                <span className="font-medium text-card-foreground">Cache time:</span> 
                Cached for 5 minutes before garbage collection
              </li>
            </ul>
            <p className="text-xs text-muted-foreground pt-3 border-t border-border">
              This ensures workers always see up-to-date metrics without manual refresh.
            </p>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Usage Example
          </h2>

          <div className="rounded-lg bg-muted p-4">
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              <code>{`import { QuickStatsPanel } from "@/components/maker";

function MakerDashboard() {
  return (
    <div className="space-y-6">
      <HeaderContextBar />
      <PrimaryActionSection />
      <QuickStatsPanel />  {/* Simple drop-in */}
      <AssignedShelvesList />
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Design Philosophy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Design Philosophy
          </h2>

          <div className="rounded-lg bg-card border border-border p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-card-foreground">
                Why Keep It Simple?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Store workers need quick, actionable information - not analytics dashboards.
                Three numbers tell them everything they need to know:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>How productive was I today? (Audits submitted)</li>
                <li>What's in the pipeline? (Pending review)</li>
                <li>What needs my attention NOW? (Returned audits)</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-border">
              <h3 className="font-semibold text-card-foreground">
                What We Intentionally Avoided:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-1">
                <li>Charts and graphs (visual clutter)</li>
                <li>Historical trends (not actionable today)</li>
                <li>Week/month comparisons (too analytical)</li>
                <li>Average scores or KPIs (managerial metrics)</li>
                <li>Percentage calculations (cognitive overhead)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
