import { Check, Store, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { StoreSetting } from "@/types/checker";

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
      (initialData.default_dimensions as StoreDimensionUnit | undefined) ||
      "inch",
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
      <div className="bg-card border-border text-foreground glassmorphism overflow-hidden rounded-xl border shadow-2xl">
        <div className="border-border bg-muted/20 flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="bg-accent/20 rounded-md p-1.5">
              <Store className="text-accent h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              {initialData ? "Edit Store" : "Add New Store"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-muted text-muted-foreground rounded-md p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <Label
              htmlFor="storeName"
              className="text-muted-foreground text-sm font-medium"
            >
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
            <Label
              htmlFor="address"
              className="text-muted-foreground text-sm font-medium"
            >
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
              <Label
                htmlFor="region"
                className="text-muted-foreground text-sm font-medium"
              >
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
              <Label
                htmlFor="status"
                className="text-muted-foreground text-sm font-medium"
              >
                Status <span className="text-destructive">*</span>
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as "Active" | "Inactive")
                }
                className="border-border bg-background text-foreground focus-visible:ring-accent focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="currency"
                className="text-muted-foreground text-sm font-medium"
              >
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
              <Label
                htmlFor="default_dimensions"
                className="text-muted-foreground text-sm font-medium"
              >
                Default Dimension Unit{" "}
                <span className="text-destructive">*</span>
              </Label>
              <select
                id="default_dimensions"
                value={formData.default_dimensions}
                onChange={(e) =>
                  updateField("default_dimensions", e.target.value)
                }
                className="border-border bg-background text-foreground focus-visible:ring-accent focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
              className="border-border hover:bg-muted rounded-lg border px-6 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 px-6"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <Check className="h-4 w-4" />
              )}
              {initialData ? "Save Changes" : "Create Store"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
