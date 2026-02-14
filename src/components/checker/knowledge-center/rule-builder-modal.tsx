/**
 * Rule Builder Modal
 *
 * Form-based structured rule creation. No free-text logic engine in Phase 1.
 * Rules default to Draft. Cannot activate without validation passing.
 */

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateComplianceRule,
  useUpdateComplianceRule,
} from "@/features/checker/hooks";
import { KNOWLEDGE_SHELF_TYPES } from "@/features/checker/api/knowledge-center";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type {
  ComplianceRule,
  CreateRuleInput,
  RuleSeverity,
  RuleType,
  UpdateRuleInput,
} from "@/types/checker";

const RULE_TYPES: RuleType[] = [
  "Facings",
  "Spacing",
  "Product Position",
  "Margin",
  "OOS",
  "Labeling",
];

const SEVERITY_LEVELS: RuleSeverity[] = ["Low", "Medium", "High"];

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

  const resetForm = () => {
    setRuleName("");
    setRuleType("Facings");
    setShelfType("Beverages");
    setExpectedValue("");
    setTolerance("");
    setSeverity("Medium");
    setChangeSummary("");
    setErrors({});
  };

  const validate = (): boolean => {
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

  const handleSubmit = () => {
    if (!validate()) return;
    if (isRetired) return;

    if (isEdit && rule) {
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
    } else {
      const payload: CreateRuleInput = {
        ruleName: ruleName.trim(),
        ruleType,
        shelfType,
        expectedValue: expectedValue.trim(),
        tolerance: tolerance === "" ? undefined : parseFloat(tolerance),
        severity,
        createdBy,
      };
      createRule.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Rule created", description: "The rule has been created as Draft." });
          resetForm();
          onClose();
        },
        onError: (err) => {
          toast({
            title: "Create failed",
            description: err instanceof Error ? err.message : "Could not create rule.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleClose = () => {
    if (!createRule.isPending && !updateRule.isPending) {
      resetForm();
      onClose();
    }
  };

  const InlineHelp = ({ text }: { text: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex text-muted-foreground hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{text}</TooltipContent>
    </Tooltip>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-xl"
    >
      <Card className="border border-border bg-card relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <CardHeader className="px-0 pt-0 pr-10">
          <CardTitle>{isEdit ? "Edit Rule" : "Create Rule"}</CardTitle>
          {rule?.ruleId && (
            <p className="text-sm text-muted-foreground">Rule ID: {rule.ruleId}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6 px-0">
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
              <div className="flex items-center gap-2">
                <select
                  id="rule-type"
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as RuleType)}
                  disabled={isRetired}
                  className={cn(
                    "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  {RULE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <InlineHelp text="Type of compliance check (e.g. Facings, Spacing, Labeling)" />
              </div>
            </FormField>

            <FormField label="Shelf Type" required htmlFor="shelf-type">
              <select
                id="shelf-type"
                value={shelfType}
                onChange={(e) => setShelfType(e.target.value)}
                disabled={isRetired}
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {KNOWLEDGE_SHELF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label="Expected Value"
            required
            error={errors.expectedValue}
            htmlFor="expected-value"
          >
            <div className="flex items-center gap-2">
              <Input
                id="expected-value"
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
                placeholder="e.g. >= 3 or All labels front-facing"
                disabled={isRetired}
              />
              <InlineHelp text="Numeric threshold (e.g. >= 3) or descriptive value depending on rule type" />
            </div>
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
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as RuleSeverity)}
              disabled={isRetired}
              className={cn(
                "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {SEVERITY_LEVELS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose} disabled={createRule.isPending || updateRule.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isRetired || createRule.isPending || updateRule.isPending}
        >
          {createRule.isPending || updateRule.isPending ? "Saving…" : isEdit ? "Save" : "Create Rule"}
        </Button>
      </div>
    </Modal>
  );
}
