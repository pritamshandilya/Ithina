/**
 * Audit Review Workspace Route
 *
 * Dedicated page for Checkers to review, analyze, and take action on individual audits.
 * Uses MainLayout for sidebar, DataTable for violations, design system components.
 *
 * Access at: /checker/review/:auditId
 */

import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  useAuditDetail,
  useAuditViolations,
  useApproveAudit,
  useReturnAudit,
  useOverrideAndApprove,
} from "@/queries/checker";
import { useToast } from "@/hooks/use-toast";
import { useStoreScopedCheckerRoutes } from "@/hooks/use-store-scoped-checker-routes";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layouts/main";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Calendar,
  User,
  Layers,
  FileText,
  FileBarChart,
} from "lucide-react";
import { ComplianceReportMetrics } from "@/components/shared/compliance-report";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Violation } from "@/types/checker";

export const Route = createFileRoute("/checker/review/$auditId/")({
  component: AuditReviewWorkspace,
});

function getSeverityClass(severity: Violation["severity"]): string {
  switch (severity) {
    case "critical":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-action-critical/10 text-action-critical border border-action-critical/30";
    case "warning":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-action-warning/10 text-action-warning border border-action-warning/30";
    case "info":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-muted/50 text-muted-foreground border border-border";
    default:
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-muted/50 text-muted-foreground";
  }
}

function getComplianceColor(score: number): string {
  if (score >= 80) return "text-chart-2";
  if (score >= 50) return "text-action-warning";
  return "text-action-critical";
}

const VIOLATION_COLUMNS: DataTableColumn<Violation>[] = [
  {
    title: "Rule",
    field: "ruleName",
    minWidth: 180,
    sorter: "string",
    headerSort: true,
    formatter: (cell: unknown) => {
      const v = (cell as { getData: () => Violation }).getData();
      return `
        <div class="flex flex-col gap-0.5 py-1">
          <span class="font-medium text-foreground">${v.ruleName}</span>
          <span class="text-xs text-muted-foreground">${v.description}</span>
        </div>
      `;
    },
  },
  {
    title: "Expected",
    field: "expected",
    minWidth: 140,
    sorter: "string",
    headerSort: true,
    formatter: (cell: unknown) => {
      const val = (cell as { getValue: () => unknown }).getValue();
      return `<span class="text-sm text-foreground">${val ?? "—"}</span>`;
    },
  },
  {
    title: "Actual",
    field: "actual",
    minWidth: 140,
    sorter: "string",
    headerSort: true,
    formatter: (cell: unknown) => {
      const val = (cell as { getValue: () => unknown }).getValue();
      return `<span class="text-sm text-foreground">${val ?? "—"}</span>`;
    },
  },
  {
    title: "Severity",
    field: "severity",
    width: 100,
    headerSort: true,
    sorter: "string",
    headerFilter: false,
    formatter: (cell: unknown) => {
      const v = (cell as { getData: () => Violation }).getData();
      const cls = getSeverityClass(v.severity);
      return `<span class="${cls}">${v.severity.toUpperCase()}</span>`;
    },
  },
];

export function AuditReviewWorkspace() {
  const { auditId } = useParams({ strict: false });
  const navigate = useNavigate();
  const routes = useStoreScopedCheckerRoutes();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id ?? mockCheckerUser.storeId;

  const { data: audit, isLoading: auditLoading, error: auditError } = useAuditDetail(auditId ?? "");
  const { data: violations, isLoading: violationsLoading } = useAuditViolations(auditId ?? "");

  const approveAudit = useApproveAudit(selectedStoreId);
  const returnAudit = useReturnAudit(selectedStoreId);
  const overrideAndApprove = useOverrideAndApprove(selectedStoreId);

  const { toast } = useToast();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const handleApprove = () => setShowApproveDialog(true);

  const confirmApprove = () => {
    approveAudit.mutate(auditId, {
      onSuccess: () => {
        setShowApproveDialog(false);
        toast({
          title: "Audit approved",
          description: "The audit has been approved successfully.",
        });
        navigate({ ...routes.toAuditReview() });
      },
    });
  };

  const handleReturn = () => setShowReturnDialog(true);

  const confirmReturn = () => {
    if (!returnReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason required",
        description: "Please provide a reason for returning this audit.",
      });
      return;
    }
    returnAudit.mutate(
      { auditId, reason: returnReason },
      {
        onSuccess: () => {
          setShowReturnDialog(false);
          setReturnReason("");
          toast({
            title: "Audit returned",
            description: "The audit has been returned to the maker.",
          });
          navigate({ ...routes.toAuditReview() });
        },
      }
    );
  };

  const handleOverride = () => setShowOverrideDialog(true);

  const confirmOverride = () => {
    if (!overrideReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason required",
        description: "Please provide a reason for overriding the AI decision.",
      });
      return;
    }
    overrideAndApprove.mutate(
      { auditId, overrideReason },
      {
        onSuccess: () => {
          setShowOverrideDialog(false);
          setOverrideReason("");
          toast({
            title: "Audit approved",
            description: "The audit has been approved with override.",
          });
          navigate({ ...routes.toAuditReview() });
        },
      }
    );
  };

  if (!auditId) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
          <div className="mx-auto max-w-screen-2xl space-y-4">
            <p className="text-sm text-muted-foreground">Missing audit id.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (auditLoading || violationsLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
          <div className="mx-auto max-w-screen-2xl space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (auditError || !audit) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
          <div className="mx-auto max-w-screen-2xl space-y-4">
            <Button variant="ghost" asChild>
              <Link
                {...routes.toAuditReview()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Audit Review
              </Link>
            </Button>
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <p className="mt-4 text-lg font-semibold text-foreground">Audit Not Found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The audit you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const complianceColor = getComplianceColor(audit.complianceScore || 0);

  // Derive metrics for ComplianceReportMetrics (report-style layout)
  const criticalCount = violations?.filter((v) => v.severity === "critical").length ?? 0;
  const warningCount = violations?.filter((v) => v.severity === "warning").length ?? 0;
  const infoCount = violations?.filter((v) => v.severity === "info").length ?? 0;
  const totalViolations = violations?.length ?? 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          {/* Header: Back + Title + View Full Report */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" asChild size="sm">
              <Link
                {...routes.toAuditReview()}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Audit Review
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2 border-accent/50 text-foreground hover:bg-accent/10 shrink-0">
              <Link {...routes.toAuditReport(auditId)}>
                <FileBarChart className="h-4 w-4" />
                View Full Report
              </Link>
            </Button>
          </div>

          {/* Audit Summary Header (report-style) */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <header className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {audit.shelfInfo.shelfName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Aisle {audit.shelfInfo.aisleCode} • Bay {audit.shelfInfo.bayCode} • Rule version {audit.ruleVersionUsed}
                </p>
              </header>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className={cn("text-3xl font-bold", complianceColor)}>
                  {audit.complianceScore ?? 0}%
                </p>
              </div>
            </div>

            {/* Metrics row (aligned with full report) */}
            <div className="mt-6">
              <ComplianceReportMetrics
                complianceScore={audit.complianceScore ?? 0}
                matched={0}
                misplaced={warningCount}
                missing={criticalCount}
                extra={infoCount}
                issues={totalViolations}
                facings={0}
                units={0}
                detected={0}
                gap={0}
              />
            </div>

            {/* Metadata */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="text-sm font-medium text-foreground">{audit.submittedByName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium text-foreground">
                    {audit.submittedAt
                      ? format(new Date(audit.submittedAt), "MMM d, h:mm a")
                      : "Not submitted"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Audit Mode</p>
                  <p className="text-sm font-medium text-foreground">
                    {audit.mode === "planogram-based" || audit.mode === "vision-edge"
                      ? "Planogram Based"
                      : "Adhoc Analysis"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Rule Version</p>
                  <p className="text-sm font-medium text-foreground">{audit.ruleVersionUsed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary (report-style) */}
          {(totalViolations > 0 || (audit.complianceScore ?? 0) < 80) && (
            <div className="rounded-xl border border-border bg-card/60 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-accent shrink-0" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Summary
                </h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(audit.complianceScore ?? 0) < 80 && (
                  <div className="flex gap-2 rounded-lg px-3 py-2.5 text-sm bg-action-warning/10 border border-action-warning/30">
                    <span className="size-4 rounded-full bg-action-warning/30 flex items-center justify-center shrink-0">
                      <span className="size-2 rounded-full bg-action-warning" />
                    </span>
                    <span className="text-foreground">
                      Compliance at {audit.complianceScore ?? 0}%. Review violations before approving.
                    </span>
                  </div>
                )}
                {criticalCount > 0 && (
                  <div className="flex gap-2 rounded-lg px-3 py-2.5 text-sm bg-destructive/10 border border-destructive/30">
                    <span className="size-4 rounded-full bg-destructive/30 flex items-center justify-center shrink-0">
                      <span className="size-2 rounded-full bg-destructive" />
                    </span>
                    <span className="text-foreground">
                      {criticalCount} critical violation{criticalCount !== 1 ? "s" : ""} require attention.
                    </span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex gap-2 rounded-lg px-3 py-2.5 text-sm bg-action-warning/10 border border-action-warning/30">
                    <span className="size-4 rounded-full bg-action-warning/30 flex items-center justify-center shrink-0">
                      <span className="size-2 rounded-full bg-action-warning" />
                    </span>
                    <span className="text-foreground">
                      {warningCount} warning{warningCount !== 1 ? "s" : ""} identified.
                    </span>
                  </div>
                )}
                {totalViolations === 0 && (audit.complianceScore ?? 0) >= 80 && (
                  <div className="flex gap-2 rounded-lg px-3 py-2.5 text-sm bg-chart-2/10 border border-chart-2/30">
                    <span className="size-4 rounded-full bg-chart-2/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="size-2.5 text-chart-2" />
                    </span>
                    <span className="text-foreground">
                      Audit meets compliance threshold. No violations found.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Violations Section (report-style: All Issues) */}
          <section className="space-y-4">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Rule Violations ({violations?.length ?? 0})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Rule violations identified during this audit. View full report for detailed analysis.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-2 shrink-0">
                <Link {...routes.toAuditReport(auditId)}>
                  <FileBarChart className="h-4 w-4" />
                  View Full Report
                </Link>
              </Button>
            </header>

            {violations && violations.length > 0 ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <DataTable<Violation>
                  columns={VIOLATION_COLUMNS}
                  data={violations}
                  rowIdField="id"
                  initialSort={{ field: "severity", dir: "asc" }}
                  emptyMessage="No violations"
                  pageSize={10}
                  pageSizeSelector={[5, 10, 20]}
                  headerFilters={false}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-chart-2" />
                <p className="mt-4 text-sm font-medium text-foreground">No violations found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This audit passed all compliance checks
                </p>
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link {...routes.toAuditReport(auditId)} className="gap-2">
                    <FileBarChart className="h-4 w-4" />
                    View Full Report
                  </Link>
                </Button>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Review Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleApprove}
                disabled={approveAudit.isPending}
                variant="success"
              >
                <CheckCircle className="h-5 w-5" />
                {approveAudit.isPending ? "Approving..." : "Approve"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReturn}
                disabled={returnAudit.isPending}
              >
                <XCircle className="h-5 w-5" />
                {returnAudit.isPending ? "Returning..." : "Return to Maker"}
              </Button>
              <Button
                onClick={handleOverride}
                disabled={overrideAndApprove.isPending}
                className="bg-accent text-accent-foreground hover:opacity-90"
              >
                <ShieldAlert className="h-5 w-5" />
                {overrideAndApprove.isPending ? "Processing..." : "Override & Approve"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Modal isOpen={showApproveDialog} onClose={() => setShowApproveDialog(false)}>
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Approve Audit</h3>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to approve this audit? This will mark it as compliant and complete the review.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveAudit.isPending}
              className="flex-1 bg-chart-2 text-white hover:bg-chart-2/90"
            >
              {approveAudit.isPending ? "Approving..." : "Confirm Approve"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Dialog */}
      <Modal isOpen={showReturnDialog} onClose={() => setShowReturnDialog(false)}>
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Return Audit to Maker</h3>
          <p className="text-sm text-muted-foreground">
            Please provide a reason for returning this audit. The maker will see this message.
          </p>
          <div className="space-y-2">
            <Label htmlFor="return-reason">Reason</Label>
            <textarea
              id="return-reason"
              placeholder="Enter rejection reason..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowReturnDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReturn}
              disabled={returnAudit.isPending}
              className="flex-1"
            >
              {returnAudit.isPending ? "Returning..." : "Confirm Return"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Override Dialog */}
      <Modal isOpen={showOverrideDialog} onClose={() => setShowOverrideDialog(false)}>
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Override AI Decision</h3>
          <p className="text-sm text-muted-foreground">
            You are about to override the AI decision and approve this audit manually. Please
            provide a reason for transparency and governance tracking.
          </p>
          <div className="space-y-2">
            <Label htmlFor="override-reason">Reason</Label>
            <textarea
              id="override-reason"
              placeholder="Enter override reason..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={confirmOverride}
              disabled={overrideAndApprove.isPending}
              className="flex-1 bg-accent text-accent-foreground hover:opacity-90"
            >
              {overrideAndApprove.isPending ? "Processing..." : "Confirm Override"}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
