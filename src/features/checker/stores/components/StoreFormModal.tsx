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
    onSubmit: (store: Omit<StoreSetting, "id" | "created" | "status" | "maker_ids">) => void;
    initialData?: StoreSetting;
    isLoading?: boolean;
}

export function StoreFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}: StoreFormModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        currency: "USD",
        default_dimensions: "Metric",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                address: initialData.address,
                currency: initialData.currency || "USD",
                default_dimensions: initialData.default_dimensions || "Metric",
            });
        } else {
            setFormData({
                name: "",
                address: "",
                currency: "USD",
                default_dimensions: "Metric",
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-sm font-medium text-muted-foreground">
                                Currency <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="currency"
                                placeholder="e.g. USD, EUR"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="bg-background border-border focus:border-accent transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="default_dimensions" className="text-sm font-medium text-muted-foreground">
                                Default Dimensions <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="default_dimensions"
                                placeholder="e.g. Metric, Imperial"
                                value={formData.default_dimensions}
                                onChange={(e) => setFormData({ ...formData, default_dimensions: e.target.value })}
                                className="bg-background border-border focus:border-accent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {initialData ? "Save Changes" : "Create Store"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
