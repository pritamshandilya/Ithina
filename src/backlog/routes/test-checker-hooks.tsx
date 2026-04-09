/**
 * Test Page: Checker Hooks (Milestone 5)
 * 
 * This page tests all TanStack Query hooks for the Checker dashboard.
 * It verifies data fetching, caching, and mutation functionality.
 * 
 * Test Coverage:
 * - useStores: Fetch assigned stores
 * - useComplianceOverview: Fetch governance metrics
 * - usePendingAudits: Fetch review queue
 * - useNotifications: Fetch and manage notifications
 * - useRuleInfo: Fetch rule metadata
 * - useOverrideActivity: Fetch override metrics
 * - usePublishedAudits: Fetch publishing status
 * - useAuditActions: Test mutations (approve, return, override)
 * 
 * Navigation: http://localhost:5175/test-checker-hooks
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStores,
  useComplianceOverview,
  usePendingAudits,
  useNotifications,
  useRuleInfo,
  useOverrideActivity,
  usePublishedAudits,
  useApproveAudit,
  useReturnAudit,
  useOverrideAndApprove,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/queries/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { format } from "date-fns";

export const Route = createFileRoute("/test-checker-hooks")({
  component: TestCheckerHooks,
});

function TestCheckerHooks() {
  // Select first store by default
  const { data: stores, isLoading: storesLoading, error: storesError } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("store-1234");

  // Query hooks
  const {
    data: complianceData,
    isLoading: complianceLoading,
    error: complianceError,
  } = useComplianceOverview(selectedStoreId);

  const {
    data: audits,
    isLoading: auditsLoading,
    error: auditsError,
  } = usePendingAudits(selectedStoreId);

  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useNotifications(selectedStoreId);

  const {
    data: ruleInfo,
    isLoading: ruleInfoLoading,
    error: ruleInfoError,
  } = useRuleInfo(selectedStoreId);

  const {
    data: overrideActivity,
    isLoading: overrideLoading,
    error: overrideError,
  } = useOverrideActivity(selectedStoreId);

  const {
    data: publishedAudits,
    isLoading: publishedLoading,
    error: publishedError,
  } = usePublishedAudits(selectedStoreId);

  // Mutation hooks
  const approveAuditMutation = useApproveAudit(selectedStoreId);
  const returnAuditMutation = useReturnAudit(selectedStoreId);
  const overrideAndApproveMutation = useOverrideAndApprove(selectedStoreId);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Checker Hooks Test Page
          </h1>
          <p className="text-muted-foreground">
            Testing all TanStack Query hooks for Checker dashboard (Milestone 5)
          </p>
          <div className="rounded-lg bg-card/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-foreground">
              <strong>Mock User:</strong> {mockCheckerUser.firstName}{" "}
              {mockCheckerUser.lastName} ({mockCheckerUser.email})
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {mockCheckerUser.role}
            </p>
          </div>
        </div>

        {/* Store Selector */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            1. Store Selector (useStores)
          </h2>
          {storesLoading && <p className="text-muted-foreground">Loading stores...</p>}
          {storesError && <p className="text-destructive">Error: {String(storesError)}</p>}
          {stores && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Found {stores.length} store(s)
              </p>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Compliance Overview */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            2. Compliance Overview (useComplianceOverview)
          </h2>
          {complianceLoading && <p className="text-muted-foreground">Loading metrics...</p>}
          {complianceError && <p className="text-destructive">Error: {String(complianceError)}</p>}
          {complianceData && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {complianceData.totalPendingAudits}
                </p>
                <p className="text-xs text-muted-foreground">Pending Audits</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-destructive">
                  {complianceData.criticalAudits}
                </p>
                <p className="text-xs text-muted-foreground">Critical ({'<'}50%)</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {complianceData.avgComplianceScore}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Score (7d)</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {complianceData.totalApprovedToday}
                </p>
                <p className="text-xs text-muted-foreground">Approved Today</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {complianceData.totalOverridesToday}
                </p>
                <p className="text-xs text-muted-foreground">Overrides Today</p>
              </div>
            </div>
          )}
        </div>

        {/* Pending Audits */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            3. Pending Audits Queue (usePendingAudits)
          </h2>
          {auditsLoading && <p className="text-muted-foreground">Loading audits...</p>}
          {auditsError && <p className="text-destructive">Error: {String(auditsError)}</p>}
          {audits && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {audits.length} audit(s) pending review
              </p>
              <div className="space-y-2">
                {audits.slice(0, 3).map((audit) => (
                  <div
                    key={audit.id}
                    className="rounded-md bg-background p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">
                        {audit.shelfInfo.shelfName}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {audit.complianceScore}%
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submitted by: {audit.submittedByName} | Violations:{" "}
                      {audit.violationCount} | Mode: {audit.mode}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveAuditMutation.mutate(audit.id)}
                        disabled={approveAuditMutation.isPending}
                        className="rounded-md bg-chart-2 px-3 py-1 text-sm text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          returnAuditMutation.mutate({
                            auditId: audit.id,
                            reason: "Test rejection",
                          })
                        }
                        disabled={returnAuditMutation.isPending}
                        className="rounded-md bg-destructive px-3 py-1 text-sm text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Return
                      </button>
                      <button
                        onClick={() =>
                          overrideAndApproveMutation.mutate({
                            auditId: audit.id,
                            overrideReason: "Test override",
                          })
                        }
                        disabled={overrideAndApproveMutation.isPending}
                        className="rounded-md bg-[var(--checker-override)] px-3 py-1 text-sm text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Override & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            4. Notifications (useNotifications)
          </h2>
          {notificationsLoading && <p className="text-muted-foreground">Loading notifications...</p>}
          {notificationsError && <p className="text-destructive">Error: {String(notificationsError)}</p>}
          {notifications && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {notifications.filter((n) => !n.read).length} unread of{" "}
                  {notifications.length} total
                </p>
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Mark All Read
                </button>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-md p-4 ${
                      notification.read ? "bg-background/50" : "bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {notification.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.timestamp), "PPp")}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-xs text-primary hover:underline disabled:opacity-50"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rule Info */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            5. Rule Information (useRuleInfo)
          </h2>
          {ruleInfoLoading && <p className="text-muted-foreground">Loading rule info...</p>}
          {ruleInfoError && <p className="text-destructive">Error: {String(ruleInfoError)}</p>}
          {ruleInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {ruleInfo.activeRulesCount}
                </p>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-sm font-medium text-foreground">
                  {ruleInfo.currentVersion}
                </p>
                <p className="text-xs text-muted-foreground">Current Version</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(ruleInfo.lastModifiedDate), "PP")}
                </p>
                <p className="text-xs text-muted-foreground">Last Modified</p>
              </div>
            </div>
          )}
        </div>

        {/* Override Activity */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            6. Override Activity (useOverrideActivity)
          </h2>
          {overrideLoading && <p className="text-muted-foreground">Loading override data...</p>}
          {overrideError && <p className="text-destructive">Error: {String(overrideError)}</p>}
          {overrideActivity && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {overrideActivity.overridesToday}
                </p>
                <p className="text-xs text-muted-foreground">Overrides Today</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-2xl font-bold text-foreground">
                  {overrideActivity.overridesThisWeek}
                </p>
                <p className="text-xs text-muted-foreground">Overrides This Week</p>
              </div>
              <div className="rounded-md bg-background p-4">
                <p className="text-sm font-medium text-foreground">
                  {overrideActivity.topOverriddenRule}
                </p>
                <p className="text-xs text-muted-foreground">Top Overridden Rule</p>
              </div>
            </div>
          )}
        </div>

        {/* Published Audits */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            7. Published Audits (usePublishedAudits)
          </h2>
          {publishedLoading && <p className="text-muted-foreground">Loading published audits...</p>}
          {publishedError && <p className="text-destructive">Error: {String(publishedError)}</p>}
          {publishedAudits && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {publishedAudits.length} audit(s) published recently
              </p>
              <div className="space-y-2">
                {publishedAudits.slice(0, 3).map((audit) => (
                  <div
                    key={audit.auditId}
                    className="rounded-md bg-background p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{audit.shelfInfo.shelfName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(audit.publishedAt), "PPp")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        audit.status === "published"
                          ? "bg-chart-2/20 text-chart-2"
                          : audit.status === "failed"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mutation Status */}
        <div className="rounded-lg bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            8. Mutation Status
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Approve Audit:{" "}
              {approveAuditMutation.isPending
                ? "Loading..."
                : approveAuditMutation.isSuccess
                  ? "✅ Success"
                  : "Idle"}
            </p>
            <p className="text-muted-foreground">
              Return Audit:{" "}
              {returnAuditMutation.isPending
                ? "Loading..."
                : returnAuditMutation.isSuccess
                  ? "✅ Success"
                  : "Idle"}
            </p>
            <p className="text-muted-foreground">
              Override & Approve:{" "}
              {overrideAndApproveMutation.isPending
                ? "Loading..."
                : overrideAndApproveMutation.isSuccess
                  ? "✅ Success"
                  : "Idle"}
            </p>
            <p className="text-muted-foreground">
              Mark Notification Read:{" "}
              {markAsReadMutation.isPending
                ? "Loading..."
                : markAsReadMutation.isSuccess
                  ? "✅ Success"
                  : "Idle"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
