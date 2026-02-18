import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, X, Check } from "lucide-react";
import type { StoreSetting } from "../types";

interface StoreFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (store: Omit<StoreSetting, "id" | "created" | "status">) => void;
    initialData?: StoreSetting;
}

export function StoreFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: StoreFormModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        region: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                address: initialData.address,
                region: initialData.region,
            });
        } else {
            setFormData({
                name: "",
                address: "",
                region: "",
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground glassmorphism">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-accent/20 rounded-md">
                            <Store className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">
                            {initialData ? "Edit Store" : "Add New Store"}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-sm font-medium text-muted-foreground">
                            Store Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="storeName"
                            placeholder="e.g. Downtown Flagship"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-background border-border focus:border-accent transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">
                            Address
                        </Label>
                        <Input
                            id="address"
                            placeholder="e.g. 100 Main St, New York, NY"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-background border-border focus:border-accent transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="region" className="text-sm font-medium text-muted-foreground">
                            Region
                        </Label>
                        <Input
                            id="region"
                            placeholder="e.g. Northeast"
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className="bg-background border-border focus:border-accent transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {initialData ? "Save Changes" : "Create Store"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
