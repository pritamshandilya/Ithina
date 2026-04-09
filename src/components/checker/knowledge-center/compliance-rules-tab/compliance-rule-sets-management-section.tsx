import { useCallback, useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

import { useQueryClient, useMutation, useQueries } from "@tanstack/react-query";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable, type DataTableCell, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { knowledgeCenterKeys } from "@/queries/checker/hooks/useKnowledgeCenter";
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

type ComplianceRuleTreeRow = {
  id: string;
  name: string;
  rulesCount: number | string;
  enabledCount: number | string;
  isDefault?: boolean;
  isChild?: boolean;
  _children?: ComplianceRuleTreeRow[];
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function actionCellHtml(isDefault: boolean): string {
  const editIcon = renderToStaticMarkup(<Edit3 className="size-3.5" aria-hidden />);
  const deleteIcon = renderToStaticMarkup(<Trash2 className="size-3.5" aria-hidden />);
  const deleteButton = isDefault
    ? `<button type="button" aria-label="Delete disabled for default rule set" title="Default rule set cannot be deleted" class="inline-flex size-8 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground/50" disabled>
        ${deleteIcon}
      </button>`
    : `<button type="button" data-action="delete" aria-label="Delete rule set" class="inline-flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10">
        ${deleteIcon}
      </button>`;
  return `
    <div class="flex justify-end gap-1">
      <button type="button" data-action="edit" aria-label="Edit rule set" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        ${editIcon}
      </button>
      ${deleteButton}
    </div>
  `;
}

export function ComplianceRuleSetsManagementSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complianceRuleSets = [], isLoading } = useComplianceRuleSets();

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingDefaultRuleSet, setIsEditingDefaultRuleSet] = useState(false);
  const [initialValues, setInitialValues] = useState<
    CreateComplianceRuleSetModalProps["initialValues"]
  >(undefined);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredSets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return complianceRuleSets;
    return complianceRuleSets.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [complianceRuleSets, search]);

  const ruleSetDetailsQueries = useQueries({
    queries: complianceRuleSets.map((ruleSet) => ({
      queryKey: ["compliance-rule-set-detail", ruleSet.id],
      queryFn: () => fetchComplianceRuleSetById(ruleSet.id),
      enabled: complianceRuleSets.length > 0,
      staleTime: 60_000,
    })),
  });

  const ruleSetDetailMap = useMemo(() => {
    const entries = complianceRuleSets.map((ruleSet, idx) => [
      ruleSet.id,
      ruleSetDetailsQueries[idx]?.data,
    ] as const);
    return new Map(entries);
  }, [complianceRuleSets, ruleSetDetailsQueries]);

  const tableData = useMemo<ComplianceRuleTreeRow[]>(() => {
    return filteredSets.map((ruleSet) => {
      const detail = ruleSetDetailMap.get(ruleSet.id);
      const children: ComplianceRuleTreeRow[] = detail
        ? detail.rules.map((rule, idx) => ({
            id: `${ruleSet.id}-rule-${idx}`,
            name: `Rule: ${rule.name}`,
            rulesCount: String(rule.threshold),
            enabledCount: rule.is_active ? "Yes" : "No",
            isChild: true,
          }))
        : [
            {
              id: `${ruleSet.id}-loading`,
              name: "Loading rules...",
              rulesCount: "—",
              enabledCount: "—",
              isChild: true,
            },
          ];

      return {
        id: ruleSet.id,
        name: ruleSet.name,
        rulesCount: ruleSet.rulesCount,
        enabledCount: ruleSet.enabledCount,
        isDefault: ruleSet.isDefault,
        _children: children,
      };
    });
  }, [filteredSets, ruleSetDetailMap]);

  const openEdit = useCallback(
    async (id: string) => {
      try {
        const ruleSet = await fetchComplianceRuleSetById(id);
        const targetSummary = complianceRuleSets.find((item) => item.id === id);
        setMode("edit");
        setEditingId(id);
        setIsEditingDefaultRuleSet(!!targetSummary?.isDefault);
        setInitialValues(mapRuleSetToModalInitialValues(ruleSet));
        setModalOpen(true);
      } catch (err) {
        toast({
          title: "Could not load rule set",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      }
    },
    [complianceRuleSets, toast],
  );

  const tableColumns = useMemo<DataTableColumn<ComplianceRuleTreeRow>[]>(
    () => [
      {
        title: "Rule set",
        field: "name",
        minWidth: 230,
        headerFilter: false,
        hozAlign: "left",
        headerHozAlign: "left",
        formatter: (cell: DataTableCell<ComplianceRuleTreeRow>) => {
          const row = cell.getData();
          if (row.isChild) {
            return `<span class="text-muted-foreground">${escapeHtml(row.name)}</span>`;
          }
          const defaultBadge = row.isDefault
            ? `<span class="ml-2 text-xs rounded-md border border-accent/30 bg-accent/10 text-accent px-2 py-0.5">Default</span>`
            : "";
          return `<span class="font-medium text-foreground">${escapeHtml(row.name)}</span>${defaultBadge}`;
        },
      },
      {
        title: "Rules",
        field: "rulesCount",
        width: 120,
        headerFilter: false,
      },
      {
        title: "Enabled",
        field: "enabledCount",
        width: 120,
        headerFilter: false,
      },
      {
        title: "Actions",
        field: "id",
        width: 96,
        headerSort: false,
        headerFilter: false,
        formatter: (cell: DataTableCell<ComplianceRuleTreeRow>) => {
          const row = cell.getData();
          if (row.isChild) return "";
          return actionCellHtml(!!row.isDefault);
        },
        cellClick: (e: unknown, cell: DataTableCell<ComplianceRuleTreeRow>) => {
          const target =
            e && typeof e === "object" && "target" in e && e.target instanceof Element
              ? e.target
              : null;
          if (!target) return;
          const row = cell.getData();
          if (row.isChild) return;
          const button = target.closest("[data-action]");
          if (!button) return;
          const action = button.getAttribute("data-action");
          if (action === "edit") {
            void openEdit(row.id);
          } else if (action === "delete") {
            if (row.isDefault) {
              toast({
                title: "Delete not allowed",
                description: "Default rule set cannot be deleted.",
                variant: "destructive",
              });
              return;
            }
            setConfirmDeleteId(row.id);
          }
        },
      },
    ],
    [openEdit, toast]
  );

  const invalidateSets = () => {
    void queryClient.invalidateQueries({ queryKey: ["compliance-rule-sets"] });
    void queryClient.invalidateQueries({ queryKey: knowledgeCenterKeys.all });
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
    setIsEditingDefaultRuleSet(false);
    setInitialValues(undefined);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: Parameters<typeof createComplianceRuleSet>[0]) => {

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else {
        if (!editingId) throw new Error("Missing rule set id for edit.");
        await updateMutation.mutateAsync({ id: editingId, payload });
      }

      setModalOpen(false);
      setIsEditingDefaultRuleSet(false);
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 pb-3">
        <h2 className="text-lg font-semibold text-foreground">Compliance rule sets</h2>
        <p className="text-sm text-muted-foreground">
          Create, edit, and remove rule sets for this store.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Card noBorder className="bg-card shadow-xl glassmorphism">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <DataTable<ComplianceRuleTreeRow>
                columns={tableColumns}
                data={tableData}
                rowIdField="id"
                emptyMessage="No compliance rule sets found."
                headerFilters={false}
                pagination
                pageSize={10}
                pageSizeSelector={[5, 10, 20, 50]}
                dataTree
                dataTreeChildField="_children"
                dataTreeStartExpanded={false}
                dataTreeElementColumn="name"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <CreateComplianceRuleSetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsEditingDefaultRuleSet(false);
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        mode={mode}
        lockNameAndStatus={isEditingDefaultRuleSet}
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

