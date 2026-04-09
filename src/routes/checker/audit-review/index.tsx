import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import {
  AuditReviewQueue,
} from "@/components/checker";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import {
  // useMarkNotificationAsRead,
  // useNotifications,
  usePendingAudits,
  useApproveAudit,
  useReturnAudit,
  useDeleteAudit,
  // useStores,
} from "@/queries/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";

export const Route = createFileRoute("/checker/audit-review/")({
  component: CheckerAuditReviewPage,
});

export function CheckerAuditReviewPage() {
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();
  const { selectedStore } = useStore();
  // const { data: stores } = useStores();
  const selectedStoreId = selectedStore?.id ?? mockCheckerUser.storeId;

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

  const [auditToApprove, setAuditToApprove] = useState<string | null>(null);
  const [auditToReject, setAuditToReject] = useState<string | null>(null);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleAuditClick = useCallback(
    (auditId: string, event?: unknown) => {
      // If we are currently showing a modal, don't navigate
      if (auditToApprove || auditToReject || auditToDelete) return;

      // If the click originated from an action button, don't trigger review navigation
      const target =
        event && typeof event === "object" && "target" in event ? event.target : null;
      if (target instanceof Element && target.closest("button")) return;

      navigate({ ...routes.toReviewAudit(auditId) });
    },
    [navigate, routes, auditToApprove, auditToReject, auditToDelete]
  );

  const approveAuditMutation = useApproveAudit(selectedStoreId);
  const returnAuditMutation = useReturnAudit(selectedStoreId);
  const deleteAuditMutation = useDeleteAudit(selectedStoreId);

  const handleApprove = useCallback((auditId: string) => {
    setAuditToApprove(auditId);
  }, []);

  const handleReject = useCallback((auditId: string) => {
    setAuditToReject(auditId);
    setRejectReason("");
  }, []);

  const handleDelete = useCallback((auditId: string) => {
    setAuditToDelete(auditId);
  }, []);

  const confirmApprove = () => {
    if (auditToApprove) {
      approveAuditMutation.mutate(auditToApprove, {
        onSuccess: () => setAuditToApprove(null)
      });
    }
  };

  const confirmReject = () => {
    if (auditToReject && rejectReason.trim()) {
      returnAuditMutation.mutate(
        { auditId: auditToReject, reason: rejectReason },
        {
          onSuccess: () => {
            setAuditToReject(null);
            setRejectReason("");
          }
        }
      );
    }
  };

  const confirmDelete = () => {
    if (auditToDelete) {
      deleteAuditMutation.mutate(auditToDelete, {
        onSuccess: () => setAuditToDelete(null)
      });
    }
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Audit Review"
          description="Review and approve store audits to maintain planogram compliance."
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">

          <AuditReviewQueue
            className="mt-3 flex-1 min-h-0 rounded-lg border border-border bg-card p-3 shadow-sm sm:p-4"
            audits={audits || []}
            isLoading={auditsLoading}
            error={auditsError}
            onAuditClick={handleAuditClick}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={!!auditToApprove}
        onClose={() => setAuditToApprove(null)}
        onConfirm={confirmApprove}
        title="Approve Audit"
        description="Are you sure you want to approve this audit? This action will publish the results to the store system."
        confirmLabel="Approve"
        isLoading={approveAuditMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!auditToDelete}
        onClose={() => setAuditToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Audit"
        description="Are you sure you want to delete/cancel this audit? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteAuditMutation.isPending}
      />

      <Modal isOpen={!!auditToReject} onClose={() => setAuditToReject(null)} className="max-w-md">
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Return Audit</h3>
          <p className="text-sm text-muted-foreground">
            Please provide a reason for returning this audit to the store worker.
          </p>
          <div className="space-y-2">
            <label htmlFor="reject-reason" className="text-sm font-medium">Rejection Reason</label>
            <Input
              id="reject-reason"
              placeholder="e.g., Image quality too low, missing shelves"
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAuditToReject(null)} disabled={returnAuditMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={confirmReject}
              disabled={!rejectReason.trim() || returnAuditMutation.isPending}
            >
              {returnAuditMutation.isPending ? "Returning..." : "Return Audit"}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
