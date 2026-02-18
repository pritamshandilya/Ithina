import { useState, useMemo, useEffect } from "react";
import { renderToString } from "react-dom/server";
import { Plus, Search, Store as StoreIcon, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StoreFormModal } from "./StoreFormModal";
import { useStores } from "@/features/checker/hooks";
import type { StoreSetting } from "../types";

export function StoreSettingsPage() {
    const { data: globalStores, isLoading } = useStores();
    const [stores, setStores] = useState<StoreSetting[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreSetting | null>(null);

    useEffect(() => {
        if (globalStores) {
            setStores(globalStores as StoreSetting[]);
        }
    }, [globalStores]);

    const filteredStores = useMemo(() => {
        return stores.filter((store) =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.region || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [stores, searchQuery]);

    const handleAddStore = (newStore: Omit<StoreSetting, "id" | "created" | "status">) => {
        const store: StoreSetting = {
            ...newStore,
            id: Math.random().toString(36).substr(2, 9),
            created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Inactive",
        };
        setStores([...stores, store]);
    };

    const handleEditStore = (updatedData: Omit<StoreSetting, "id" | "created" | "status">) => {
        if (!selectedStore) return;
        setStores(stores.map((s) => (s.id === selectedStore.id ? { ...s, ...updatedData } : s)));
    };

    const handleDeleteStore = () => {
        if (!selectedStore) return;
        setStores(stores.filter((s) => s.id !== selectedStore.id));
        setIsDeleteModalOpen(false);
        setSelectedStore(null);
    };

    const columns: DataTableColumn<StoreSetting>[] = [
        {
            title: "STORE NAME",
            field: "name",
            width: "25%",
            formatter: (cell: any) => {
                const store = cell.getData() as StoreSetting;
                const iconHtml = renderToString(<StoreIcon className="w-4 h-4 text-[var(--accent)]" />);
                return `
          <div class="flex items-center gap-3 py-1">
            <div class="p-1.5 bg-[var(--accent)]/10 rounded-md">
              ${iconHtml}
            </div>
            <span class="font-semibold text-foreground/90">${store.name}</span>
          </div>
        `;
            },
        },
        {
            title: "ADDRESS",
            field: "address",
            width: "30%",
            formatter: (cell: any) => {
                const value = cell.getValue() || "No address provided";
                const iconHtml = renderToString(<MapPin className="w-3.5 h-3.5 opacity-50" />);
                return `
          <div class="flex items-center gap-2 text-foreground/60">
            ${iconHtml}
            <span class="text-sm truncate">${value}</span>
          </div>
        `;
            },
        },
        {
            title: "REGION",
            field: "region",
            width: "15%",
            formatter: (cell: any) => {
                const value = cell.getValue() || "N/A";
                return `
          <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/50">
            ${value}
          </span>
        `;
            },
        },
        {
            title: "CREATED",
            field: "created",
            width: "15%",
            formatter: (cell: any) => {
                const value = cell.getValue() || "—";
                return `<span class="text-sm text-foreground/50">${value}</span>`;
            },
        },
        {
            title: "STATUS",
            field: "status",
            width: "10%",
            formatter: (cell: any) => {
                const status = cell.getValue();
                const isActive = status === "Active";
                if (!isActive) return `<span class="text-foreground/20">—</span>`;
                return `
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--action-success)]/10 border border-[var(--action-success)]/20 w-fit">
            <div class="w-1.5 h-1.5 rounded-full bg-[var(--action-success)]"></div>
            <span class="text-[10px] font-bold text-[var(--action-success)]">${status}</span>
          </div>
        `;
            },
        },
        {
            title: "ACTIONS",
            field: "actions",
            width: "5%",
            headerSort: false,
            hozAlign: "right",
            formatter: () => {
                const editIconHtml = renderToString(<Edit2 className="w-4 h-4" />);
                const deleteIconHtml = renderToString(<Trash2 className="w-4 h-4" />);
                return `
          <div class="flex items-center gap-2">
            <button class="edit-btn p-1.5 hover:bg-foreground/5 rounded-md transition-colors text-foreground/40 hover:text-foreground/80 cursor-pointer">
              ${editIconHtml}
            </button>
            <button class="delete-btn p-1.5 hover:bg-foreground/5 rounded-md transition-colors text-foreground/40 hover:text-destructive cursor-pointer">
              ${deleteIconHtml}
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
                } else if (target?.classList.contains("delete-btn")) {
                    setSelectedStore(store);
                    setIsDeleteModalOpen(true);
                }
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-accent/20 rounded-lg">
                            <StoreIcon className="w-5 h-5 text-accent" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Store Settings</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage stores — add, edit, or remove stores</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Store
                </Button>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-card border-border hover:border-accent/50 focus:border-accent transition-all text-foreground placeholder:text-muted-foreground"
                />
            </div>

            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden shadow-black/20">
                <DataTable
                    columns={columns}
                    data={filteredStores}
                    rowIdField="id"
                    pagination={false}
                    className="border-none bg-transparent"
                />
            </div>

            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{filteredStores.length} stores total</span>
                    <div className="flex items-center gap-1.5">
                        <span>Active:</span>
                        <span className="text-accent font-medium uppercase tracking-wide">
                            {stores.find(s => s.status === "Active")?.name || "None"}
                        </span>
                    </div>
                </div>
            </div>

            <StoreFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddStore}
            />

            <StoreFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditStore}
                initialData={selectedStore || undefined}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteStore}
                title="Delete Store"
                description={`Are you sure you want to delete "${selectedStore?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
}
