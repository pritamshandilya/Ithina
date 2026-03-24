import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    <li className="flex-1 min-w-[180px]">
      <div
        className={`flex h-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
          isActive
            ? "border-accent bg-accent/10 text-accent shadow-md shadow-accent/20"
            : isCompleted
              ? "border-emerald-500/40 bg-emerald-500/8 text-emerald-400"
              : "border-border/70 bg-card/70 text-muted-foreground"
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-xs font-semibold">
          {isCompleted ? <Check className="size-4" /> : step + 1}
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-2">
            <Icon className="size-4" />
            <span className="text-sm font-semibold">{label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
    </li>
  );
}

function StepSeparator() {
  return (
    <li className="flex items-center">
      <div className="h-px w-6 rounded-full bg-border/70" />
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
