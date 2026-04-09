import { useEffect, useState, useSyncExternalStore } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AuthSessionService } from "@/lib/auth/session";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import {
  useRemoveStoreUser,
  useStoreUsers,
  useUpdateStore,
  useUpdateStoreComplianceSettings,
} from "@/queries/checker";

import { StoreUserAssignmentModal } from "./StoreUserAssignmentModal";
import type { StoreConfigurationTab } from "./store-configuration.types";
import { StoreProfileTab } from "./store-profile-tab";
import { StoreTabNavigation } from "./store-tab-navigation";
import { StoreTeamTab } from "./store-team-tab";
import { useStoreConfigurationActions } from "./use-store-configuration-actions";

interface StoreConfigurationPageProps {
  canEdit?: boolean;
}

export function StoreConfigurationPage({
  canEdit = false,
}: StoreConfigurationPageProps) {
  const { toast } = useToast();
  const { selectedStore, setSelectedStore } = useGlobalStore();
  const sessionUser = useSyncExternalStore(
    (onStoreChange) => AuthSessionService.subscribe(onStoreChange),
    () => AuthSessionService.getSnapshot().user,
    () => null,
  );
  const canManageComplianceRuleSets =
    sessionUser?.role === "admin" || sessionUser?.role === "maker";
  const isAdmin = sessionUser?.role === "admin";
  const updateStoreMutation = useUpdateStore();
  const updateStoreComplianceSettingsMutation = useUpdateStoreComplianceSettings();
  const { data: storeUsers = [], isLoading: storeUsersLoading } = useStoreUsers(
    selectedStore?.id ?? "",
  );
  const removeStoreUserMutation = useRemoveStoreUser();

  const [activeTab, setActiveTab] = useState<StoreConfigurationTab>("profile");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    region: "",
    status: "Active" as "Active" | "Inactive",
    currency: "USD",
    default_dimensions: "mm" as StoreDimensionUnit,
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      setFormData({
        name: selectedStore.name || "",
        address: selectedStore.address || "",
        region: selectedStore.region || "",
        status: selectedStore.status || "Active",
        currency: selectedStore.currency || "USD",
        default_dimensions:
          (selectedStore.default_dimensions as StoreDimensionUnit | undefined) || "mm",
      });
      setIsProfileEditing(false);
    }
  }, [selectedStore]);

  if (!selectedStore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const {
    handleSave,
    handleActivateStore,
    handleDeactivateStore,
  } = useStoreConfigurationActions({
    canEdit,
    canManageComplianceRuleSets,
    isAdmin: !!isAdmin,
    selectedStore,
    formData,
    defaultComplianceRuleSetId: selectedStore.default_compliance_rule_set_id ?? "",
    updateStoreMutation,
    updateStoreComplianceSettingsMutation,
    setSelectedStore,
    toast,
  });

  return (
    <MainLayout
      pageHeader={
        <PageHeader title="Store Settings" />
      }
    >
      <div className="space-y-6 mx-auto pb-10 pt-4 px-2 sm:px-4 max-w-6xl">
        <StoreTabNavigation activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "profile" && (
          <StoreProfileTab
            canEdit={canEdit}
            isEditing={isProfileEditing}
            isAdmin={!!isAdmin}
            formData={formData}
            setFormData={setFormData}
            isSaving={updateStoreMutation.isPending}
            onSave={(e) => {
              e.preventDefault();
              void handleSave();
              setIsProfileEditing(false);
            }}
            onEditStart={() => setIsProfileEditing(true)}
            onCancelEdit={() => {
              setFormData({
                name: selectedStore.name || "",
                address: selectedStore.address || "",
                region: selectedStore.region || "",
                status: selectedStore.status || "Active",
                currency: selectedStore.currency || "USD",
                default_dimensions:
                  (selectedStore.default_dimensions as StoreDimensionUnit | undefined) || "mm",
              });
              setIsProfileEditing(false);
            }}
            onDeactivate={handleDeactivateStore}
            onActivate={handleActivateStore}
          />
        )}

        {activeTab === "team" && (
          <StoreTeamTab
            canEdit={canEdit}
            storeId={selectedStore.id}
            storeUsers={storeUsers}
            storeUsersLoading={storeUsersLoading}
            onManageStaff={() => setIsStaffModalOpen(true)}
            onRemoveUser={(userId) => {
              void removeStoreUserMutation.mutateAsync({
                storeId: selectedStore.id,
                userId,
              });
            }}
          />
        )}

        {canEdit && (
          <StoreUserAssignmentModal
            isOpen={isStaffModalOpen}
            onClose={() => setIsStaffModalOpen(false)}
            store={selectedStore}
          />
        )}

      </div>
    </MainLayout>
  );
}
