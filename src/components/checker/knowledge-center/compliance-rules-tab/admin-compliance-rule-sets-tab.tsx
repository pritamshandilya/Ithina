import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { useQueryClient, useMutation } from "@tanstack/react-query";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  CreateComplianceRuleSetModal,
  type CreateComplianceRuleSetModalProps,
} from "@/components/common/create-compliance-rule-set-modal";
import { useComplianceRuleSets } from "@/queries/maker";
import {
  deleteComplianceRuleSet,
  fetchComplianceRuleSetById,
  createComplianceRuleSet,
  updateComplianceRuleSet,
} from "@/queries/maker/api/compliance-rule-sets";
import { useUpdateStoreComplianceSettings } from "@/queries/checker";
import { useStore } from "@/providers/store";

function mapRuleSetToModalInitialValues(ruleSet: Awaited<ReturnType<typeof fetchComplianceRuleSetById>>) {
  return {
    name: ruleSet.name,
    status: ruleSet.status,
    rules: ruleSet.rules.map((r) => ({
      name: r.name,
      description: r.description,
      category: r.category,
      threshold: r.threshold,
      is_active: r.is_active,
    })),
  };
}

export function AdminComplianceRuleSetsTabContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateStoreComplianceSettingsMutation = useUpdateStoreComplianceSettings();

  const { selectedStore } = useStore();
  const storeId = selectedStore?.id;

  const { data: complianceRuleSets = [], isLoading } = useComplianceRuleSets();

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<
    CreateComplianceRuleSetModalProps["initialValues"]
  >(undefined);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [defaultRuleSetId, setDefaultRuleSetId] = useState<string>("");

  useEffect(() => {
    if (!selectedStore) return;
    setDefaultRuleSetId((selectedStore as any).default_compliance_rule_set_id ?? "");
  }, [selectedStore]);

  const filteredSets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return complianceRuleSets;
    return complianceRuleSets.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [complianceRuleSets, search]);

  const invalidateSets = () => {
    void queryClient.invalidateQueries({ queryKey: ["compliance-rule-sets"] });
  };

  const createMutation = useMutation({
    mutationFn: createComplianceRuleSet,
    onSuccess: () => {
      invalidateSets();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateComplianceRuleSet>[1] }) =>
      updateComplianceRuleSet(id, payload),
    onSuccess: () => {
      invalidateSets();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComplianceRuleSet(id),
    onSuccess: () => {
      invalidateSets();
    },
  });

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setInitialValues(undefined);
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const ruleSet = await fetchComplianceRuleSetById(id);
      setMode("edit");
      setEditingId(id);
      setInitialValues(mapRuleSetToModalInitialValues(ruleSet));
      setModalOpen(true);
    } catch (err) {
      toast({
        title: "Could not load rule set",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (
    payload: Parameters<typeof createComplianceRuleSet>[0],
    options: { setAsDefault: boolean },
  ) => {
    if (!storeId) {
      toast({ title: "Store not selected", description: "Please select a store first.", variant: "destructive" });
      return;
    }

    try {
      let createdOrUpdatedId: string;
      if (mode === "create") {
        const created = await createMutation.mutateAsync(payload);
        createdOrUpdatedId = created.id;
      } else {
        if (!editingId) throw new Error("Missing rule set id for edit.");
        const updated = await updateMutation.mutateAsync({ id: editingId, payload });
        createdOrUpdatedId = updated.id;
      }

      if (options.setAsDefault) {
        setDefaultRuleSetId(createdOrUpdatedId);
        await updateStoreComplianceSettingsMutation.mutateAsync({
          storeId,
          data: { default_compliance_rule_set_id: createdOrUpdatedId },
        });
      }

      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (defaultRuleSetId === id) setDefaultRuleSetId("");
      toast({ title: "Rule set deleted", description: "The rule set was removed successfully." });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleDefaultChange = async (value: string) => {
    if (!storeId) return;
    try {
      setDefaultRuleSetId(value);
      await updateStoreComplianceSettingsMutation.mutateAsync({
        storeId,
        data: { default_compliance_rule_set_id: value || null },
      });
    } catch (err) {
      toast({
        title: "Could not update default",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <Card noBorder className="bg-card shadow-xl glassmorphism">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Compliance Rule Sets</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Admin and maker can create, edit, and delete compliance rule sets.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" className="h-9 gap-2" onClick={openCreate}>
                  <Plus className="size-4" />
                  New rule set
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-[240px] flex-1">
                <Label htmlFor="rule-set-search" className="text-xs text-muted-foreground">
                  Search
                </Label>
                <Input
                  id="rule-set-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or id..."
                />
              </div>
              <div className="min-w-[280px]">
                <Label className="text-xs text-muted-foreground" htmlFor="rule-set-default">
                  Default for this store
                </Label>
                <Select
                  id="rule-set-default"
                  value={defaultRuleSetId}
                  onChange={(e) => void handleDefaultChange(e.target.value)}
                >
                  <option value="">No default rule set</option>
                  {complianceRuleSets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                        Rule set
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                        Rules
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                        Enabled
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-xs text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                          No compliance rule sets found.
                        </td>
                      </tr>
                    ) : (
                      filteredSets.map((s) => (
                        <tr key={s.id} className="border-t border-border/60">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{s.name}</span>
                              {s.isDefault && (
                                <span className="text-xs rounded-md border border-accent/30 bg-accent/10 text-accent px-2 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 tabular-nums">{s.rulesCount}</td>
                          <td className="px-3 py-2 tabular-nums">{s.enabledCount}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => openEdit(s.id)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8"
                                onClick={() => setConfirmDeleteId(s.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateComplianceRuleSetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        mode={mode}
        initialValues={initialValues ?? undefined}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          void handleDelete(confirmDeleteId);
        }}
        title="Delete rule set?"
        description="This will permanently delete the selected compliance rule set."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

