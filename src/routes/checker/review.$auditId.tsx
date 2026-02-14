/**
 * Audit Review Workspace Route
 *
 * Dedicated page for Checkers to review, analyze, and take action on individual audits.
 * Uses MainLayout for sidebar, DataTable for violations, design system components.
 *
 * Access at: /checker/review/:auditId
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  useAuditDetail,
  useAuditViolations,
  useApproveAudit,
  useReturnAudit,
  useOverrideAndApprove,
} from "@/features/checker/hooks";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Violation } from "@/types/checker";

export const Route = createFileRoute("/checker/review/$auditId")({
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
    formatter: (cell: { getData: () => Violation }) => {
      const v = cell.getData();
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

function AuditReviewWorkspace() {
  const { auditId } = Route.useParams();
  const navigate = useNavigate();

  const { data: audit, isLoading: auditLoading, error: auditError } = useAuditDetail(auditId);
  const { data: violations, isLoading: violationsLoading } = useAuditViolations(auditId);

  const approveAudit = useApproveAudit("store-1234");
  const returnAudit = useReturnAudit("store-1234");
  const overrideAndApprove = useOverrideAndApprove("store-1234");

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const handleApprove = () => {
    if (window.confirm("Are you sure you want to approve this audit?")) {
      approveAudit.mutate(auditId, {
        onSuccess: () => {
          navigate({ to: "/checker/audit-review" });
        },
      });
    }
  };

  const handleReturn = () => setShowReturnDialog(true);

  const confirmReturn = () => {
    if (!returnReason.trim()) {
      window.alert("Please provide a reason for returning this audit.");
      return;
    }
    returnAudit.mutate(
      { auditId, reason: returnReason },
      {
        onSuccess: () => {
          setShowReturnDialog(false);
          setReturnReason("");
          navigate({ to: "/checker/audit-review" });
        },
      }
    );
  };

  const handleOverride = () => setShowOverrideDialog(true);

  const confirmOverride = () => {
    if (!overrideReason.trim()) {
      window.alert("Please provide a reason for overriding the AI decision.");
      return;
    }
    overrideAndApprove.mutate(
      { auditId, overrideReason },
      {
        onSuccess: () => {
          setShowOverrideDialog(false);
          setOverrideReason("");
          navigate({ to: "/checker/audit-review" });
        },
      }
    );
  };

  if (auditLoading || violationsLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
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
        <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Button variant="ghost" asChild>
              <Link to="/checker/audit-review" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back Link */}
          <Button variant="ghost" asChild size="sm">
            <Link
              to="/checker/audit-review"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Audit Review
            </Link>
          </Button>

          {/* Audit Header */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <header className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">{audit.shelfInfo.shelfName}</h1>
                <p className="text-sm text-muted-foreground">
                  Aisle {audit.shelfInfo.aisleNumber} • Bay {audit.shelfInfo.bayNumber}
                </p>
              </header>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className={cn("text-3xl font-bold", complianceColor)}>{audit.complianceScore}%</p>
              </div>
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
                    {audit.mode === "vision-edge" ? "Vision Edge" : "Assist Mode"}
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

          {/* Violations Table */}
          <section className="space-y-4">
            <header className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Violations ({violations?.length ?? 0})
              </h2>
              <p className="text-sm text-muted-foreground">
                Rule violations identified during this audit
              </p>
            </header>

            {violations && violations.length > 0 ? (
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
            ) : (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-chart-2" />
                <p className="mt-4 text-sm font-medium text-foreground">No violations found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This audit passed all compliance checks
                </p>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Review Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleApprove}
                disabled={approveAudit.isPending}
                className="bg-chart-2 text-white hover:opacity-90"
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

      {/* Return Dialog */}
      <Modal isOpen={showReturnDialog} onClose={() => setShowReturnDialog(false)}>
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
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
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
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
