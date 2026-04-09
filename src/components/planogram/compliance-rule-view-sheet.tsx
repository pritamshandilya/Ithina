import { FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useRulesByRuleSetId } from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { ComplianceRule, RuleSeverity } from "@/types/checker";

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
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{rule.ruleName}</span>
        <span
          className={`shrink-0 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(rule.status)}`}
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
          <span className="text-foreground font-medium">{rule.expectedValue}</span>
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

export function ComplianceRuleViewSheet({
  open,
  onOpenChange,
  ruleSet,
  ruleSetName,
}: ComplianceRuleViewSheetProps) {
  const ruleSetId = ruleSet?.id ?? null;
  const { data: rules, isLoading, isError } = useRulesByRuleSetId(
    open ? ruleSetId : null,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="size-5 text-chart-2" />
            Compliance Rule Set
          </SheetTitle>
          <SheetDescription>
            View the selected compliance rule set applied to this shelf. Read-only.
          </SheetDescription>
        </SheetHeader>

        {ruleSet ? (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
            <div className="space-y-2 shrink-0">
              <h3 className="text-sm font-medium text-foreground">{ruleSet.name}</h3>
              {ruleSet.description && (
                <p className="text-sm text-muted-foreground">{ruleSet.description}</p>
              )}
            </div>

            <div className="grid shrink-0 gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rules in set</span>
                <span className="font-medium tabular-nums text-foreground">
                  {ruleSet.rulesCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Enabled rules</span>
                <span className="font-medium tabular-nums text-foreground">
                  {ruleSet.enabledCount}
                </span>
              </div>
              {ruleSet.isDefault && (
                <div className="rounded-md border border-chart-2/30 bg-chart-2/10 px-2 py-1.5 text-xs font-medium text-chart-2">
                  Default rule set
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
                Rules in this set
              </h4>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ) : isError ? (
                  <p className="text-sm text-destructive py-4">
                    Could not load rules for this set. It may have been removed or the id is
                    invalid.
                  </p>
                ) : rules && rules.length > 0 ? (
                  rules.map((rule) => <RuleCard key={rule.ruleId} rule={rule} />)
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    No rules in this set.
                  </p>
                )}
              </div>
            </div>

          </div>
        ) : ruleSetName ? (
          <div className="flex flex-col gap-6 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">{ruleSetName}</h3>
              <p className="text-sm text-muted-foreground">
                Rule set details are not available.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No compliance rule set selected for this shelf.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
