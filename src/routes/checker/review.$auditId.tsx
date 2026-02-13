/**
 * Audit Review Workspace Route
 * 
 * Dedicated page for Checkers to review, analyze, and take action on individual audits.
 * This is the primary governance decision-making interface.
 * 
 * Features:
 * - Full audit metadata and details
 * - Compliance score with visual indicator
 * - Violation list with severity badges
 * - Action buttons: Approve, Return, Override & Approve
 * - Back navigation to dashboard
 * - Responsive layout
 * 
 * Actions:
 * - Approve: Accept audit and publish to event bus
 * - Return: Reject audit and send back to maker with reason
 * - Override & Approve: Override AI decision and approve manually
 * 
 * Access at: /checker/review/:auditId
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  useAuditDetail,
  useAuditViolations,
  useApproveAudit,
  useReturnAudit,
  useOverrideAndApprove,
} from "@/features/checker/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Info,
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

/**
 * Get severity icon for violations
 */
function getSeverityIcon(severity: Violation["severity"]) {
  switch (severity) {
    case "critical":
      return AlertTriangle;
    case "warning":
      return AlertTriangle;
    case "info":
      return Info;
  }
}

/**
 * Get severity color for violations
 */
function getSeverityColor(severity: Violation["severity"]) {
  switch (severity) {
    case "critical":
      return "text-[var(--checker-critical)] bg-[var(--checker-critical)]/10 border-[var(--checker-critical)]/30";
    case "warning":
      return "text-[var(--checker-warning)] bg-[var(--checker-warning)]/10 border-[var(--checker-warning)]/30";
    case "info":
      return "text-[var(--checker-neutral)] bg-[var(--checker-neutral)]/10 border-[var(--checker-neutral)]/30";
  }
}

/**
 * Get compliance score color
 */
function getComplianceColor(score: number) {
  if (score >= 80) return "text-[var(--checker-success)]";
  if (score >= 50) return "text-[var(--checker-warning)]";
  return "text-[var(--checker-critical)]";
}

function AuditReviewWorkspace() {
  const { auditId } = Route.useParams();
  const navigate = useNavigate();

  // Fetch audit data
  const { data: audit, isLoading: auditLoading, error: auditError } = useAuditDetail(auditId);
  const { data: violations, isLoading: violationsLoading } = useAuditViolations(auditId);

  // Get mutations (store ID would come from audit, using placeholder for now)
  const approveAudit = useApproveAudit("store-1234");
  const returnAudit = useReturnAudit("store-1234");
  const overrideAndApprove = useOverrideAndApprove("store-1234");

  // Dialog states
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  /**
   * Handle approve action
   */
  const handleApprove = () => {
    if (window.confirm("Are you sure you want to approve this audit?")) {
      approveAudit.mutate(auditId, {
        onSuccess: () => {
          alert("Audit approved successfully!");
          navigate({ to: "/checker/dashboard" });
        },
      });
    }
  };

  /**
   * Handle return action
   */
  const handleReturn = () => {
    setShowReturnDialog(true);
  };

  const confirmReturn = () => {
    if (!returnReason.trim()) {
      alert("Please provide a reason for returning this audit.");
      return;
    }

    returnAudit.mutate(
      { auditId, reason: returnReason },
      {
        onSuccess: () => {
          alert("Audit returned to maker successfully!");
          navigate({ to: "/checker/dashboard" });
        },
      }
    );
  };

  /**
   * Handle override action
   */
  const handleOverride = () => {
    setShowOverrideDialog(true);
  };

  const confirmOverride = () => {
    if (!overrideReason.trim()) {
      alert("Please provide a reason for overriding the AI decision.");
      return;
    }

    overrideAndApprove.mutate(
      { auditId, overrideReason },
      {
        onSuccess: () => {
          alert("Audit overridden and approved successfully!");
          navigate({ to: "/checker/dashboard" });
        },
      }
    );
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate({ to: "/checker/dashboard" });
  };

  // Loading state
  if (auditLoading || violationsLoading) {
    return (
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (auditError || !audit) {
    return (
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-4 text-lg font-semibold text-foreground">
              Audit Not Found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The audit you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const complianceColor = getComplianceColor(audit.complianceScore || 0);

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Audit Header Card */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {audit.shelfInfo.shelfName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Aisle {audit.shelfInfo.aisleNumber} • Bay {audit.shelfInfo.bayNumber}
              </p>
            </div>

            {/* Compliance Score */}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className={cn("text-4xl font-bold", complianceColor)}>
                {audit.complianceScore}%
              </p>
            </div>
          </div>

          {/* Audit Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Submitted By</p>
                <p className="text-sm font-medium text-foreground">
                  {audit.submittedByName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm font-medium text-foreground">
                  {audit.submittedAt
                    ? format(new Date(audit.submittedAt), "MMM d, h:mm a")
                    : "Not submitted"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Audit Mode</p>
                <p className="text-sm font-medium text-foreground">
                  {audit.mode === "vision-edge" ? "Vision Edge" : "Assist Mode"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rule Version</p>
                <p className="text-sm font-medium text-foreground">
                  {audit.ruleVersionUsed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Violations Section */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Violations ({violations?.length || 0})
            </h2>
            {violations && violations.length === 0 && (
              <span className="rounded-full bg-[var(--checker-success)]/10 px-3 py-1 text-xs font-medium text-[var(--checker-success)]">
                No Violations
              </span>
            )}
          </div>

          {/* Violations List */}
          {violations && violations.length > 0 ? (
            <div className="space-y-3">
              {violations.map((violation) => {
                const SeverityIcon = getSeverityIcon(violation.severity);
                const severityColor = getSeverityColor(violation.severity);

                return (
                  <div
                    key={violation.id}
                    className={cn(
                      "rounded-lg border p-4 space-y-3",
                      severityColor
                    )}
                  >
                    {/* Violation Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <SeverityIcon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold">{violation.ruleName}</h3>
                          <p className="text-sm opacity-90">
                            {violation.description}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium uppercase",
                        severityColor
                      )}>
                        {violation.severity}
                      </span>
                    </div>

                    {/* Expected vs Actual */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-current/20">
                      <div>
                        <p className="text-xs font-medium opacity-75">Expected</p>
                        <p className="text-sm mt-1">{violation.expected}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium opacity-75">Actual</p>
                        <p className="text-sm mt-1">{violation.actual}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-[var(--checker-success)]" />
              <p className="mt-4 text-sm font-medium text-foreground">
                No violations found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This audit passed all compliance checks
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Review Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleApprove}
              disabled={approveAudit.isPending}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors",
                "bg-[var(--checker-success)] text-white hover:opacity-90",
                "focus:outline-none focus:ring-2 focus:ring-[var(--checker-success)] focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <CheckCircle className="h-5 w-5" />
              {approveAudit.isPending ? "Approving..." : "Approve"}
            </button>

            <button
              onClick={handleReturn}
              disabled={returnAudit.isPending}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors",
                "bg-destructive text-white hover:opacity-90",
                "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <XCircle className="h-5 w-5" />
              {returnAudit.isPending ? "Returning..." : "Return to Maker"}
            </button>

            <button
              onClick={handleOverride}
              disabled={overrideAndApprove.isPending}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors",
                "bg-[var(--checker-override)] text-white hover:opacity-90",
                "focus:outline-none focus:ring-2 focus:ring-[var(--checker-override)] focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ShieldAlert className="h-5 w-5" />
              {overrideAndApprove.isPending ? "Processing..." : "Override & Approve"}
            </button>
          </div>
        </div>

        {/* Return Dialog */}
        {showReturnDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Return Audit to Maker
              </h3>
              <p className="text-sm text-muted-foreground">
                Please provide a reason for returning this audit. The maker will see
                this message.
              </p>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground min-h-[100px]"
              />
              <div className="flex gap-3">
                <button
                  onClick={confirmReturn}
                  disabled={returnAudit.isPending}
                  className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Confirm Return
                </button>
                <button
                  onClick={() => {
                    setShowReturnDialog(false);
                    setReturnReason("");
                  }}
                  className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Override Dialog */}
        {showOverrideDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Override AI Decision
              </h3>
              <p className="text-sm text-muted-foreground">
                You are about to override the AI decision and approve this audit manually.
                Please provide a reason for transparency and governance tracking.
              </p>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter override reason..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground min-h-[100px]"
              />
              <div className="flex gap-3">
                <button
                  onClick={confirmOverride}
                  disabled={overrideAndApprove.isPending}
                  className="flex-1 rounded-md bg-[var(--checker-override)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Confirm Override
                </button>
                <button
                  onClick={() => {
                    setShowOverrideDialog(false);
                    setOverrideReason("");
                  }}
                  className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
