/**
 * Compliance Rules Tab
 *
 * Knowledge Catalog: View, filter, and manage compliance rules.
 * Rule Builder: Create and edit rules via modal.
 */

import { useState } from "react";
import {
  Eye,
  Pencil,
  Play,
  Archive,
  Copy,
  Plus,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RuleStatusBadge } from "@/components/shared";
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

export function ComplianceRulesTab() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<RuleFilters>({});
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activateConfirmRuleId, setActivateConfirmRuleId] = useState<string | null>(null);

  const { data: rules, isLoading, error } = useComplianceRules(filters);
  const activateRule = useActivateComplianceRule();
  const retireRule = useRetireComplianceRule();
  const cloneRule = useCloneRetiredRule();
  const validateActivation = useValidateRuleActivation();

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: ComplianceRule) => {
    if (rule.status === "Retired") return;
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const handleViewRule = (rule: ComplianceRule) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const handleActivate = (ruleId: string) => {
    setActivateConfirmRuleId(ruleId);
  };

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

  const handleRetire = (ruleId: string) => {
    if (!window.confirm("Are you sure you want to retire this rule? Retired rules cannot be reactivated without cloning.")) return;
    retireRule.mutate(ruleId, {
      onSuccess: () => toast({ title: "Rule retired", description: "The rule has been retired." }),
      onError: (err) =>
        toast({
          title: "Retire failed",
          description: err instanceof Error ? err.message : "Could not retire rule.",
          variant: "destructive",
        }),
    });
  };

  const handleClone = (ruleId: string) => {
    cloneRule.mutate(
      { ruleId, createdBy: `${mockCheckerUser.firstName} ${mockCheckerUser.lastName} (${mockCheckerUser.email})` },
      {
        onSuccess: () => toast({ title: "Rule cloned", description: "A new draft rule has been created." }),
        onError: (err) =>
          toast({
            title: "Clone failed",
            description: err instanceof Error ? err.message : "Could not clone rule.",
            variant: "destructive",
          }),
      }
    );
  };

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
        <Button onClick={handleCreateRule}>
          <Plus className="size-4" />
          Create Rule
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Filter className="size-4" />
          Filters
        </button>
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Shelf Type</label>
              <select
                value={filters.shelfType ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, shelfType: e.target.value || undefined }))
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All</option>
                {KNOWLEDGE_SHELF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Severity</label>
              <select
                value={filters.severity ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    severity: (e.target.value || undefined) as RuleSeverity | undefined,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All</option>
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Status</label>
              <select
                value={filters.status ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: (e.target.value || undefined) as RuleStatus | undefined,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table - Custom implementation for Actions column */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading rules…
          </div>
        ) : error ? (
          <div className="p-6 text-destructive">
            Failed to load rules. Please try again.
          </div>
        ) : !rules || rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <p className="text-muted-foreground">
              No compliance rules defined yet. Create your first rule to begin.
            </p>
            <Button onClick={handleCreateRule}>
              <Plus className="size-4" />
              Create Rule
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium">Rule ID</th>
                  <th className="px-4 py-3 text-left font-medium">Rule Name</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Shelf Type</th>
                  <th className="px-4 py-3 text-left font-medium">Severity</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Version</th>
                  <th className="px-4 py-3 text-left font-medium">Last Updated</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr
                    key={r.ruleId}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/20",
                      r.status === "Active" && "bg-chart-2/5"
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{r.ruleId}</td>
                    <td className="px-4 py-3 font-medium">{r.ruleName}</td>
                    <td className="px-4 py-3">{r.ruleType}</td>
                    <td className="px-4 py-3">{r.shelfType}</td>
                    <td className="px-4 py-3">{r.severity}</td>
                    <td className="px-4 py-3">
                      <RuleStatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">{r.currentVersion}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(r.lastUpdated), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleViewRule(r)}
                          aria-label="View rule"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {r.status !== "Retired" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEditRule(r)}
                            aria-label="Edit rule"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {r.status === "Draft" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleActivate(r.ruleId)}
                            aria-label="Activate rule"
                          >
                            <Play className="size-4" />
                          </Button>
                        )}
                        {r.status === "Active" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRetire(r.ruleId)}
                            aria-label="Retire rule"
                          >
                            <Archive className="size-4" />
                          </Button>
                        )}
                        {r.status === "Retired" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleClone(r.ruleId)}
                            aria-label="Clone rule"
                          >
                            <Copy className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activate Confirmation Modal */}
      {activateConfirmRuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Activate Rule</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to activate this rule? It will become effective immediately.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActivateConfirmRuleId(null)}>
                Cancel
              </Button>
              <Button onClick={confirmActivate} disabled={activateRule.isPending}>
                {activateRule.isPending ? "Activating…" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
