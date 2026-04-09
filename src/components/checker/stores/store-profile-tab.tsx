import type { Dispatch, SetStateAction, FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Pencil, Store } from "lucide-react";
import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";

type StoreProfileTabFormData = {
  name: string;
  address: string;
  region: string;
  status: "Active" | "Inactive";
  currency: string;
  default_dimensions: StoreDimensionUnit;
};

export interface StoreProfileTabProps {
  canEdit: boolean;
  isEditing: boolean;
  isAdmin: boolean;
  formData: StoreProfileTabFormData;
  setFormData: Dispatch<SetStateAction<StoreProfileTabFormData>>;
  isSaving: boolean;
  onSave: (e: FormEvent) => void | Promise<void>;
  onEditStart: () => void;
  onCancelEdit: () => void;
  onDeactivate: () => void | Promise<void>;
  onActivate: () => void | Promise<void>;
}

export function StoreProfileTab({
  canEdit,
  isEditing,
  isAdmin,
  formData,
  setFormData,
  isSaving,
  onSave,
  onEditStart,
  onCancelEdit,
  onDeactivate,
  onActivate,
}: StoreProfileTabProps) {
  if (!formData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-[260px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <Card noBorder className="bg-card shadow-xl glassmorphism space-y-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Store className="size-5 text-accent" />
            <CardTitle>Store Profile</CardTitle>
          </div>
          {canEdit && !isEditing && (
            <Button type="button" variant="outline" size="sm" onClick={onEditStart}>
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
    <form onSubmit={onSave} className="space-y-6">
      <CardContent className="space-y-6 p-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-name">
              Store Name
            </label>
            <Input
              id="store-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={!canEdit || !isEditing}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-currency">
              Currency
            </label>
            <Select
              id="store-currency"
              value={formData.currency}
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
              disabled={!canEdit || !isEditing}
            >
              {PREDEFINED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2 xl:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-address">
              Address
            </label>
            <Input
              id="store-address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              disabled={!canEdit || !isEditing}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-region">
              Region
            </label>
            <Input
              id="store-region"
              value={formData.region}
              onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
              disabled={!canEdit || !isEditing}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-dimension-unit">
              Default Dimension Unit
            </label>
            <Select
              id="store-dimension-unit"
              value={formData.default_dimensions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  default_dimensions: e.target.value as StoreDimensionUnit,
                }))
              }
              disabled={!canEdit || !isEditing}
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </Select>
          </div>

        </div>

        <div className="flex justify-between items-center pt-2 gap-2">
          {isAdmin && canEdit && isEditing && formData.status === "Active" && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSaving}
              onClick={() => void onDeactivate()}
            >
              Deactivate store
            </Button>
          )}
          {isAdmin && canEdit && isEditing && formData.status === "Inactive" && (
            <Button
              type="button"
              variant="success"
              disabled={isSaving}
              onClick={() => void onActivate()}
            >
              Activate store
            </Button>
          )}

          {canEdit && isEditing && (
            <div className="flex flex-1 justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSaving} onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="min-w-[150px]">
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </form>
    </Card>
  );
}

