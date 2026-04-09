/**
 * Test Page: Compliance Overview Component
 * 
 * Route: /test-compliance-overview
 * 
 * Purpose: Visual testing and documentation for the ComplianceOverview component
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ComplianceOverview } from "@/components/checker";
import { generateMockComplianceOverview } from "@/lib/api/mock-data";
import { Button } from "@/components/ui/button";
import type { ComplianceOverview as ComplianceOverviewType } from "@/types/checker";

export const Route = createFileRoute("/test-compliance-overview")({
  component: TestComplianceOverviewPage,
});

function TestComplianceOverviewPage() {
  const [data, setData] = useState<ComplianceOverviewType>(
    generateMockComplianceOverview("store-1234")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockComplianceOverview("store-1234"));
      setIsLoading(false);
    }, 1000);
  };

  const handleToggleError = () => {
    setHasError(!hasError);
  };

  const handleSetCritical = () => {
    setData({
      ...data,
      criticalAudits: 5,
      avgComplianceScore: 45,
    });
  };

  const handleSetGood = () => {
    setData({
      ...data,
      criticalAudits: 0,
      avgComplianceScore: 92,
    });
  };

  const handleSetWithOverrides = () => {
    setData({
      ...data,
      totalOverridesToday: 3,
    });
  };

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">
            Compliance Overview Component
          </h1>
          <p className="text-muted-foreground">
            Test page for the five governance metric cards
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
            <Button onClick={handleSetCritical} variant="outline">
              Set Critical (5 critical, 45% avg)
            </Button>
            <Button onClick={handleSetGood} variant="outline">
              Set Good (0 critical, 92% avg)
            </Button>
            <Button onClick={handleSetWithOverrides} variant="outline">
              Set Overrides (3)
            </Button>
          </div>
        </div>

        {/* Live Component */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Live Component
          </h2>
          <ComplianceOverview
            data={hasError ? undefined : data}
            isLoading={isLoading}
            error={hasError ? new Error("Failed to fetch compliance data") : null}
          />
        </section>

        {/* Current Data */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Current Data
          </h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <pre className="text-sm text-muted-foreground overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </section>

        {/* Documentation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Component Documentation
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Five Metrics */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Five Governance Metrics:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>Total Pending Audits</strong> - Blue/Accent variant</li>
                <li><strong>Critical Audits</strong> - Red if greater than 0, pulsing animation</li>
                <li><strong>Average Compliance</strong> - Green if 80%+, Orange if 50-79%, Red if less than 50%</li>
                <li><strong>Approved Today</strong> - Green/Success variant</li>
                <li><strong>Overrides Today</strong> - Orange border if greater than 0</li>
              </ul>
            </div>

            {/* Metric 1: Pending */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <span 
                  className="inline-flex size-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--checker-primary)", color: "white" }}
                >
                  1
                </span>
                Total Pending Audits
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>ClipboardList icon</li>
                <li>Blue/Accent variant (checker-primary)</li>
                <li>Shows work awaiting review</li>
                <li>Description: "Awaiting your review"</li>
                <li>Main metric for workload visibility</li>
              </ul>
            </div>

            {/* Metric 2: Critical */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <span 
                  className="inline-flex size-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--checker-critical)", color: "white" }}
                >
                  2
                </span>
                Critical Audits
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>AlertTriangle icon</li>
                <li>Red border and background when count greater than 0</li>
                <li>Pulsing animation for attention</li>
                <li>Compliance below 50%</li>
                <li>Description: "Compliance below 50%"</li>
                <li>Trend: "Needs attention" when greater than 0</li>
              </ul>
            </div>

            {/* Metric 3: Average Score */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <span 
                  className="inline-flex size-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--checker-success)", color: "white" }}
                >
                  3
                </span>
                Average Compliance Score
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>TrendingUp icon</li>
                <li>Dynamic color based on score:</li>
                <li className="ml-6">Green (success) if 80% or higher</li>
                <li className="ml-6">Orange (warning) if 50-79%</li>
                <li className="ml-6">Red (default) if below 50%</li>
                <li>Shows performance trend</li>
                <li>Description: "Last 7 days average"</li>
                <li>Displayed with 1 decimal place</li>
              </ul>
            </div>

            {/* Metric 4: Approved */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <span 
                  className="inline-flex size-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--checker-success)", color: "white" }}
                >
                  4
                </span>
                Approved Today
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>CheckCircle icon</li>
                <li>Green/Success variant</li>
                <li>Daily productivity metric</li>
                <li>Description: "Audits approved today"</li>
                <li>Shows checker throughput</li>
              </ul>
            </div>

            {/* Metric 5: Overrides */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <span 
                  className="inline-flex size-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--checker-override)", color: "white" }}
                >
                  5
                </span>
                Overrides Today
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>ShieldAlert icon</li>
                <li>Orange border and text when count greater than 0</li>
                <li>Shows AI decision overrides</li>
                <li>Description: "AI decisions overridden"</li>
                <li>Governance transparency metric</li>
                <li>Helps track AI accuracy</li>
              </ul>
            </div>

            {/* Features */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Uses shared StatCard component</li>
                <li>Responsive grid: 1→2→5 columns</li>
                <li>Loading skeletons for each card</li>
                <li>Error state with destructive styling</li>
                <li>Dynamic color variants based on values</li>
                <li>Pulsing animation for critical alerts</li>
                <li>Auto-refresh ready (30s interval)</li>
              </ul>
            </div>

            {/* Color Coding */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Color Coding:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Pending: Blue (checker-primary)</li>
                <li>Critical: Red (checker-critical)</li>
                <li>Avg Score: Green/Orange/Red (dynamic)</li>
                <li>Approved: Green (checker-success)</li>
                <li>Overrides: Orange (checker-override)</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Accessibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>role="region" on container</li>
                <li>aria-label: "Compliance overview metrics"</li>
                <li>Icons with aria-hidden="true"</li>
                <li>Clear text labels on all cards</li>
                <li>Sufficient color contrast</li>
                <li>Descriptive text for context</li>
              </ul>
            </div>

            {/* Design Philosophy */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Design Philosophy:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Governance-focused, not analytical</li>
                <li>Operational clarity for decision-making</li>
                <li>No charts or deep analytics</li>
                <li>Simple, actionable numbers</li>
                <li>Visual hierarchy by importance</li>
                <li>Immediate attention to critical items</li>
              </ul>
            </div>

            {/* What's NOT Included */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                What's NOT Included (by design):
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Historical trends or charts</li>
                <li>Week/month comparisons</li>
                <li>Predictive analytics</li>
                <li>Heatmaps or visualizations</li>
                <li>Cross-store benchmarking</li>
                <li>Financial forecasting</li>
              </ul>
            </div>

            {/* Integration Notes */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-2">
                Integration Notes:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Data filtered by selected store</li>
                <li>Auto-refresh every 30 seconds</li>
                <li>Uses TanStack Query for caching</li>
                <li>Optimistic updates on actions</li>
                <li>Loading state during refetch</li>
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
              <code>{`import { ComplianceOverview } from "@/components/checker";
import { useComplianceOverview } from "@/queries/checker";

function CheckerDashboard() {
  const { data, isLoading, error } = useComplianceOverview(selectedStoreId);
  
  return (
    <ComplianceOverview
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Responsive Behavior */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Responsive Behavior
          </h2>
          <div className="rounded-lg bg-card border border-border p-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-card-foreground">
                  Mobile (default):
                </span>{" "}
                Single column, stacked vertically
              </p>
              <p>
                <span className="font-medium text-card-foreground">
                  Tablet (md):
                </span>{" "}
                2 columns for better space utilization
              </p>
              <p>
                <span className="font-medium text-card-foreground">
                  Desktop (lg+):
                </span>{" "}
                5 columns, all metrics visible at once
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
