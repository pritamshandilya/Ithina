import { FileText } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRulesByRuleSetId } from "@/queries/maker";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { ComplianceRule, RuleSeverity } from "@/types/checker";

export interface StoreFixtureDetailComplianceTabProps {
  ruleSets: ComplianceRuleSetSummary[];
  selectedRuleSetId: string;
  onRuleSetChange: (value: string) => void;
  onSaveRuleSet: () => void;
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
    <details className="rounded-lg border border-border bg-muted/20 p-3 open:bg-muted/30">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-foreground">{rule.ruleName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {rule.ruleType} · {rule.shelfType} · Expected {rule.expectedValue}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`text-xs font-medium ${severityClass(rule.severity)}`}>
            {rule.severity}
          </span>
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(rule.status)}`}
          >
            {rule.status}
          </span>
        </div>
      </summary>
      <div className="mt-3 grid gap-1.5 border-t border-border/70 pt-2 text-xs">
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
          <span className="font-medium text-foreground">{rule.expectedValue}</span>
        </div>
        {rule.tolerance != null && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tolerance</span>
            <span className="text-foreground">±{rule.tolerance}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Severity</span>
          <span className={`font-medium ${severityClass(rule.severity)}`}>{rule.severity}</span>
        </div>
      </div>
    </details>
  );
}

export function StoreFixtureDetailComplianceTab({
  ruleSets,
  selectedRuleSetId,
  onRuleSetChange,
  onSaveRuleSet,
}: StoreFixtureDetailComplianceTabProps) {
  const selectedRuleSet = ruleSets.find((set) => set.id === selectedRuleSetId) ?? null;
  const { data: rules, isLoading, isError } = useRulesByRuleSetId(selectedRuleSetId || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | RuleSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Draft" | "Retired">("all");

  const filteredRules = useMemo(() => {
    if (!rules) return [];
    const query = searchTerm.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesSearch =
        !query ||
        rule.ruleName.toLowerCase().includes(query) ||
        rule.ruleType.toLowerCase().includes(query) ||
        rule.shelfType.toLowerCase().includes(query) ||
        String(rule.expectedValue).toLowerCase().includes(query);
      const matchesSeverity =
        severityFilter === "all" || rule.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || rule.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [rules, searchTerm, severityFilter, statusFilter]);

  return (
    <div className="space-y-3">
      <Card className="border-border bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-chart-2" aria-hidden />
            Compliance Rule Set
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select value={selectedRuleSetId} onChange={(e) => onRuleSetChange(e.target.value)}>
            <option value="">No rule set selected</option>
            {ruleSets.map((ruleSet) => (
              <option key={ruleSet.id} value={ruleSet.id}>
                {ruleSet.name}
              </option>
            ))}
          </Select>
          <Button type="button" variant="outline" className="w-full" onClick={onSaveRuleSet}>
            Save Compliance Rule Set
          </Button>
          <p className="text-xs text-muted-foreground">
            Current selection: {selectedRuleSet?.name ?? "None"}
          </p>
        </CardContent>
      </Card>

      {selectedRuleSet ? (
        <Card className="border-border bg-card/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">{selectedRuleSet.name}</CardTitle>
            {selectedRuleSet.description && (
              <p className="text-sm text-muted-foreground">{selectedRuleSet.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rules in set</span>
                <span className="font-medium tabular-nums text-foreground">
                  {selectedRuleSet.rulesCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enabled rules</span>
                <span className="font-medium tabular-nums text-foreground">
                  {selectedRuleSet.enabledCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rules in this set
              </h4>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : isError ? (
                <p className="py-2 text-sm text-destructive">
                  Could not load rules for this set.
                </p>
              ) : rules && rules.length > 0 ? (
                <div className="space-y-2">
                  <div className="sticky top-0 z-10 space-y-2 rounded-md border border-border bg-card/95 p-2 backdrop-blur-sm">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search rules by name, type, or expected value..."
                      aria-label="Search compliance rules"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select
                        value={severityFilter}
                        onChange={(e) =>
                          setSeverityFilter(e.target.value as "all" | RuleSeverity)
                        }
                        aria-label="Filter rules by severity"
                      >
                        <option value="all">All Severities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </Select>
                      <Select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as "all" | "Active" | "Draft" | "Retired",
                          )
                        }
                        aria-label="Filter rules by status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Retired">Retired</option>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Showing {filteredRules.length} of {rules.length} rules
                    </p>
                  </div>
                  <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                    {filteredRules.length > 0 ? (
                      filteredRules.map((rule) => <RuleCard key={rule.ruleId} rule={rule} />)
                    ) : (
                      <p className="py-2 text-sm text-muted-foreground">
                        No rules match the selected filters.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">No rules in this set.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Select a compliance rule set to view full rule details.
        </div>
      )}
    </div>
  );
}
