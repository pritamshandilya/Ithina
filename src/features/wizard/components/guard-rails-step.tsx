import { AlertTriangle, Check, Info, Loader2, Shield, ShieldOff, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useEnterGuardrailsReview, useValidateCampaignGuardrails } from "@/hooks/use-campaigns";
import { useGuardrails } from "@/hooks/use-guardrails";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { GuardRailRule, GuardRailSeverity } from "@/mocks/guard-rails";
import type { ApiGuardrailValidateRuleResult } from "@/types/api/campaigns";
import { useAppSelector } from "@/store/hooks";

const EMPTY_GUARDRAILS_MESSAGE =
  "None are set up for your organization yet. Ask an administrator to add rules.";

/** Pushes Check & Validate / running state up to {@link WizardStepHeader} trailing slot. */
export type GuardRailsWizardHeaderApi =
  | { mode: "check"; onCheckValidate: () => void; checkDisabled: boolean }
  | { mode: "running" };

interface GuardRailsStepProps {
  campaignId?: string;
  onNext: () => void;
  /** Fires when the step-advancing action becomes available (validation passed). */
  onProceedAvailableChange?: (canProceed: boolean) => void;
  /** When true, hides the bottom "Proceed to Scheduling" bar (header holds primary). */
  hideFooterProceed?: boolean;
  /** Wire primary actions into the global wizard header (same row as other steps' Next). */
  onWizardHeaderActionChange?: (api: GuardRailsWizardHeaderApi | null) => void;
}

type ValidationState = "idle" | "running" | "passed" | "failed";

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

export default function GuardRailsStep({
  campaignId,
  onNext,
  onProceedAvailableChange,
  hideFooterProceed = false,
  onWizardHeaderActionChange,
}: GuardRailsStepProps) {
  const gridData = useAppSelector((s) => s.wizard.gridData);
  const includedLen = useMemo(
    () => gridData.filter((r) => r.included !== false).length,
    [gridData],
  );
  const skuCount = includedLen > 0 ? includedLen : gridData.length > 0 ? 0 : 1;
  const { data: rules = [], isLoading, isError, isSuccess } = useGuardrails();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, setState] = useState<ValidationState>("idle");
  const [complianceScore, setComplianceScore] = useState<number | null>(null);
  const [validateResults, setValidateResults] = useState<ApiGuardrailValidateRuleResult[]>([]);
  const initializedSelectionRef = useRef(false);
  const emptyListToastShownRef = useRef(false);
  const enteredGuardrailsRef = useRef(false);

  const enterMutation = useEnterGuardrailsReview();
  const validateMutation = useValidateCampaignGuardrails();

  useEffect(() => {
    if (!campaignId || enteredGuardrailsRef.current) return;
    enteredGuardrailsRef.current = true;
    enterMutation.mutate(campaignId);
  }, [campaignId]);

  useEffect(() => {
    if (!isSuccess || isLoading || isError || rules.length > 0) return;
    if (emptyListToastShownRef.current) return;
    emptyListToastShownRef.current = true;
    toast({
      description: EMPTY_GUARDRAILS_MESSAGE,
    });
  }, [isSuccess, isLoading, isError, rules.length]);

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

  const runValidation = useCallback(async () => {
    if (state === "running" || !campaignId) return;
    setState("running");
    setValidateResults([]);
    setComplianceScore(null);
    try {
      const result = await validateMutation.mutateAsync({
        id: campaignId,
        guardrailIds: [...selected],
      });
      setComplianceScore(result.compliance_score);
      setValidateResults(result.results);
      if (result.overall_passed) {
        setState("passed");
      } else {
        setState("failed");
      }
    } catch {
      toast({
        title: "Validation failed",
        description: "Could not run compliance checks. Please try again.",
        variant: "destructive",
      });
      setState("idle");
    }
  }, [state, campaignId, selected, validateMutation]);

  const passedCount = useMemo(
    () => validateResults.filter((r) => r.passed).length,
    [validateResults],
  );
  const failedCount = useMemo(
    () => validateResults.filter((r) => !r.passed).length,
    [validateResults],
  );

  const resetValidation = () => {
    setState("idle");
    setValidateResults([]);
    setComplianceScore(null);
  };

  useEffect(() => {
    onProceedAvailableChange?.(state === "passed");
  }, [state, onProceedAvailableChange]);

  useEffect(() => {
    if (!onWizardHeaderActionChange) return;
    if (state === "idle" || state === "failed") {
      onWizardHeaderActionChange({
        mode: "check",
        onCheckValidate: runValidation,
        checkDisabled: selectedRules.length === 0 || rules.length === 0 || !campaignId,
      });
    } else if (state === "running") {
      onWizardHeaderActionChange({ mode: "running" });
    } else {
      onWizardHeaderActionChange(null);
    }
    return () => onWizardHeaderActionChange(null);
  }, [state, onWizardHeaderActionChange, runValidation, selectedRules.length, rules.length, campaignId]);

  const scoreDisplay = complianceScore != null ? `${Math.round(complianceScore)}%` : "—";

  return (
    <div className="flex min-h-0 flex-1 animate-[fadeIn_0.3s_ease-out] overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-ithina-border/50">
        <div className="shrink-0 border-b border-ithina-border/30 px-6 pb-4 pt-6">
          <h3 className="text-lg font-bold text-white">Guard Rails</h3>
          <p className="mt-0.5 text-sm text-slate-400">
            Select the guard rails to apply, then use{" "}
            <span className="font-medium text-white">Check &amp; Validate</span> in the top bar to run
            compliance checks.
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
                      {passedCount} passed, {failedCount} failed, 0 warnings
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
                  {validateResults.map((result) => {
                    const rule = rules.find((r) => r.id === result.guardrail_id);
                    return (
                      <div key={result.guardrail_id} className="flex items-start gap-3 px-5 py-3.5">
                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                          <Check className="size-3.5 text-emerald-400" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white">{result.rule_name}</span>
                            {rule && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase",
                                  severityBadgeClass(rule.severity),
                                )}
                              >
                                {rule.severity === "Hard" ? "HARD" : "SOFT"}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">
                            {result.skus_checked} SKUs checked
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-emerald-400">
                          pass
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {!hideFooterProceed && (
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
            )}
          </>
        )}

        {state === "failed" && (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-rose-400/10">
                    <X className="size-4 text-rose-400" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-300">Validation Failed</p>
                    <p className="text-[10px] text-slate-500">
                      {passedCount} passed, {failedCount} failed
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
                  {validateResults.map((result) => {
                    const rule = rules.find((r) => r.id === result.guardrail_id);
                    const passed = result.passed;
                    return (
                      <div key={result.guardrail_id} className="flex items-start gap-3 px-5 py-3.5">
                        <div
                          className={cn(
                            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                            passed ? "bg-emerald-400/10" : "bg-rose-400/10",
                          )}
                        >
                          {passed ? (
                            <Check className="size-3.5 text-emerald-400" strokeWidth={2.5} />
                          ) : (
                            <X className="size-3.5 text-rose-400" strokeWidth={2.5} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white">{result.rule_name}</span>
                            {rule && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase",
                                  severityBadgeClass(rule.severity),
                                )}
                              >
                                {rule.severity === "Hard" ? "HARD" : "SOFT"}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">
                            {result.skus_checked} SKUs checked
                            {!passed && result.skus_failed > 0 && (
                              <span className="text-rose-400"> · {result.skus_failed} failed</span>
                            )}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[9px] font-bold uppercase",
                            passed ? "text-emerald-400" : "text-rose-400",
                          )}
                        >
                          {passed ? "pass" : "fail"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                  {!isLoading && !isError && rules.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full border border-ithina-border bg-ithina-bg">
                        <ShieldOff className="size-7 text-slate-500" strokeWidth={1.5} aria-hidden />
                      </div>
                      <div>
                        <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">
                          {EMPTY_GUARDRAILS_MESSAGE}
                        </p>
                      </div>
                    </div>
                  )}
                  {!isLoading && !isError &&
                    rules.length > 0 &&
                    rules.map((rule) => (
                      <RuleCheckboxRow
                        key={rule.id}
                        rule={rule}
                        checked={selected.has(rule.id)}
                        onToggle={() => toggleRule(rule.id)}
                      />
                    ))}
                </div>
                {rules.length > 0 && (
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
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto bg-ithina-bg/30 px-5 py-6">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">Compliance Score</p>
          {(state === "passed" || state === "failed") && complianceScore != null ? (
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "relative flex size-16 shrink-0 items-center justify-center rounded-full border-4 bg-ithina-bg/40",
                  state === "passed" ? "border-emerald-400" : "border-rose-400",
                )}
              >
                <span className={cn("text-sm font-bold", state === "passed" ? "text-emerald-400" : "text-rose-400")}>
                  {scoreDisplay}
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {passedCount}/{validateResults.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">checks passed</p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded border px-2 py-0.5 font-mono text-[9px] font-bold",
                    state === "passed"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                      : "border-rose-400/20 bg-rose-400/10 text-rose-400",
                  )}
                >
                  {state === "passed" ? "ALL CLEAR" : "FAILED"}
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
              {selectedRules.map((rule) => {
                const result = validateResults.find((r) => r.guardrail_id === rule.id);
                const passed = result?.passed;
                return (
                  <div key={rule.id} className="flex items-center gap-2 px-4 py-2.5">
                    {state === "passed" || state === "failed" ? (
                      passed ? (
                        <Check className="size-3 shrink-0 text-emerald-400" strokeWidth={3} />
                      ) : passed === false ? (
                        <X className="size-3 shrink-0 text-rose-400" strokeWidth={3} />
                      ) : (
                        <div className="size-2 shrink-0 rounded-full bg-ithina-purple" />
                      )
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
                );
              })}
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
                  : state === "failed"
                    ? "border-rose-400/20 bg-rose-400/10 text-rose-400"
                    : state === "running"
                      ? "border-ithina-border/40 text-slate-300"
                      : "border-ithina-border/40 text-slate-600",
              )}
            >
              {state === "passed" ? "PASSED" : state === "failed" ? "FAILED" : state === "running" ? "RUNNING" : "PENDING"}
            </span>
          </div>
        </div>

        {state === "idle" && rules.length === 0 && !isLoading && !isError && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-ithina-border bg-ithina-panel p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-[11px] leading-relaxed text-slate-500">{EMPTY_GUARDRAILS_MESSAGE}</p>
            </div>
          </div>
        )}

        {state === "idle" && rules.length > 0 && selectedRules.length === 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={2} aria-hidden />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-rose-300">Selection Required</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Select at least one guard rail, then use <span className="text-slate-300">Check &amp; Validate</span>{" "}
                in the top bar.
              </p>
            </div>
          </div>
        )}

        {state === "idle" && rules.length > 0 && selectedRules.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-ithina-purple/20 bg-ithina-purple/5 p-4">
            <Zap className="mt-0.5 size-4 shrink-0 text-ithina-purple" strokeWidth={2} aria-hidden />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-ithina-purple">Ready to Validate</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {selectedRules.length} rule{selectedRules.length !== 1 ? "s" : ""} selected. Use{" "}
                <span className="text-slate-300">Check &amp; Validate</span> in the top bar to run checks.
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

        {state === "failed" && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={2} aria-hidden />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-rose-300">Checks Failed</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {failedCount} rule{failedCount !== 1 ? "s" : ""} failed. Fix the issues and re-validate, or re-select
                rules.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
