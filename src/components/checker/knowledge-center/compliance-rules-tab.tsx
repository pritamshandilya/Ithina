/**
 * Compliance Rules Tab
 *
 * Knowledge Catalog: View, filter, and manage compliance rules.
 * Rule Builder: Create and edit rules via modal.
 * Uses shared DataTable (Tabulator) for consistent display.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Filter, Search, Eye, Pencil, Play, Archive, Copy } from "lucide-react";

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
import type { ComplianceRule, RuleFilters, RuleStatus } from "@/types/checker";

import { RuleBuilderModal } from "./rule-builder-modal";

const RULE_CATEGORIES = ["VISUAL", "SAFETY", "PROFITABILITY", "EFFICIENCY"] as const;
const STATUS_OPTIONS: RuleStatus[] = ["Draft", "Active", "Retired"];

type RulesSort =
  | "lastUpdated-desc"
  | "lastUpdated-asc"
  | "ruleName-asc"
  | "ruleName-desc"
  | "status-asc";

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

/** Actions column: single "..." button that opens dropdown (avoids clutter, shows all relevant actions) */
function actionsCellHtml(): string {
  return `
    <button type="button" data-action="open-menu" title="Actions" class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center" aria-label="Open actions menu">
      <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    </button>
  `;
}

/** Display row: rule set (grouped) or single legacy rule */
export interface RuleSetDisplayRow {
  id: string;
  displayName: string;
  types: string[];
  rulesCount: number;
  enabledCount: number;
  status: RuleStatus;
  lastUpdated: Date;
  primaryRule: ComplianceRule;
}

function groupRulesForDisplay(rules: ComplianceRule[]): RuleSetDisplayRow[] {
  const rows: RuleSetDisplayRow[] = [];
  const seenSetIds = new Set<string>();

  for (const rule of rules) {
    if (rule.ruleSetId) {
      if (seenSetIds.has(rule.ruleSetId)) continue;
      seenSetIds.add(rule.ruleSetId);
      const setRules = rules.filter((r) => r.ruleSetId === rule.ruleSetId);
      const types = [...new Set(setRules.map((r) => r.ruleType))];
      const enabledCount = setRules.filter((r) => r.enabled !== false).length;
      const status = setRules.some((r) => r.status === "Active") ? "Active" : setRules.some((r) => r.status === "Retired") ? "Retired" : "Draft";
      const lastUpdated = setRules.reduce((max, r) => (new Date(r.lastUpdated) > max ? new Date(r.lastUpdated) : max), new Date(0));
      rows.push({
        id: rule.ruleSetId,
        displayName: rule.ruleSetName ?? rule.ruleName,
        types,
        rulesCount: setRules.length,
        enabledCount,
        status,
        lastUpdated,
        primaryRule: setRules[0]!,
      });
    } else {
      rows.push({
        id: rule.ruleId,
        displayName: rule.ruleName,
        types: [rule.ruleType],
        rulesCount: 1,
        enabledCount: 1,
        status: rule.status,
        lastUpdated: new Date(rule.lastUpdated),
        primaryRule: rule,
      });
    }
  }
  return rows;
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
  const [actionsMenu, setActionsMenu] = useState<{
    row: RuleSetDisplayRow;
    anchor: { x: number; y: number };
  } | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const { data: rules, isLoading, error } = useComplianceRules(filters);

  useEffect(() => {
    if (!actionsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        const tableEl = document.querySelector(".data-table-wrapper");
        if (tableEl && tableEl.contains(target)) return;
        setActionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsMenu]);

  const filteredRules = useMemo(() => {
    if (!rules) return [];
    let result = [...rules];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.ruleId.toLowerCase().includes(q) ||
          r.ruleName.toLowerCase().includes(q) ||
          (r.ruleSetName?.toLowerCase().includes(q)) ||
          r.ruleType.toLowerCase().includes(q) ||
          r.shelfType.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rules, searchQuery]);

  const displayRows = useMemo(() => {
    const grouped = groupRulesForDisplay(filteredRules);
    switch (sortBy) {
      case "lastUpdated-desc":
        grouped.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
        break;
      case "lastUpdated-asc":
        grouped.sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());
        break;
      case "ruleName-asc":
        grouped.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case "ruleName-desc":
        grouped.sort((a, b) => b.displayName.localeCompare(a.displayName));
        break;
      case "status-asc":
        grouped.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }
    return grouped;
  }, [filteredRules, sortBy]);

  const filterKey = `${filters.shelfType ?? ""}-${filters.status ?? ""}-${searchQuery}-${sortBy}`;
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

  const tableColumns = useMemo<DataTableColumn<RuleSetDisplayRow>[]>(
    () => [
      { title: "Rule ID", field: "id", width: 110, headerFilter: false, formatter: (c) => { const row = (c as { getData: () => RuleSetDisplayRow }).getData(); return `<span class="font-mono text-xs">${row.primaryRule.ruleId}</span>`; } },
      {
        title: "Rule Name",
        field: "displayName",
        minWidth: 180,
        sorter: "string",
        formatter: (c) => {
          const name = (c as { getValue: () => string }).getValue();
          return `<span class="font-medium text-foreground">${name}</span>`;
        },
      },
      {
        title: "Type",
        field: "types",
        width: 220,
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => RuleSetDisplayRow }).getData();
          const badges = row.types
            .filter((t) => RULE_CATEGORIES.includes(t as (typeof RULE_CATEGORIES)[number]))
            .map((t) => `<span class="inline-flex rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">${t}</span>`)
            .join(" ");
          return badges || row.types.map((t) => `<span class="text-muted-foreground text-xs">${t}</span>`).join(", ");
        },
      },
      {
        title: "Rules",
        field: "enabledCount",
        width: 80,
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => RuleSetDisplayRow }).getData();
          return `<span class="text-sm tabular-nums">${row.enabledCount}/${row.rulesCount}</span>`;
        },
      },
      {
        title: "Status",
        field: "status",
        width: 100,
        headerFilter: false,
        formatter: (c) => statusBadgeHtml((c as { getValue: () => RuleStatus }).getValue()),
      },
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
        field: "id",
        width: 60,
        headerSort: false,
        headerFilter: false,
        formatter: () => actionsCellHtml(),
        cellClick: (e: MouseEvent, cell: { getData: () => RuleSetDisplayRow }) => {
          const target = (e as unknown as { target: HTMLElement }).target as HTMLElement;
          const btn = target.closest?.("[data-action]");
          if (!btn) return;
          (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
          const action = btn.getAttribute("data-action");
          const row = cell.getData();
          if (action === "open-menu") {
            const rect = (btn as HTMLElement).getBoundingClientRect();
            setActionsMenu({ row, anchor: { x: rect.left, y: rect.bottom + 4 } });
          }
        },
      },
    ],
    []
  );

  const rowFormatter = useMemo(
    () => (row: { getData: () => RuleSetDisplayRow; getElement: () => HTMLElement }) => {
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
          New Rule Set
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
              placeholder="Search by rule ID, name, or type..."
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
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      ) : !displayRows.length ? (
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
              New Rule Set
            </Button>
          )}
        </div>
      ) : (
        <>
          <DataTable<RuleSetDisplayRow>
            key={filterKey}
            columns={tableColumns}
            data={displayRows}
            rowIdField="id"
            initialSort={{ field: "lastUpdated", dir: "desc" }}
            emptyMessage="No rules match the current filters"
            pageSize={10}
            pageSizeSelector={[5, 10, 20, 50]}
            rowFormatter={rowFormatter}
            onPaginationChange={setTablePagination}
            onRowClick={(row) => handleViewRule(row.primaryRule)}
          />
          <p className="text-sm text-muted-foreground text-center">
            Showing{" "}
            {Math.min(
              tablePagination.pageSize,
              Math.max(0, displayRows.length - (tablePagination.page - 1) * tablePagination.pageSize)
            )}{" "}
            of {displayRows.length} rule sets
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
        onAddNewRuleSet={() => setEditingRule(null)}
      />

      {/* Actions dropdown - positioned near the clicked "..." button */}
      {actionsMenu && (
        <div
          ref={actionsMenuRef}
          className="fixed z-50 min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md"
          style={{
            left: actionsMenu.anchor.x,
            top: actionsMenu.anchor.y,
          }}
        >
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
            onClick={() => {
              handleViewRule(actionsMenu.row.primaryRule);
              setActionsMenu(null);
            }}
          >
            <Eye className="size-4 text-muted-foreground" />
            View rule
          </button>
          {actionsMenu.row.primaryRule.status !== "Retired" && (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
              onClick={() => {
                handleEditRule(actionsMenu.row.primaryRule);
                setActionsMenu(null);
              }}
            >
              <Pencil className="size-4 text-muted-foreground" />
              Edit rule
            </button>
          )}
          {actionsMenu.row.primaryRule.status === "Draft" && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
                onClick={() => {
                  handleActivate(actionsMenu.row.primaryRule.ruleId);
                  setActionsMenu(null);
                }}
              >
                <Play className="size-4 text-muted-foreground" />
                Activate rule
              </button>
            </>
          )}
          {actionsMenu.row.primaryRule.status === "Active" && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
                onClick={() => {
                  handleRetire(actionsMenu.row.primaryRule.ruleId);
                  setActionsMenu(null);
                }}
              >
                <Archive className="size-4 text-muted-foreground" />
                Retire rule
              </button>
            </>
          )}
          {actionsMenu.row.primaryRule.status === "Retired" && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
                onClick={() => {
                  handleClone(actionsMenu.row.primaryRule.ruleId);
                  setActionsMenu(null);
                }}
              >
                <Copy className="size-4 text-muted-foreground" />
                Clone rule
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
