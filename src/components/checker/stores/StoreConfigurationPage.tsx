import MainLayout from "@/components/layouts/main";
import type { ShelfTemplateModalValues } from "@/components/common/shelf-template-modal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
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
  useStoreUsers,
  useUpdateShelfTemplate,
  useUpdateStore,
} from "@/queries/checker";
import {
  Settings,
  Store as StoreIcon,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StoreUserAssignmentModal } from "./StoreUserAssignmentModal";
import { StoreDefaultsTabContent } from "./store-defaults-tab-content";
import { StoreProfileTab } from "./store-profile-tab";
import type { ShelfTemplateCreateInput, ShelfTemplateFixtureType } from "@/types/shelf-template";

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

const DEFAULT_FIXTURE_TYPES = [
  "Gondola (standard)",
  "Endcap",
  "Cooler/Chiller",
  "Checkout Lane",
  "Wall Unit",
];

const DEFAULT_COMPLIANCE_RULES = [
  "Min facing: 1",
  'Max gap: 2"',
  "FIFO required for perishables",
  "Label alignment: required",
];

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
  const { toast } = useToast();
  const { selectedStore, setSelectedStore } = useGlobalStore();
  const updateStoreMutation = useUpdateStore();
  const { data: storeUsers = [], isLoading: storeUsersLoading } = useStoreUsers(
    selectedStore?.id ?? "",
  );
  const removeStoreUserMutation = useRemoveStoreUser();

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
  const [fixtureTypes, setFixtureTypes] = useState<string[]>(DEFAULT_FIXTURE_TYPES);
  const [complianceRules, setComplianceRules] = useState<string[]>(
    DEFAULT_COMPLIANCE_RULES,
  );
  const [newFixture, setNewFixture] = useState("");
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
  const [newRule, setNewRule] = useState("");
  const [activeDefaultsTab, setActiveDefaultsTab] = useState<DefaultsTab>("fixtures");
  const { data: shelfTemplates = [], isLoading: shelfTemplatesLoading } = useShelfTemplates();
  const createTemplateMutation = useCreateShelfTemplate();
  const updateTemplateMutation = useUpdateShelfTemplate();
  const deleteTemplateMutation = useDeleteShelfTemplate();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      setFormData({
        name: selectedStore.name || "",
        address: (selectedStore as any).address || "",
        region: (selectedStore as any).region || "",
        status: ((selectedStore as any).status as "Active" | "Inactive" | undefined) || "Active",
        currency: (selectedStore as any).currency || "USD",
        default_dimensions:
          ((selectedStore as any).default_dimensions as StoreDimensionUnit | undefined) || "mm",
      });
    }
  }, [selectedStore]);

  useEffect(() => {
    const storeId = selectedStore?.id;
    if (!storeId) return;
    const key = `dd-pog:store-defaults:${storeId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setFixtureTypes(DEFAULT_FIXTURE_TYPES);
        setComplianceRules(DEFAULT_COMPLIANCE_RULES);
        return;
      }
      const parsed = JSON.parse(raw) as {
        fixtureTypes?: string[];
        complianceRules?: string[];
      };
      setFixtureTypes(parsed.fixtureTypes?.length ? parsed.fixtureTypes : DEFAULT_FIXTURE_TYPES);
      setComplianceRules(parsed.complianceRules?.length ? parsed.complianceRules : DEFAULT_COMPLIANCE_RULES);
    } catch {
      setFixtureTypes(DEFAULT_FIXTURE_TYPES);
      setComplianceRules(DEFAULT_COMPLIANCE_RULES);
    }
  }, [selectedStore?.id]);

  useEffect(() => {
    const storeId = selectedStore?.id;
    if (!storeId) return;
    const key = `dd-pog:store-defaults:${storeId}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        fixtureTypes,
        complianceRules,
      }),
    );
  }, [selectedStore?.id, fixtureTypes, complianceRules]);

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

  const handleSaveDefaults = async () => {
    if (!canEdit) return;
    try {
      const updatedStore = await updateStoreMutation.mutateAsync({
        storeId: selectedStore.id,
        data: formData,
      });
      setSelectedStore(updatedStore);
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

  const userColumns: DataTableColumn<AuthSessionUser>[] = useMemo(
    () => [
      {
        title: "User",
        field: "firstName",
        minWidth: 220,
        headerHozAlign: "left",
        hozAlign: "left",
        formatter: (cell: any) => {
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
        formatter: (cell: any) => {
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
              formatter: (cell: any) => {
                const user = cell.getData() as AuthSessionUser;
                if (user.role === "admin") return "";
                return `
                  <button class="remove-btn inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10">
                    Remove
                  </button>
                `;
              },
              cellClick: (_e: any, cell: any) => {
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
            formData={formData}
            setFormData={setFormData}
            isSaving={updateStoreMutation.isPending}
            onSave={handleSave}
          />
        )}

        {activeTab === "defaults" && (
          <StoreDefaultsTabContent
            canEdit={canEdit}
            activeDefaultsTab={activeDefaultsTab}
            setActiveDefaultsTab={setActiveDefaultsTab}
            fixtureTypes={fixtureTypes}
            setFixtureTypes={setFixtureTypes}
            newFixture={newFixture}
            setNewFixture={setNewFixture}
            complianceRules={complianceRules}
            setComplianceRules={setComplianceRules}
            newRule={newRule}
            setNewRule={setNewRule}
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
            isSavingDefaults={updateStoreMutation.isPending}
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
            store={selectedStore as any}
          />
        )}
      </div>
    </MainLayout>
  );
}
