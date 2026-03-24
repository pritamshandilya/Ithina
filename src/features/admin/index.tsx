import { Check, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { PrototypeTabulator } from "@/components/ui/prototype-tabulator";
import { buildGuardRailTabulatorColumns } from "./guard-rails-table-columns";
import {
  MOCK_GUARD_RAIL_RULES,
  type GuardRailCategory,
  type GuardRailRule,
  type GuardRailSeverity,
} from "@/mocks/guard-rails";
import { cn } from "@/lib/utils";

type GuardRailFilter = "All" | GuardRailCategory;
interface NewGuardRailForm {
  name: string;
  category: GuardRailCategory;
  severity: GuardRailSeverity;
  description: string;
  active: boolean;
}

const FILTERS: GuardRailFilter[] = ["All", "Pricing", "Brand", "Regulatory", "Content"];
const EMPTY_FORM: NewGuardRailForm = {
  name: "",
  category: "Pricing",
  severity: "Hard",
  description: "",
  active: true,
};

export default function Admin() {
  const [activeFilter, setActiveFilter] = useState<GuardRailFilter>("All");
  const [rules, setRules] = useState<GuardRailRule[]>(MOCK_GUARD_RAIL_RULES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewGuardRailForm>(EMPTY_FORM);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const filteredRules = useMemo(() => {
    if (activeFilter === "All") return rules;
    return rules.filter((r) => r.category === activeFilter);
  }, [activeFilter, rules]);

  const activeCount = useMemo(() => rules.filter((r) => r.active).length, [rules]);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const createRule = () => {
    if (!form.name.trim() || !form.description.trim()) return;
    const nextId = `gr${Date.now().toString().slice(-4)}`;
    const nextRule: GuardRailRule = {
      id: nextId,
      name: form.name.trim(),
      category: form.category,
      severity: form.severity,
      description: form.description.trim(),
      active: form.active,
    };
    setRules((prev) => [nextRule, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const openCreateModal = () => {
    setEditingRuleId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = useCallback((rule: GuardRailRule) => {
    setEditingRuleId(rule.id);
    setForm({
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
      description: rule.description,
      active: rule.active,
    });
    setShowModal(true);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingRuleId(null);
    setForm(EMPTY_FORM);
  };

  const saveRule = () => {
    if (!form.name.trim() || !form.description.trim()) return;

    if (!editingRuleId) {
      createRule();
      return;
    }

    setRules((prev) =>
      prev.map((rule) =>
        rule.id === editingRuleId
          ? {
              ...rule,
              name: form.name.trim(),
              category: form.category,
              severity: form.severity,
              description: form.description.trim(),
              active: form.active,
            }
          : rule,
      ),
    );
    closeModal();
  };

  const handleTableAction = useCallback(
    (e: MouseEvent, rule: GuardRailRule) => {
      const target = e.target as HTMLElement | null;
      const actionEl = target?.closest?.("[data-action]") as HTMLElement | null;
      const action = actionEl?.getAttribute("data-action");
      if (!action) return;

      if (action === "edit") {
        openEditModal(rule);
        return;
      }

      if (action === "delete") {
        deleteRule(rule.id);
        return;
      }

      if (action === "toggle") {
        toggleRule(rule.id);
      }
    },
    [deleteRule, openEditModal, toggleRule],
  );

  const columns = useMemo(() => buildGuardRailTabulatorColumns(), []);

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div className="flex shrink-0 items-center gap-3 border-b border-ithina-border/40 px-7 pb-4 pt-5">
          <div className="flex gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                  activeFilter === f
                    ? "bg-ithina-purple text-white shadow-sm"
                    : "text-slate-400 hover:text-white",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover"
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Add Guard Rail
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PrototypeTabulator
              className="guard-rails-tabulator-prototype min-h-0 flex-1 border-0"
              columns={columns}
              data={filteredRules}
              layout="fitDataTable"
              pagination={false}
              tableHeight="100%"
              onCellClick={(e, row) => handleTableAction(e, row)}
            />
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-ithina-border/40 bg-ithina-bg/40 px-6 py-2.5 text-xs text-slate-600">
            <span className="font-mono">
              {rules.length} rules<span className="mx-1.5">•</span>
              {activeCount} active
            </span>
          </div>
        </div>
      </div>

      {showModal && (
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
                  {editingRuleId ? "Update rule definition" : "Define a new compliance rule"}
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
                disabled={!form.name.trim() || !form.description.trim()}
                className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="size-4 shrink-0" aria-hidden />
                {editingRuleId ? "Save Changes" : "Create Rule"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

