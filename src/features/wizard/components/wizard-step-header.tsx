import { ChevronLeft, CloudUpload, Zap } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { WizardMode } from "./mode-chooser";

interface WizardStepHeaderProps {
  mode: WizardMode;
  currentStep: number; // 1-indexed
  steps: string[];
  onBack: () => void;
}

function WizardStepHeader({ mode, currentStep, steps, onBack }: WizardStepHeaderProps) {
  const isNl = mode === "nl";

  return (
    <div className="flex shrink-0 items-center gap-5 border-b border-ithina-border px-8 pb-4 pt-5">
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
            isNl ? "bg-ithina-purple" : "border border-ithina-border bg-ithina-bg",
          )}
        >
          {isNl ? (
            <Zap className="size-3.5 text-white" />
          ) : (
            <CloudUpload className="size-3.5 text-slate-400" />
          )}
        </div>
        <span className={cn("text-xs font-semibold", isNl ? "text-ithina-purple" : "text-slate-300")}>
          {isNl ? "NL Generation" : "Manual Creation"}
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
                  "flex items-center gap-2 rounded-full px-3 py-1.5 transition-all",
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

      {/* Step counter badge */}
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-ithina-border bg-ithina-bg px-3 py-1">
        <span className="text-[10px] font-bold text-ithina-purple">{currentStep}</span>
        <span className="text-[10px] text-slate-600">/</span>
        <span className="text-[10px] font-medium text-slate-400">{steps.length}</span>
      </div>
    </div>
  );
}

export default memo(WizardStepHeader);
