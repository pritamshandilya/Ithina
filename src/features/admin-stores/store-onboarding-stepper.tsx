import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type OnboardingStep = 0 | 1 | 2;

interface StepPillProps {
  step: OnboardingStep;
  currentStep: OnboardingStep;
  icon: LucideIcon;
  label: string;
  description: string;
}

function StepPill({ step, currentStep, icon: Icon, label, description }: StepPillProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <li className="min-w-[180px] flex-1">
      <div
        className={cn(
          "flex h-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
          isActive &&
            "border-ithina-purple/50 bg-ithina-purple/10 text-ithina-purple shadow-md shadow-ithina-purple/15",
          !isActive &&
            isCompleted &&
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
          !isActive &&
            !isCompleted &&
            "border-ithina-border bg-ithina-panel/80 text-slate-500",
        )}
      >
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
            isCompleted && "bg-emerald-500/15 text-emerald-400",
            isActive && "ring-2 ring-ithina-purple/40 bg-ithina-purple/15 text-ithina-purple",
            !isActive && !isCompleted && "bg-ithina-bg/80 text-slate-400",
          )}
        >
          {isCompleted ? (
            <Check className="size-4 text-emerald-400" aria-hidden />
          ) : isActive ? (
            <Icon className="size-4" aria-hidden />
          ) : (
            <span className="tabular-nums">{step + 1}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="text-sm font-semibold leading-tight">{label}</span>
          <p
            className={cn(
              "text-[11px] leading-snug",
              isActive ? "text-ithina-purple/80" : "text-slate-500",
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </li>
  );
}

function StepSeparator() {
  return (
    <li className="hidden items-center self-center sm:flex" aria-hidden>
      <div className="h-px w-8 rounded-full bg-ithina-border lg:w-10" />
    </li>
  );
}

interface StoreOnboardingStepperProps {
  step: OnboardingStep;
  icons: {
    basic: LucideIcon;
    config: LucideIcon;
    team: LucideIcon;
  };
}

export function StoreOnboardingStepper({
  step,
  icons: { basic: BasicIcon, config: ConfigIcon, team: TeamIcon },
}: StoreOnboardingStepperProps) {
  return (
    <ol className="flex flex-wrap items-stretch gap-2 sm:gap-3 lg:gap-4">
      <StepPill
        step={0}
        currentStep={step}
        icon={BasicIcon}
        label="Basic details"
        description="Name and address"
      />
      <StepSeparator />
      <StepPill
        step={1}
        currentStep={step}
        icon={ConfigIcon}
        label="Store configuration"
        description="Defaults & dimensions"
      />
      <StepSeparator />
      <StepPill
        step={2}
        currentStep={step}
        icon={TeamIcon}
        label="Team members"
        description="Assign makers & checkers"
      />
    </ol>
  );
}
