import { useCallback } from "react";

import type { ToastInput } from "@/hooks/use-toast";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { Store } from "@/providers/store/types";

type MutationLike<TInput, TResult> = {
  mutateAsync: (input: TInput) => Promise<TResult>;
};

type FormDataShape = {
  name: string;
  address: string;
  region: string;
  status: "Active" | "Inactive";
  currency: string;
  default_dimensions: StoreDimensionUnit;
};

interface UseStoreConfigurationActionsParams {
  canEdit: boolean;
  canManageComplianceRuleSets: boolean;
  isAdmin: boolean;
  selectedStore: Store;
  formData: FormDataShape;
  defaultComplianceRuleSetId: string;
  updateStoreMutation: MutationLike<
    { storeId: string; data: FormDataShape },
    Store
  >;
  updateStoreComplianceSettingsMutation: MutationLike<
    {
      storeId: string;
      data: { default_compliance_rule_set_id: string | null };
    },
    unknown
  >;
  setSelectedStore: (store: Store | null) => void;
  toast: (props: ToastInput) => void;
}

export function useStoreConfigurationActions({
  canEdit,
  canManageComplianceRuleSets,
  isAdmin,
  selectedStore,
  formData,
  defaultComplianceRuleSetId,
  updateStoreMutation,
  updateStoreComplianceSettingsMutation,
  setSelectedStore,
  toast,
}: UseStoreConfigurationActionsParams) {
  const handleSave = useCallback(async () => {
    if (!canEdit) return;
    try {
      const updatedStore = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: formData,
      });
      await updateStoreComplianceSettingsMutation.mutateAsync({
        storeId: selectedStore.id,
        data: {
          default_compliance_rule_set_id: defaultComplianceRuleSetId || null,
        },
      });
      setSelectedStore(updatedStore);
      toast({
        title: "Settings Saved",
        description: "The store configuration has been updated successfully.",
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "An error occurred while saving the store settings.",
        variant: "destructive",
      });
    }
  }, [
    canEdit,
    defaultComplianceRuleSetId,
    formData,
    selectedStore.id,
    setSelectedStore,
    toast,
    updateStoreComplianceSettingsMutation,
    updateStoreMutation,
  ]);

  const handleDeactivateStore = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const updated = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: { ...formData, status: "Inactive" },
      });
      setSelectedStore(updated);
      toast({
        title: "Store deactivated",
        description: "This store is now inactive.",
        variant: "warning",
      });
    } catch (error) {
      toast({
        title: "Failed to deactivate store",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [formData, isAdmin, selectedStore.id, setSelectedStore, toast, updateStoreMutation]);

  const handleActivateStore = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const updated = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: { ...formData, status: "Active" },
      });
      setSelectedStore(updated);
      toast({
        title: "Store activated",
        description: "This store is now active.",
      });
    } catch (error) {
      toast({
        title: "Failed to activate store",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [formData, isAdmin, selectedStore.id, setSelectedStore, toast, updateStoreMutation]);

  const handleSaveDefaults = useCallback(async () => {
    if (!canEdit) return;
    try {
      const updatedStore = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: formData,
      });
      await updateStoreComplianceSettingsMutation.mutateAsync({
        storeId: selectedStore.id,
        data: {
          default_compliance_rule_set_id: defaultComplianceRuleSetId || null,
        },
      });
      const normalizedStore: Store = {
        ...updatedStore,
        default_compliance_rule_set_id: defaultComplianceRuleSetId || null,
      };
      setSelectedStore(normalizedStore);
      toast({
        title: "Defaults Saved",
        description: "Store defaults have been updated successfully.",
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "An error occurred while saving store defaults.",
        variant: "destructive",
      });
    }
  }, [
    canEdit,
    defaultComplianceRuleSetId,
    formData,
    selectedStore.id,
    setSelectedStore,
    toast,
    updateStoreComplianceSettingsMutation,
    updateStoreMutation,
  ]);

  const handleSaveComplianceDefaultOnly = useCallback(async () => {
    if (!canManageComplianceRuleSets || canEdit) return;
    try {
      await updateStoreComplianceSettingsMutation.mutateAsync({
        storeId: selectedStore.id,
        data: {
          default_compliance_rule_set_id: defaultComplianceRuleSetId || null,
        },
      });
      setSelectedStore({
        ...selectedStore,
        default_compliance_rule_set_id: defaultComplianceRuleSetId || null,
      });
      toast({
        title: "Compliance saved",
        description: "Default rule set for this store has been updated.",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Could not save the default compliance rule set.",
        variant: "destructive",
      });
    }
  }, [
    canEdit,
    canManageComplianceRuleSets,
    defaultComplianceRuleSetId,
    selectedStore,
    setSelectedStore,
    toast,
    updateStoreComplianceSettingsMutation,
  ]);

  return {
    handleSave,
    handleDeactivateStore,
    handleActivateStore,
    handleSaveDefaults,
    handleSaveComplianceDefaultOnly,
  };
}
