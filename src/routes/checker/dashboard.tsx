import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import {
  AuditReviewQueue,
  CheckerHeader,
  ComplianceOverview,
  KnowledgeCenterSection,
  OverrideActivityPanel,
} from "@/components/checker";
import MainLayout from "@/components/layouts/main";
import {
  useComplianceOverview,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  usePendingAudits,
  useStores,
} from "@/features/checker/hooks";
import { mockCheckerUser } from "@/lib/api/mock-data";
import type { Notification } from "@/types/checker";

export const Route = createFileRoute("/checker/dashboard")({
  component: CheckerDashboard,
});

function CheckerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>(mockCheckerUser.storeId);

  const { data: complianceData, isLoading: complianceLoading, error: complianceError } =
    useComplianceOverview(selectedStoreId);
  const { data: audits, isLoading: auditsLoading, error: auditsError } =
    usePendingAudits(selectedStoreId);
  const { data: notifications } = useNotifications(selectedStoreId);

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleStoreChange = useCallback((storeId: string) => {
    setSelectedStoreId(storeId);
  }, []);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsRead.mutate(notification.id);
      }

      if (notification.type === "new_audit" || notification.type === "critical_audit") {
        console.log("Navigate to audit:", notification.auditId);
      } else if (notification.type === "rule_change") {
        console.log("Navigate to rule changes");
      }
    },
    [markAsRead]
  );

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsRead.mutate(notificationId);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleAuditClick = useCallback(
    (auditId: string) => {
      navigate({ to: "/checker/review/$auditId", params: { auditId } });
    },
    [navigate]
  );

  // Scroll to hash target when navigating with hash (e.g. sidebar links)
  useEffect(() => {
    const hash = location.hash?.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
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

          <section aria-labelledby="compliance-overview-heading">
            <ComplianceOverview
              data={complianceData}
              isLoading={complianceLoading}
              error={complianceError}
            />
          </section>

          <section aria-labelledby="audit-queue-heading">
            <div className="space-y-4">
              <div>
                <h2 id="audit-queue-heading" className="text-2xl font-bold text-foreground scroll-mt-24">
                  Audit Review Queue
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section aria-labelledby="knowledge-center-heading" className="lg:col-span-2">
              <KnowledgeCenterSection storeId={selectedStoreId} />
            </section>

            <div className="space-y-6">
              <section aria-labelledby="override-activity-heading">
                <OverrideActivityPanel storeId={selectedStoreId} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
