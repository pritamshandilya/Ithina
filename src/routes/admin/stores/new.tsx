import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Globe,
  Store as StoreIcon,
  Users as UsersIcon,
} from "lucide-react";

import MainLayout from "@/components/layouts/main";
import type { ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import { StoreOnboardingBasicStep } from "@/components/admin/stores/store-onboarding-basic-step";
import {
  StoreOnboardingConfigStep,
} from "@/components/admin/stores/store-onboarding-config-step";
import type {
  ConfigSection,
  FixtureConfig,
  ShelfTemplateConfig,
} from "@/components/admin/stores/store-onboarding-config-step";
import { StoreOnboardingTeamStep } from "@/components/admin/stores/store-onboarding-team-step";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useAssignStoreUser,
  useCreateStore,
  useOrgUsers,
  shelfTemplatesKeys,
  storeDefaultsKeys,
} from "@/queries/checker";
import { useDimensionUnits } from "@/queries/checker";
import { updateStoreComplianceSettings } from "@/queries/checker/api/org";
import {
  createComplianceRuleSetForStore,
  formatDefaultOnboardingComplianceRuleSetName,
} from "@/queries/maker/api/compliance-rule-sets";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { StoreSetting } from "@/types/checker";
import type { ShelfTemplateCreateInput } from "@/types/shelf-template";
import { replaceShelfTemplates } from "@/queries/checker/api/shelf-templates";
import { mergeStoreDefaults } from "@/lib/store-defaults-storage";

export const Route = createFileRoute("/admin/stores/new")({
  component: StoreOnboardingPage,
});

type Step = 0 | 1 | 2;


function StoreOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createStoreMutation = useCreateStore();
  const assignStoreUserMutation = useAssignStoreUser();
  const { data: orgUsers = [], isLoading: orgUsersLoading } = useOrgUsers();

  const [step, setStep] = useState<Step>(0);
  const [createdStore, setCreatedStore] = useState<StoreSetting | null>(null);

  const [basicForm, setBasicForm] = useState({
    name: "",
    address: "",
    region: "",
    status: "Active" as "Active" | "Inactive",
    currency: "USD",
  });

  const [configForm, setConfigForm] = useState({
    default_dimensions: "inch" as StoreDimensionUnit,
  });

  const [activeConfigSection, setActiveConfigSection] =
    useState<ConfigSection>("fixtures");
  const [configVisited, setConfigVisited] = useState<Record<ConfigSection, boolean>>({
    fixtures: true,
    shelfTemplates: false,
    rules: false,
    dimensions: false,
  });

  const [fixtureTypes, setFixtureTypes] = useState<FixtureConfig[]>([
    { name: "Gondola (standard)", detail: "Primary aisle runs" },
    { name: "Endcap", detail: "Promotional displays at aisle ends" },
    { name: "Cooler/Chiller", detail: "Refrigerated product bays" },
    { name: "Checkout Lane", detail: "Impulse fixtures at checkout" },
    { name: "Wall Unit", detail: "Perimeter wall shelving" },
  ]);

  const [shelfTemplatesConfig, setShelfTemplatesConfig] = useState<ShelfTemplateConfig[]>([
    {
      name: '4-shelf standard (48"W)',
      description: "4 shelves · gondola bay",
      fixtureType: "gondola",
      zone: "Grocery",
      section: "General",
      width: "48",
      height: "72",
      depth: "18",
    },
    {
      name: '5-shelf tall (48"W)',
      description: "5 shelves · tall gondola",
      fixtureType: "gondola",
      zone: "Grocery",
      section: "General",
      width: "48",
      height: "84",
      depth: "18",
    },
    {
      name: "3-shelf cooler",
      description: "3 shelves · refrigerated bay",
      fixtureType: "cooler",
      zone: "Dairy",
      section: "Cold",
      width: "48",
      height: "78",
      depth: "30",
    },
  ]);

  const [newFixture, setNewFixture] = useState<FixtureConfig>({
    name: "",
    detail: "",
  });

  const [newTemplate, setNewTemplate] = useState<ShelfTemplateConfig>({
    name: "",
    description: "",
    fixtureType: "gondola",
    zone: "",
    section: "",
    width: "",
    height: "",
    depth: "",
  });
  const [editingTemplateIndex, setEditingTemplateIndex] = useState<number | null>(null);
  const [showAddTemplateForm, setShowAddTemplateForm] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [seedComplianceRuleSet, setSeedComplianceRuleSet] = useState(true);

  const canContinueBasic =
    basicForm.name.trim().length > 0 &&
    basicForm.address.trim().length > 0 &&
    basicForm.region.trim().length > 0 &&
    basicForm.currency.trim().length > 0;

  const hasVisitedAllConfigSections = useMemo(
    () => Object.values(configVisited).every(Boolean),
    [configVisited],
  );

  const canContinueConfig =
    configForm.default_dimensions.trim().length > 0 && hasVisitedAllConfigSections;

  const { data: dimensionUnits = [] } = useDimensionUnits();

  const assignableUsers = useMemo(
    () => orgUsers.filter((u) => u.role === "maker" || u.role === "checker"),
    [orgUsers],
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const saveShelfTemplateFromModal = (values: ShelfTemplateModalValues) => {
    const name = values.name.trim();
    if (!name) return;
    if (editingTemplateIndex !== null) {
      setShelfTemplatesConfig((prev) =>
        prev.map((item, idx) =>
          idx === editingTemplateIndex
            ? {
                name,
                description: values.description.trim() || "Custom shelf template",
                fixtureType: values.fixtureType,
                zone: values.zone,
                section: values.section,
                width: values.width || "48",
                height: values.height || "72",
                depth: values.depth || "18",
              }
            : item,
        ),
      );
    } else {
      setShelfTemplatesConfig((prev) => [
        ...prev,
        {
          name,
          description: values.description.trim() || "Custom shelf template",
          fixtureType: values.fixtureType,
          zone: values.zone,
          section: values.section,
          width: values.width || "48",
          height: values.height || "72",
          depth: values.depth || "18",
        },
      ]);
    }
    setNewTemplate({
      name: "",
      description: "",
      fixtureType: "gondola",
      zone: "",
      section: "",
      width: "",
      height: "",
      depth: "",
    });
    setEditingTemplateIndex(null);
    setShowAddTemplateForm(false);
  };

  const handleCreateStore = async () => {
    if (!canContinueBasic || !canContinueConfig) return;
    try {
      const store = await createStoreMutation.mutateAsync({
        name: basicForm.name.trim(),
        address: basicForm.address.trim(),
        region: basicForm.region.trim(),
        status: basicForm.status,
        currency: basicForm.currency.trim().toUpperCase(),
        default_dimensions: configForm.default_dimensions,
      });
      const storeId = (store as StoreSetting).id;
      const postCreateWarnings: string[] = [];

      const fixtureNames = fixtureTypes
        .map((f) => f.name.trim())
        .filter((n) => n.length > 0);
      mergeStoreDefaults(storeId, { fixtureTypes: fixtureNames });
      void queryClient.invalidateQueries({ queryKey: storeDefaultsKeys.all });
      const templatePayload: ShelfTemplateCreateInput[] = shelfTemplatesConfig.map((tpl) => ({
        name: tpl.name.trim(),
        description: tpl.description.trim() || undefined,
        fixtureType: tpl.fixtureType,
        zone: tpl.zone.trim() || undefined,
        section: tpl.section.trim() || undefined,
        width: Number(tpl.width) || 48,
        height: Number(tpl.height) || 72,
        depth: Number(tpl.depth) || 18,
      }));
      try {
        await replaceShelfTemplates(storeId, templatePayload);
        void queryClient.invalidateQueries({ queryKey: shelfTemplatesKeys.all });
      } catch {
        postCreateWarnings.push(
          "Shelf template defaults could not be saved locally; you can re-add them in store settings.",
        );
      }

      if (seedComplianceRuleSet) {
        try {
          const createdSet = await createComplianceRuleSetForStore(storeId, {
            name: formatDefaultOnboardingComplianceRuleSetName(basicForm.name),
            status: "ACTIVE",
            rules: [
              {
                name: "Baseline visual check",
                description:
                  "Default onboarding compliance threshold for visual checks. Adjust or extend this rule set later.",
                category: "VISUAL",
                threshold: 95,
                is_active: true,
              },
            ],
          });
          await updateStoreComplianceSettings(storeId, {
            default_compliance_rule_set_id: createdSet.id,
          });
        } catch {
          postCreateWarnings.push(
            "Default compliance rule set was not created; configure it later under store settings or via the API.",
          );
        }
      }
      setCreatedStore(store as StoreSetting);
      toast({
        title: "Store created",
        description:
          postCreateWarnings.length > 0
            ? `${postCreateWarnings.join(" ")} Next, assign users to this store.`
            : "Next, assign users to this store.",
        variant: postCreateWarnings.length > 0 ? "warning" : "success",
      });
      setStep(2);
    } catch (error) {
      toast({
        title: "Failed to create store",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFinish = async () => {
    if (!createdStore) {
      navigate({ to: "/admin/stores" });
      return;
    }
    try {
      const storeId = createdStore.id;
      const userIds = Array.from(selectedUserIds);
      await Promise.all(
        userIds.map((userId) =>
          assignStoreUserMutation.mutateAsync({ storeId, userId }),
        ),
      );
      toast({
        title: "Store onboarding complete",
        description: "Users have been assigned successfully.",
      });
      navigate({ to: "/admin/stores" });
    } catch (error) {
      toast({
        title: "Failed to assign users",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (step === 2 && !createdStore) {
      setStep(0);
    }
  }, [step, createdStore]);

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Create Store"
          description="Onboard a new store with basic settings and staff assignments."
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/admin/stores" })}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Stores
          </Button>
        </PageHeader>
      }
    >
      <div className="min-h-screen pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-6">
          {/* Step indicator */}
          <ol className="flex flex-wrap items-stretch gap-3 rounded-2xl px-2 py-3 shadow-sm">
            <StepPill
              step={0}
              currentStep={step}
              icon={StoreIcon}
              label="Basic details"
              description="Name and address"
            />
            <StepSeparator />
            <StepPill
              step={1}
              currentStep={step}
              icon={Globe}
              label="Store configuration"
              description="Defaults & dimensions"
            />
            <StepSeparator />
            <StepPill
              step={2}
              currentStep={step}
              icon={UsersIcon}
              label="Team members"
              description="Assign makers & checkers"
            />
          </ol>

          {step === 0 && (
            <StoreOnboardingBasicStep
              name={basicForm.name}
              address={basicForm.address}
              region={basicForm.region}
              status={basicForm.status}
              currency={basicForm.currency}
              canContinue={canContinueBasic}
              onNameChange={(value) => setBasicForm((f) => ({ ...f, name: value }))}
              onAddressChange={(value) => setBasicForm((f) => ({ ...f, address: value }))}
              onRegionChange={(value) => setBasicForm((f) => ({ ...f, region: value }))}
              onStatusChange={(value) => setBasicForm((f) => ({ ...f, status: value }))}
              onCurrencyChange={(value) => setBasicForm((f) => ({ ...f, currency: value }))}
              onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <StoreOnboardingConfigStep
              activeConfigSection={activeConfigSection}
              setActiveConfigSection={setActiveConfigSection}
              configVisited={configVisited}
              setConfigVisited={setConfigVisited}
              fixtureTypes={fixtureTypes}
              setFixtureTypes={setFixtureTypes}
              newFixture={newFixture}
              setNewFixture={setNewFixture}
              shelfTemplatesConfig={shelfTemplatesConfig}
              setShelfTemplatesConfig={setShelfTemplatesConfig}
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              editingTemplateIndex={editingTemplateIndex}
              setEditingTemplateIndex={setEditingTemplateIndex}
              showAddTemplateForm={showAddTemplateForm}
              setShowAddTemplateForm={setShowAddTemplateForm}
              saveShelfTemplateFromModal={saveShelfTemplateFromModal}
              dimensionUnits={dimensionUnits}
              configForm={configForm}
              setConfigForm={setConfigForm}
              canContinueConfig={canContinueConfig}
              isCreating={createStoreMutation.isPending}
              seedComplianceRuleSet={seedComplianceRuleSet}
              setSeedComplianceRuleSet={setSeedComplianceRuleSet}
              shelfFixtureLabels={fixtureTypes.map((f) => f.name.trim()).filter(Boolean)}
              onBack={() => setStep(0)}
              onCreateStore={handleCreateStore}
            />
          )}

          {step === 2 && (
            <StoreOnboardingTeamStep
              hasStore={!!createdStore}
              usersLoading={orgUsersLoading}
              assignableUsers={assignableUsers}
              selectedUserIds={selectedUserIds}
              isFinishing={assignStoreUserMutation.isPending}
              onToggleUser={toggleUserSelection}
              onBack={() => setStep(1)}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

interface StepPillProps {
  step: Step;
  currentStep: Step;
  icon: typeof StoreIcon;
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
          <p className="text-[11px] text-muted-foreground">
            {description}
          </p>
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

