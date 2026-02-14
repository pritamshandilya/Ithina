/**
 * Compliance Rules Tab
 *
 * Knowledge Catalog: View, filter, and manage compliance rules.
 * Rule Builder: Create and edit rules via modal.
 * Uses shared DataTable (Tabulator) for consistent display.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useActivateComplianceRule,
  useCloneRetiredRule,
  useComplianceRules,
  useRetireComplianceRule,
  useValidateRuleActivation,
} from "@/features/checker/hooks";
import { KNOWLEDGE_SHELF_TYPES } from "@/features/checker/api/knowledge-center";
import { useToast } from "@/hooks/use-toast";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { ComplianceRule, RuleFilters, RuleSeverity, RuleStatus } from "@/types/checker";

import { RuleBuilderModal } from "./rule-builder-modal";

const SEVERITY_OPTIONS: RuleSeverity[] = ["Low", "Medium", "High"];
const STATUS_OPTIONS: RuleStatus[] = ["Draft", "Active", "Retired"];

type RulesSort =
  | "lastUpdated-desc"
  | "lastUpdated-asc"
  | "ruleName-asc"
  | "ruleName-desc"
  | "status-asc"
  | "version-desc";

/** Badge HTML for status (matches RuleStatusBadge styling) */
function statusBadgeHtml(status: RuleStatus): string {
  const config: Record<RuleStatus, string> = {
    Draft: "bg-muted/80 text-muted-foreground border-border",
    Active: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    Retired: "bg-muted/60 text-muted-foreground border-border",
  };
  const cls = config[status];
  return `<span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${cls}">${status}</span>`;
}

/** Actions column HTML with data-action attributes */
function actionsCellHtml(rule: ComplianceRule): string {
  const btn = (action: string, label: string, icon: string) =>
    `<button type="button" data-action="${action}" class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="${label}">${icon}</button>`;

  const view = btn("view", "View rule", '<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>');
  const edit = rule.status !== "Retired" ? btn("edit", "Edit rule", '<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>') : "";
  const activate = rule.status === "Draft" ? btn("activate", "Activate rule", '<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>') : "";
  const retire = rule.status === "Active" ? btn("retire", "Retire rule", '<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>') : "";
  const clone = rule.status === "Retired" ? btn("clone", "Clone rule", '<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>') : "";

  return `<div class="flex items-center gap-1">${view}${edit}${activate}${retire}${clone}</div>`;
}

export function ComplianceRulesTab() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<RuleFilters>({});
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activateConfirmRuleId, setActivateConfirmRuleId] = useState<string | null>(null);
  const [retireConfirmRuleId, setRetireConfirmRuleId] = useState<string | null>(null);
  const [cloneConfirmRuleId, setCloneConfirmRuleId] = useState<string | null>(null);
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<RulesSort>("lastUpdated-desc");

  const { data: rules, isLoading, error } = useComplianceRules(filters);

  const filteredAndSortedRules = useMemo(() => {
    if (!rules) return [];
    let result = [...rules];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.ruleId.toLowerCase().includes(q) ||
          r.ruleName.toLowerCase().includes(q) ||
          r.ruleType.toLowerCase().includes(q) ||
          r.shelfType.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "lastUpdated-desc":
        result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case "lastUpdated-asc":
        result.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
        break;
      case "ruleName-asc":
        result.sort((a, b) => a.ruleName.localeCompare(b.ruleName));
        break;
      case "ruleName-desc":
        result.sort((a, b) => b.ruleName.localeCompare(a.ruleName));
        break;
      case "status-asc":
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "version-desc":
        result.sort((a, b) => b.currentVersion - a.currentVersion);
        break;
    }
    return result;
  }, [rules, searchQuery, sortBy]);

  useEffect(() => {
    setTablePagination((p) => ({ ...p, page: 1 }));
  }, [filters, searchQuery, sortBy]);
  const activateRule = useActivateComplianceRule();
  const retireRule = useRetireComplianceRule();
  const cloneRule = useCloneRetiredRule();
  const validateActivation = useValidateRuleActivation();

  const handleCreateRule = useCallback(() => {
    setEditingRule(null);
    setShowRuleModal(true);
  }, []);

  const handleEditRule = useCallback((rule: ComplianceRule) => {
    if (rule.status === "Retired") return;
    setEditingRule(rule);
    setShowRuleModal(true);
  }, []);

  const handleViewRule = useCallback((rule: ComplianceRule) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  }, []);

  const handleActivate = useCallback((ruleId: string) => {
    setActivateConfirmRuleId(ruleId);
  }, []);

  const confirmActivate = () => {
    if (!activateConfirmRuleId) return;
    validateActivation.mutate(activateConfirmRuleId, {
      onSuccess: (result) => {
        if (!result.valid) {
          toast({
            title: "Validation failed",
            description: result.errors.join(" "),
            variant: "destructive",
          });
          setActivateConfirmRuleId(null);
          return;
        }
        activateRule.mutate(activateConfirmRuleId, {
          onSuccess: () => {
            toast({ title: "Rule activated", description: "The rule is now active." });
            setActivateConfirmRuleId(null);
          },
          onError: (err) => {
            toast({
              title: "Activation failed",
              description: err instanceof Error ? err.message : "Could not activate rule.",
              variant: "destructive",
            });
            setActivateConfirmRuleId(null);
          },
        });
      },
    });
  };

  const handleRetire = useCallback((ruleId: string) => {
    setRetireConfirmRuleId(ruleId);
  }, []);

  const confirmRetire = useCallback(() => {
    if (!retireConfirmRuleId) return;
    retireRule.mutate(retireConfirmRuleId, {
      onSuccess: () => {
        toast({ title: "Rule retired", description: "The rule has been retired." });
        setRetireConfirmRuleId(null);
      },
      onError: (err) => {
        toast({
          title: "Retire failed",
          description: err instanceof Error ? err.message : "Could not retire rule.",
          variant: "destructive",
        });
        setRetireConfirmRuleId(null);
      },
    });
  }, [retireConfirmRuleId, retireRule, toast]);

  const handleClone = useCallback((ruleId: string) => {
    setCloneConfirmRuleId(ruleId);
  }, []);

  const confirmClone = useCallback(() => {
    if (!cloneConfirmRuleId) return;
    cloneRule.mutate(
      { ruleId: cloneConfirmRuleId, createdBy: `${mockCheckerUser.firstName} ${mockCheckerUser.lastName} (${mockCheckerUser.email})` },
      {
        onSuccess: () => {
          toast({ title: "Rule cloned", description: "A new draft rule has been created." });
          setCloneConfirmRuleId(null);
        },
        onError: (err) => {
          toast({
            title: "Clone failed",
            description: err instanceof Error ? err.message : "Could not clone rule.",
            variant: "destructive",
          });
          setCloneConfirmRuleId(null);
        },
      }
    );
  }, [cloneConfirmRuleId, cloneRule, toast]);

  const tableColumns = useMemo<DataTableColumn<ComplianceRule>[]>(
    () => [
      { title: "Rule ID", field: "ruleId", width: 100, headerFilter: false, formatter: (c) => `<span class="font-mono text-xs">${(c as { getValue: () => string }).getValue()}</span>` },
      { title: "Rule Name", field: "ruleName", minWidth: 180, sorter: "string" },
      { title: "Type", field: "ruleType", width: 130, headerFilter: false },
      { title: "Shelf Type", field: "shelfType", width: 110, headerFilter: false },
      { title: "Severity", field: "severity", width: 90, headerFilter: false },
      {
        title: "Status",
        field: "status",
        width: 100,
        headerFilter: false,
        formatter: (c) => statusBadgeHtml((c as { getValue: () => RuleStatus }).getValue()),
      },
      { title: "Version", field: "currentVersion", width: 80, sorter: "number", headerFilter: false },
      {
        title: "Last Updated",
        field: "lastUpdated",
        width: 120,
        sorter: "date",
        headerFilter: false,
        formatter: (c) => {
          const val = (c as { getValue: () => Date }).getValue();
          return val ? format(new Date(val), "MMM d, yyyy") : "";
        },
      },
      {
        title: "Actions",
        field: "ruleId",
        width: 180,
        headerSort: false,
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getRow: () => { getData: () => ComplianceRule } }).getRow();
          return actionsCellHtml(row.getData());
        },
        cellClick: (e: MouseEvent, cell: { getData: () => ComplianceRule }) => {
          const target = (e as unknown as { target: HTMLElement }).target as HTMLElement;
          const btn = target.closest?.("[data-action]");
          if (!btn) return;
          (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
          const action = btn.getAttribute("data-action");
          const rule = cell.getData();
          if (action === "view") handleViewRule(rule);
          else if (action === "edit") handleEditRule(rule);
          else if (action === "activate") handleActivate(rule.ruleId);
          else if (action === "retire") handleRetire(rule.ruleId);
          else if (action === "clone") handleClone(rule.ruleId);
        },
      },
    ],
    [handleViewRule, handleEditRule, handleActivate, handleRetire, handleClone]
  );

  const rowFormatter = useMemo(
    () => (row: { getData: () => ComplianceRule; getElement: () => HTMLElement }) => {
      const data = row.getData();
      const el = row.getElement();
      if (data.status === "Active") {
        el.classList.add("!bg-chart-2/5");
      } else {
        el.classList.remove("!bg-chart-2/5");
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Header with Create Rule */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Compliance Rules</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage rules that define audit compliance logic
          </p>
        </div>
        <Button
          onClick={handleCreateRule}
          className="bg-chart-2 text-white hover:opacity-90"
        >
          <Plus className="size-4" />
          Create Rule
        </Button>
      </div>

      {/* Search and Filters - audit queue style */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by rule ID, name, type, or shelf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search rules"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              showFilters
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-card text-card-foreground hover:border-accent/50"
            )}
          >
            <Filter className="size-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Shelf Type</label>
              <Select
                value={filters.shelfType ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, shelfType: e.target.value || undefined }))
                }
              >
                <option value="">All</option>
                {KNOWLEDGE_SHELF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Severity</label>
              <Select
                value={filters.severity ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    severity: (e.target.value || undefined) as RuleSeverity | undefined,
                  }))
                }
              >
                <option value="">All</option>
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Status</label>
              <Select
                value={filters.status ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: (e.target.value || undefined) as RuleStatus | undefined,
                  }))
                }
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Sort - same layout as audit review queue */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as RulesSort)}
              aria-label="Sort rules"
              className="w-auto min-w-[180px]"
            >
              <option value="lastUpdated-desc">Newest First</option>
              <option value="lastUpdated-asc">Oldest First</option>
              <option value="ruleName-asc">Rule Name A–Z</option>
              <option value="ruleName-desc">Rule Name Z–A</option>
              <option value="status-asc">Status</option>
              <option value="version-desc">Highest Version First</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Rules Table - DataTable (Tabulator) */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
          Loading rules…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border bg-card p-6 text-destructive">
          Failed to load rules. Please try again.
        </div>
      ) : !filteredAndSortedRules.length ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery.trim()
              ? `No rules found matching "${searchQuery}"`
              : "No compliance rules defined yet. Create your first rule to begin."}
          </p>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-sm underline text-accent hover:text-accent/80"
            >
              Clear search
            </button>
          )}
          {!searchQuery.trim() && (
            <Button
              onClick={handleCreateRule}
              className="bg-chart-2 text-white hover:opacity-90"
            >
              <Plus className="size-4" />
              Create Rule
            </Button>
          )}
        </div>
      ) : (
        <>
          <DataTable<ComplianceRule>
            columns={tableColumns}
            data={filteredAndSortedRules}
            rowIdField="ruleId"
            initialSort={{ field: "lastUpdated", dir: "desc" }}
            emptyMessage="No rules match the current filters"
            pageSize={10}
            pageSizeSelector={[5, 10, 20, 50]}
            rowFormatter={rowFormatter}
            onPaginationChange={setTablePagination}
            onRowClick={(row) => handleViewRule(row)}
          />
          <p className="text-sm text-muted-foreground text-center">
            Showing{" "}
            {Math.min(
              tablePagination.pageSize,
              Math.max(0, filteredAndSortedRules.length - (tablePagination.page - 1) * tablePagination.pageSize)
            )}{" "}
            of {filteredAndSortedRules.length} rules
          </p>
        </>
      )}

      {/* Activate Confirmation Modal */}
      <ConfirmModal
        isOpen={!!activateConfirmRuleId}
        onClose={() => setActivateConfirmRuleId(null)}
        onConfirm={confirmActivate}
        title="Activate Rule"
        description="Are you sure you want to activate this rule? It will become effective immediately."
        confirmLabel="Activate"
        isLoading={activateRule.isPending}
      />

      {/* Retire Confirmation Modal */}
      <ConfirmModal
        isOpen={!!retireConfirmRuleId}
        onClose={() => setRetireConfirmRuleId(null)}
        onConfirm={confirmRetire}
        title="Retire Rule"
        description="Are you sure you want to retire this rule? Retired rules cannot be reactivated without cloning."
        confirmLabel="Retire Rule"
        variant="destructive"
        isLoading={retireRule.isPending}
      />

      {/* Clone Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cloneConfirmRuleId}
        onClose={() => setCloneConfirmRuleId(null)}
        onConfirm={confirmClone}
        title="Clone Rule"
        description="Create a new draft rule from this retired rule? The new rule will need to be activated separately."
        confirmLabel="Clone"
        isLoading={cloneRule.isPending}
      />

      <RuleBuilderModal
        isOpen={showRuleModal}
        onClose={() => {
          setShowRuleModal(false);
          setEditingRule(null);
        }}
        rule={editingRule}
        createdBy={`${mockCheckerUser.firstName} ${mockCheckerUser.lastName} (${mockCheckerUser.email})`}
      />
    </div>
  );
}
