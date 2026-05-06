import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useRulesByRuleSetId } from "@/queries/maker";
import type { ComplianceRule, RuleSeverity } from "@/types/checker";
import type { ComplianceRuleSetSummary } from "@/types/complianceRuleSet";

export interface ComplianceRuleViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleSet: ComplianceRuleSetSummary | null;
  /** Fallback name when rule set is not found in API (e.g. custom selection) */
  ruleSetName?: string | null;
}

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

/**
 * Read-only compliance rule set viewer (centered modal).
 * Kept name `ComplianceRuleViewSheet` for existing import paths.
 */
export function ComplianceRuleViewSheet({
  open,
  onOpenChange,
  ruleSet,
  ruleSetName,
}: ComplianceRuleViewSheetProps) {
  const ruleSetId = ruleSet?.id ?? null;
  const {
    data: rules,
    isLoading,
    isError,
  } = useRulesByRuleSetId(open ? ruleSetId : null);

  const handleClose = () => onOpenChange(false);

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      className="max-w-lg"
      showCloseButton
    >
      <div className="border-border bg-card flex max-h-[min(88vh,720px)] w-full flex-col overflow-hidden rounded-lg border p-6 shadow-lg">
        <div className="shrink-0 space-y-1 pr-10">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <FileText className="text-chart-2 size-5 shrink-0" aria-hidden />
            Compliance rule set
          </h2>
          <p className="text-muted-foreground text-sm">
            View the selected compliance rule set applied to this Display Unit.
            Read-only.
          </p>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          {ruleSet ? (
            <>
              <div className="shrink-0 space-y-2">
                <h3 className="text-foreground text-sm font-medium">
                  {ruleSet.name}
                </h3>
                {ruleSet.description ? (
                  <p className="text-muted-foreground text-sm">
                    {ruleSet.description}
                  </p>
                ) : null}
              </div>

              <div className="border-border bg-muted/30 mt-4 grid shrink-0 gap-3 rounded-lg border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rules in set</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {ruleSet.rulesCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enabled rules</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {ruleSet.enabledCount}
                  </span>
                </div>
                {ruleSet.isDefault ? (
                  <div className="border-chart-2/30 bg-chart-2/10 text-chart-2 rounded-md border px-2 py-1.5 text-xs font-medium">
                    Default rule set
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                <h4 className="text-muted-foreground shrink-0 text-xs font-medium tracking-wider uppercase">
                  Rules in this set
                </h4>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                  ) : isError ? (
                    <p className="text-destructive py-4 text-sm">
                      Could not load rules for this set. It may have been
                      removed or the id is invalid.
                    </p>
                  ) : rules && rules.length > 0 ? (
                    rules.map((rule) => (
                      <RuleCard key={rule.ruleId} rule={rule} />
                    ))
                  ) : (
                    <p className="text-muted-foreground py-4 text-sm">
                      No rules in this set.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : ruleSetName ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground text-sm font-medium">
                {ruleSetName}
              </h3>
              <p className="text-muted-foreground text-sm">
                Rule set details are not available.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No compliance rule set selected for this shelf.
            </p>
          )}
        </div>

        <div className="border-border mt-4 flex shrink-0 justify-end border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
