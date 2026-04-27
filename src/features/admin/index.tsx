import { AlertCircle, Ban, Check, LayoutList, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "@tanstack/react-router";

import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { buildGuardRailTabulatorColumns } from "./guard-rails-table-columns";
import type { GuardRailCategory, GuardRailRule, GuardRailSeverity } from "@/mocks/guard-rails";
import {
  useCreateGuardrail,
  useDeleteGuardrail,
  useGuardrails,
  useUpdateGuardrail,
} from "@/hooks/use-guardrails";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NewGuardRailForm {
  name: string;
  category: GuardRailCategory;
  severity: GuardRailSeverity;
  description: string;
  active: boolean;
}

const EMPTY_FORM: NewGuardRailForm = {
  name: "",
  category: "Pricing",
  severity: "Hard",
  description: "",
  active: true,
};

type GuardRailsPrimaryTab = "all" | "inactive";
type GuardRailsStatusFilter = "all" | "active" | "inactive";

export default function Admin() {
  const location = useLocation();
  const readOnly = location.pathname !== "/admin/settings";

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewGuardRailForm>(EMPTY_FORM);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [primaryTab, setPrimaryTab] = useState<GuardRailsPrimaryTab>("all");
  const [statusFilter, setStatusFilter] = useState<GuardRailsStatusFilter>("all");

  const { data: rules = [], isLoading, isError, error } = useGuardrails();
  const createMutation = useCreateGuardrail();
  const updateMutation = useUpdateGuardrail();
  const deleteMutation = useDeleteGuardrail();
  const { toast } = useToast();

  const openCreateModal = useCallback(() => {
    setEditingRuleId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    const onOpen = () => openCreateModal();
    window.addEventListener("promo:open-guard-rail-modal", onOpen);
    return () => window.removeEventListener("promo:open-guard-rail-modal", onOpen);
  }, [openCreateModal, readOnly]);

  const inactiveCount = useMemo(() => rules.filter((r) => !r.active).length, [rules]);

  const statusFilters = useMemo(
    () => [
      {
        id: "all" as const,
        label: "All",
        count: rules.length,
      },
      {
        id: "active" as const,
        label: "Active",
        count: rules.filter((r) => r.active).length,
      },
      {
        id: "inactive" as const,
        label: "Inactive",
        count: rules.filter((r) => !r.active).length,
      },
    ],
    [rules],
  );

  const filteredRules = useMemo<GuardRailRule[]>(() => {
    const q = search.trim().toLowerCase();
    const matchSearch = (r: GuardRailRule) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.severity.toLowerCase().includes(q);

    let base = rules;
    if (primaryTab === "inactive") {
      base = rules.filter((r) => !r.active);
    } else if (statusFilter === "active") {
      base = rules.filter((r) => r.active);
    } else if (statusFilter === "inactive") {
      base = rules.filter((r) => !r.active);
    }

    return base.filter(matchSearch);
  }, [rules, search, primaryTab, statusFilter]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingRuleId(null);
    setForm(EMPTY_FORM);
  }, []);

  const saveRule = async () => {
    if (!form.name.trim() || !form.description.trim()) return;
    try {
      if (editingRuleId) {
        await updateMutation.mutateAsync({
          id: editingRuleId,
          patch: {
            name: form.name.trim(),
            category: form.category,
            severity: form.severity,
            description: form.description.trim(),
            active: form.active,
          },
        });
        toast({ title: "Guard rail updated." });
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          category: form.category,
          severity: form.severity,
          description: form.description.trim(),
          active: form.active,
        });
        toast({ title: "Guard rail created." });
      }
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save guard rail.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleTableAction = useCallback(
    async (e: MouseEvent, row: GuardRailRule) => {
      const target = e.target as HTMLElement | null;
      const actionEl = target?.closest?.("[data-action]") as HTMLElement | null;
      const action = actionEl?.getAttribute("data-action");
      if (!action) return;

      if (action === "edit") {
        setEditingRuleId(row.id);
        setForm({
          name: row.name,
          category: row.category,
          severity: row.severity,
          description: row.description,
          active: row.active,
        });
        setShowModal(true);
        return;
      }

      if (action === "toggle") {
        try {
          await updateMutation.mutateAsync({
            id: row.id,
            patch: { active: !row.active },
          });
          toast({ title: `Guard rail ${!row.active ? "enabled" : "disabled"}.` });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to update guard rail.";
          toast({ title: "Error", description: message, variant: "destructive" });
        }
        return;
      }

      if (action === "delete") {
        try {
          await deleteMutation.mutateAsync(row.id);
          toast({ title: "Guard rail deleted." });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to delete guard rail.";
          toast({ title: "Error", description: message, variant: "destructive" });
        }
      }
    },
    [deleteMutation, updateMutation],
  );

  const columns = useMemo(
    () => buildGuardRailTabulatorColumns({ onAction: handleTableAction, readOnly }),
    [handleTableAction, readOnly],
  );

  return (
    <>
      <div className="flex w-full min-w-0 flex-col bg-ithina-bg">
        <div className="ithina-page w-full flex flex-col">
          <div className="mx-auto w-full max-w-screen-2xl space-y-4 px-4 pb-10 pt-4 lg:px-8">
            {readOnly ? (
              <p className="rounded-lg border border-ithina-border/40 bg-ithina-panel/30 px-4 py-3 text-sm text-muted-foreground">
                View only. Contact an administrator to add or change guard rails.
              </p>
            ) : null}

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <div className="flex shrink-0 gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel/80 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryTab("all");
                    setStatusFilter("all");
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                    primaryTab === "all"
                      ? "bg-ithina-purple text-white shadow-sm"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  <LayoutList className="size-3.5 shrink-0" aria-hidden />
                  All Rules
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryTab("inactive");
                    setStatusFilter("all");
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                    primaryTab === "inactive"
                      ? "bg-ithina-purple text-white shadow-sm"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  <Ban className="size-3.5 shrink-0" aria-hidden />
                  Inactive
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                      primaryTab === "inactive"
                        ? "bg-white/20 text-white"
                        : "bg-slate-500/20 text-slate-400",
                    )}
                  >
                    {inactiveCount}
                  </span>
                </button>
              </div>

              {primaryTab === "all" && (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  {statusFilters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStatusFilter(f.id)}
                      className={cn(
                        "h-8 rounded-md border px-2.5 text-xs font-medium transition-all",
                        statusFilter === f.id
                          ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                          : "border-ithina-border/60 text-slate-500 hover:border-slate-500 hover:text-white",
                      )}
                    >
                      {f.label}
                      <span className="ml-1 text-[9px] tabular-nums opacity-60">{f.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="group relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by rule name, description, or ID..."
                className="h-12 w-full rounded-md border border-input bg-card py-2 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30"
                aria-label="Search guard rails"
              />
            </div>

            {isLoading && (
              <div className="space-y-3 rounded-xl border border-ithina-border/40 bg-ithina-panel/20 p-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 w-full rounded-md" />
                ))}
              </div>
            )}

            {!isLoading && isError && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-6 py-4 text-rose-300">
                <AlertCircle className="size-5 shrink-0" />
                <span className="text-sm">
                  {(error as Error)?.message ?? "Failed to load guard rails"}
                </span>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="min-w-0">
                <DataTable<GuardRailRule>
                  className="guard-rails-tabulator-prototype"
                  columns={columns}
                  data={filteredRules}
                  rowIdField="id"
                  layout="fitColumns"
                  pagination
                  pageSize={10}
                  pageSizeSelector={[5, 10, 20, 50]}
                  emptyMessage="No guard rails found matching your criteria"
                  headerFilters
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && !readOnly && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-[6px]"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="w-full max-w-[640px] overflow-hidden rounded-[20px] border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guard-rail-modal-title"
          >
            <header className="flex shrink-0 items-start justify-between border-b border-ithina-border px-7 py-5">
              <div>
                <h3 id="guard-rail-modal-title" className="text-lg font-bold text-white">
                  {editingRuleId ? "Edit Guard Rail" : "New Guard Rail"}
                </h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  {editingRuleId
                    ? "Update this compliance rule"
                    : "Define a new compliance rule"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="space-y-6 px-7 py-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Rule Name<span className="text-rose-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Margin Floor"
                  className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-ithina-purple focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Category</label>
                  <div className="flex flex-col gap-2">
                    {(["Pricing", "Brand", "Regulatory", "Content"] as const).map((cat) => {
                      const selected = form.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                            selected
                              ? "border-2 border-ithina-purple bg-ithina-purple/10 text-white"
                              : "border border-ithina-border text-slate-400 hover:border-slate-600 hover:text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "size-3 shrink-0 rounded-full border-2",
                              selected
                                ? "border-ithina-purple bg-ithina-purple"
                                : "border-slate-500 bg-transparent",
                            )}
                          />
                          <span className="text-sm font-semibold">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Severity</label>
                  <div className="flex flex-col gap-2">
                    {(["Hard", "Soft"] as const).map((sev) => {
                      const selected = form.severity === sev;
                      return (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, severity: sev }))}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-all",
                            selected
                              ? "border-2 border-ithina-purple bg-ithina-purple/10 text-white"
                              : "border border-ithina-border text-slate-400 hover:border-slate-600 hover:text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 size-3 shrink-0 rounded-full border-2",
                              selected
                                ? "border-ithina-purple bg-ithina-purple"
                                : "border-slate-500 bg-transparent",
                            )}
                          />
                          <span>
                            <p className="text-sm font-semibold leading-tight">{sev}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {sev === "Hard" ? "Blocks campaign" : "Warns only"}
                            </p>
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
                      className="mt-1 inline-flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left transition-opacity hover:opacity-95"
                      aria-pressed={form.active}
                    >
                      <span
                        className={cn(
                          "relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full border p-0.5 transition-colors",
                          form.active
                            ? "border-emerald-500/50 bg-emerald-500/20"
                            : "border-slate-600 bg-slate-800/80",
                        )}
                      >
                        <span
                          className={cn(
                            "size-[18px] rounded-full shadow-sm ring-1 transition-[margin] duration-200",
                            form.active
                              ? "ml-auto bg-emerald-400 ring-emerald-300/40"
                              : "bg-slate-500 ring-black/20",
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          form.active ? "text-emerald-400" : "text-slate-500",
                        )}
                      >
                        {form.active ? "Active" : "Off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule checks and enforces..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-ithina-border bg-ithina-bg px-3.5 py-2.5 text-sm leading-relaxed text-white placeholder:text-slate-500 transition-colors focus:border-ithina-purple focus:outline-none"
                />
              </div>
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-ithina-border px-7 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRule}
                disabled={
                  !form.name.trim() ||
                  !form.description.trim() ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Check className="size-4 shrink-0" aria-hidden />
                )}
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving…"
                  : editingRuleId
                    ? "Save Changes"
                    : "Create Rule"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
