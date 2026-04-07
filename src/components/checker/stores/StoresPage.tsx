import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Globe, MapPin, Plus, RulerDimensionLine, Search, Store, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AuthSessionService } from "@/lib/auth/session";
import { useStore as useGlobalStore } from "@/providers/store";
import { useDeleteStore, useOrgStores, useUpdateStore } from "@/queries/checker";
import type { StoreSetting } from "@/types/checker";
import { useNavigate } from "@tanstack/react-router";
import { StoreFormModal } from "./StoreFormModal";
import { StoreUserAssignmentModal } from "./StoreUserAssignmentModal";

export function StoresPage() {
    const { data: stores = [], isLoading } = useOrgStores();
    const updateStoreMutation = useUpdateStore();
    const deleteStoreMutation = useDeleteStore();
    const { setSelectedStore: setGlobalSelectedStore } = useGlobalStore();
    const navigate = useNavigate();
    const currentUser = AuthSessionService.getCurrentUser();

    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreSetting | null>(null);

    const filteredStores = useMemo(() => {
        return (stores as StoreSetting[]).filter((store) =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.region || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.status || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [stores, searchQuery]);

    const handleEditStore = async (updatedStore: Omit<StoreSetting, "id">) => {
        if (!selectedStore) return;
        try {
            await updateStoreMutation.mutateAsync({
                storeId: selectedStore.id,
                data: updatedStore,
            });
            setIsEditModalOpen(false);
            setSelectedStore(null);
        } catch {
            // Store update errors are handled by query layer or UI feedback.
        }
    };

    const handleDeleteStore = async () => {
        if (!selectedStore) return;
        try {
            await deleteStoreMutation.mutateAsync(selectedStore.id);
            setIsDeleteModalOpen(false);
            setSelectedStore(null);
        } catch {
            // Store deletion errors are handled by query layer or UI feedback.
        }
    };

    const handleViewStore = (store: StoreSetting) => {
        setGlobalSelectedStore(store);
        if (currentUser?.role === "admin") {
            navigate({ to: "/admin/$storeId/dashboard", params: { storeId: store.id } });
            return;
        }
        navigate({ to: "/checker/dashboard" });
    };

    const columns: DataTableColumn<StoreSetting>[] = [
        {
            title: "Store Details",
            field: "name",
            minWidth: 200,
            hozAlign: "left",
            headerHozAlign: "left",
            formatter: (cell: DataTableCell<StoreSetting>) => {
                const store = cell.getData() as StoreSetting;
                const storeIcon = renderToStaticMarkup(<Store size={20} />);
                return `
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            ${storeIcon}
                        </div>
                        <div class="text-left">
                            <p class="font-semibold text-foreground">${store.name}</p>
                            <p class="text-[10px] text-muted-foreground opacity-70 tracking-widest uppercase">ID: ${store.id.slice(0, 8)}</p>
                        </div>
                    </div>
                `;
            },
        },
        {
            title: "Address",
            field: "address",
            minWidth: 250,
            hozAlign: "left",
            headerHozAlign: "left",
            formatter: (cell: DataTableCell<StoreSetting>) => {
                const value = cell.getValue() || "—";
                const pinIcon = renderToStaticMarkup(<MapPin size={14} />);
                return `
                    <div class="flex items-center gap-2 text-muted-foreground">
                        ${pinIcon}
                        <span class="text-sm truncate">${value}</span>
                    </div>
                `;
            },
        },
        {
            title: "Region",
            field: "region",
            width: 130,
            formatter: (cell: DataTableCell<StoreSetting>) => {
                const value = cell.getValue() || "—";
                return `<span class="text-sm text-muted-foreground">${value}</span>`;
            },
        },
        {
            title: "Status",
            field: "status",
            width: 120,
            formatter: (cell: DataTableCell<StoreSetting>) => {
                const value = (cell.getValue() as "Active" | "Inactive" | undefined) || "Active";
                const statusClass =
                  value === "Inactive"
                    ? "border-destructive/30 text-destructive"
                    : "border-emerald-500/30 text-emerald-500";
                return `<span class="inline-flex rounded px-1.5 py-0.5 border text-xs ${statusClass}">${value}</span>`;
            },
        },
        {
            title: "Currency",
            field: "currency",
            width: 130,
            formatter: (cell: DataTableCell<StoreSetting>) => {
                const globeIcon = renderToStaticMarkup(<Globe size={12} className="opacity-70" />);
                return `
                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                        ${globeIcon}
                        <span>${(cell.getValue() as string) || "USD"}</span>
                    </div>
                `;
            },
        },
        {
            title: "Dimensions",
            field: "default_dimensions",
            width: 140,
            formatter: (cell: DataTableCell<StoreSetting>) => {
                const dimensionsIcon = renderToStaticMarkup(<RulerDimensionLine size={12} className="opacity-70" />);
                return `
                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                        ${dimensionsIcon}
                        <span>${(cell.getValue() as string) || "Metric"}</span>
                    </div>
                `;
            },
        },
        // {
        //     title: "Assignments",
        //     field: "maker_ids",
        //     width: 100,
        //     hozAlign: "center",
        //     headerHozAlign: "center",
        //     formatter: (cell: DataTableCell<StoreSetting>) => {
        //         const store = cell.getData() as StoreSetting;
        //         const makerCount = store.maker_ids?.length || 0;
        //         const userCount = store.user_ids?.length || 0;
        //         const count = makerCount + userCount;
        //         return `
        //             <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 border border-accent/20 text-accent">
        //                 ${count} Users
        //             </span>
        //         `;
        //     },
        // },
        {
            title: "Actions",
            field: "actions",
            width: 100,
            headerSort: false,
            hozAlign: "right",
            formatter: () => {
                const editBtn = renderToStaticMarkup(
                    <IconButton
                        type="button"
                        className="edit-btn"
                        variant="icon-ghost"
                        size="icon-sm"
                        aria-label="Edit store"
                        icon={<Edit2 size={16} aria-hidden />}
                    />,
                );
                const staffBtn = renderToStaticMarkup(
                    <IconButton
                        type="button"
                        className="staff-btn"
                        variant="icon-ghost"
                        size="icon-sm"
                        aria-label="Manage staff"
                        icon={<Users size={16} aria-hidden />}
                    />,
                );
                const deleteBtn = renderToStaticMarkup(
                    <IconButton
                        type="button"
                        className="delete-btn"
                        variant="destructive-ghost"
                        size="icon-sm"
                        aria-label="Delete store"
                        icon={<Trash2 size={16} aria-hidden />}
                    />,
                );
                return `
                    <div class="flex items-center justify-end gap-1">
                        ${editBtn}
                        ${staffBtn}
                        ${deleteBtn}
                    </div>
                `;
            },
            cellClick: (e: unknown, cell: DataTableCell<StoreSetting>) => {
            if (e && typeof e === "object" && "stopPropagation" in e && typeof e.stopPropagation === "function") {
                e.stopPropagation();
            }
                const store = cell.getData() as StoreSetting;
                const target = e && typeof e === "object" && "target" in e && e.target instanceof Element
                    ? e.target.closest("button")
                    : null;
                if (target?.classList.contains("edit-btn")) {
                    setSelectedStore(store);
                    setIsEditModalOpen(true);
                } else if (target?.classList.contains("staff-btn")) {
                    setSelectedStore(store);
                    setIsStaffModalOpen(true);
                } else if (target?.classList.contains("delete-btn")) {
                    setSelectedStore(store);
                    setIsDeleteModalOpen(true);
                }
            },
        },
    ];

    return (
        <MainLayout
            pageHeader={(
                <PageHeader
                    title="Stores"
                    description="Monitor and manage all retail locations in your organization."
                >
                    <Button
                        variant="accent"
                        onClick={() =>
                            navigate({
                                to: "/admin/stores/new",
                            })
                        }
                    >
                        <Plus className="mr-2 size-4" />
                        Create Store
                    </Button>
                </PageHeader>
            )}
        >
            <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
                <div className="mx-auto w-full max-w-screen-2xl space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input
                            placeholder="Search by name or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-card border-border hover:border-accent/50 focus:border-accent transition-all text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex-1 min-h-0">
                        {isLoading ? (
                            <Skeleton className="h-[400px] w-full rounded-xl" />
                        ) : (
                            <DataTable<StoreSetting>
                                columns={columns}
                                data={filteredStores}
                                onRowClick={handleViewStore}
                                pageSize={10}
                                emptyMessage="No stores found matching your criteria"
                            />
                        )}
                    </div>
                </div>
            </div>

            <StoreFormModal
                isOpen={isEditModalOpen}
                isLoading={updateStoreMutation.isPending}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditStore}
                initialData={selectedStore || undefined}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                isLoading={deleteStoreMutation.isPending}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteStore}
                title="Delete Store"
                description={`Are you sure you want to delete "${selectedStore?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
            />

            <StoreUserAssignmentModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                store={selectedStore}
            />
        </MainLayout>
    );
}
