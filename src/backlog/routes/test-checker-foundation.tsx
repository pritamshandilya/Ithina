/**
 * Test Page: Checker Foundation - Milestone 1
 * 
 * Route: /test-checker-foundation
 * 
 * Purpose: Visual testing and verification of Checker foundation types and mock data
 */

import { createFileRoute } from "@tanstack/react-router";
import { 
  mockCheckerUser,
  generateMockStores,
  generateMockComplianceOverview,
  generateMockPendingAudits,
  generateMockNotifications,
  generateMockRuleInfo,
  generateMockOverrideActivity,
  generateMockPublishedAudits,
} from "@/lib/api/mock-data";

export const Route = createFileRoute("/test-checker-foundation")({
  component: TestCheckerFoundationPage,
});

function TestCheckerFoundationPage() {
  // Generate all mock data
  const stores = generateMockStores();
  const complianceOverview = generateMockComplianceOverview("store-1234");
  const pendingAudits = generateMockPendingAudits("store-1234");
  const notifications = generateMockNotifications("store-1234");
  const ruleInfo = generateMockRuleInfo("store-1234");
  const overrideActivity = generateMockOverrideActivity("store-1234");
  const publishedAudits = generateMockPublishedAudits("store-1234");

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">
            Checker Foundation - Milestone 1
          </h1>
          <p className="text-muted-foreground">
            Testing types, mock data, and color scheme for Checker Dashboard
          </p>
        </div>

        {/* Mock User */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Mock Checker User
          </h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <pre className="text-sm text-card-foreground overflow-x-auto">
              {JSON.stringify(mockCheckerUser, null, 2)}
            </pre>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              ✅ Email matches auth system: <code className="bg-muted px-2 py-1 rounded">checker@displaydata.com</code>
            </p>
          </div>
        </section>

        {/* Color Scheme */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Checker Color Scheme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-6 space-y-2">
              <div 
                className="h-16 rounded-md" 
                style={{ backgroundColor: "var(--checker-primary)" }}
              />
              <h3 className="font-semibold text-card-foreground">Primary (Blue)</h3>
              <p className="text-xs text-muted-foreground">Governance & Control</p>
              <code className="text-xs">--checker-primary</code>
            </div>

            <div className="rounded-lg border border-border p-6 space-y-2">
              <div 
                className="h-16 rounded-md" 
                style={{ backgroundColor: "var(--checker-critical)" }}
              />
              <h3 className="font-semibold text-card-foreground">Critical (Red)</h3>
              <p className="text-xs text-muted-foreground">Less than 50% compliance</p>
              <code className="text-xs">--checker-critical</code>
            </div>

            <div className="rounded-lg border border-border p-6 space-y-2">
              <div 
                className="h-16 rounded-md" 
                style={{ backgroundColor: "var(--checker-warning)" }}
              />
              <h3 className="font-semibold text-card-foreground">Warning (Orange)</h3>
              <p className="text-xs text-muted-foreground">Needs attention (50-79%)</p>
              <code className="text-xs">--checker-warning</code>
            </div>

            <div className="rounded-lg border border-border p-6 space-y-2">
              <div 
                className="h-16 rounded-md" 
                style={{ backgroundColor: "var(--checker-success)" }}
              />
              <h3 className="font-semibold text-card-foreground">Success (Green)</h3>
              <p className="text-xs text-muted-foreground">Approved & Good (80%+)</p>
              <code className="text-xs">--checker-success</code>
            </div>

            <div className="rounded-lg border border-border p-6 space-y-2">
              <div 
                className="h-16 rounded-md" 
                style={{ backgroundColor: "var(--checker-neutral)" }}
              />
              <h3 className="font-semibold text-card-foreground">Neutral (Gray)</h3>
              <p className="text-xs text-muted-foreground">Neutral states</p>
              <code className="text-xs">--checker-neutral</code>
            </div>

            <div className="rounded-lg border border-border p-6 space-y-2">
              <div 
                className="h-16 rounded-md" 
                style={{ backgroundColor: "var(--checker-override)" }}
              />
              <h3 className="font-semibold text-card-foreground">Override (Orange)</h3>
              <p className="text-xs text-muted-foreground">Override actions</p>
              <code className="text-xs">--checker-override</code>
            </div>
          </div>
        </section>

        {/* Stores */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Mock Stores ({stores.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div key={store.id} className="rounded-lg border border-border bg-card p-6 space-y-2">
                <h3 className="font-semibold text-card-foreground">{store.name}</h3>
                <p className="text-sm text-muted-foreground">{store.address}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Pending Audits:</span>
                  <span 
                    className="inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold"
                    style={{ 
                      backgroundColor: "var(--checker-primary)", 
                      color: "white" 
                    }}
                  >
                    {store.pendingAuditCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Compliance Overview Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-primary)" }}>
                {complianceOverview.totalPendingAudits}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-critical)" }}>
                {complianceOverview.criticalAudits}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-success)" }}>
                {complianceOverview.avgComplianceScore.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Approved Today</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-success)" }}>
                {complianceOverview.totalApprovedToday}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Overrides Today</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-override)" }}>
                {complianceOverview.totalOverridesToday}
              </p>
            </div>
          </div>
        </section>

        {/* Pending Audits */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Pending Audits ({pendingAudits.length})
          </h2>
          <div className="space-y-2">
            {pendingAudits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-card-foreground">
                      Aisle {audit.shelfInfo.aisleCode}, Bay {audit.shelfInfo.bayCode} - {audit.shelfInfo.shelfName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {audit.submittedByName} • {audit.mode === "vision-edge" ? "Vision Edge" : "Assist Mode"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Rule Version: {audit.ruleVersionUsed}</span>
                      <span>Violations: {audit.violationCount}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p 
                      className="text-2xl font-bold"
                      style={{ 
                        color: audit.complianceScore && audit.complianceScore < 50 
                          ? "var(--checker-critical)" 
                          : audit.complianceScore && audit.complianceScore < 80 
                          ? "var(--checker-warning)" 
                          : "var(--checker-success)" 
                      }}
                    >
                      {audit.complianceScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {audit.submittedAt
                        ? new Date(audit.submittedAt).toLocaleTimeString()
                        : "Not submitted"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Showing 5 of {pendingAudits.length} audits</p>
        </section>

        {/* Notifications */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Notifications ({notifications.length})
          </h2>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="rounded-lg border border-border bg-card p-4 flex items-start gap-3"
              >
                {!notification.read && (
                  <div 
                    className="size-2 rounded-full mt-2"
                    style={{ backgroundColor: "var(--checker-primary)" }}
                  />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleString()} • {notification.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rule Info */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Rule Information
          </h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <pre className="text-sm text-card-foreground overflow-x-auto">
              {JSON.stringify(ruleInfo, null, 2)}
            </pre>
          </div>
        </section>

        {/* Override Activity */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Override Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-override)" }}>
                {overrideActivity.overridesToday}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-3xl font-bold" style={{ color: "var(--checker-override)" }}>
                {overrideActivity.overridesThisWeek}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Top Override</p>
              <p className="text-lg font-semibold text-card-foreground">
                {overrideActivity.topOverriddenRule}
              </p>
              <p className="text-sm text-muted-foreground">
                {overrideActivity.topOverriddenCount} times
              </p>
            </div>
          </div>
        </section>

        {/* Published Audits */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Published Audits ({publishedAudits.length})
          </h2>
          <div className="space-y-2">
            {publishedAudits.map((published) => (
              <div 
                key={published.auditId} 
                className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-card-foreground">
                    Aisle {published.shelfInfo.aisleCode}, Bay {published.shelfInfo.bayCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(published.publishedAt).toLocaleString()}
                  </p>
                  {published.errorMessage && (
                    <p className="text-xs" style={{ color: "var(--checker-critical)" }}>
                      Error: {published.errorMessage}
                    </p>
                  )}
                </div>
                <span 
                  className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ 
                    backgroundColor: published.status === "published" 
                      ? "var(--checker-success)" 
                      : published.status === "failed" 
                      ? "var(--checker-critical)" 
                      : "var(--checker-warning)",
                    color: "white"
                  }}
                >
                  {published.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-lg bg-muted/50 p-6 space-y-4">
          <h2 className="text-xl font-bold text-card-foreground">
            Milestone 1 Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Types Created:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>CheckerAudit with 9+ fields</li>
                <li>ComplianceOverview (5 metrics)</li>
                <li>Store with multi-store support</li>
                <li>Notification system types</li>
                <li>RuleInfo for versioning</li>
                <li>OverrideActivity for transparency</li>
                <li>PublishedAudit for event bus</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Mock Data Generated:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>✅ Checker user (checker@displaydata.com)</li>
                <li>✅ 3 stores with audit counts</li>
                <li>✅ {pendingAudits.length} pending audits</li>
                <li>✅ {notifications.length} notifications</li>
                <li>✅ Rule info (v{ruleInfo.currentVersion})</li>
                <li>✅ Override activity metrics</li>
                <li>✅ {publishedAudits.length} published audits</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Next:</strong> Milestone 2 will build the Checker Header component with store selector and notifications dropdown using this foundation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
