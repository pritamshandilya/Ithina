import { ChevronLeft, CloudUpload, Zap } from "lucide-react";
import { memo, type ReactNode } from "react";

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
}

function WizardStepHeader({ mode, inputMode = "ai", currentStep, steps, onBack, trailingSlot }: WizardStepHeaderProps) {
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

          return (
            <div key={i} className="flex shrink-0 items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all",
                  isActive ? "border border-ithina-purple/30 bg-ithina-purple/15" : "border border-transparent",
                )}
              >
                <div
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all",
                    isCompleted
                      ? "border-ithina-purple bg-ithina-purple text-white"
                      : isActive
                      ? "border-ithina-purple text-ithina-purple"
                      : "border-ithina-border text-slate-600",
                  )}
                >
                  {isCompleted ? (
                    <svg className="size-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    isActive ? "text-white" : isCompleted ? "text-ithina-purple" : "text-slate-600",
                  )}
                >
                  {label}
                </span>
              </div>
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

      {trailingSlot ? <div className="flex shrink-0 items-center">{trailingSlot}</div> : null}

      {isNl ? (
        <div className="flex shrink-0 items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="inline-block size-1.5 rounded-full bg-amber-400" />
          Draft, auto-saved
        </div>
      ) : null}
    </div>
  );
}

export default memo(WizardStepHeader);
