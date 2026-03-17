import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { AuthSessionUser } from "@/lib/auth/session";
import { STORE_DIMENSION_UNITS } from "@/lib/constants/dimensions";
import { useStore as useGlobalStore } from "@/providers/store";
import { useRemoveStoreUser, useStoreUsers, useUpdateStore } from "@/queries/checker";
import {
  Globe,
  MapPin,
  Maximize,
  Save,
  Settings,
  Store as StoreIcon,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StoreUserAssignmentModal } from "./StoreUserAssignmentModal";

type Tab = "profile" | "team";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Store Profile", icon: StoreIcon },
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
    currency: "USD",
    default_dimensions: "mm",
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      setFormData({
        name: selectedStore.name || "",
        address: (selectedStore as any).address || "",
        currency: (selectedStore as any).currency || "USD",
        default_dimensions:
          (selectedStore as any).default_dimensions || "Metric",
      });
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

        {/* Store Profile tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-6">
            <Card noBorder className="bg-card shadow-xl glassmorphism">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StoreIcon className="size-5 text-accent" />
                  <CardTitle>Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <StoreIcon className="size-3.5" /> Store Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter store name"
                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                    required
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="address"
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <MapPin className="size-3.5" /> Physical Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Full store address"
                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                    required
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            <Card noBorder className="bg-card shadow-xl glassmorphism">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="size-5 text-accent" />
                  <CardTitle>Regional</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label
                    htmlFor="currency"
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <Globe className="size-3.5" /> Currency
                  </Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="e.g. USD, EUR"
                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                    required
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="dimensions"
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <Maximize className="size-3.5" /> Default Dimension Unit
                  </Label>
                  <select
                    id="dimensions"
                    value={formData.default_dimensions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        default_dimensions: e.target.value,
                      })
                    }
                    className="h-11 rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={!canEdit}
                  >
                    {STORE_DIMENSION_UNITS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {canEdit && (
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="submit"
                  disabled={updateStoreMutation.isPending}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[150px] gap-2 h-11 rounded-xl shadow-lg shadow-accent/20"
                >
                  {updateStoreMutation.isPending ? (
                    <div className="size-4 border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin rounded-full" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Configuration
                </Button>
              </div>
            )}
          </form>
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
