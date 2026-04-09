/**
 * Rule Versions Tab
 *
 * View version history per rule with actions (edit, activate, retire, clone).
 * Uses shared DataTable (Tabulator) - same format as compliance rules.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Pencil, Play, Archive, Copy } from "lucide-react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useActivateComplianceRule,
  useCloneRetiredRule,
  useComplianceRules,
  useRetireComplianceRule,
  useRuleVersions,
  useValidateRuleActivation,
} from "@/queries/checker";
import { useToast } from "@/hooks/use-toast";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { format } from "date-fns";
import type {
  ComplianceRule,
  RuleVersion,
  RuleVersionStatus,
} from "@/types/checker";

import { RuleBuilderModal } from "./rule-builder-modal";

const VERSION_STATUS_OPTIONS: RuleVersionStatus[] = ["Draft", "Active", "Archived", "Retired"];

type VersionsSort = "createdDate-desc" | "createdDate-asc" | "ruleId-asc" | "status-asc";

/** Badge HTML for version status */
function versionStatusBadgeHtml(status: RuleVersionStatus): string {
  const config: Record<RuleVersionStatus, string> = {
    Draft: "bg-muted/80 text-muted-foreground border-border",
    Active: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    Archived: "bg-muted/50 text-muted-foreground border-border",
    Retired: "bg-muted/60 text-muted-foreground border-border",
  };
  const cls = config[status];
  return `<span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${cls}">${status}</span>`;
}

/** Display row: version + rule metadata for actions */
export interface VersionDisplayRow {
  id: string;
  version: RuleVersion;
  ruleName: string;
  rule: ComplianceRule | null;
}

/** Actions cell: "..." button that opens dropdown */
function actionsCellHtml(): string {
  return `
    <button type="button" data-action="open-menu" title="Actions" class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center" aria-label="Open actions menu">
      <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    </button>
  `;
}

export function RuleVersionsTab() {
  const { toast } = useToast();
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();
  const [versionFilter, setVersionFilter] = useState<RuleVersionStatus | "">("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<VersionsSort>("createdDate-desc");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [activateConfirmRuleId, setActivateConfirmRuleId] = useState<string | null>(null);
  const [retireConfirmRuleId, setRetireConfirmRuleId] = useState<string | null>(null);
  const [cloneConfirmRuleId, setCloneConfirmRuleId] = useState<string | null>(null);
  const [actionsMenu, setActionsMenu] = useState<{
    row: VersionDisplayRow;
    anchor: { x: number; y: number };
  } | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const handleOpenMenu = useCallback((row: VersionDisplayRow, anchor: { x: number; y: number }) => {
    const menuWidth = 192;
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const x =
      anchor.x + menuWidth + padding > viewportWidth
        ? viewportWidth - menuWidth - padding
        : anchor.x;
    setActionsMenu({ row, anchor: { ...anchor, x } });
  }, []);

  const { data: rules } = useComplianceRules();
  const { data: versions, isLoading, error } = useRuleVersions(selectedRuleId);
  const activateRule = useActivateComplianceRule();
  const retireRule = useRetireComplianceRule();
  const cloneRule = useCloneRetiredRule();
  const validateActivation = useValidateRuleActivation();

  const ruleMap = useMemo(() => {
    const m = new Map<string, ComplianceRule>();
    rules?.forEach((r) => m.set(r.ruleId, r));
    return m;
  }, [rules]);

  const displayRows = useMemo(() => {
    const vers = versions ?? [];
    return vers.map((v) => ({
      id: v.id,
      version: v,
      ruleName: ruleMap.get(v.ruleId)?.ruleName ?? v.ruleId,
      rule: ruleMap.get(v.ruleId) ?? null,
    }));
  }, [versions, ruleMap]);

  const filteredRows = useMemo(() => {
    let result = displayRows.filter(
      (r) => !versionFilter || r.version.status === versionFilter
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.version.ruleId.toLowerCase().includes(q) ||
          r.ruleName.toLowerCase().includes(q) ||
          (r.version.changeSummary?.toLowerCase().includes(q) ?? false) ||
          r.version.expectedValue.toLowerCase().includes(q) ||
          r.version.shelfType.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "createdDate-desc":
        result.sort(
          (a, b) =>
            new Date(b.version.createdDate).getTime() -
            new Date(a.version.createdDate).getTime()
        );
        break;
      case "createdDate-asc":
        result.sort(
          (a, b) =>
            new Date(a.version.createdDate).getTime() -
            new Date(b.version.createdDate).getTime()
        );
        break;
      case "ruleId-asc":
        result.sort((a, b) => a.version.ruleId.localeCompare(b.version.ruleId));
        break;
      case "status-asc":
        result.sort((a, b) => a.version.status.localeCompare(b.version.status));
        break;
    }
    return result;
  }, [displayRows, versionFilter, searchQuery, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => setTablePagination((p) => ({ ...p, page: 1 })), 0);
    return () => clearTimeout(t);
  }, [selectedRuleId, versionFilter, searchQuery, sortBy]);

  useEffect(() => {
    if (!actionsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        const tableEl = document.querySelector(".data-table-wrapper");
        if (tableEl?.contains(target)) return;
        setActionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsMenu]);

  const handleEditRule = useCallback((row: VersionDisplayRow) => {
    if (!row.rule || row.rule.status === "Retired") return;
    setEditingRule(row.rule);
    setShowRuleModal(true);
  }, []);

  const handleActivate = useCallback((ruleId: string) => {
    setActivateConfirmRuleId(ruleId);
  }, []);

  const confirmActivate = useCallback(() => {
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
  }, [activateConfirmRuleId, validateActivation, activateRule, toast]);

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
      {
        ruleId: cloneConfirmRuleId,
        createdBy: `${mockCheckerUser.firstName} ${mockCheckerUser.lastName} (${mockCheckerUser.email})`,
      },
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

  const tableColumns = useMemo<DataTableColumn<VersionDisplayRow>[]>(
    () => [
      {
        title: "Rule ID",
        field: "version.ruleId",
        width: 100,
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => VersionDisplayRow }).getData();
          return `<span class="font-mono text-xs">${row.version.ruleId}</span>`;
        },
      },
      {
        title: "Rule Name",
        field: "ruleName",
        minWidth: 180,
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => VersionDisplayRow }).getData();
          return `<span class="font-medium text-foreground">${row.ruleName.replace(/</g, "&lt;")}</span>`;
        },
      },
      {
        title: "Version",
        field: "version.version",
        width: 80,
        sorter: "number",
        headerFilter: false,
      },
      {
        title: "Status",
        field: "version.status",
        width: 100,
        headerFilter: false,
        formatter: (c) =>
          versionStatusBadgeHtml(
            (c as { getData: () => VersionDisplayRow }).getData().version.status
          ),
      },
      {
        title: "Threshold",
        field: "version.expectedValue",
        minWidth: 140,
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => VersionDisplayRow }).getData();
          return row.version.expectedValue || "—";
        },
      },
      {
        title: "Created",
        field: "version.createdDate",
        width: 120,
        sorter: "date",
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => VersionDisplayRow }).getData();
          const val = row.version.createdDate;
          return val ? format(new Date(val), "MMM d, yyyy") : "";
        },
      },
      {
        title: "Effective",
        field: "version.effectiveDate",
        width: 120,
        sorter: "date",
        headerFilter: false,
        formatter: (c) => {
          const row = (c as { getData: () => VersionDisplayRow }).getData();
          const val = row.version.effectiveDate;
          return val ? format(new Date(val), "MMM d, yyyy") : "—";
        },
      },
      {
        title: "Change Summary",
        field: "version.changeSummary",
        minWidth: 160,
        formatter: (c) => {
          const row = (c as { getData: () => VersionDisplayRow }).getData();
          const val = row.version.changeSummary;
          return val
            ? `<span class="text-muted-foreground">${String(val).replace(/</g, "&lt;")}</span>`
            : "—";
        },
      },
      {
        title: "Actions",
        field: "id",
        width: 60,
        headerSort: false,
        headerFilter: false,
        formatter: () => actionsCellHtml(),
        cellClick: (e: unknown, cell: DataTableCell<VersionDisplayRow>) => {
          const target =
            e && typeof e === "object" && "target" in e && e.target instanceof HTMLElement
              ? e.target
              : null;
          if (!target) return;
          const btn = target.closest?.("[data-action]");
          if (!btn) return;
          if (e && typeof e === "object" && "stopPropagation" in e && typeof e.stopPropagation === "function") {
            e.stopPropagation();
          }
          const action = btn.getAttribute("data-action");
          const row = cell.getData();
          if (action === "open-menu") {
            const rect = (btn as HTMLElement).getBoundingClientRect();
            handleOpenMenu(row, { x: rect.left, y: rect.bottom + 4 });
          }
        },
      },
    ],
    [handleOpenMenu]
  );

  const rowFormatter = useMemo(
    () => (row: { getData: () => VersionDisplayRow; getElement: () => HTMLElement }) => {
      const data = row.getData();
      const el = row.getElement();
      if (data.version.status === "Active") {
        el.classList.add("!bg-chart-2/5");
      } else {
        el.classList.remove("!bg-chart-2/5");
      }
    },
    []
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Rule Versions</h2>
        <p className="text-sm text-muted-foreground">
          View version history, compare changes, and manage rules (edit, activate, retire, clone)
        </p>
      </div>

      {/* Search, Filters, Sort */}
      <div className="mt-4 shrink-0 space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by rule ID, rule name, threshold..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search versions"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1 block text-xs text-muted-foreground">Filter by Rule</label>
            <Select
              value={selectedRuleId ?? ""}
              onChange={(e) => setSelectedRuleId(e.target.value || undefined)}
            >
              <option value="">All rules</option>
              {rules?.map((r) => (
                <option key={r.ruleId} value={r.ruleId}>
                  {r.ruleId} – {r.ruleName}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1 block text-xs text-muted-foreground">Filter by Status</label>
            <Select
              value={versionFilter}
              onChange={(e) =>
                setVersionFilter((e.target.value || "") as RuleVersionStatus | "")
              }
            >
              <option value="">All statuses</option>
              {VERSION_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as VersionsSort)}
            aria-label="Sort versions"
            className="w-auto min-w-[180px]"
          >
            <option value="createdDate-desc">Newest First</option>
            <option value="createdDate-asc">Oldest First</option>
            <option value="ruleId-asc">Rule ID</option>
            <option value="status-asc">Status</option>
          </Select>
        </div>
      </div>

      {/* Versions DataTable */}
      <div className="mt-4 flex-1 min-h-0 overflow-auto">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
            Loading versions…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-border bg-card p-6 text-destructive">
            Failed to load versions. Please try again.
          </div>
        ) : !filteredRows.length ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery.trim()
                ? `No versions found matching "${searchQuery}"`
                : selectedRuleId || versionFilter
                  ? "No versions match your filters."
                  : "No rule versions yet. Create and activate rules to see version history."}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm underline text-accent hover:text-accent/80"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <DataTable<VersionDisplayRow>
              columns={tableColumns}
              data={filteredRows}
              rowIdField="id"
              initialSort={{ field: "version.createdDate", dir: "desc" }}
              emptyMessage="No versions match the current filters"
              pageSize={10}
              pageSizeSelector={[5, 10, 20, 50]}
              rowFormatter={rowFormatter}
              onPaginationChange={setTablePagination}
            />
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Showing{" "}
              {Math.min(
                tablePagination.pageSize,
                Math.max(0, filteredRows.length - (tablePagination.page - 1) * tablePagination.pageSize)
              )}{" "}
              of {filteredRows.length} versions
            </p>
          </>
        )}
      </div>

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
        rulesInSet={
          editingRule && rules
            ? editingRule.ruleSetId
              ? rules.filter((r) => r.ruleSetId === editingRule.ruleSetId)
              : [editingRule]
            : undefined
        }
        createdBy={`${mockCheckerUser.firstName} ${mockCheckerUser.lastName} (${mockCheckerUser.email})`}
      />

      {/* Actions dropdown */}
      {actionsMenu && (
        <div
          ref={actionsMenuRef}
          className="fixed z-50 min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md"
          style={{
            left: actionsMenu.anchor.x,
            top: actionsMenu.anchor.y,
          }}
        >
          {actionsMenu.row.rule && actionsMenu.row.rule.status !== "Retired" && (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
              onClick={() => {
                handleEditRule(actionsMenu.row);
                setActionsMenu(null);
              }}
            >
              <Pencil className="size-4 text-muted-foreground" />
              Edit rule
            </button>
          )}
          {actionsMenu.row.rule?.status === "Draft" && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
                onClick={() => {
                  handleActivate(actionsMenu.row.version.ruleId);
                  setActionsMenu(null);
                }}
              >
                <Play className="size-4 text-muted-foreground" />
                Activate rule
              </button>
            </>
          )}
          {actionsMenu.row.rule?.status === "Active" && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
                onClick={() => {
                  handleRetire(actionsMenu.row.version.ruleId);
                  setActionsMenu(null);
                }}
              >
                <Archive className="size-4 text-muted-foreground" />
                Retire rule
              </button>
            </>
          )}
          {actionsMenu.row.rule?.status === "Retired" && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:shrink-0 [&_svg]:size-4"
                onClick={() => {
                  handleClone(actionsMenu.row.version.ruleId);
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
