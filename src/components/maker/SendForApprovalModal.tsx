/**
 * Send for Approval Modal
 *
 * Confirmation dialog when Maker sends an audit to the Store Manager.
 * Includes optional notes for the approver.
 */
import { Send } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRulesByRuleSetId } from "@/queries/maker";
import type { ComplianceRule, RuleSeverity } from "@/types/checker";
import type { ComplianceRuleSetSummary } from "@/types/complianceRuleSet";

export interface SendForApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  isLoading?: boolean;
  /** Selected rule set summary (preferred when available) */
  selectedRuleSet?: ComplianceRuleSetSummary | null;
  /** Fallback name when rule set is not found in API (e.g. custom selection) */
  selectedRuleSetName?: string | null;
}

export function SendForApprovalModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  selectedRuleSet,
  selectedRuleSetName,
}: SendForApprovalModalProps) {
  const [notes, setNotes] = useState("");

  const ruleSetId = useMemo(
    () => selectedRuleSet?.id ?? null,
    [selectedRuleSet?.id],
  );

  const {
    data: rules,
    isLoading: isRulesLoading,
    isError: isRulesError,
  } = useRulesByRuleSetId(isOpen ? ruleSetId : null);
  const resolvedRules = rules ?? [];
  const resolvedRulesCount =
    selectedRuleSet?.rulesCount ?? resolvedRules.length;
  const resolvedEnabledCount =
    selectedRuleSet?.enabledCount ??
    resolvedRules.filter((rule) => rule.enabled !== false).length;
  const resolvedRuleSetName =
    selectedRuleSet?.name ?? selectedRuleSetName ?? null;
  const resolvedRuleSetDescription = selectedRuleSet?.description;
  const isDefaultSet = selectedRuleSet?.isDefault ?? false;

  const handleSubmit = () => {
    if (isLoading) return;
    onSubmit(notes);
    setNotes("");
    // Parent is responsible for closing when submission completes
  };

  const handleClose = () => {
    if (isLoading) return;
    setNotes("");
    onClose();
  };

  function severityClass(severity: RuleSeverity): string {
    switch (severity) {
      case "High":
        return "text-destructive";
      case "Medium":
        return "text-accent";
      case "Low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  }

  function statusClass(status: string): string {
    switch (status) {
      case "Active":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "Draft":
        return "bg-muted/80 text-muted-foreground border-border";
      case "Retired":
        return "bg-muted/60 text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  function RuleCard({ rule }: { rule: ComplianceRule }) {
    return (
      <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-foreground text-sm font-medium">
            {rule.ruleName}
          </span>
          <span
            className={`inline-flex shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(rule.status)}`}
          >
            {rule.status}
          </span>
        </div>
        <div className="grid gap-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground">{rule.ruleType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shelf type</span>
            <span className="text-foreground">{rule.shelfType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected</span>
            <span className="text-foreground font-medium">
              {rule.expectedValue}
            </span>
          </div>
          {rule.tolerance != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tolerance</span>
              <span className="text-foreground">±{rule.tolerance}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Severity</span>
            <span className={`font-medium ${severityClass(rule.severity)}`}>
              {rule.severity}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      className="max-w-2xl"
    >
      <div
        className="border-border bg-card rounded-xl border p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="bg-chart-2/20 shrink-0 rounded-full p-2">
            <Send className="text-chart-2 size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground text-lg font-semibold">
              Send for Approval
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              This analysis will be sent to the Store Manager for review and
              approval.
            </p>
          </div>
        </div>

        <div className="border-border bg-muted/20 mt-4 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Selected analysis rules
          </p>

          {resolvedRuleSetName ? (
            <div className="mt-2 space-y-3">
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  {resolvedRuleSetName}
                </p>
                {resolvedRuleSetDescription && (
                  <p className="text-muted-foreground text-sm">
                    {resolvedRuleSetDescription}
                  </p>
                )}
              </div>

              <div className="border-border bg-muted/30 grid gap-3 rounded-lg border p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rules in set</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {resolvedRulesCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enabled rules</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {resolvedEnabledCount}
                  </span>
                </div>
                {isDefaultSet && (
                  <div className="border-chart-2/30 bg-chart-2/10 text-chart-2 rounded-md border px-2 py-1.5 text-xs font-medium">
                    Default rule set
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Rules in this set
                </h4>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {isRulesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                  ) : isRulesError ? (
                    <p className="text-destructive py-2 text-sm">
                      Could not load rules for this set. It may have been
                      removed or the id is invalid.
                    </p>
                  ) : resolvedRules.length > 0 ? (
                    resolvedRules.map((rule) => (
                      <RuleCard key={rule.ruleId} rule={rule} />
                    ))
                  ) : (
                    <p className="text-muted-foreground py-2 text-sm">
                      {ruleSetId
                        ? "No rules in this set."
                        : "Rule set details are not available."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">
              No compliance rule set selected for this shelf.
            </p>
          )}
        </div>

        <div className="mt-6">
          <label
            htmlFor="approval-notes"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            Notes for approver (optional)
          </label>
          <textarea
            id="approval-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Shelf 2 rearrangement — please review compliance."
            rows={3}
            disabled={isLoading}
            className={cn(
              "border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} variant="success">
            {isLoading ? (
              "Sending…"
            ) : (
              <>
                <Send className="size-4" aria-hidden />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
