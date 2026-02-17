/**
 * Rule Builder Modal
 *
 * Create New Rule Set: Multi-rule form with name, description, category (VISUAL, SAFETY, PROFITABILITY, EFFICIENCY), threshold.
 * + Add rule creates empty fields at the bottom.
 * Edit mode: Single-rule form for editing existing rules.
 */

import { useState, useCallback } from "react";
import { Plus, Trash2, X, Settings, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  useCreateComplianceRule,
  useUpdateComplianceRule,
} from "@/features/checker/hooks";
import { KNOWLEDGE_SHELF_TYPES } from "@/features/checker/api/knowledge-center";
import { useToast } from "@/hooks/use-toast";
import type {
  ComplianceRule,
  CreateRuleInput,
  RuleSeverity,
  RuleType,
  UpdateRuleInput,
} from "@/types/checker";

const RULE_CATEGORIES: RuleType[] = ["VISUAL", "SAFETY", "PROFITABILITY", "EFFICIENCY"];
const LEGACY_RULE_TYPES: RuleType[] = [
  "Facings",
  "Spacing",
  "Product Position",
  "Margin",
  "OOS",
  "Labeling",
];
const SEVERITY_LEVELS: RuleSeverity[] = ["Low", "Medium", "High"];

export interface RuleSetItem {
  id: string;
  name: string;
  description: string;
  category: RuleType;
  threshold: string;
  enabled: boolean;
}

function createEmptyRule(id: string): RuleSetItem {
  return {
    id,
    name: "",
    description: "",
    category: "SAFETY",
    threshold: "N/A",
    enabled: true,
  };
}

export interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: ComplianceRule | null;
  createdBy: string;
}

export function RuleBuilderModal({
  isOpen,
  onClose,
  rule,
  createdBy,
}: RuleBuilderModalProps) {
  const { toast } = useToast();
  const createRule = useCreateComplianceRule();
  const updateRule = useUpdateComplianceRule();

  const isEdit = Boolean(rule);
  const isRetired = rule?.status === "Retired";

  // Create mode: multi-rule state
  const [rules, setRules] = useState<RuleSetItem[]>(() => [
    createEmptyRule(crypto.randomUUID()),
  ]);

  // Edit mode: single-rule state
  const [ruleName, setRuleName] = useState(rule?.ruleName ?? "");
  const [ruleType, setRuleType] = useState<RuleType>(rule?.ruleType ?? "Facings");
  const [shelfType, setShelfType] = useState(rule?.shelfType ?? "Beverages");
  const [expectedValue, setExpectedValue] = useState(rule?.expectedValue ?? "");
  const [tolerance, setTolerance] = useState<string>(
    rule?.tolerance?.toString() ?? ""
  );
  const [severity, setSeverity] = useState<RuleSeverity>(
    rule?.severity ?? "Medium"
  );
  const [changeSummary, setChangeSummary] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRule = useCallback(() => {
    setRules((prev) => [...prev, createEmptyRule(crypto.randomUUID())]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length > 0 ? next : [createEmptyRule(crypto.randomUUID())];
    });
  }, []);

  const updateRuleItem = useCallback(
    (id: string, updates: Partial<RuleSetItem>) => {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    []
  );

  const resetForm = () => {
    setRules([createEmptyRule(crypto.randomUUID())]);
    setRuleName("");
    setRuleType("Facings");
    setShelfType("Beverages");
    setExpectedValue("");
    setTolerance("");
    setSeverity("Medium");
    setChangeSummary("");
    setErrors({});
  };

  const validateCreate = (): boolean => {
    const next: Record<string, string> = {};
    const enabledRules = rules.filter((r) => r.enabled);
    if (enabledRules.length === 0) {
      next.rules = "At least one rule must be enabled.";
    }
    enabledRules.forEach((r) => {
      if (!r.name.trim()) next[`rule-${r.id}-name`] = "Rule name is required.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateEdit = (): boolean => {
    const next: Record<string, string> = {};
    if (!ruleName.trim()) next.ruleName = "Rule name is required.";
    if (!expectedValue.trim()) next.expectedValue = "Expected value is required.";
    const tol = parseFloat(tolerance);
    if (tolerance !== "" && (Number.isNaN(tol) || tol < 0)) {
      next.tolerance = "Tolerance must be a valid non-negative number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitCreate = async () => {
    if (!validateCreate()) return;

    const enabledRules = rules.filter((r) => r.enabled && r.name.trim());
    if (enabledRules.length === 0) {
      toast({
        title: "No rules to save",
        description: "Add at least one rule with a name.",
        variant: "destructive",
      });
      return;
    }

    let successCount = 0;
    let lastError: Error | null = null;

    for (const r of enabledRules) {
      const payload: CreateRuleInput = {
        ruleName: r.name.trim(),
        ruleType: r.category,
        shelfType: "Beverages",
        expectedValue: r.threshold.trim() || "N/A",
        severity: "Medium",
        createdBy,
        description: r.description.trim() || undefined,
      };
      try {
        await createRule.mutateAsync(payload);
        successCount += 1;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (successCount > 0) {
      toast({
        title: "Rule set created",
        description: `${successCount} rule(s) created as Draft.`,
      });
      resetForm();
      onClose();
    }
    if (lastError) {
      toast({
        title: "Some rules failed",
        description: lastError.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitEdit = () => {
    if (!validateEdit() || !rule || isRetired) return;

    const payload: UpdateRuleInput = {
      ruleName: ruleName.trim(),
      ruleType,
      shelfType,
      expectedValue: expectedValue.trim(),
      tolerance: tolerance === "" ? undefined : parseFloat(tolerance),
      severity,
      updatedBy: createdBy,
      changeSummary: changeSummary.trim() || undefined,
    };
    updateRule.mutate(
      { ruleId: rule.ruleId, payload },
      {
        onSuccess: () => {
          toast({ title: "Rule updated", description: "The rule has been updated." });
          onClose();
        },
        onError: (err) => {
          toast({
            title: "Update failed",
            description: err instanceof Error ? err.message : "Could not update rule.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSubmit = () => {
    if (isEdit) handleSubmitEdit();
    else handleSubmitCreate();
  };

  const handleClose = () => {
    if (!createRule.isPending && !updateRule.isPending) {
      resetForm();
      onClose();
    }
  };

  const isPending = createRule.isPending || updateRule.isPending;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
      <div className="rounded-lg border border-border bg-card shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent/10 p-2">
              <Settings className="size-5 text-accent" />
            </div>
            <CardHeader className="p-0">
              <CardTitle>
                {isEdit ? "Edit Rule" : "Create New Rule Set"}
              </CardTitle>
            </CardHeader>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEdit ? (
            /* Edit mode: single-rule form */
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="space-y-6 p-0">
                {rule?.ruleId && (
                  <p className="text-sm text-muted-foreground">Rule ID: {rule.ruleId}</p>
                )}
                <FormField label="Rule Name" required error={errors.ruleName} htmlFor="rule-name">
                  <Input
                    id="rule-name"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. Minimum Beverage Facings"
                    disabled={isRetired}
                  />
                </FormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Rule Type" required htmlFor="rule-type">
                    <Select
                      id="rule-type"
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value as RuleType)}
                      disabled={isRetired}
                    >
                      {[...LEGACY_RULE_TYPES, ...RULE_CATEGORIES].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Shelf Type" required htmlFor="shelf-type">
                    <Select
                      id="shelf-type"
                      value={shelfType}
                      onChange={(e) => setShelfType(e.target.value)}
                      disabled={isRetired}
                    >
                      {KNOWLEDGE_SHELF_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <FormField
                  label="Expected Value"
                  required
                  error={errors.expectedValue}
                  htmlFor="expected-value"
                >
                  <Input
                    id="expected-value"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    placeholder="e.g. >= 3 or All labels front-facing"
                    disabled={isRetired}
                  />
                </FormField>
                <FormField label="Tolerance (optional)" error={errors.tolerance} htmlFor="tolerance">
                  <Input
                    id="tolerance"
                    type="number"
                    min={0}
                    step={0.1}
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                    placeholder="e.g. 1"
                    disabled={isRetired}
                  />
                </FormField>
                <FormField label="Severity" required htmlFor="severity">
                  <Select
                    id="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as RuleSeverity)}
                    disabled={isRetired}
                  >
                    {SEVERITY_LEVELS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </FormField>
                {isEdit && (
                  <FormField label="Change Summary (optional)" htmlFor="change-summary">
                    <Input
                      id="change-summary"
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      placeholder="Brief description of changes"
                      disabled={isRetired}
                    />
                  </FormField>
                )}
                {isRetired && (
                  <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    Retired rules cannot be edited. Clone the rule to create a new version.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Create mode: multi-rule form */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Rules ({rules.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRule}
                  className="bg-accent text-accent-foreground border-accent hover:bg-accent/90 hover:text-accent-foreground"
                >
                  <Plus className="size-4" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border bg-card/50 p-4 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`enabled-${r.id}`}
                        checked={r.enabled}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          updateRuleItem(r.id, { enabled: checked === true })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0 space-y-3">
                        <Input
                          placeholder="Rule name"
                          value={r.name}
                          onChange={(e) => updateRuleItem(r.id, { name: e.target.value })}
                          className="font-medium"
                        />
                        <Input
                          placeholder="Description"
                          value={r.description}
                          onChange={(e) =>
                            updateRuleItem(r.id, { description: e.target.value })
                          }
                          className="text-sm text-muted-foreground"
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <Select
                            value={r.category}
                            onChange={(e) =>
                              updateRuleItem(r.id, {
                                category: e.target.value as RuleType,
                              })
                            }
                            className="w-[180px]"
                          >
                            {RULE_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </Select>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Threshold:
                            </span>
                            <Input
                              placeholder="N/A"
                              value={r.threshold}
                              onChange={(e) =>
                                updateRuleItem(r.id, { threshold: e.target.value })
                              }
                              className="w-24"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRule(r.id)}
                        className="rounded p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                        aria-label="Delete rule"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {errors.rules && (
                <p className="text-sm text-destructive">{errors.rules}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4 shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isRetired || isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Save className="size-4" />
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
