import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import {
  AuditReviewQueue,
} from "@/components/checker";
import MainLayout from "@/components/layouts/main";
import {
  // useMarkNotificationAsRead,
  // useNotifications,
  usePendingAudits,
  // useStores,
} from "@/features/checker/hooks";
import { mockCheckerUser } from "@/lib/api/mock-data";
// import type { Notification } from "@/types/checker";
// import { useStore } from "@/providers/store";

export const Route = createFileRoute("/checker/audit-review")({
  component: CheckerAuditReviewPage,
});

function CheckerAuditReviewPage() {
  const navigate = useNavigate();
  // const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>(mockCheckerUser.storeId);

  const { data: audits, isLoading: auditsLoading, error: auditsError } =
    usePendingAudits(selectedStoreId);
  // const { data: notifications } = useNotifications(selectedStoreId);

  // const markAsRead = useMarkNotificationAsRead();

  // const handleNotificationClick = useCallback(
  //   (notification: Notification) => {
  //     if (!notification.read) {
  //       markAsRead.mutate(notification.id);
  //     }
  //     if (notification.type === "new_audit" || notification.type === "critical_audit") {
  //       navigate({ to: "/checker/review/$auditId", params: { auditId: notification.auditId } });
  //     } else if (notification.type === "rule_change") {
  //       navigate({ to: "/checker/knowledge-center" });
  //     }
  //   },
  //   [markAsRead, navigate]
  // );

  const handleAuditClick = useCallback(
    (auditId: string) => {
      navigate({ to: "/checker/review/$auditId", params: { auditId } });
    },
    [navigate]
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Audit Review</h1>
            <p className="text-sm text-muted-foreground">
              Review, approve, or return audits submitted by store workers
            </p>
          </header>

          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <AuditReviewQueue
              audits={audits || []}
              isLoading={auditsLoading}
              error={auditsError}
              onAuditClick={handleAuditClick}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
