import { useState, useMemo } from "react";
import { Plus, Search, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared";

import { StoreFormModal } from "./StoreFormModal";
import { useOrgStores, useCreateStore } from "@/features/checker/hooks/useOrgData";
import { useStore as useGlobalStore } from "@/providers/store";
import { useNavigate } from "@tanstack/react-router";
import type { StoreSetting } from "../types";

export function StoresPage() {
    const { data: stores = [], isLoading } = useOrgStores();
    const createStoreMutation = useCreateStore();
    const { setSelectedStore: setGlobalSelectedStore } = useGlobalStore();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreSetting | null>(null);

    const filteredStores = useMemo(() => {
        return (stores as StoreSetting[]).filter((store) =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.address || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [stores, searchQuery]);

    const handleAddStore = async (newStore: any) => {
        try {
            await createStoreMutation.mutateAsync(newStore);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to create store:", error);
        }
    };

    const handleViewStore = (store: any) => {
        setGlobalSelectedStore(store);
        navigate({ to: "/checker/dashboard" });
    };

    const columns: DataTableColumn<StoreSetting>[] = [
        {
            title: "Store Details",
            field: "name",
            minWidth: 200,
            hozAlign: "left",
            headerHozAlign: "left",
            formatter: (cell: any) => {
                const store = cell.getData() as StoreSetting;
                return `
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7"/></svg>
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
            formatter: (cell: any) => {
                const value = cell.getValue() || "—";
                return `
                    <div class="flex items-center gap-2 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                        <span class="text-sm truncate">${value}</span>
                    </div>
                `;
            },
        },
        {
            title: "Settings",
            field: "currency",
            width: 150,
            formatter: (cell: any) => {
                const store = cell.getData() as StoreSetting;
                return `
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                            <span>${store.currency || 'USD'}</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><path d="m10 2 2 2 2-2"/><path d="M12 4v16"/><path d="M10 22h4"/><path d="m22 10-2 2 2 2"/><path d="M20 12H4"/><path d="m2 10 2 2-2 2"/></svg>
                            <span>${store.default_dimensions || 'Metric'}</span>
                        </div>
                    </div>
                `;
            },
        },
        {
            title: "Staff",
            field: "maker_ids",
            width: 100,
            hozAlign: "center",
            headerHozAlign: "center",
            formatter: (cell: any) => {
                const count = cell.getValue()?.length || 0;
                return `
                    <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 border border-accent/20 text-accent">
                        ${count} Members
                    </span>
                `;
            },
        },
        {
            title: "Actions",
            field: "actions",
            width: 100,
            headerSort: false,
            hozAlign: "right",
            formatter: () => {
                return `
                    <div class="flex items-center justify-end gap-2">
                        <button class="edit-btn p-1.5 hover:bg-accent/10 rounded-md transition-colors text-muted-foreground hover:text-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                    </div>
                `;
            },
            cellClick: (e: any, cell: any) => {
                const store = cell.getData() as StoreSetting;
                const target = e.target.closest("button");
                if (target?.classList.contains("edit-btn")) {
                    setSelectedStore(store);
                    setIsEditModalOpen(true);
                }
            },
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Stores"
                description="Monitor and manage all retail locations in your organization."
                icon={StoreIcon}
            >
                <Button variant="accent" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Create Store
                </Button>
            </PageHeader>

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

            <StoreFormModal
                isOpen={isAddModalOpen}
                isLoading={createStoreMutation.isPending}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddStore}
            />

            <StoreFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={() => { }} // Not implemented yet per API
                initialData={selectedStore || undefined}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { }}
                title="Delete Store"
                description={`Are you sure you want to delete "${selectedStore?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
}
