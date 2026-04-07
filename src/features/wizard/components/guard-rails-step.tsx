import { AlertTriangle, Check, Loader2, Shield, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGuardrails } from "@/hooks/use-guardrails";
import { cn } from "@/lib/utils";
import type { GuardRailRule, GuardRailSeverity } from "@/mocks/guard-rails";
import { useAppSelector } from "@/store/hooks";

interface GuardRailsStepProps {
  onNext: () => void;
}

type ValidationState = "idle" | "running" | "passed";

const VALIDATION_STEPS = [
  "Loading campaign data",
  "Running margin checks",
  "Verifying brand compliance",
  "Checking regulatory rules",
  "Finalising report",
] as const;

function severityBadgeClass(sev: GuardRailSeverity) {
  return sev === "Hard"
    ? "border border-rose-400/20 bg-rose-400/10 text-rose-400"
    : "border border-amber-400/20 bg-amber-400/10 text-amber-400";
}

function RuleCheckboxRow({
  rule,
  checked,
  onToggle,
}: {
  rule: GuardRailRule;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]",
        checked && "bg-ithina-purple/[0.04]",
      )}
    >
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-all",
          checked ? "border-ithina-purple bg-ithina-purple" : "border-slate-600",
        )}
      >
        {checked && <Check className="size-2.5 text-white" strokeWidth={3} />}
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{rule.name}</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase",
              severityBadgeClass(rule.severity),
            )}
          >
            {rule.severity === "Hard" ? "HARD" : "SOFT"}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500">{rule.description}</p>
      </div>
      <span className="shrink-0 font-mono text-[9px] text-slate-600">{rule.category}</span>
    </label>
  );
}

export default function GuardRailsStep({ onNext }: GuardRailsStepProps) {
  const gridData = useAppSelector((s) => s.wizard.gridData);
  const includedLen = useMemo(
    () => gridData.filter((r) => r.included !== false).length,
    [gridData],
  );
  const skuCount = includedLen > 0 ? includedLen : gridData.length > 0 ? 0 : 1;
  const { data: rules = [], isLoading, isError } = useGuardrails();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, setState] = useState<ValidationState>("idle");
  const [activeValidationStep, setActiveValidationStep] = useState(0);
  const validationTimerRef = useRef<number | null>(null);
  const initializedSelectionRef = useRef(false);

  useEffect(() => {
    if (initializedSelectionRef.current) return;
    if (!rules.length) return;
    setSelected(new Set(rules.filter((r) => r.active).map((r) => r.id)));
    initializedSelectionRef.current = true;
  }, [rules]);

  const selectedRules = useMemo(
    () => rules.filter((r) => selected.has(r.id)),
    [rules, selected],
  );

  const toggleRule = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const runValidation = () => {
    if (state === "running") return;
    setState("running");
    setActiveValidationStep(0);
  };

  useEffect(() => {
    if (state !== "running") return;

    if (activeValidationStep >= VALIDATION_STEPS.length) {
      setState("passed");
      return;
    }

    validationTimerRef.current = window.setTimeout(() => {
      setActiveValidationStep((prev) => prev + 1);
    }, 650);

    return () => {
      if (validationTimerRef.current) {
        window.clearTimeout(validationTimerRef.current);
      }
    };
  }, [activeValidationStep, state]);

  useEffect(
    () => () => {
      if (validationTimerRef.current) {
        window.clearTimeout(validationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (state === "idle") {
      setActiveValidationStep(0);
    }
  }, [state]);

  const stepStatus = useCallback(
    (index: number): "done" | "running" | "pending" => {
      if (state === "passed") return "done";
      if (state !== "running") return "pending";
      if (index < activeValidationStep) return "done";
      if (index === activeValidationStep) return "running";
      return "pending";
    },
    [activeValidationStep, state],
  );

  const resetValidation = () => {
    setState("idle");
    setActiveValidationStep(0);
  };

  return (
    <div className="flex min-h-0 flex-1 animate-[fadeIn_0.3s_ease-out] overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-ithina-border/50">
        <div className="shrink-0 px-6 pb-4 pt-6">
          <h3 className="text-lg font-bold text-white">Guard Rails</h3>
          <p className="mt-0.5 text-sm text-slate-400">
            Select the guard rails to apply, then click{" "}
            <span className="font-medium text-white">Check &amp; Validate</span> to run compliance checks.
          </p>
        </div>

        {state === "running" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <Loader2 className="size-10 animate-spin text-ithina-purple" strokeWidth={2} aria-hidden />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Running compliance checks…</p>
              <p className="mt-1 text-xs text-slate-500">
                Validating {selectedRules.length} rule{selectedRules.length !== 1 ? "s" : ""} against {skuCount} SKUs
              </p>
            </div>
            <div className="flex w-64 flex-col gap-1.5">
              {VALIDATION_STEPS.map((label, index) => {
                const status = stepStatus(index);
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      status === "done" && "text-emerald-400",
                      status === "running" && "text-ithina-purple",
                      status === "pending" && "text-slate-600",
                    )}
                  >
                    {status === "done" ? (
                      <Check className="size-3.5 shrink-0" strokeWidth={3} />
                    ) : status === "running" ? (
                      <Loader2 className="size-3.5 shrink-0 animate-spin" strokeWidth={2} />
                    ) : (
                      <div className="size-3.5 shrink-0 rounded-full border border-slate-700" />
                    )}
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {state === "passed" && (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-400/10">
                    <Check className="size-4 text-emerald-400" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-300">All Checks Passed</p>
                    <p className="text-[10px] text-slate-500">
                      {selectedRules.length} passed, 0 failed, 0 warnings
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetValidation}
                  className="rounded-lg border border-ithina-border px-3 py-1.5 text-[10px] text-slate-500 transition-colors hover:text-white"
                >
                  Re-select
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
                <div className="divide-y divide-ithina-border/40">
                  {selectedRules.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                        <Check className="size-3.5 text-emerald-400" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white">{rule.name}</span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase",
                              severityBadgeClass(rule.severity),
                            )}
                          >
                            {rule.severity === "Hard" ? "HARD" : "SOFT"}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500">{rule.description}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-emerald-400">
                        pass
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-ithina-border/40 bg-ithina-bg/20 px-6 py-4">
              <button
                type="button"
                onClick={onNext}
                className="flex items-center gap-2 rounded-xl bg-ithina-purple px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Proceed to Scheduling
              </button>
            </div>
          </>
        )}

        {state === "idle" && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden px-6">
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
                <div className="flex shrink-0 items-center justify-between border-b border-ithina-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-ithina-purple" strokeWidth={2} aria-hidden />
                    <span className="text-sm font-semibold text-white">Select Rules to Apply</span>
                  </div>
                  <span className="rounded-lg border border-ithina-purple/20 bg-ithina-purple/10 px-2.5 py-1 font-mono text-[10px] text-ithina-purple">
                    {selectedRules.length} selected
                  </span>
                </div>
                <div className="min-h-0 flex-1 divide-y divide-ithina-border/40 overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="ml-2 text-xs">Loading guard rails...</span>
                    </div>
                  )}
                  {isError && (
                    <div className="px-5 py-6 text-xs text-rose-400">
                      Failed to load guard rails. Please retry.
                    </div>
                  )}
                  {!isLoading && !isError && rules.map((rule) => (
                    <RuleCheckboxRow
                      key={rule.id}
                      rule={rule}
                      checked={selected.has(rule.id)}
                      onToggle={() => toggleRule(rule.id)}
                    />
                  ))}
                </div>
                <div className="flex shrink-0 gap-2 border-t border-ithina-border/60 px-5 py-2">
                  <button
                    type="button"
                    onClick={() => setSelected(new Set(rules.map((r) => r.id)))}
                    className="text-[10px] text-ithina-purple transition-colors hover:text-white"
                  >
                    Select All
                  </button>
                  <span className="text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-[10px] text-slate-500 transition-colors hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-ithina-border/40 bg-ithina-bg/20 px-6 py-4">
              <button
                type="button"
                onClick={runValidation}
                disabled={selectedRules.length === 0}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  selectedRules.length > 0
                    ? "bg-ithina-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:bg-ithina-purple-hover"
                    : "border border-ithina-border bg-ithina-panel text-slate-500",
                )}
              >
                <Shield className="size-4" strokeWidth={2} aria-hidden />
                Check &amp; Validate
              </button>
            </div>
          </>
        )}
      </div>

      <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto bg-ithina-bg/30 px-5 py-6">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">Compliance Score</p>
          {state === "passed" ? (
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-emerald-400 bg-ithina-bg/40">
                <span className="text-sm font-bold text-emerald-400">100%</span>
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {selectedRules.length}/{selectedRules.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">checks passed</p>
                <span className="mt-1 inline-block rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                  ALL CLEAR
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex size-16 items-center justify-center rounded-full border-4 border-ithina-border/60">
                <span className="font-mono text-xs text-slate-600">—</span>
              </div>
              <p className="text-center text-[10px] text-slate-600">Run validation to see score</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
          <div className="border-b border-ithina-border px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Selected Rules</p>
          </div>
          {selectedRules.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-slate-600">None selected yet</p>
            </div>
          ) : (
            <div className="divide-y divide-ithina-border/40">
              {selectedRules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2 px-4 py-2.5">
                  {state === "passed" ? (
                    <Check className="size-3 shrink-0 text-emerald-400" strokeWidth={3} />
                  ) : (
                    <div className="size-2 shrink-0 rounded-full bg-ithina-purple" />
                  )}
                  <span className="flex-1 truncate text-xs text-slate-300">{rule.name}</span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[9px]",
                      rule.severity === "Hard" ? "text-rose-400" : "text-amber-400",
                    )}
                  >
                    {rule.severity === "Hard" ? "HARD" : "SOFT"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-ithina-border bg-ithina-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">SKUs</span>
            <span className="font-mono text-xs font-bold text-white">{skuCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Rules selected</span>
            <span className="font-mono text-xs font-bold text-ithina-purple">{selectedRules.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Validation</span>
            <span
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[10px] font-bold",
                state === "passed"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                  : state === "running"
                    ? "border-ithina-border/40 text-slate-300"
                    : "border-ithina-border/40 text-slate-600",
              )}
            >
              {state === "passed" ? "PASSED" : state === "running" ? "RUNNING" : "PENDING"}
            </span>
          </div>
        </div>

        {state === "idle" && selectedRules.length === 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={2} aria-hidden />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-rose-300">Selection Required</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Select at least one guard rail then click Check &amp; Validate.
              </p>
            </div>
          </div>
        )}

        {state === "idle" && selectedRules.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-ithina-purple/20 bg-ithina-purple/5 p-4">
            <Zap className="mt-0.5 size-4 shrink-0 text-ithina-purple" strokeWidth={2} aria-hidden />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-ithina-purple">Ready to Validate</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {selectedRules.length} rule{selectedRules.length !== 1 ? "s" : ""} selected. Click Check &amp;
                Validate to proceed.
              </p>
            </div>
          </div>
        )}

        {state === "passed" && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={2} aria-hidden />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-emerald-300">All Clear</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                All checks passed. Click Proceed to Scheduling.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
