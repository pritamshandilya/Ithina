import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  COMPLIANCE_RULE_SET_NAME_MAX_LENGTH,
  type ComplianceRuleCategory,
  type ComplianceRuleSetStatus,
  type CreateComplianceRuleSetInput,
} from "@/queries/maker/api/compliance-rule-sets";

type RuleFormItem = {
  /** Stable React key; must not depend on editable fields (e.g. name). */
  localId: string;
  name: string;
  description: string;
  category: ComplianceRuleCategory;
  threshold: string;
  is_active: boolean;
};

function newRuleLocalId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createEmptyRule(): RuleFormItem {
  return {
    localId: newRuleLocalId(),
    name: "",
    description: "",
    category: "VISUAL",
    threshold: "95",
    is_active: true,
  };
}

export interface CreateComplianceRuleSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onSubmit: (payload: CreateComplianceRuleSetInput) => void | Promise<void>;
  mode?: "create" | "edit";
  lockNameAndStatus?: boolean;
  initialValues?: Partial<CreateComplianceRuleSetInput> & {
    /** When editing an existing rule set. */
    id?: string;
  };
}

const RULE_CATEGORIES: ComplianceRuleCategory[] = [
  "VISUAL",
  "SAFETY",
  "PROFITABILITY",
  "EFFICIENCY",
];

const STATUS_OPTIONS: ComplianceRuleSetStatus[] = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
];

const RULE_SURFACE_CLASSNAME =
  "border-border bg-card/80 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30";

const RULE_SELECT_CLASSNAME =
  "h-9 border-border bg-card/80 text-foreground focus-visible:ring-ring focus-visible:ring-offset-0";

export function CreateComplianceRuleSetModal({
  isOpen,
  onClose,
  isSubmitting = false,
  onSubmit,
  mode = "create",
  lockNameAndStatus = false,
  initialValues,
}: CreateComplianceRuleSetModalProps) {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [status, setStatus] = useState<ComplianceRuleSetStatus>("ACTIVE");
  const [rules, setRules] = useState<RuleFormItem[]>(() => [createEmptyRule()]);

  const title =
    mode === "create" ? "New Compliance Rule Set" : "Edit Compliance Rule Set";
  const submitLabel = mode === "create" ? "Create" : "Save changes";
  const initialRules = initialValues?.rules;

  const normalizedInitialRules = useMemo(() => {
    if (!initialRules?.length) return null;
    return initialRules.map((r) => ({
      name: r.name,
      description: r.description,
      category: r.category,
      threshold: String(r.threshold),
      is_active: r.is_active,
    }));
  }, [initialRules]);

  useEffect(() => {
    if (!isOpen) return;

    setName(initialValues?.name ?? "");
    setStatus(initialValues?.status ?? "ACTIVE");
    setRules(
      normalizedInitialRules
        ? normalizedInitialRules.map((r) => ({
            ...r,
            localId: newRuleLocalId(),
          }))
        : [createEmptyRule()],
    );

  }, [
    isOpen,
    normalizedInitialRules,
    initialValues?.name,
    initialValues?.status,
  ]);

  const ruleNameSet = useMemo(
    () => rules.map((r) => r.name.trim().toLowerCase()),
    [rules],
  );
  const hasDuplicateRuleNames = useMemo(() => {
    const seen = new Set<string>();
    for (const n of ruleNameSet) {
      if (!n) continue;
      if (seen.has(n)) return true;
      seen.add(n);
    }
    return false;
  }, [ruleNameSet]);

  const updateRule = (
    localId: string,
    updates: Partial<Omit<RuleFormItem, "localId">>,
  ) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.localId === localId ? { ...rule, ...updates } : rule,
      ),
    );
  };

  const removeRule = (localId: string) => {
    setRules((prev) => {
      if (prev.length === 1) return [createEmptyRule()];
      return prev.filter((rule) => rule.localId !== localId);
    });
  };

  function validate(): { ok: true } | { ok: false; message: string } {
    const trimmedName = name.trim();
    if (!trimmedName)
      return { ok: false, message: "Rule set name is required." };
    if (trimmedName.length > COMPLIANCE_RULE_SET_NAME_MAX_LENGTH) {
      return {
        ok: false,
        message: `Rule set name must be <= ${COMPLIANCE_RULE_SET_NAME_MAX_LENGTH} characters.`,
      };
    }

    if (rules.length < 1)
      return { ok: false, message: "At least one rule is required." };
    if (hasDuplicateRuleNames)
      return { ok: false, message: "Rule names must be unique." };

    for (let i = 0; i < rules.length; i += 1) {
      const r = rules[i];
      if (!r.name.trim())
        return { ok: false, message: `Rule #${i + 1}: name is required.` };
      if (!r.description.trim()) {
        return {
          ok: false,
          message: `Rule #${i + 1}: description is required.`,
        };
      }
      if (!r.threshold.trim()) {
        return { ok: false, message: `Rule #${i + 1}: threshold is required.` };
      }
      const threshold = Number(r.threshold);
      if (!Number.isFinite(threshold)) {
        return {
          ok: false,
          message: `Rule #${i + 1}: threshold must be a number.`,
        };
      }
    }

    return { ok: true };
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validation = validate();
    if (!validation.ok) {
      toast({
        title: "Fix form errors",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    const payload: CreateComplianceRuleSetInput = {
      name: name.trim(),
      status,
      reference_document_id: null,
      rules: rules.map((r) => ({
        name: r.name.trim(),
        description: r.description.trim(),
        category: r.category,
        threshold: Number(r.threshold),
        is_active: r.is_active,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-h-[min(90dvh,calc(100vh-2rem))] max-w-3xl"
    >
      <div
        className="border-border bg-card flex max-h-[min(90dvh,calc(100vh-2rem))] w-full flex-col overflow-hidden rounded-lg border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-border/60 flex shrink-0 items-start justify-between gap-3 border-b px-6 pt-6 pr-14 pb-4">
          <div className="min-w-0">
            <h3 className="text-foreground text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Configure a compliance rule set and its rules.
            </p>
          </div>
          <div className="text-muted-foreground hidden shrink-0 text-xs sm:block">
            {COMPLIANCE_RULE_SET_NAME_MAX_LENGTH - name.trim().length} chars
            left
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-4">
          <div className="space-y-5">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <Label htmlFor="crs-name">Name</Label>
                <span className="text-muted-foreground text-xs sm:hidden">
                  {COMPLIANCE_RULE_SET_NAME_MAX_LENGTH - name.trim().length}{" "}
                  chars left
                </span>
              </div>
              <Input
                id="crs-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baseline Compliance"
                disabled={isSubmitting || lockNameAndStatus}
              />
            </div>

            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="crs-status">Status</Label>
                <Select
                  id="crs-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ComplianceRuleSetStatus)
                  }
                  disabled={isSubmitting || lockNameAndStatus}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-foreground text-sm font-semibold">
                  Rules ({rules.length})
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="accent"
                  className="h-8 gap-1.5 shadow-none"
                  onClick={() =>
                    setRules((prev) => [...prev, createEmptyRule()])
                  }
                  disabled={isSubmitting}
                >
                  <Plus className="size-4" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-2.5 pt-0.5">
                {rules.map((r, idx) => (
                  <div key={r.localId} className="flex items-start gap-2.5">
                    <div className="flex h-11 shrink-0 items-center">
                      <Checkbox
                        id={`rule-active-${r.localId}`}
                        checked={r.is_active}
                        onCheckedChange={(v: boolean | "indeterminate") =>
                          updateRule(r.localId, { is_active: v === true })
                        }
                        className="h-5 w-5 rounded-[4px]"
                        disabled={isSubmitting}
                        aria-label={`Toggle ${r.name || `rule ${idx + 1}`}`}
                      />
                    </div>

                    <div className="border-border bg-card/80 min-w-0 flex-1 rounded-xl border p-3 shadow-sm">
                      <div className="space-y-2.5">
                        <Input
                          id={`rule-name-${r.localId}`}
                          value={r.name}
                          onChange={(e) =>
                            updateRule(r.localId, { name: e.target.value })
                          }
                          placeholder="Rule name"
                          className={`${RULE_SURFACE_CLASSNAME} h-10 font-medium`}
                          disabled={isSubmitting}
                          aria-label={`Rule ${idx + 1} name`}
                        />

                        <Input
                          id={`rule-desc-${r.localId}`}
                          value={r.description}
                          onChange={(e) =>
                            updateRule(r.localId, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Rule description"
                          className={`${RULE_SURFACE_CLASSNAME} h-9 text-sm`}
                          disabled={isSubmitting}
                          aria-label={`Rule ${idx + 1} description`}
                        />

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                            <Select
                              id={`rule-cat-${r.localId}`}
                              value={r.category}
                              onChange={(e) =>
                                updateRule(r.localId, {
                                  category: e.target
                                    .value as ComplianceRuleCategory,
                                })
                              }
                              className={`${RULE_SELECT_CLASSNAME} sm:max-w-[180px]`}
                              disabled={isSubmitting}
                              aria-label={`Rule ${idx + 1} category`}
                            >
                              {RULE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </Select>

                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Label
                                htmlFor={`rule-threshold-${r.localId}`}
                                className="text-muted-foreground shrink-0 text-sm font-medium"
                              >
                                Threshold:
                              </Label>
                              <Input
                                id={`rule-threshold-${r.localId}`}
                                type="number"
                                step="0.01"
                                value={r.threshold}
                                onChange={(e) =>
                                  updateRule(r.localId, {
                                    threshold: e.target.value,
                                  })
                                }
                                placeholder="0"
                                className={`${RULE_SURFACE_CLASSNAME} h-8 w-full sm:w-24`}
                                disabled={isSubmitting}
                                aria-label={`Rule ${idx + 1} threshold`}
                              />
                            </div>
                          </div>

                          {rules.length > 1 ? (
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0 disabled:opacity-40 disabled:hover:bg-transparent"
                                onClick={() => removeRule(r.localId)}
                                disabled={isSubmitting}
                                aria-label={`Remove ${r.name || `rule ${idx + 1}`}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="border-border/60 bg-card flex shrink-0 justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" variant="success" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
