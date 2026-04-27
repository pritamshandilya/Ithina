import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, Globe, Store as StoreIcon, Users as UsersIcon } from "lucide-react";

import { StoreOnboardingBasicStep } from "@/features/admin-stores/store-onboarding-basic-step";
import { StoreOnboardingConfigStepPromo } from "@/features/admin-stores/store-onboarding-config-step";
import { StoreOnboardingTeamStepPromo } from "@/features/admin-stores/store-onboarding-team-step";
import { StoreOnboardingStepper } from "@/features/admin-stores/store-onboarding-stepper";
import { usePromoStoreOnboarding } from "@/features/admin-stores/use-promo-store-onboarding";

export default function StoreCreateWizardPage() {
  const navigate = useNavigate();
  const o = usePromoStoreOnboarding();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border/80 bg-sidebar/70 py-4 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/stores" })}
              className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              aria-label="Back to Stores"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                Create Store
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Onboard a new store with basic settings and staff assignments.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <div className="flex h-9 items-center border-l border-border/60 pl-3">
              <button
                type="button"
                className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full border border-background bg-destructive text-[9px] font-bold text-destructive-foreground">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="ithina-page-inner space-y-6 py-6 lg:pb-8">
          <StoreOnboardingStepper
            step={o.step}
            icons={{ basic: StoreIcon, config: Globe, team: UsersIcon }}
          />

          {o.step === 0 && (
            <StoreOnboardingBasicStep
              name={o.basicForm.name}
              address={o.basicForm.address}
              region={o.basicForm.region}
              currency={o.basicForm.currency}
              canContinue={o.canContinueBasic}
              onNameChange={(value) => o.setBasicForm((f) => ({ ...f, name: value }))}
              onAddressChange={(value) => o.setBasicForm((f) => ({ ...f, address: value }))}
              onRegionChange={(value) => o.setBasicForm((f) => ({ ...f, region: value }))}
              onCurrencyChange={(value) => o.setBasicForm((f) => ({ ...f, currency: value }))}
              onNext={() => o.goToStep(1)}
            />
          )}

          {o.step === 1 && (
            <StoreOnboardingConfigStepPromo
              onBack={() => o.goToStep(0)}
              onNext={() => void o.handleCreateAndGoToTeam()}
              isCreating={o.createStoreMutation.isPending}
            />
          )}

          {o.step === 2 && (
            <StoreOnboardingTeamStepPromo
              usersLoading={o.orgUsersLoading}
              assignableUsers={o.assignableUsers}
              selectedUserIds={o.selectedUserIds}
              isFinishing={o.isFinishing}
              onToggleUser={o.toggleUserSelection}
              onBulkSelectionChange={o.bulkUserSelectionChange}
              onBack={() => o.goToStep(1)}
              onFinish={() => void o.handleFinish()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
