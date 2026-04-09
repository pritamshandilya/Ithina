import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { adminStoresKeys, useCreateAdminStore } from "@/hooks/use-admin-stores";
import { useAdminOrganizationUsers } from "@/hooks/use-admin-users";
import { toast } from "@/hooks/use-toast";
import type { Store } from "@/services/stores";
import { assignUserToStore } from "@/services/stores";

import type { OnboardingStep } from "./store-onboarding-stepper";

export function usePromoStoreOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createStoreMutation = useCreateAdminStore();
  const { data: orgUsers = [], isLoading: orgUsersLoading } = useAdminOrganizationUsers();

  const [step, setStep] = useState<OnboardingStep>(0);
  const [createdStore, setCreatedStore] = useState<Store | null>(null);
  const [basicForm, setBasicForm] = useState({
    name: "",
    address: "",
    region: "",
    currency: "USD",
  });
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(() => new Set());
  const [isFinishing, setIsFinishing] = useState(false);

  const assignableUsers = useMemo(
    () =>
      orgUsers.filter(
        (u) =>
          u.status === "active" &&
          (u.role === "maker" || u.role === "checker" || u.role === "admin"),
      ),
    [orgUsers],
  );

  const canContinueBasic =
    basicForm.name.trim().length > 0 &&
    basicForm.address.trim().length > 0 &&
    basicForm.region.trim().length > 0 &&
    basicForm.currency.trim().length > 0;

  const goToStep = (nextStep: OnboardingStep) => {
    if (createdStore && nextStep < 2) {
      setStep(2);
      return;
    }
    setStep(nextStep);
  };

  const handleCreateAndGoToTeam = async () => {
    if (!canContinueBasic) return;
    try {
      const store = await createStoreMutation.mutateAsync({
        name: basicForm.name.trim(),
        address: basicForm.address.trim(),
        region: basicForm.region.trim(),
        currency: basicForm.currency.trim().toUpperCase(),
        is_active: true,
      });
      setCreatedStore(store);
      toast({
        title: "Store created",
        description: "Assign team members to finish onboarding.",
      });
      setStep(2);
    } catch (e) {
      toast({
        title: "Failed to create store",
        description: (e as Error)?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

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
      userIds.forEach((id) => {
        if (selected) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const handleFinish = async () => {
    if (!createdStore) {
      navigate({ to: "/admin/stores" });
      return;
    }
    setIsFinishing(true);
    try {
      const ids = Array.from(selectedUserIds);
      await Promise.all(ids.map((userId) => assignUserToStore(createdStore.id, userId)));
      await queryClient.invalidateQueries({ queryKey: adminStoresKeys.list });
      toast({
        title: "Store onboarding complete",
        description:
          ids.length > 0 ? "Users have been assigned to this store." : "You can assign users later from store settings.",
      });
      navigate({ to: "/admin/stores" });
    } catch (e) {
      toast({
        title: "Failed to assign users",
        description: (e as Error)?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  return {
    step,
    goToStep,
    createdStore,
    basicForm,
    setBasicForm,
    canContinueBasic,
    assignableUsers,
    orgUsersLoading,
    createStoreMutation,
    selectedUserIds,
    toggleUserSelection,
    bulkUserSelectionChange,
    handleCreateAndGoToTeam,
    handleFinish,
    isFinishing,
  };
}
