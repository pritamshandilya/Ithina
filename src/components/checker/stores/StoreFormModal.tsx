import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Store, X, Check } from "lucide-react";
import type { StoreSetting } from "@/types/checker";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";

interface StoreFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (store: Omit<StoreSetting, "id" | "created" | "maker_ids">) => void;
    initialData?: StoreSetting;
    isLoading?: boolean;
}

type StoreFormValues = Omit<StoreSetting, "id" | "created" | "maker_ids">;

const EMPTY_STORE_FORM: StoreFormValues = {
  name: "",
  address: "",
  region: "",
  status: "Active",
  currency: "USD",
  default_dimensions: "inch",
};

function getInitialStoreFormData(initialData?: StoreSetting): StoreFormValues {
    if (!initialData) return EMPTY_STORE_FORM;

    return {
        name: initialData.name,
        address: initialData.address,
        region: initialData.region || "",
        status: initialData.status || "Active",
        currency: initialData.currency || "USD",
        default_dimensions:
          (initialData.default_dimensions as StoreDimensionUnit | undefined) || "inch",
    };
}

export function StoreFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}: StoreFormModalProps) {
  const draftSeed = initialData?.id ?? "new";
  const [draftState, setDraftState] = useState<{
    seed: string;
    values: Partial<StoreFormValues>;
  }>({
    seed: draftSeed,
    values: {},
  });

  const formData: StoreFormValues = {
    ...getInitialStoreFormData(initialData),
    ...(draftState.seed === draftSeed ? draftState.values : {}),
  };

  const updateField = <K extends keyof StoreFormValues>(
    field: K,
    value: StoreFormValues[K],
  ) => {
    setDraftState((prev) => ({
      seed: draftSeed,
      values: {
        ...(prev.seed === draftSeed ? prev.values : {}),
        [field]: value,
      },
    }));
  };

  const handleClose = () => {
    setDraftState({ seed: draftSeed, values: {} });
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
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
                        onClick={handleClose}
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
                            onChange={(e) => updateField("name", e.target.value)}
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
                            onChange={(e) => updateField("address", e.target.value)}
                            className="bg-background border-border focus:border-accent transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="region" className="text-sm font-medium text-muted-foreground">
                                Region
                            </Label>
                            <Input
                                id="region"
                                placeholder="e.g. North, West, APAC"
                                value={formData.region}
                                onChange={(e) => updateField("region", e.target.value)}
                                className="bg-background border-border focus:border-accent transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-muted-foreground">
                                Status <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => updateField("status", e.target.value as "Active" | "Inactive")}
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-sm font-medium text-muted-foreground">
                                Currency <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              id="currency"
                              value={formData.currency}
                              onChange={(e) => updateField("currency", e.target.value)}
                              required
                            >
                              {PREDEFINED_CURRENCIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="default_dimensions" className="text-sm font-medium text-muted-foreground">
                                Default Dimension Unit <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="default_dimensions"
                                value={formData.default_dimensions}
                                onChange={(e) => updateField("default_dimensions", e.target.value)}
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                required
                            >
                                <option value="mm">mm</option>
                                <option value="cm">cm</option>
                                <option value="inch">inch</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
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
