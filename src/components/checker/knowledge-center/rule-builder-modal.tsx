/**
 * Rule Builder Modal
 *
 * Unified form for create and edit: Rule Set Name, rules with name, description, category (VISUAL, SAFETY, PROFITABILITY, EFFICIENCY), threshold.
 * + Add rule creates empty fields at the bottom (create mode only).
 * View/Edit: Same form, prepopulated with rule values.
 */

import { useState, useCallback, useEffect } from "react";
import { Plus, Trash2, X, Settings, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  useCreateComplianceRule,
  useUpdateComplianceRule,
} from "@/features/checker/hooks";
import { useToast } from "@/hooks/use-toast";
import type {
  ComplianceRule,
  CreateRuleInput,
  RuleType,
  UpdateRuleInput,
} from "@/types/checker";

const RULE_CATEGORIES: RuleType[] = ["VISUAL", "SAFETY", "PROFITABILITY", "EFFICIENCY"];

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
  /** When editing, call this to switch to create-new-rule-set mode */
  onAddNewRuleSet?: () => void;
}

export function RuleBuilderModal({
  isOpen,
  onClose,
  rule,
  createdBy,
  onAddNewRuleSet,
}: RuleBuilderModalProps) {
  const { toast } = useToast();
  const createRule = useCreateComplianceRule();
  const updateRule = useUpdateComplianceRule();

  const isEdit = Boolean(rule);
  const isRetired = rule?.status === "Retired";

  // Unified form state (create and edit)
  const [ruleSetName, setRuleSetName] = useState("");
  const [rules, setRules] = useState<RuleSetItem[]>(() => [
    createEmptyRule(crypto.randomUUID()),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form when rule prop changes (view/edit)
  useEffect(() => {
    const t = setTimeout(() => {
      if (rule) {
        setRuleSetName(rule.ruleSetName ?? rule.ruleName ?? "");
        setRules([
          {
            id: rule.ruleId,
            name: rule.ruleName,
            description: rule.description ?? "",
            category: rule.ruleType,
            threshold: rule.expectedValue,
            enabled: rule.enabled ?? true,
          },
        ]);
      } else {
        setRuleSetName("");
        setRules([createEmptyRule(crypto.randomUUID())]);
      }
      setErrors({});
    }, 0);
    return () => clearTimeout(t);
  }, [rule]);

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
    setRuleSetName("");
    setRules([createEmptyRule(crypto.randomUUID())]);
    setErrors({});
  };

  const validateCreate = (): boolean => {
    const next: Record<string, string> = {};
    if (!ruleSetName.trim()) {
      next.ruleSetName = "Rule set name is required.";
    }
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
    if (!ruleSetName.trim()) next.ruleSetName = "Rule set name is required.";
    const r = rules[0];
    if (r) {
      if (!r.name.trim()) next[`rule-${r.id}-name`] = "Rule name is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** Persist rules as draft. Used by Save (validated) and Cancel (lenient auto-save).
   * Saves ALL rules with names (including disabled ones) so the Rules column shows enabled/total correctly. */
  const saveAsDraft = useCallback(
    async (lenient: boolean): Promise<boolean> => {
      const name = ruleSetName.trim() || "Untitled Draft";
      let rulesToSave = rules.filter((r) => r.name.trim());
      if (lenient && rulesToSave.length === 0 && rules.length > 0) {
        rulesToSave = [{ ...rules[0]!, name: rules[0]!.name.trim() || "Untitled" }];
      }
      if (rulesToSave.length === 0) return false;

      const ruleSetId = crypto.randomUUID();
      let successCount = 0;
      let lastError: Error | null = null;

      for (const r of rulesToSave) {
        const payload: CreateRuleInput = {
          ruleName: r.name.trim() || "Untitled",
          ruleType: r.category,
          shelfType: "Beverages",
          expectedValue: r.threshold.trim() || "N/A",
          severity: "Medium",
          createdBy,
          description: r.description.trim() || undefined,
          ruleSetId,
          ruleSetName: name,
          enabled: r.enabled,
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
          title: "Saved as draft",
          description: `${successCount} rule(s) saved as Draft.`,
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
      return successCount > 0;
    },
    [ruleSetName, rules, createdBy, createRule, onClose, toast]
  );

  const handleSubmitCreate = async () => {
    if (!validateCreate()) return;
    await saveAsDraft(false);
  };

  const handleSubmitEdit = () => {
    if (!validateEdit() || !rule || isRetired) return;

    const r = rules[0];
    if (!r) return;

    const payload: UpdateRuleInput = {
      ruleName: r.name.trim(),
      ruleType: r.category,
      shelfType: rule.shelfType,
      expectedValue: r.threshold.trim() || "N/A",
      tolerance: rule.tolerance,
      severity: rule.severity,
      updatedBy: createdBy,
      changeSummary: undefined,
    };
    updateRule.mutate(
      { ruleId: rule.ruleId, payload },
      {
        onSuccess: () => {
          toast({ title: "Rule updated", description: "The rule has been updated." });
          resetForm();
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

  const handleClose = async () => {
    if (createRule.isPending || updateRule.isPending) return;

    if (isEdit) {
      resetForm();
      onClose();
      return;
    }

    // Create mode: Cancel = auto-save as draft if there's any content
    const hasContent =
      ruleSetName.trim() ||
      rules.some((r) => r.name.trim() || r.description.trim() || r.threshold.trim());
    if (hasContent) {
      await saveAsDraft(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const isPending = createRule.isPending || updateRule.isPending;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
      <div className="rounded-lg border border-border bg-card shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
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
          <div className="flex items-center gap-2">
            {isEdit && onAddNewRuleSet && !isRetired && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddNewRuleSet}
                className="shrink-0"
              >
                <Plus className="size-4" />
                Add New Rule Set
              </Button>
            )}
            <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          </div>
        </div>

        {/* Content - unified form for create and edit */}
        <div className="flex-1 min-h-0 flex flex-col px-5 py-3">
          <div className="flex flex-col min-h-0 flex-1 gap-4">
            {isEdit && rule?.ruleId && (
              <p className="text-sm text-muted-foreground shrink-0">Rule ID: {rule.ruleId}</p>
            )}
            <FormField
              label="Rule Set Name"
              required
              error={errors.ruleSetName}
              htmlFor="rule-set-name"
              className="shrink-0"
            >
              <Input
                id="rule-set-name"
                placeholder="e.g. Store Safety & Efficiency Rules"
                value={ruleSetName}
                onChange={(e) => setRuleSetName(e.target.value)}
                disabled={isRetired}
              />
            </FormField>
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-foreground">
                Rules ({rules.length})
              </h3>
              {!isEdit && (
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
              )}
            </div>

            <div className="rounded-lg border border-border overflow-hidden flex-1 min-h-0 overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left p-2 w-10" scope="col">
                      <span className="sr-only">Enabled</span>
                    </th>
                    <th className="text-left p-2 font-medium text-foreground" scope="col">
                      Rule name
                    </th>
                    <th className="text-left p-2 font-medium text-foreground" scope="col">
                      Description
                    </th>
                    <th className="text-left p-2 font-medium text-foreground" scope="col">
                      Category
                    </th>
                    <th className="text-left p-2 font-medium text-foreground" scope="col">
                      Threshold
                    </th>
                    {!isEdit && (
                      <th className="text-left p-2 w-10" scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-2 align-top">
                        <Checkbox
                          id={`enabled-${r.id}`}
                          checked={r.enabled}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            !isEdit && updateRuleItem(r.id, { enabled: checked === true })
                          }
                          className="mt-1"
                          disabled={isEdit}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          placeholder="Rule name"
                          value={r.name}
                          onChange={(e) => updateRuleItem(r.id, { name: e.target.value })}
                          className="font-medium h-8 w-full min-w-[120px]"
                          disabled={isRetired}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          placeholder="Description"
                          value={r.description}
                          onChange={(e) =>
                            updateRuleItem(r.id, { description: e.target.value })
                          }
                          className="text-sm text-muted-foreground h-8 w-full min-w-[140px]"
                          disabled={isRetired}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Select
                          value={r.category}
                          onChange={(e) =>
                            updateRuleItem(r.id, {
                              category: e.target.value as RuleType,
                            })
                          }
                          className="w-full min-w-[140px] h-8"
                          disabled={isRetired}
                        >
                          {RULE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          placeholder="N/A"
                          value={r.threshold}
                          onChange={(e) =>
                            updateRuleItem(r.id, { threshold: e.target.value })
                          }
                          className="w-20 h-8"
                          disabled={isRetired}
                        />
                      </td>
                      {!isEdit && (
                        <td className="p-2 align-top">
                          {rules.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeRule(r.id)}
                              className="rounded p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                              aria-label="Delete rule"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          ) : (
                            <span className="w-10 block" aria-hidden />
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.rules && (
              <p className="text-sm text-destructive shrink-0">{errors.rules}</p>
            )}
            {isRetired && (
              <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground shrink-0">
                Retired rules cannot be edited. Clone the rule to create a new version.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          {isEdit ? (
            <Button
              onClick={handleSubmit}
              disabled={isRetired || isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Save className="size-4" />
              {isPending ? "Saving…" : "Save"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isRetired || isPending || !ruleSetName.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Save className="size-4" />
              {isPending ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
