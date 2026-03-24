import { useEffect, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
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
  onSubmit: (
    payload: CreateComplianceRuleSetInput,
    options: { setAsDefault: boolean },
  ) => void | Promise<void>;
  mode?: "create" | "edit";
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

const STATUS_OPTIONS: ComplianceRuleSetStatus[] = ["DRAFT", "ACTIVE", "RETIRED"];

export function CreateComplianceRuleSetModal({
  isOpen,
  onClose,
  isSubmitting = false,
  onSubmit,
  mode = "create",
  initialValues,
}: CreateComplianceRuleSetModalProps) {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [status, setStatus] = useState<ComplianceRuleSetStatus>("ACTIVE");
  const [rules, setRules] = useState<RuleFormItem[]>(() => [createEmptyRule()]);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const title = mode === "create" ? "New Compliance Rule Set" : "Edit Compliance Rule Set";
  const submitLabel = mode === "create" ? "Create" : "Save changes";

  const normalizedInitialRules = useMemo(() => {
    if (!initialValues?.rules?.length) return null;
    return initialValues.rules.map((r) => ({
      name: r.name,
      description: r.description,
      category: r.category,
      threshold: String(r.threshold),
      is_active: r.is_active,
    }));
  }, [initialValues?.rules]);

  useEffect(() => {
    if (!isOpen) return;

    setName(initialValues?.name ?? "");
    setStatus(initialValues?.status ?? "ACTIVE");
    setRules(
      normalizedInitialRules
        ? normalizedInitialRules.map((r) => ({ ...r, localId: newRuleLocalId() }))
        : [createEmptyRule()],
    );

    // For edits, defaulting to unchecked avoids accidentally changing store defaults.
    setSetAsDefault(mode === "create");
  }, [
    isOpen,
    mode,
    normalizedInitialRules,
    initialValues?.name,
    initialValues?.status,
  ]);

  const ruleNameSet = useMemo(() => rules.map((r) => r.name.trim().toLowerCase()), [rules]);
  const hasDuplicateRuleNames = useMemo(() => {
    const seen = new Set<string>();
    for (const n of ruleNameSet) {
      if (!n) continue;
      if (seen.has(n)) return true;
      seen.add(n);
    }
    return false;
  }, [ruleNameSet]);

  function validate(): { ok: true } | { ok: false; message: string } {
    const trimmedName = name.trim();
    if (!trimmedName) return { ok: false, message: "Rule set name is required." };
    if (trimmedName.length > COMPLIANCE_RULE_SET_NAME_MAX_LENGTH) {
      return {
        ok: false,
        message: `Rule set name must be <= ${COMPLIANCE_RULE_SET_NAME_MAX_LENGTH} characters.`,
      };
    }

    if (rules.length < 1) return { ok: false, message: "At least one rule is required." };
    if (hasDuplicateRuleNames) return { ok: false, message: "Rule names must be unique." };

    for (let i = 0; i < rules.length; i += 1) {
      const r = rules[i];
      if (!r.name.trim()) return { ok: false, message: `Rule #${i + 1}: name is required.` };
      if (!r.description.trim()) {
        return { ok: false, message: `Rule #${i + 1}: description is required.` };
      }
      if (!r.threshold.trim()) {
        return { ok: false, message: `Rule #${i + 1}: threshold is required.` };
      }
      const threshold = Number(r.threshold);
      if (!Number.isFinite(threshold)) {
        return { ok: false, message: `Rule #${i + 1}: threshold must be a number.` };
      }
    }

    return { ok: true };
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validation = validate();
    if (!validation.ok) {
      toast({ title: "Fix form errors", description: validation.message, variant: "destructive" });
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

    await onSubmit(payload, { setAsDefault });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-3xl max-h-[min(90dvh,calc(100vh-2rem))]"
    >
      <div
        className="flex w-full max-h-[min(90dvh,calc(100vh-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-6 pb-4 pt-6 pr-14">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure a compliance rule set and its rules. Store defaults can be updated during creation.
            </p>
          </div>
          <div className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            {COMPLIANCE_RULE_SET_NAME_MAX_LENGTH - name.trim().length} chars left
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-4">
          <div className="space-y-5">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <Label htmlFor="crs-name">Name</Label>
                <span className="text-xs text-muted-foreground sm:hidden">
                  {COMPLIANCE_RULE_SET_NAME_MAX_LENGTH - name.trim().length} chars left
                </span>
              </div>
              <Input
                id="crs-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baseline Compliance"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="crs-status">Status</Label>
                <Select
                  id="crs-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ComplianceRuleSetStatus)}
                  disabled={isSubmitting}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="crs-set-default"
                    checked={setAsDefault}
                    onCheckedChange={(v: boolean | "indeterminate") =>
                      setSetAsDefault(v === true)
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="crs-set-default" className="text-sm font-medium">
                    Set as default for this store
                  </Label>
                </div>
              </div>
            </div>

            <section className="space-y-3 rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <h4 className="text-sm font-semibold text-foreground">Rules</h4>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1 bg-chart-2 text-white hover:opacity-90"
                  onClick={() => setRules((prev) => [...prev, createEmptyRule()])}
                  disabled={isSubmitting}
                >
                  Add rule
                </Button>
              </div>

              <div className="space-y-3 pt-1">
                {rules.map((r, idx) => (
                  <div
                    key={r.localId}
                    className="rounded-xl border border-border bg-card/80 p-4 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Rule #{idx + 1}
                      </p>
                      {rules.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() =>
                            setRules((prev) => prev.filter((x) => x.localId !== r.localId))
                          }
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`rule-name-${r.localId}`}>Name</Label>
                        <Input
                          id={`rule-name-${r.localId}`}
                          value={r.name}
                          onChange={(e) =>
                            setRules((prev) =>
                              prev.map((x) =>
                                x.localId === r.localId ? { ...x, name: e.target.value } : x,
                              ),
                            )
                          }
                          placeholder="e.g. Baseline visual check"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`rule-cat-${r.localId}`}>Category</Label>
                        <Select
                          id={`rule-cat-${r.localId}`}
                          value={r.category}
                          onChange={(e) =>
                            setRules((prev) =>
                              prev.map((x) =>
                                x.localId === r.localId
                                  ? { ...x, category: e.target.value as ComplianceRuleCategory }
                                  : x,
                              ),
                            )
                          }
                          disabled={isSubmitting}
                        >
                          {RULE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`rule-desc-${r.localId}`}>Description</Label>
                        <Input
                          id={`rule-desc-${r.localId}`}
                          value={r.description}
                          onChange={(e) =>
                            setRules((prev) =>
                              prev.map((x) =>
                                x.localId === r.localId
                                  ? { ...x, description: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="Short description"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`rule-threshold-${r.localId}`}>Threshold</Label>
                        <Input
                          id={`rule-threshold-${r.localId}`}
                          type="number"
                          step="0.01"
                          value={r.threshold}
                          onChange={(e) =>
                            setRules((prev) =>
                              prev.map((x) =>
                                x.localId === r.localId ? { ...x, threshold: e.target.value } : x,
                              ),
                            )
                          }
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <Checkbox
                        id={`rule-active-${r.localId}`}
                        checked={r.is_active}
                        onCheckedChange={(v: boolean | "indeterminate") =>
                          setRules((prev) =>
                            prev.map((x) =>
                              x.localId === r.localId ? { ...x, is_active: v === true } : x,
                            ),
                          )
                        }
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`rule-active-${r.localId}`} className="text-sm font-medium">
                        Rule is active
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 bg-card px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

