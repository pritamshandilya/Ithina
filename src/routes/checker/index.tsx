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
  PublishingStatusPanel,
} from "@/components/checker";
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
  const { data: stores, isLoading: storesLoading } = useStores();
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
        console.log("Navigate to audit:", notification.relatedId);
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
    <div className="min-h-screen">
      {/* Main container with max width for readability */}
      <div className="mx-auto max-w-[1920px]">
        {/* 1. Checker Header - Full width, no side padding */}
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

        {/* Main content area with padding */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* 2. Compliance Overview - 5 key governance metrics */}
          <section aria-labelledby="compliance-overview-heading">
            <h2 id="compliance-overview-heading" className="sr-only">
              Compliance Overview
            </h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 4. Knowledge Center Section - Spans 2 columns on large screens */}
            <section
              aria-labelledby="knowledge-center-heading"
              className="lg:col-span-2"
            >
              <h2 id="knowledge-center-heading" className="sr-only">
                Knowledge Center
              </h2>
              <KnowledgeCenterSection storeId={selectedStoreId} />
            </section>

            {/* Governance Transparency Panels - Stacked in 1 column */}
            <div className="space-y-8">
              {/* 5. Override Activity Panel */}
              <section aria-labelledby="override-activity-heading">
                <h2 id="override-activity-heading" className="sr-only">
                  Override Activity
                </h2>
                <OverrideActivityPanel storeId={selectedStoreId} />
              </section>

              {/* 6. Publishing Status Panel */}
              <section aria-labelledby="publishing-status-heading">
                <h2 id="publishing-status-heading" className="sr-only">
                  Publishing Status
                </h2>
                <PublishingStatusPanel storeId={selectedStoreId} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
