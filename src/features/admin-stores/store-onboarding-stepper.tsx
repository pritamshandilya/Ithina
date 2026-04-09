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
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ithina-bg/80 text-xs font-semibold text-slate-300">
          {isCompleted ? <Check className="size-4 text-emerald-400" aria-hidden /> : step + 1}
        </div>
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="text-sm font-semibold">{label}</span>
          </div>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>
      </div>
    </li>
  );
}

function StepSeparator() {
  return (
    <li className="flex items-center">
      <div className="h-px w-6 rounded-full bg-ithina-border" />
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
    <ol className="flex flex-wrap items-stretch gap-3 rounded-2xl px-2 py-3 shadow-sm">
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
