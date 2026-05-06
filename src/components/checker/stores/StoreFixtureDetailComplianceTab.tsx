import { FileText, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRulesByRuleSetId } from "@/queries/maker";
import type { ComplianceRule, RuleSeverity } from "@/types/checker";
import type { ComplianceRuleSetSummary } from "@/types/complianceRuleSet";

interface ComplianceAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleSetOptions: ComplianceRuleSetSummary[];
  ruleSetId: string;
  onRuleSetIdChange: (value: string) => void;
  onSaveAssociation: () => void;
}

function ComplianceAssociationModal({
  isOpen,
  onClose,
  ruleSetOptions,
  ruleSetId,
  onRuleSetIdChange,
  onSaveAssociation,
}: ComplianceAssociationModalProps) {
  const handleSave = () => {
    onSaveAssociation();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      showCloseButton
    >
      <div className="border-border bg-card rounded-xl border p-6 shadow-2xl">
        <h3 className="text-foreground text-lg font-semibold">
          Associate Compliance Rule Set
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a compliance rule set to assign to this fixture.
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="fixture-compliance-association">
            Compliance rule set
          </Label>
          <Select
            id="fixture-compliance-association"
            value={ruleSetId}
            onChange={(e) => onRuleSetIdChange(e.target.value)}
          >
            <option value="">None</option>
            {ruleSetOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export interface StoreFixtureDetailComplianceTabProps {
  ruleSets: ComplianceRuleSetSummary[];
  /** Resolved selection (fixture, override, or store default) — same source as rule details. */
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
    <details className="border-border bg-muted/20 open:bg-muted/30 rounded-lg border p-3">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-foreground truncate text-sm font-medium">
            {rule.ruleName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {rule.ruleType} · {rule.shelfType} · Expected {rule.expectedValue}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`text-xs font-medium ${severityClass(rule.severity)}`}
          >
            {rule.severity}
          </span>
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(rule.status)}`}
          >
            {rule.status}
          </span>
        </div>
      </summary>
      <div className="border-border/70 mt-3 grid gap-1.5 border-t pt-2 text-xs">
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
    </details>
  );
}

export function StoreFixtureDetailComplianceTab({
  ruleSets,
  selectedRuleSetId,
  onRuleSetChange,
  onSaveRuleSet,
}: StoreFixtureDetailComplianceTabProps) {
  const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
  const selectedRuleSet =
    ruleSets.find((set) => set.id === selectedRuleSetId) ?? null;
  const hasAssociatedCompliance = !!selectedRuleSetId;
  const associatedRuleSetName = selectedRuleSet?.name ?? selectedRuleSetId;
  const {
    data: rules,
    isLoading,
    isError,
  } = useRulesByRuleSetId(selectedRuleSetId || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | RuleSeverity>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Draft" | "Retired"
  >("all");

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
      const matchesStatus =
        statusFilter === "all" || rule.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [rules, searchTerm, severityFilter, statusFilter]);

  return (
    <div className="space-y-3">
      {!hasAssociatedCompliance ? (
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Compliance Rule Set Association
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              No compliance rule set is in use for this Display Unit.
            </p>
            <Button
              type="button"
              variant="success"
              className="items-center gap-1.5"
              onClick={() => setIsAssociationModalOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              Associate Compliance Rule Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">
                Associated Compliance Rule Set
              </CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="items-center gap-1.5"
                onClick={() => setIsAssociationModalOpen(true)}
              >
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground text-sm">
              {associatedRuleSetName}
            </div>
            {selectedRuleSet?.description ? (
              <div className="text-muted-foreground text-sm">
                {selectedRuleSet.description}
              </div>
            ) : null}
            {selectedRuleSet ? (
              <div className="text-muted-foreground text-sm">
                {selectedRuleSet.rulesCount} rules ·{" "}
                {selectedRuleSet.enabledCount} enabled
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <ComplianceAssociationModal
        isOpen={isAssociationModalOpen}
        onClose={() => setIsAssociationModalOpen(false)}
        ruleSetOptions={ruleSets}
        ruleSetId={selectedRuleSetId}
        onRuleSetIdChange={onRuleSetChange}
        onSaveAssociation={onSaveRuleSet}
      />

      {selectedRuleSet ? (
        <Card className="border-border bg-card/80">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="text-chart-2 size-4" aria-hidden />
              {selectedRuleSet.name}
            </CardTitle>
            {selectedRuleSet.description && (
              <p className="text-muted-foreground text-sm">
                {selectedRuleSet.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-border bg-muted/30 grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rules in set</span>
                <span className="text-foreground font-medium tabular-nums">
                  {selectedRuleSet.rulesCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enabled rules</span>
                <span className="text-foreground font-medium tabular-nums">
                  {selectedRuleSet.enabledCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Rules in this set
              </h4>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : isError ? (
                <p className="text-destructive py-2 text-sm">
                  Could not load rules for this set.
                </p>
              ) : rules && rules.length > 0 ? (
                <div className="space-y-2">
                  <div className="border-border bg-card/95 sticky top-0 z-10 space-y-2 rounded-md border p-2 backdrop-blur-sm">
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
                          setSeverityFilter(
                            e.target.value as "all" | RuleSeverity,
                          )
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
                            e.target.value as
                              | "all"
                              | "Active"
                              | "Draft"
                              | "Retired",
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
                    <p className="text-muted-foreground text-xs">
                      Showing {filteredRules.length} of {rules.length} rules
                    </p>
                  </div>
                  <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                    {filteredRules.length > 0 ? (
                      filteredRules.map((rule) => (
                        <RuleCard key={rule.ruleId} rule={rule} />
                      ))
                    ) : (
                      <p className="text-muted-foreground py-2 text-sm">
                        No rules match the selected filters.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-2 text-sm">
                  No rules in this set.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border px-4 py-3 text-sm">
          Select a compliance rule set in the association dialog to view full
          rule details.
        </div>
      )}
    </div>
  );
}
