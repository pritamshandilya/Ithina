import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { X, UserPlus, Trash2, Search, User } from "lucide-react";
import { useOrgUsers, useStoreUsers, useAssignStoreUser, useRemoveStoreUser } from "@/queries/checker";
import { Skeleton } from "@/components/ui/skeleton";
import type { Store } from "@/types/checker";
import { Input } from "@/components/ui/input";

interface StoreUserAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store | null;
}

export function StoreUserAssignmentModal({
    isOpen,
    onClose,
    store,
}: StoreUserAssignmentModalProps) {
    const { data: orgUsers = [], isLoading: isOrgUsersLoading } = useOrgUsers();
    const { data: storeUsers = [], isLoading: isStoreUsersLoading } = useStoreUsers(store?.id || "");
    const assignMutation = useAssignStoreUser();
    const removeMutation = useRemoveStoreUser();

    const [searchQuery, setSearchQuery] = useState("");

    const assignedUserIds = useMemo(() => new Set(storeUsers.map(u => u.id)), [storeUsers]);

    const availableUsers = useMemo(() => {
        return orgUsers.filter(user => 
            !assignedUserIds.has(user.id) && 
            (user.role === "maker" || user.role === "checker") &&
            (`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [orgUsers, assignedUserIds, searchQuery]);

    const handleAssign = async (userId: string) => {
        if (!store) return;
        try {
            await assignMutation.mutateAsync({ storeId: store.id, userId });
        } catch {
            // Assignment errors are surfaced via query layer or UI; no console logs.
        }
    };

    const handleRemove = async (userId: string) => {
        if (!store) return;
        try {
            await removeMutation.mutateAsync({ storeId: store.id, userId });
        } catch {
            // Removal errors are surfaced via query layer or UI; no console logs.
        }
    };

    if (!store) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground glassmorphism flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-accent/20 rounded-md">
                            <UserPlus className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Manage Store Staff
                            </h3>
                            <p className="text-xs text-muted-foreground">{store.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <section>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Assigned Staff</h4>
                        {(isStoreUsersLoading) ? (
                            <Skeleton className="h-20 w-full" />
                        ) : storeUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic bg-muted/10 p-4 rounded-lg border border-dashed border-border">No users assigned to this store yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {storeUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{user.role}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemove(user.id)}
                                            disabled={removeMutation.isPending}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Available Staff</h4>
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                                <Input 
                                    className="h-8 pl-8 text-xs bg-muted/20" 
                                    placeholder="Find users..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {isOrgUsersLoading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : availableUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic py-4 text-center">No more staff members available to assign.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {availableUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border border-border/30 hover:border-accent/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px]">
                                                <User className="size-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium truncate">{user.firstName} {user.lastName}</p>
                                                <p className="text-[9px] text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleAssign(user.id)}
                                            disabled={assignMutation.isPending}
                                            className="h-7 text-accent hover:bg-accent/10"
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
                    <Button onClick={onClose} variant="outline" className="px-8">Done</Button>
                </div>
            </div>
        </Modal>
    );
}
