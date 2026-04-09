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
  type CreateComplianceRuleSetInput,
} from "@/queries/maker/api/compliance-rule-sets";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { StoreSetting } from "@/types/checker";
import type { ShelfTemplateCreateInput } from "@/types/shelf-template";
import { replaceShelfTemplates } from "@/queries/checker/api/shelf-templates";
import { createStoreFixture } from "@/queries/checker/api/fixtures";
import type { CreateComplianceRuleSetModalProps } from "@/components/common/create-compliance-rule-set-modal";

const LOCAL_DEFAULT_RULE_SET_ID = "local-default-compliance-rule-set";
const DEFAULT_ONBOARDING_RULE_SET_NAME = "Default Rule";

function normalizeCodePart(input: string, fallback: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return cleaned || fallback;
}

function buildFixtureCode(
  fixture: { type: string; aisle: string; zone: string; section: string },
  index: number,
): string {
  const typePart = normalizeCodePart(fixture.type, "FIX").slice(0, 4);
  const aislePart = normalizeCodePart(fixture.aisle, "A1").slice(0, 4);
  const zonePart = normalizeCodePart(fixture.zone, "GEN").slice(0, 3);
  const sectionPart = normalizeCodePart(fixture.section, "GEN").slice(0, 3);
  const seq = String(index + 1).padStart(2, "0");
  // Backend-like format.
  return `F-${typePart}-${aislePart}-${zonePart}-${sectionPart}-${seq}`;
}

type OnboardingRuleSet = ComplianceRuleSetSummary & {
  payload: CreateComplianceRuleSetInput;
  isLocal: true;
};

function createDefaultOnboardingRuleSet(): OnboardingRuleSet {
  const name = DEFAULT_ONBOARDING_RULE_SET_NAME;
  return {
    id: LOCAL_DEFAULT_RULE_SET_ID,
    name,
    rulesCount: 1,
    enabledCount: 1,
    isDefault: true,
    isLocal: true,
    payload: {
      name,
      status: "ACTIVE",
      reference_document_id: null,
      rules: [
        {
          name: "Default visual compliance",
          description: "Baseline visual compliance check for onboarding.",
          category: "VISUAL",
          threshold: 95,
          is_active: true,
        },
      ],
    },
  };
}

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

  const [localComplianceRuleSets, setLocalComplianceRuleSets] = useState<OnboardingRuleSet[]>(() => [
    createDefaultOnboardingRuleSet(),
  ]);
  const [defaultComplianceRuleSetId, setDefaultComplianceRuleSetId] = useState(
    LOCAL_DEFAULT_RULE_SET_ID,
  );
  const [complianceRuleSetModalOpen, setComplianceRuleSetModalOpen] = useState(false);
  const [complianceRuleSetModalMode, setComplianceRuleSetModalMode] = useState<
    "create" | "edit"
  >("create");
  const [editingComplianceRuleSetId, setEditingComplianceRuleSetId] = useState<string | null>(
    null,
  );
  const [complianceRuleSetInitialValues, setComplianceRuleSetInitialValues] = useState<
    CreateComplianceRuleSetModalProps["initialValues"]
  >(undefined);
  const [confirmDeleteRuleSetId, setConfirmDeleteRuleSetId] = useState<string | null>(null);

  const canContinueBasic =
    basicForm.name.trim().length > 0 &&
    basicForm.address.trim().length > 0 &&
    basicForm.region.trim().length > 0 &&
    basicForm.currency.trim().length > 0;

  const canContinueConfig =
    configForm.default_dimensions.trim().length > 0 &&
    fixtureTypes.some((f) => f.type.trim().length > 0) &&
    shelfTemplatesConfig.some((t) => t.name.trim().length > 0);

  const { data: dimensionUnits = [] } = useDimensionUnits();

  const openCreateComplianceRuleSetModal = () => {
    setComplianceRuleSetModalMode("create");
    setEditingComplianceRuleSetId(null);
    setComplianceRuleSetInitialValues(undefined);
    setComplianceRuleSetModalOpen(true);
  };

  const openEditDefaultComplianceRuleSetModal = () => {
    const defaultRuleSet = localComplianceRuleSets.find(
      (ruleSet) => ruleSet.id === LOCAL_DEFAULT_RULE_SET_ID,
    );
    if (!defaultRuleSet) return;
    setComplianceRuleSetModalMode("edit");
    setEditingComplianceRuleSetId(defaultRuleSet.id);
    setComplianceRuleSetInitialValues({
      name: defaultRuleSet.payload.name,
      status: defaultRuleSet.payload.status,
      rules: defaultRuleSet.payload.rules,
    });
    setComplianceRuleSetModalOpen(true);
  };

  const openEditComplianceRuleSetModal = (ruleSetId: string) => {
    const ruleSet = localComplianceRuleSets.find((item) => item.id === ruleSetId);
    if (!ruleSet) return;
    setComplianceRuleSetModalMode("edit");
    setEditingComplianceRuleSetId(ruleSetId);
    setComplianceRuleSetInitialValues({
      name: ruleSet.payload.name,
      status: ruleSet.payload.status,
      rules: ruleSet.payload.rules,
    });
    setComplianceRuleSetModalOpen(true);
  };

  const closeComplianceRuleSetModal = () => {
    setComplianceRuleSetModalOpen(false);
    setComplianceRuleSetInitialValues(undefined);
    setEditingComplianceRuleSetId(null);
    setComplianceRuleSetModalMode("create");
  };

  const submitComplianceRuleSet = async (
    payload: CreateComplianceRuleSetInput,
  ) => {
    if (complianceRuleSetModalMode === "create") {
      const localId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? `local-${crypto.randomUUID()}`
          : `local-${Date.now()}`;
      const isDefault = false;
      setLocalComplianceRuleSets((prev) => [
        ...prev,
        {
          id: localId,
          name: payload.name,
          rulesCount: payload.rules.length,
          enabledCount: payload.rules.filter((rule) => rule.is_active).length,
          isDefault,
          isLocal: true,
          payload,
        },
      ]);
      toast({ title: "Rule set staged for onboarding" });
      closeComplianceRuleSetModal();
      return;
    }

    if (!editingComplianceRuleSetId) {
      toast({
        title: "Update failed",
        description: "Missing rule set id for edit.",
        variant: "destructive",
      });
      return;
    }

    setLocalComplianceRuleSets((prev) =>
      prev.map((item) => {
        if (item.id !== editingComplianceRuleSetId) return item;
        return {
          ...item,
          name: payload.name,
          rulesCount: payload.rules.length,
          enabledCount: payload.rules.filter((rule) => rule.is_active).length,
          payload,
        };
      }),
    );

    toast({ title: "Rule set updated" });
    closeComplianceRuleSetModal();
  };

  const handleDeleteComplianceRuleSet = async (ruleSetId: string) => {
    if (ruleSetId === LOCAL_DEFAULT_RULE_SET_ID) {
      toast({
        title: "Default rule set is required",
        description: "The default onboarding rule set can be edited but cannot be deleted.",
        variant: "destructive",
      });
      setConfirmDeleteRuleSetId(null);
      return;
    }

    setLocalComplianceRuleSets((prev) => prev.filter((ruleSet) => ruleSet.id !== ruleSetId));
    toast({
      title: "Rule set removed",
      description: "The staged rule set was removed from onboarding.",
    });
    setConfirmDeleteRuleSetId(null);
  };

  const defaultComplianceRuleSet = useMemo(() => {
    const currentDefault =
      localComplianceRuleSets.find((ruleSet) => ruleSet.id === defaultComplianceRuleSetId) ??
      localComplianceRuleSets.find((ruleSet) => ruleSet.id === LOCAL_DEFAULT_RULE_SET_ID);

    if (currentDefault) {
      return currentDefault.payload;
    }

    return createDefaultOnboardingRuleSet().payload;
  }, [defaultComplianceRuleSetId, localComplianceRuleSets]);

  const updateDefaultComplianceRuleSet = (
    updater:
      | CreateComplianceRuleSetInput
      | ((current: CreateComplianceRuleSetInput) => CreateComplianceRuleSetInput),
  ) => {
    setLocalComplianceRuleSets((prev) =>
      prev.map((ruleSet) => {
        if (ruleSet.id !== LOCAL_DEFAULT_RULE_SET_ID) return ruleSet;
        const nextPayload =
          typeof updater === "function"
            ? updater(ruleSet.payload)
            : updater;
        const normalizedPayload: CreateComplianceRuleSetInput = {
          ...nextPayload,
          name: DEFAULT_ONBOARDING_RULE_SET_NAME,
          status: "ACTIVE",
          rules: (nextPayload.rules.length ? nextPayload.rules : ruleSet.payload.rules).map(
            (rule, idx) => (idx === 0 ? { ...rule, is_active: true } : rule),
          ),
        };

        return {
          ...ruleSet,
          name: normalizedPayload.name,
          rulesCount: normalizedPayload.rules.length,
          enabledCount: normalizedPayload.rules.filter((rule) => rule.is_active).length,
          payload: normalizedPayload,
        };
      }),
    );
    setDefaultComplianceRuleSetId(LOCAL_DEFAULT_RULE_SET_ID);
  };

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
          code: fixture.code?.trim() || "",
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
        const seenCodes = new Set<string>();
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
          dedupedFixtures.map((fixture, idx) => {
            let generatedCode =
              fixture.code ||
              buildFixtureCode(
                {
                  type: fixture.type,
                  aisle: fixture.aisle,
                  zone: fixture.zone,
                  section: fixture.section,
                },
                idx,
              );
            // Ensure uniqueness in this batch.
            while (seenCodes.has(generatedCode)) {
              generatedCode = `${generatedCode}-${String(seenCodes.size + 1).padStart(2, "0")}`;
            }
            seenCodes.add(generatedCode);

            return (
            createStoreFixture(storeId, {
              type: fixture.type,
              code: generatedCode,
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
            })
            );
          }),
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

      let persistedDefaultComplianceRuleSetId: string | null = null;
      if (localComplianceRuleSets.length > 0) {
        try {
          const persistedRuleSets = await Promise.all(
            localComplianceRuleSets.map((ruleSet) =>
              createComplianceRuleSetForStore(storeId, ruleSet.payload),
            ),
          );
          const defaultLocalIndex = localComplianceRuleSets.findIndex(
            (ruleSet) => ruleSet.id === defaultComplianceRuleSetId,
          );
          persistedDefaultComplianceRuleSetId =
            defaultLocalIndex >= 0 ? persistedRuleSets[defaultLocalIndex]?.id ?? null : null;
        } catch {
          postCreateWarnings.push(
            "Some compliance rule sets could not be created during onboarding; you can add them later from store settings.",
          );
        }
      }

      let finalizedStore: StoreSetting = store as StoreSetting;
      if (persistedDefaultComplianceRuleSetId) {
        try {
          const updatedStore = await updateStoreComplianceSettings(storeId, {
            default_compliance_rule_set_id: persistedDefaultComplianceRuleSetId,
          });
          finalizedStore = updatedStore as StoreSetting;
        } catch {
          postCreateWarnings.push(
            "Default compliance rule set could not be assigned; configure it later under store settings.",
          );
        }
      }

      setLocalComplianceRuleSets([createDefaultOnboardingRuleSet()]);
      setCreatedStore(finalizedStore);
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
    complianceRuleSets: localComplianceRuleSets,
    defaultComplianceRuleSet,
    updateDefaultComplianceRuleSet,
    defaultComplianceRuleSetId,
    setDefaultComplianceRuleSetId,
    complianceRuleSetModalOpen,
    complianceRuleSetModalMode,
    complianceRuleSetInitialValues,
    confirmDeleteRuleSetId,
    setConfirmDeleteRuleSetId,
    isSubmittingComplianceRuleSet: false,
    isDeletingComplianceRuleSet: false,
    openCreateComplianceRuleSetModal,
    openEditDefaultComplianceRuleSetModal,
    openEditComplianceRuleSetModal,
    closeComplianceRuleSetModal,
    submitComplianceRuleSet,
    handleDeleteComplianceRuleSet,
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
