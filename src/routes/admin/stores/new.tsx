import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Globe,
  Store as StoreIcon,
  Users as UsersIcon,
} from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { StoreOnboardingBasicStep } from "@/components/admin/stores/store-onboarding-basic-step";
import { StoreOnboardingConfigStep } from "@/components/admin/stores/store-onboarding-config-step";
import { StoreOnboardingTeamStep } from "@/components/admin/stores/store-onboarding-team-step";
import { StoreOnboardingStepper } from "@/components/admin/stores/store-onboarding-stepper";
import { useStoreOnboarding } from "@/components/admin/stores/useStoreOnboarding";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/admin/stores/new")({
  component: StoreOnboardingPage,
});

function StoreOnboardingPage() {
  const navigate = useNavigate();
  const o = useStoreOnboarding();

  const backButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate({ to: "/admin/stores" })}
      aria-label="Back to Stores"
    >
      <ArrowLeft className="size-4" aria-hidden />
    </Button>
  );

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Create Store"
          description="Onboard a new store with basic settings and staff assignments."
          leading={backButton}
        >
          {/* Right-side actions intentionally omitted; back button is in `leading`. */}
        </PageHeader>
      }
    >
      <div className="min-h-0 pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-6">
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
              onAddressChange={(value) =>
                o.setBasicForm((f) => ({ ...f, address: value }))
              }
              onRegionChange={(value) => o.setBasicForm((f) => ({ ...f, region: value }))}
              onCurrencyChange={(value) =>
                o.setBasicForm((f) => ({ ...f, currency: value }))
              }
              onNext={() => o.goToStep(1)}
            />
          )}

          {o.step === 1 && (
            <StoreOnboardingConfigStep
              activeConfigSection={o.activeConfigSection}
              setActiveConfigSection={o.setActiveConfigSection}
              configVisited={o.configVisited}
              setConfigVisited={o.setConfigVisited}
              fixtureTypes={o.fixtureTypes}
              setFixtureTypes={o.setFixtureTypes}
              shelfTemplatesConfig={o.shelfTemplatesConfig}
              setShelfTemplatesConfig={o.setShelfTemplatesConfig}
              newTemplate={o.newTemplate}
              setNewTemplate={o.setNewTemplate}
              editingTemplateIndex={o.editingTemplateIndex}
              setEditingTemplateIndex={o.setEditingTemplateIndex}
              showAddTemplateForm={o.showAddTemplateForm}
              setShowAddTemplateForm={o.setShowAddTemplateForm}
              saveShelfTemplateFromModal={o.saveShelfTemplateFromModal}
              dimensionUnits={o.dimensionUnits}
              configForm={o.configForm}
              setConfigForm={o.setConfigForm}
              canContinueConfig={o.canContinueConfig}
              defaultComplianceRuleSet={o.defaultComplianceRuleSet}
              onUpdateDefaultComplianceRuleSet={o.updateDefaultComplianceRuleSet}
              shelfFixtureLabels={o.shelfFixtureLabels}
              onBack={() => o.goToStep(0)}
              isCreatingStore={o.createStoreMutation.isPending}
              onCreateStore={o.handleCreateStore}
            />
          )}

          {o.step === 2 && (
            <StoreOnboardingTeamStep
              hasStore={!!o.createdStore}
              usersLoading={o.orgUsersLoading}
              assignableUsers={o.assignableUsers}
              selectedUserIds={o.selectedUserIds}
              isCreatingStore={o.createStoreMutation.isPending}
              onCreateStore={o.handleCreateStore}
              isFinishing={o.assignStoreUserMutation.isPending}
              onToggleUser={o.toggleUserSelection}
              onBulkSelectionChange={o.bulkUserSelectionChange}
              onFinish={o.handleFinish}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
