import MainLayout from "@/components/layouts/main";
import type { ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import { StoreFixtureModal, type StoreFixtureModalValues } from "@/components/common/store-fixture-modal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { AuthSessionUser } from "@/lib/auth/session";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import {
  useCreateShelfTemplate,
  useDeleteShelfTemplate,
  useRemoveStoreUser,
  useShelfTemplates,
  useStoreFixtureTypes,
  useStoreUsers,
  useUpdateShelfTemplate,
  useUpdateStore,
  useUpdateStoreComplianceSettings,
} from "@/queries/checker";
import { useComplianceRuleSets } from "@/queries/maker";
import {
  Settings,
  Store as StoreIcon,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { StoreUserAssignmentModal } from "./StoreUserAssignmentModal";
import { StoreDefaultsTabContent } from "./store-defaults-tab-content";
import { StoreProfileTab } from "./store-profile-tab";
import { AuthSessionService } from "@/lib/auth/session";
import { CreateComplianceRuleSetModal } from "@/components/common/create-compliance-rule-set-modal";
import { ApiError } from "@/queries/shared";
import { useCreateComplianceRuleSet } from "@/queries/maker";
import type { CreateComplianceRuleSetInput } from "@/queries/maker/api/compliance-rule-sets";
import type { StoreSetting } from "@/types/checker";
import type { ShelfTemplateCreateInput, ShelfTemplateFixtureType } from "@/types/shelf-template";
import {
  createStoreFixture,
  deleteStoreFixture,
  fetchStoreFixtures,
  updateStoreFixture,
  type StoreFixtureApiModel,
} from "@/queries/checker/api/fixtures";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";

type Tab = "profile" | "defaults" | "team";
type DefaultsTab = "fixtures" | "templates" | "rules" | "units";
type StoreTemplateForm = {
  name: string;
  description: string;
  fixtureType: ShelfTemplateFixtureType;
  zone: string;
  section: string;
  width: string;
  height: string;
  depth: string;
};

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Store Profile", icon: StoreIcon },
  { id: "defaults", label: "Store Defaults", icon: Settings },
  { id: "team", label: "Staff", icon: Users },
];

interface StoreConfigurationPageProps {
  canEdit?: boolean;
}

export function StoreConfigurationPage({
  canEdit = false,
}: StoreConfigurationPageProps) {
  const queryClient = useQueryClient();
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
  const createComplianceRuleSetMutation = useCreateComplianceRuleSet();
  const { data: storeUsers = [], isLoading: storeUsersLoading } = useStoreUsers(
    selectedStore?.id ?? "",
  );
  const removeStoreUserMutation = useRemoveStoreUser();
  const { data: fixtureTypes = [] } = useStoreFixtureTypes();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    region: "",
    status: "Active" as "Active" | "Inactive",
    currency: "USD",
    default_dimensions: "mm" as StoreDimensionUnit,
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newFixture, setNewFixture] = useState("");
  const [defaultComplianceRuleSetId, setDefaultComplianceRuleSetId] = useState("");
  const [newTemplate, setNewTemplate] = useState<StoreTemplateForm>({
    name: "",
    description: "",
    fixtureType: "gondola",
    zone: "",
    section: "",
    width: "",
    height: "",
    depth: "",
  });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [activeDefaultsTab, setActiveDefaultsTab] = useState<DefaultsTab>("fixtures");
  const { data: complianceRuleSets = [] } = useComplianceRuleSets();
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } = useShelfTemplates();
  const createTemplateMutation = useCreateShelfTemplate();
  const updateTemplateMutation = useUpdateShelfTemplate();
  const deleteTemplateMutation = useDeleteShelfTemplate();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [fixtureModalOpen, setFixtureModalOpen] = useState(false);
  const [isCreatingFixture, setIsCreatingFixture] = useState(false);
  const [editingFixture, setEditingFixture] = useState<StoreFixtureApiModel | null>(null);
  const [createRuleSetModalOpen, setCreateRuleSetModalOpen] = useState(false);
  const { data: fixtures = [] } = useQuery({
    queryKey: ["maker", "fixtures", "list", selectedStore?.id ?? "no-store"],
    queryFn: fetchStoreFixtures,
    enabled: !!selectedStore?.id,
    staleTime: 60 * 1000,
  });

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
      setDefaultComplianceRuleSetId(
        selectedStore.default_compliance_rule_set_id ?? "",
      );
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleDeactivateStore = async () => {
    if (!selectedStore || !isAdmin) return;
    try {
      const updated = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: {
          name: formData.name,
          address: formData.address,
          region: formData.region,
          status: "Inactive",
          currency: formData.currency,
          default_dimensions: formData.default_dimensions,
        },
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
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleActivateStore = async () => {
    if (!selectedStore || !isAdmin) return;
    try {
      const updated = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: {
          name: formData.name,
          address: formData.address,
          region: formData.region,
          status: "Active",
          currency: formData.currency,
          default_dimensions: formData.default_dimensions,
        },
      });
      setSelectedStore(updated);
      toast({
        title: "Store activated",
        description: "This store is now active.",
      });
    } catch (error) {
      toast({
        title: "Failed to activate store",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDefaults = async () => {
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
      setSelectedStore({
        ...updatedStore,
        default_compliance_rule_set_id: defaultComplianceRuleSetId || null,
      } as StoreSetting);
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
  };

  const handleSaveComplianceDefaultOnly = async () => {
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
      } as StoreSetting);
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
  };

  const handleCreateComplianceRuleSetSubmit = async (
    payload: CreateComplianceRuleSetInput,
    options: { setAsDefault: boolean },
  ) => {
    if (!selectedStore) return;
    try {
      const created = await createComplianceRuleSetMutation.mutateAsync(payload);
      if (options.setAsDefault) {
        setDefaultComplianceRuleSetId(created.id);
        await updateStoreComplianceSettingsMutation.mutateAsync({
          storeId: selectedStore.id,
          data: { default_compliance_rule_set_id: created.id },
        });
        setSelectedStore({
          ...selectedStore,
          default_compliance_rule_set_id: created.id,
        } as StoreSetting);
      }
      toast({
        title: "Rule set created",
        description: options.setAsDefault
          ? "The new rule set is now the store default."
          : "You can set it as the default from the list when ready.",
      });
      setCreateRuleSetModalOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not create the compliance rule set.";
      toast({
        title: "Create failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSaveShelfTemplate = async (values: ShelfTemplateModalValues) => {
    const payload: ShelfTemplateCreateInput = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      fixtureType: values.fixtureType,
      zone: values.zone.trim() || undefined,
      section: values.section.trim() || undefined,
      width: Number(values.width) || 48,
      height: Number(values.height) || 72,
      depth: Number(values.depth) || 18,
    };

    if (!payload.name) {
      toast({
        title: "Missing name",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplateId) {
      await updateTemplateMutation.mutateAsync({
        id: editingTemplateId,
        ...payload,
      });
    } else {
      await createTemplateMutation.mutateAsync(payload);
    }

    setEditingTemplateId(null);
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
    setTemplateModalOpen(false);
  };

  const handleCreateFixture = async (values: StoreFixtureModalValues) => {
    if (!selectedStore || !canEdit) return;
    const type = values.type.trim();
    if (!type) {
      toast({
        title: "Missing fixture type",
        description: "Fixture type is required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFixture(true);
    try {
      if (editingFixture) {
        await updateStoreFixture(selectedStore.id, editingFixture.id, {
          type,
          dimensions: {
            width: Number(values.width) || editingFixture.width,
            height: Number(values.height) || editingFixture.height,
            depth: Number(values.depth) || editingFixture.depth,
          },
          dimension_unit: values.dimensionUnit || formData.default_dimensions,
          physical_location: {
            section: values.section.trim() || editingFixture.section,
            aisle: values.aisle.trim() || editingFixture.aisle,
            zone: values.zone.trim() || editingFixture.zone,
          },
        });
      } else {
        await createStoreFixture(selectedStore.id, {
          type,
          dimensions: {
            width: Number(values.width) || 120,
            height: Number(values.height) || 200,
            depth: Number(values.depth) || 45,
          },
          dimension_unit: values.dimensionUnit || formData.default_dimensions,
          physical_location: {
            section: values.section.trim() || "General",
            aisle: values.aisle.trim() || "A1",
            zone: values.zone.trim() || "General",
          },
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStore.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStore.id],
        }),
      ]);
      setFixtureModalOpen(false);
      setEditingFixture(null);
      toast({
        title: editingFixture ? "Fixture updated" : "Fixture added",
        description: editingFixture
          ? "Fixture has been updated for this store."
          : "Fixture has been added to this store.",
      });
    } catch (error) {
      toast({
        title: editingFixture ? "Failed to update fixture" : "Failed to add fixture",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFixture(false);
    }
  };

  const handleDeleteFixture = async (fixture: StoreFixtureApiModel) => {
    if (!selectedStore || !canEdit) return;
    try {
      await deleteStoreFixture(selectedStore.id, fixture.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStore.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStore.id],
        }),
      ]);
      toast({
        title: "Fixture deleted",
        description: "Fixture has been removed from this store.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete fixture",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const userColumns: DataTableColumn<AuthSessionUser>[] = useMemo(
    () => [
      {
        title: "User",
        field: "firstName",
        minWidth: 220,
        headerHozAlign: "left",
        hozAlign: "left",
        formatter: (cell: DataTableCell<AuthSessionUser>) => {
          const member = cell.getData() as AuthSessionUser;
          const initials = `${member.firstName?.[0] ?? "U"}${member.lastName?.[0] ?? "U"}`;
          return `
            <div class="flex items-center gap-3">
              <div class="size-8 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                ${initials}
              </div>
              <div class="text-left">
                <p class="text-sm font-semibold text-foreground">${member.firstName} ${member.lastName}</p>
                <p class="text-xs text-muted-foreground truncate">${member.email}</p>
              </div>
            </div>
          `;
        },
      },
      {
        title: "Role",
        field: "role",
        width: 140,
        formatter: (cell: DataTableCell<AuthSessionUser>) => {
          const role = cell.getValue() as AuthSessionUser["role"];
          const label = role.charAt(0).toUpperCase() + role.slice(1);
          return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border bg-muted/40 text-muted-foreground">${label}</span>`;
        },
      },
      ...(canEdit
        ? [
            {
              title: "Action",
              field: "actions",
              width: 90,
              headerSort: false,
              hozAlign: "right" as const,
              formatter: (cell: DataTableCell<AuthSessionUser>) => {
                const user = cell.getData() as AuthSessionUser;
                if (user.role === "admin") return "";
                return `
                  <button class="remove-btn inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10">
                    Remove
                  </button>
                `;
              },
              cellClick: (_e: unknown, cell: DataTableCell<AuthSessionUser>) => {
                const user = cell.getData() as AuthSessionUser;
                if (!selectedStore || user.role === "admin") return;
                void removeStoreUserMutation.mutateAsync({
                  storeId: selectedStore.id,
                  userId: user.id,
                });
              },
            },
          ]
        : []),
    ],
    [removeStoreUserMutation, selectedStore, canEdit],
  );

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Store Settings"
          icon={Settings}
        />
      }
    >
      <div className="space-y-6 mx-auto pb-10 pt-4 px-2 sm:px-4 max-w-6xl">
        {/* Tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border rounded-xl w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-accent text-accent-foreground shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <StoreProfileTab
            canEdit={canEdit}
            isAdmin={!!isAdmin}
            formData={formData}
            setFormData={setFormData}
            isSaving={updateStoreMutation.isPending}
            onSave={handleSave}
            onDeactivate={handleDeactivateStore}
            onActivate={handleActivateStore}
          />
        )}

        {activeTab === "defaults" && (
          <StoreDefaultsTabContent
            canEdit={canEdit}
            canEditFixtureTypes={false}
            onOpenAddFixtureModal={() => setFixtureModalOpen(true)}
            isCreatingFixture={isCreatingFixture}
            canManageComplianceRuleSets={canManageComplianceRuleSets}
            onOpenCreateRuleSetModal={() => setCreateRuleSetModalOpen(true)}
            onSaveComplianceDefault={handleSaveComplianceDefaultOnly}
            isSavingComplianceDefault={updateStoreComplianceSettingsMutation.isPending}
            activeDefaultsTab={activeDefaultsTab}
            setActiveDefaultsTab={setActiveDefaultsTab}
            fixtureTypes={fixtureTypes}
            fixtures={fixtures}
            setFixtureTypes={() => undefined}
            newFixture={newFixture}
            setNewFixture={setNewFixture}
            onEditFixture={(fixture) => {
              setEditingFixture(fixture);
              setFixtureModalOpen(true);
            }}
            onDeleteFixture={handleDeleteFixture}
            complianceRuleSets={complianceRuleSets}
            defaultComplianceRuleSetId={defaultComplianceRuleSetId}
            setDefaultComplianceRuleSetId={setDefaultComplianceRuleSetId}
            shelfTemplates={shelfTemplates}
            shelfTemplatesLoading={shelfTemplatesLoading}
            deleteTemplate={(id) => deleteTemplateMutation.mutateAsync(id)}
            openNewTemplate={() => {
              setEditingTemplateId(null);
              setTemplateModalOpen(true);
            }}
            openEditTemplate={(tpl) => {
              setEditingTemplateId(tpl.id);
              setNewTemplate({
                name: tpl.name,
                description: tpl.description ?? "",
                fixtureType: tpl.fixtureType,
                zone: tpl.zone ?? "",
                section: tpl.section ?? "",
                width: String(tpl.width),
                height: String(tpl.height),
                depth: String(tpl.depth),
              });
              setTemplateModalOpen(true);
            }}
            templateModalOpen={templateModalOpen}
            closeTemplateModal={() => {
              setTemplateModalOpen(false);
              setEditingTemplateId(null);
            }}
            saveTemplate={handleSaveShelfTemplate}
            isTemplateSaving={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            editingTemplateId={editingTemplateId}
            templateInitialValues={newTemplate}
            formData={formData}
            setFormData={setFormData}
            isSavingDefaults={
              updateStoreMutation.isPending ||
              updateStoreComplianceSettingsMutation.isPending
            }
            onSaveDefaults={handleSaveDefaults}
          />
        )}

        {/* Team tab */}
        {activeTab === "team" && (
          <Card noBorder className="bg-card shadow-xl glassmorphism">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-accent" />
                    <CardTitle>Staff Members</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Makers and checkers assigned to this store.
                  </p>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsStaffModalOpen(true)}
                  >
                    Manage store staff
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {storeUsersLoading ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : (
                <DataTable<AuthSessionUser>
                  columns={userColumns}
                  data={storeUsers}
                  pageSize={5}
                  pageSizeSelector={[5, 10, 20]}
                  emptyMessage="No users are currently assigned to this store."
                />
              )}
            </CardContent>
          </Card>
        )}

        {canEdit && (
          <StoreUserAssignmentModal
            isOpen={isStaffModalOpen}
            onClose={() => setIsStaffModalOpen(false)}
            store={selectedStore}
          />
        )}

        <CreateComplianceRuleSetModal
          isOpen={createRuleSetModalOpen}
          onClose={() => setCreateRuleSetModalOpen(false)}
          isSubmitting={createComplianceRuleSetMutation.isPending}
          onSubmit={handleCreateComplianceRuleSetSubmit}
        />
        <StoreFixtureModal
          isOpen={fixtureModalOpen}
          onClose={() => {
            setFixtureModalOpen(false);
            setEditingFixture(null);
          }}
          onSave={handleCreateFixture}
          isSaving={isCreatingFixture}
          mode={editingFixture ? "edit" : "create"}
          initialValues={
            editingFixture
              ? {
                  type: editingFixture.type,
                  width: String(editingFixture.width),
                  height: String(editingFixture.height),
                  depth: String(editingFixture.depth),
                  dimensionUnit: editingFixture.dimension_unit as StoreDimensionUnit,
                  section: editingFixture.section,
                  aisle: editingFixture.aisle,
                  zone: editingFixture.zone,
                }
              : { dimensionUnit: formData.default_dimensions }
          }
        />
      </div>
    </MainLayout>
  );
}
