import { ChevronLeft, CloudUpload, Loader2, Save, Zap } from "lucide-react";
import { memo, type ReactNode } from "react";

import HeaderNotificationsTrigger from "@/components/header-notifications-trigger";
import { cn } from "@/lib/utils";

import type { WizardMode } from "./mode-chooser";

interface WizardStepHeaderProps {
  mode: WizardMode;
  inputMode?: "ai" | "csv";
  currentStep: number; // 1-indexed
  steps: string[];
  onBack: () => void;
  /** Primary action after the step pills (e.g. NL step 1 Next). */
  trailingSlot?: ReactNode;
  /** Navigate to a step; only called for steps at or before the current step. */
  onStepClick?: (step: number) => void;
  /** When provided, shows a Save button in the header. */
  onSave?: () => void;
  isSaving?: boolean;
}

function WizardStepHeader({
  mode,
  inputMode = "ai",
  currentStep,
  steps,
  onBack,
  trailingSlot,
  onStepClick,
  onSave,
  isSaving = false,
}: WizardStepHeaderProps) {
  const isNl = mode === "nl";
  const isCsvNl = isNl && inputMode === "csv";

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-ithina-border px-4 pb-2.5 pt-3 sm:px-5">
      {/* Back button */}
      <button
        onClick={onBack}
        aria-label="Go back"
        className="shrink-0 rounded-xl border border-ithina-border p-2 text-slate-400 transition-colors hover:text-white"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Mode badge */}
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-lg",
            isCsvNl
              ? "border border-ithina-border bg-ithina-bg"
              : isNl
                ? "bg-ithina-purple"
                : "border border-ithina-border bg-ithina-bg",
          )}
        >
          {isCsvNl ? (
            <CloudUpload className="size-3.5 text-slate-300" />
          ) : isNl ? (
            <Zap className="size-3.5 text-white" />
          ) : (
            <CloudUpload className="size-3.5 text-slate-400" />
          )}
        </div>
        <span className={cn("text-xs font-semibold", isCsvNl ? "text-slate-300" : isNl ? "text-ithina-purple" : "text-slate-300")}>
          {isCsvNl ? "CSV Upload" : isNl ? "AI Assisted" : "Manual Upload"}
        </span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px shrink-0 bg-ithina-border" />

      {/* Step pills */}
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          const isClickable = Boolean(onStepClick) && stepNum <= currentStep;

          return (
            <div key={i} className="flex shrink-0 items-center">
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(stepNum)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-left text-xs font-semibold transition-all",
                    isActive
                      ? "bg-ithina-purple text-white shadow-sm"
                      : "border border-transparent text-slate-400 hover:border-ithina-border/60 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all",
                      isActive
                        ? "border-white/50 bg-white/20 text-white"
                        : isCompleted
                          ? "border-ithina-purple bg-ithina-purple text-white"
                          : "border-ithina-border text-slate-600",
                    )}
                  >
                    {isCompleted ? (
                      <svg className="size-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : isCompleted ? "text-ithina-purple" : "text-slate-600",
                    )}
                  >
                    {label}
                  </span>
                </button>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                    isActive ? "bg-ithina-purple text-white shadow-sm" : "border border-transparent text-slate-600",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all",
                      isCompleted
                        ? "border-ithina-purple bg-ithina-purple text-white"
                        : isActive
                          ? "border-white/50 bg-white/20 text-white"
                          : "border-ithina-border text-slate-600",
                    )}
                  >
                    {isCompleted ? (
                      <svg className="size-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : isCompleted ? "text-ithina-purple" : "text-slate-600",
                    )}
                  >
                    {label}
                  </span>
                </div>
              )}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px w-6 shrink-0 transition-colors",
                    isCompleted ? "bg-ithina-purple" : "bg-ithina-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ithina-border px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-ithina-purple/50 hover:bg-ithina-purple/10 hover:text-white disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSaving ? "Saving…" : "Save"}
          </button>
        )}
        <HeaderNotificationsTrigger />
        {trailingSlot ? <div className="flex shrink-0 items-center">{trailingSlot}</div> : null}
      </div>
    </div>
  );
}

export default memo(WizardStepHeader);
