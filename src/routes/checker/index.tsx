/**
 * Checker Dashboard Route
 * 
 * Main dashboard for store managers (checkers) to oversee governance and control.
 * This is a control-oriented dashboard focused on oversight, approval workflows,
 * and configuration authority rather than field operations.
 * 
 * Layout Structure:
 * 1. Checker Header - User, store selector, role badge, notifications, Knowledge Center access
 * 2. Compliance Overview - 5 key governance metrics
 * 3. Audit Review Queue - Main body with filtering, sorting, and search
 * 4. Knowledge Center Section - Rule management shortcuts
 * 5. Override Activity Panel - AI transparency metrics
 * 6. Publishing Status Panel - Event bus integration status
 * 
 * Key Differences from Maker Dashboard:
 * - Governance-focused, not task-focused
 * - Store selector (can manage multiple stores)
 * - Review and approval workflows
 * - Configuration authority (Knowledge Center)
 * - Transparency tracking (overrides, publishing)
 * 
 * Access at: /checker
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import {
  CheckerHeader,
  ComplianceOverview,
  AuditReviewQueue,
  KnowledgeCenterSection,
  OverrideActivityPanel,
  // PublishingStatusPanel, // Commented out - not in use for Phase 1
} from "@/components/checker";
import MainLayout from "@/components/layouts/main";
import {
  useStores,
  useComplianceOverview,
  usePendingAudits,
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/features/checker/hooks";
import { mockCheckerUser } from "@/lib/api/mock-data";
import type { Notification } from "@/types/checker";

export const Route = createFileRoute("/checker/")({
  component: CheckerDashboard,
});

function CheckerDashboard() {
  const navigate = useNavigate();

  // Store selection state
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    mockCheckerUser.storeId
  );

  // Fetch all data for selected store
  const { data: complianceData, isLoading: complianceLoading, error: complianceError } = 
    useComplianceOverview(selectedStoreId);
  
  const { data: audits, isLoading: auditsLoading, error: auditsError } = 
    usePendingAudits(selectedStoreId);
  
  const { data: notifications } = useNotifications(selectedStoreId);

  // Notification mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  /**
   * Handler for store selection change
   */
  const handleStoreChange = useCallback((storeId: string) => {
    setSelectedStoreId(storeId);
  }, []);

  /**
   * Handler for notification click
   * Marks notification as read and navigates if applicable
   */
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Mark as read
      if (!notification.read) {
        markAsRead.mutate(notification.id);
      }

      // Navigate based on notification type
      if (notification.type === "new_audit" || notification.type === "critical_audit") {
        // Navigate to audit review queue (already on this page, could scroll to queue)
        console.log("Navigate to audit:", notification.auditId);
      } else if (notification.type === "rule_change") {
        // Navigate to Knowledge Center (could be a dedicated route in Phase 2)
        console.log("Navigate to rule changes");
      }
    },
    [markAsRead]
  );

  /**
   * Handler for marking a notification as read
   */
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsRead.mutate(notificationId);
    },
    [markAsRead]
  );

  /**
   * Handler for marking all notifications as read
   */
  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  /**
   * Handler for audit card click in review queue
   * Navigates to dedicated review workspace
   */
  const handleAuditClick = useCallback(
    (auditId: string) => {
      navigate({ to: "/checker/review/$auditId", params: { auditId } });
    },
    [navigate]
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        {/* Main container with max width matching Maker dashboard */}
        <div className="mx-auto max-w-7xl space-y-6">
        {/* 1. Checker Header */}
        <CheckerHeader
          user={mockCheckerUser}
          stores={stores || []}
          selectedStoreId={selectedStoreId}
          onStoreChange={handleStoreChange}
          notifications={notifications || []}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* 2. Compliance Overview - 5 key governance metrics */}
        <section aria-labelledby="compliance-overview-heading">
          <ComplianceOverview
            data={complianceData}
            isLoading={complianceLoading}
            error={complianceError}
          />
        </section>

        {/* 3. Audit Review Queue - Main body */}
        <section aria-labelledby="audit-queue-heading">
          <div className="space-y-4">
            <div>
              <h2
                id="audit-queue-heading"
                className="text-2xl font-bold text-foreground"
              >
                Audit Review Queue
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review, approve, or return audits submitted by store workers
              </p>
            </div>

            <AuditReviewQueue
              audits={audits || []}
              isLoading={auditsLoading}
              error={auditsError}
              onAuditClick={handleAuditClick}
            />
          </div>
        </section>

        {/* Two-column layout for Knowledge Center and Governance Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 4. Knowledge Center Section - Spans 2 columns on large screens */}
          <section
            aria-labelledby="knowledge-center-heading"
            className="lg:col-span-2"
          >
            <KnowledgeCenterSection storeId={selectedStoreId} />
          </section>

          {/* Governance Transparency Panels - Stacked in 1 column */}
          <div className="space-y-6">
            {/* 5. Override Activity Panel */}
            <section aria-labelledby="override-activity-heading">
              <OverrideActivityPanel storeId={selectedStoreId} />
            </section>

            {/* 6. Publishing Status Panel - COMMENTED OUT */}
            {/* <section aria-labelledby="publishing-status-heading">
              <PublishingStatusPanel storeId={selectedStoreId} />
            </section> */}
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
