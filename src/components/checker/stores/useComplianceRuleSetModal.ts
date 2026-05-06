import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import type { CreateComplianceRuleSetModalProps } from "@/components/common/CreateComplianceRuleSetModal";
import { useToast } from "@/hooks/useToast";
import {
  type CreateComplianceRuleSetInput,
  fetchComplianceRuleSetById,
  updateComplianceRuleSet,
} from "@/lib/api/maker/complianceRuleSets";
import { ApiError } from "@/queries/shared";

function mapRuleSetToModalInitialValues(
  ruleSet: Awaited<ReturnType<typeof fetchComplianceRuleSetById>>,
): CreateComplianceRuleSetModalProps["initialValues"] {
  return {
    name: ruleSet.name,
    status: ruleSet.status,
    rules: ruleSet.rules.map((rule) => ({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      threshold: rule.threshold,
      is_active: rule.is_active,
    })),
  };
}

interface UseComplianceRuleSetModalParams {
  onCreate: (payload: CreateComplianceRuleSetInput) => Promise<unknown>;
}

export function useComplianceRuleSetModal({
  onCreate,
}: UseComplianceRuleSetModalParams) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingRuleSetId, setEditingRuleSetId] = useState<string | null>(null);
  const [initialValues, setInitialValues] =
    useState<CreateComplianceRuleSetModalProps["initialValues"]>(undefined);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateComplianceRuleSetInput;
    }) => updateComplianceRuleSet(id, payload),
  });

  const reset = () => {
    setIsOpen(false);
    setMode("create");
    setEditingRuleSetId(null);
    setInitialValues(undefined);
  };

  const openCreate = () => {
    setMode("create");
    setEditingRuleSetId(null);
    setInitialValues(undefined);
    setIsOpen(true);
  };

  const openEdit = async (ruleSetId: string) => {
    try {
      const ruleSet = await fetchComplianceRuleSetById(ruleSetId);
      setMode("edit");
      setEditingRuleSetId(ruleSetId);
      setInitialValues(mapRuleSetToModalInitialValues(ruleSet));
      setIsOpen(true);
    } catch (error) {
      toast({
        title: "Could not load rule set",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const submit = async (payload: CreateComplianceRuleSetInput) => {
    try {
      if (mode === "create") {
        await onCreate(payload);
      } else {
        if (!editingRuleSetId) {
          throw new Error("Missing rule set id for edit.");
        }
        await updateMutation.mutateAsync({
          id: editingRuleSetId,
          payload,
        });
      }
      toast({
        title: mode === "create" ? "Rule set created" : "Rule set updated",
        description:
          "You can set the default rule set in Store Defaults > Compliance Rules.",
      });
      reset();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not create the compliance rule set.";
      toast({
        title: mode === "create" ? "Create failed" : "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return {
    isOpen,
    mode,
    initialValues,
    isSubmitting: updateMutation.isPending,
    openCreate,
    openEdit,
    submit,
    close: reset,
  };
}
