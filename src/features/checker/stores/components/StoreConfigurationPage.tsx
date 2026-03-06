import { useEffect, useState } from "react";
import { Settings, Save, Store as StoreIcon, MapPin, Globe, Maximize } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore as useGlobalStore } from "@/providers/store";
import { useUpdateStore } from "@/features/checker/hooks/useOrgData";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layouts/main";

export function StoreConfigurationPage() {
    const { toast } = useToast();
    const { selectedStore, setSelectedStore } = useGlobalStore();
    const updateStoreMutation = useUpdateStore();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        currency: "USD",
        default_dimensions: "Metric",
    });

    useEffect(() => {
        if (selectedStore) {
            setFormData({
                name: selectedStore.name || "",
                address: (selectedStore as any).address || "",
                currency: (selectedStore as any).currency || "USD",
                default_dimensions: (selectedStore as any).default_dimensions || "Metric",
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
        } catch (error) {
            console.error("Failed to update store:", error);
            toast({
                title: "Update Failed",
                description: "An error occurred while saving the store settings.",
                variant: "destructive",
            });
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-10 pt-4 px-4">
                <PageHeader
                    title="Store Settings"
                    // description={`Configure settings and details for ${selectedStore.name}.`}
                    icon={Settings}
                />

                <form onSubmit={handleSave} className="space-y-6">
                    <Card className="bg-card border-border shadow-xl glassmorphism">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <StoreIcon className="size-5 text-accent" />
                                <CardTitle>Basic Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-muted-foreground flex items-center gap-2">
                                    <StoreIcon className="size-3.5" /> Store Name
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter store name"
                                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address" className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="size-3.5" /> Physical Address
                                </Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full store address"
                                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-xl glassmorphism">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Globe className="size-5 text-accent" />
                                <CardTitle>Regional & System Settings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="currency" className="text-muted-foreground flex items-center gap-2">
                                    <Globe className="size-3.5" /> Currency
                                </Label>
                                <Input
                                    id="currency"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    placeholder="e.g. USD, EUR"
                                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dimensions" className="text-muted-foreground flex items-center gap-2">
                                    <Maximize className="size-3.5" /> Measurement System
                                </Label>
                                <Input
                                    id="dimensions"
                                    value={formData.default_dimensions}
                                    onChange={(e) => setFormData({ ...formData, default_dimensions: e.target.value })}
                                    placeholder="e.g. Metric, Imperial"
                                    className="bg-background/50 border-border focus:border-accent font-medium h-11"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

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
                </form>
            </div>
        </MainLayout>
    );
}
