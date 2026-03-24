import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import type { ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import type {
  ConfigSection,
  FixtureConfig,
  ShelfTemplateConfig,
} from "@/components/admin/stores/store-onboarding-config-step";
import {
  DEFAULT_ONBOARDING_FIXTURES,
  DEFAULT_ONBOARDING_SHELF_TEMPLATES,
  defaultConfigForm,
  emptyShelfTemplateForm,
} from "@/components/admin/stores/store-onboarding-initial-data";
import type { OnboardingStep } from "@/components/admin/stores/store-onboarding-stepper";
import { useToast } from "@/hooks/use-toast";
import {
  useAssignStoreUser,
  useCreateStore,
  useOrgUsers,
  shelfTemplatesKeys,
  useDimensionUnits,
} from "@/queries/checker";
import { updateStoreComplianceSettings } from "@/queries/checker/api/org";
import {
  createComplianceRuleSetForStore,
  formatDefaultOnboardingComplianceRuleSetName,
} from "@/queries/maker/api/compliance-rule-sets";
import type { StoreSetting } from "@/types/checker";
import type { ShelfTemplateCreateInput } from "@/types/shelf-template";
import { replaceShelfTemplates } from "@/queries/checker/api/shelf-templates";
import { createStoreFixture } from "@/queries/checker/api/fixtures";

export function useStoreOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createStoreMutation = useCreateStore();
  const assignStoreUserMutation = useAssignStoreUser();
  const { data: orgUsers = [], isLoading: orgUsersLoading } = useOrgUsers();

  const [step, setStep] = useState<OnboardingStep>(0);
  const [createdStore, setCreatedStore] = useState<StoreSetting | null>(null);

  const goToStep = (nextStep: OnboardingStep) => {
    if (createdStore && nextStep < 2) {
      setStep(2);
      return;
    }
    if (!createdStore && nextStep === 2) {
      setStep(0);
      return;
    }
    setStep(nextStep);
  };

  const [basicForm, setBasicForm] = useState({
    name: "",
    address: "",
    region: "",
    currency: "USD",
  });

  const [configForm, setConfigForm] = useState(defaultConfigForm);

  const [activeConfigSection, setActiveConfigSection] =
    useState<ConfigSection>("fixtures");
  const [configVisited, setConfigVisited] = useState<Record<ConfigSection, boolean>>({
    fixtures: true,
    shelfTemplates: false,
    rules: false,
    dimensions: false,
  });

  const [fixtureTypes, setFixtureTypes] = useState<FixtureConfig[]>(
    () => [...DEFAULT_ONBOARDING_FIXTURES],
  );
  const [shelfTemplatesConfig, setShelfTemplatesConfig] = useState<
    ShelfTemplateConfig[]
  >(() => [...DEFAULT_ONBOARDING_SHELF_TEMPLATES]);

  const [newTemplate, setNewTemplate] = useState<ShelfTemplateConfig>(
    emptyShelfTemplateForm,
  );
  const [editingTemplateIndex, setEditingTemplateIndex] = useState<number | null>(
    null,
  );
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
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const bulkUserSelectionChange = (userIds: string[], selected: boolean) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      for (const id of userIds) {
        if (selected) next.add(id);
        else next.delete(id);
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
    setNewTemplate(emptyShelfTemplateForm());
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
        currency: basicForm.currency.trim().toUpperCase(),
        default_dimensions: configForm.default_dimensions,
      });
      const storeId = (store as StoreSetting).id;
      const postCreateWarnings: string[] = [];

      const fixturesToCreate = fixtureTypes
        .map((fixture) => ({
          type: fixture.type.trim(),
          width: Number(fixture.width) || 120,
          height: Number(fixture.height) || 200,
          depth: Number(fixture.depth) || 45,
          dimension_unit: fixture.dimension_unit || configForm.default_dimensions,
          section: fixture.section.trim() || "General",
          aisle: fixture.aisle.trim() || "A1",
          zone: fixture.zone.trim() || "General",
        }))
        .filter((fixture) => fixture.type.length > 0);
      if (fixturesToCreate.length > 0) {
        const seen = new Set<string>();
        const dedupedFixtures = fixturesToCreate.filter((fixture) => {
          const key = [
            fixture.type.toLowerCase(),
            fixture.dimension_unit.toLowerCase(),
            fixture.width,
            fixture.height,
            fixture.depth,
            fixture.section.toLowerCase(),
            fixture.aisle.toLowerCase(),
            fixture.zone.toLowerCase(),
          ].join("|");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const fixtureResults = await Promise.allSettled(
          dedupedFixtures.map((fixture) =>
            createStoreFixture(storeId, {
              type: fixture.type,
              dimensions: {
                width: fixture.width,
                height: fixture.height,
                depth: fixture.depth,
              },
              dimension_unit: fixture.dimension_unit,
              physical_location: {
                section: fixture.section,
                aisle: fixture.aisle,
                zone: fixture.zone,
              },
            }),
          ),
        );

        const failedFixtureCount = fixtureResults.filter(
          (result) => result.status === "rejected",
        ).length;
        if (failedFixtureCount > 0) {
          postCreateWarnings.push(
            `${failedFixtureCount} fixture(s) could not be created during onboarding; you can add them later from shelf setup.`,
          );
        }
      }

      const templatePayload: ShelfTemplateCreateInput[] = shelfTemplatesConfig.map(
        (tpl) => ({
          name: tpl.name.trim(),
          description: tpl.description.trim() || undefined,
          fixtureType: tpl.fixtureType,
          zone: tpl.zone.trim() || undefined,
          section: tpl.section.trim() || undefined,
          width: Number(tpl.width) || 48,
          height: Number(tpl.height) || 72,
          depth: Number(tpl.depth) || 18,
        }),
      );
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

  const shelfFixtureLabels = useMemo(
    () => fixtureTypes.map((f) => f.type.trim()).filter(Boolean),
    [fixtureTypes],
  );

  return {
    step,
    goToStep,
    createdStore,
    basicForm,
    setBasicForm,
    configForm,
    setConfigForm,
    activeConfigSection,
    setActiveConfigSection,
    configVisited,
    setConfigVisited,
    fixtureTypes,
    setFixtureTypes,
    shelfTemplatesConfig,
    setShelfTemplatesConfig,
    newTemplate,
    setNewTemplate,
    editingTemplateIndex,
    setEditingTemplateIndex,
    showAddTemplateForm,
    setShowAddTemplateForm,
    selectedUserIds,
    seedComplianceRuleSet,
    setSeedComplianceRuleSet,
    canContinueBasic,
    canContinueConfig,
    dimensionUnits,
    assignableUsers,
    orgUsersLoading,
    createStoreMutation,
    assignStoreUserMutation,
    toggleUserSelection,
    bulkUserSelectionChange,
    saveShelfTemplateFromModal,
    handleCreateStore,
    handleFinish,
    shelfFixtureLabels,
  };
}
