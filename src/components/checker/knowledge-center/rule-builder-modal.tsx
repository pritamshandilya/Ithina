/**
 * Rule Builder Modal
 *
 * Unified form for create and edit: Rule Set Name, rules with name, description, category (VISUAL, SAFETY, PROFITABILITY, EFFICIENCY), threshold.
 * Add Rule and Delete rule available in both create and edit modes (when not retired).
 * View/Edit: Same form, prepopulated with rule values. Supports multiple rules in a set.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { FileText, Link2, Plus, Save, Settings, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  useCreateComplianceRule,
  useReferenceDocuments,
  useUpdateReferenceDocumentLinks,
  useUploadReferenceDocument,
  useUpdateComplianceRule,
} from "@/queries/checker";
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
  /** When editing a rule set, pass all rules in the set for pre-fill. Omit to use single rule. */
  rulesInSet?: ComplianceRule[];
  createdBy: string;
}

export function RuleBuilderModal({
  isOpen,
  onClose,
  rule,
  rulesInSet,
  createdBy,
}: RuleBuilderModalProps) {
  const { toast } = useToast();
  const createRule = useCreateComplianceRule();
  const updateRule = useUpdateComplianceRule();
  const { data: documents } = useReferenceDocuments();
  const updateLinks = useUpdateReferenceDocumentLinks();
  const uploadDocument = useUploadReferenceDocument();
  const docInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(rule);
  const isRetired = rule?.status === "Retired";

  // Unified form state (create and edit)
  const [ruleSetName, setRuleSetName] = useState("");
  const [rules, setRules] = useState<RuleSetItem[]>(() => [
    createEmptyRule(crypto.randomUUID()),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [docSearch, setDocSearch] = useState("");

  // Sync form when rule prop changes (view/edit)
  useEffect(() => {
    const t = setTimeout(() => {
      if (rule) {
        const rulesToLoad = rulesInSet && rulesInSet.length > 0 ? rulesInSet : [rule];
        setRuleSetName(rule.ruleSetName ?? rule.ruleName ?? "");
        setRules(
          rulesToLoad.map((r) => ({
            id: r.ruleId,
            name: r.ruleName,
            description: r.description ?? "",
            category: r.ruleType,
            threshold: r.expectedValue,
            enabled: r.enabled ?? true,
          }))
        );
      } else {
        setRuleSetName("");
        setRules([createEmptyRule(crypto.randomUUID())]);
      }
      setErrors({});
    }, 0);
    return () => clearTimeout(t);
  }, [rule, rulesInSet]);

  useEffect(() => {
    if (!rule || !documents) {
      if (!isOpen) {
        setSelectedDocumentIds([]);
        setDocSearch("");
      }
      return;
    }

    const idsInScope = new Set((rulesInSet ?? [rule]).map((r) => r.ruleId));
    const linkedDocIds = documents
      .filter((doc) => doc.linkedRuleIds.some((id) => idsInScope.has(id)))
      .map((doc) => doc.id);
    setSelectedDocumentIds(linkedDocIds);
  }, [rule, rulesInSet, documents, isOpen]);

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!docSearch.trim()) return documents;
    const q = docSearch.toLowerCase();
    return documents.filter((d) => d.name.toLowerCase().includes(q));
  }, [documents, docSearch]);

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
    setSelectedDocumentIds([]);
    setDocSearch("");
  };

  const syncDocumentLinks = useCallback(
    async (targetRuleIds: string[]) => {
      if (!documents || targetRuleIds.length === 0) return;

      for (const doc of documents) {
        const shouldLink = selectedDocumentIds.includes(doc.id);
        const hasAnyTargetLink = targetRuleIds.some((id) => doc.linkedRuleIds.includes(id));
        if (shouldLink === hasAnyTargetLink) continue;

        const nextRuleIds = shouldLink
          ? [...new Set([...doc.linkedRuleIds, ...targetRuleIds])]
          : doc.linkedRuleIds.filter((id) => !targetRuleIds.includes(id));

        await updateLinks.mutateAsync({ documentId: doc.id, linkedRuleIds: nextRuleIds });
      }
    },
    [documents, selectedDocumentIds, updateLinks]
  );

  const handleUploadReferenceDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Invalid file type",
        description: "Only PDF documents are supported.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    uploadDocument.mutate(
      { name: file.name, uploadedBy: createdBy, linkedRuleIds: [] },
      {
        onSuccess: (doc) => {
          setSelectedDocumentIds((prev) => [...new Set([...prev, doc.id])]);
          toast({
            title: "Document uploaded",
            description: "Document is ready and selected for this rule set.",
          });
          e.target.value = "";
        },
        onError: (err) => {
          toast({
            title: "Upload failed",
            description: err instanceof Error ? err.message : "Could not upload document.",
            variant: "destructive",
          });
          e.target.value = "";
        },
      }
    );
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
    const enabledRules = rules.filter((r) => r.enabled);
    if (enabledRules.length === 0) next.rules = "At least one rule must be enabled.";
    rules.forEach((r) => {
      if (r.enabled && !r.name.trim()) next[`rule-${r.id}-name`] = "Rule name is required.";
    });
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
      const createdRuleIds: string[] = [];

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
          const created = await createRule.mutateAsync(payload);
          createdRuleIds.push(created.ruleId);
          successCount += 1;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (successCount > 0) {
        await syncDocumentLinks(createdRuleIds);
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
    [ruleSetName, rules, createdBy, createRule, onClose, syncDocumentLinks, toast]
  );

  const handleSubmitCreate = async () => {
    if (!validateCreate()) return;
    await saveAsDraft(false);
  };

  const handleSubmitEdit = async () => {
    if (!validateEdit() || !rule || isRetired) return;

    const name = ruleSetName.trim();
    const ruleSetId = rule.ruleSetId ?? rule.ruleId;
    const ruleSetNameForCreate = rule.ruleSetName ?? rule.ruleName ?? name;
    const rulesToSave = rules.filter((r) => r.enabled && r.name.trim());
    if (rulesToSave.length === 0) return;

    const existingRuleIds = new Set((rulesInSet ?? [rule]).map((r) => r.ruleId));
    let successCount = 0;
    let lastError: Error | null = null;
    const syncedRuleIds: string[] = [];

    for (const r of rulesToSave) {
      const isExisting = existingRuleIds.has(r.id);
      if (isExisting) {
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
        try {
          await updateRule.mutateAsync({ ruleId: r.id, payload });
          syncedRuleIds.push(r.id);
          successCount += 1;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      } else {
        const payload: CreateRuleInput = {
          ruleName: r.name.trim(),
          ruleType: r.category,
          shelfType: rule.shelfType,
          expectedValue: r.threshold.trim() || "N/A",
          severity: rule.severity,
          createdBy,
          description: r.description.trim() || undefined,
          ruleSetId,
          ruleSetName: ruleSetNameForCreate,
          enabled: r.enabled,
        };
        try {
          const created = await createRule.mutateAsync(payload);
          syncedRuleIds.push(created.ruleId);
          successCount += 1;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
    }

    if (successCount > 0) {
      await syncDocumentLinks(syncedRuleIds);
      toast({
        title: "Rules saved",
        description: `${successCount} rule(s) updated.`,
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

  const handleSubmit = () => {
    if (isEdit) void handleSubmitEdit();
    else void handleSubmitCreate();
  };

  const handleClose = async () => {
    if (createRule.isPending || updateRule.isPending || uploadDocument.isPending || updateLinks.isPending) return;

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

  const isPending = createRule.isPending || updateRule.isPending || uploadDocument.isPending || updateLinks.isPending;

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

            <div className="shrink-0 rounded-lg border border-border bg-card/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Reference Documents</p>
                  <p className="text-xs text-muted-foreground">
                    Attach policy docs used to define this rule set.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadReferenceDoc}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => docInputRef.current?.click()}
                    disabled={uploadDocument.isPending}
                  >
                    <Upload className="size-4" />
                    {uploadDocument.isPending ? "Uploading..." : "Upload PDF"}
                  </Button>
                </div>
              </div>

              <div className="mt-2 relative">
                <Input
                  placeholder="Search documents..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              <div className="mt-2 max-h-28 overflow-y-auto rounded-md border border-border/80">
                {filteredDocuments.length === 0 ? (
                  <p className="p-2 text-xs text-muted-foreground">No documents available.</p>
                ) : (
                  filteredDocuments.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex cursor-pointer items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5 text-sm last:border-b-0 hover:bg-muted/40"
                    >
                      <span className="min-w-0 truncate flex items-center gap-1.5">
                        <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                        {doc.name}
                      </span>
                      <Checkbox
                        checked={selectedDocumentIds.includes(doc.id)}
                        onCheckedChange={(checked: boolean | "indeterminate") => {
                          setSelectedDocumentIds((prev) =>
                            checked === true
                              ? [...new Set([...prev, doc.id])]
                              : prev.filter((id) => id !== doc.id)
                          );
                        }}
                      />
                    </label>
                  ))
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                <Link2 className="size-3" />
                Links are saved when you save this rule set.
              </p>
            </div>
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-foreground">
                Rules ({rules.length})
              </h3>
              {!isRetired && (
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
                    <th className="text-left p-2 w-10" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
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
                            updateRuleItem(r.id, { enabled: checked === true })
                          }
                          className="mt-1"
                          disabled={isRetired}
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
                      <td className="p-2 align-top">
                        {!isRetired && rules.length > 1 ? (
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
