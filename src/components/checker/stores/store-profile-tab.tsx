import type { Dispatch, SetStateAction, FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Store } from "lucide-react";

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
  formData: StoreProfileTabFormData;
  setFormData: Dispatch<SetStateAction<StoreProfileTabFormData>>;
  isSaving: boolean;
  onSave: (e: FormEvent) => void | Promise<void>;
}

export function StoreProfileTab({ canEdit, formData, setFormData, isSaving, onSave }: StoreProfileTabProps) {
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
        <div className="flex items-center gap-2">
          <Store className="size-5 text-accent" />
          <CardTitle>Store Profile</CardTitle>
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
              disabled={!canEdit}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-currency">
              Currency
            </label>
            <Input
              id="store-currency"
              value={formData.currency}
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
              disabled={!canEdit}
            />
          </div>

          <div className="grid gap-2 xl:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-address">
              Address
            </label>
            <Input
              id="store-address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              disabled={!canEdit}
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
              disabled={!canEdit}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="store-status">
              Status
            </label>
            <select
              id="store-status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: (e.target.value as "Active" | "Inactive") ?? "Active",
                }))
              }
              disabled={!canEdit}
              className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="min-w-[150px]">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </form>
    </Card>
  );
}

