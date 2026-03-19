import { Globe, MapPin, Maximize, Save, Store as StoreIcon } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

interface StoreProfileTabProps {
  canEdit: boolean;
  formData: {
    name: string;
    address: string;
    region: string;
    status: "Active" | "Inactive";
    currency: string;
    default_dimensions: StoreDimensionUnit;
  };
  setFormData: (updater: (prev: {
    name: string;
    address: string;
    region: string;
    status: "Active" | "Inactive";
    currency: string;
    default_dimensions: StoreDimensionUnit;
  }) => {
    name: string;
    address: string;
    region: string;
    status: "Active" | "Inactive";
    currency: string;
    default_dimensions: StoreDimensionUnit;
  }) => void;
  isSaving: boolean;
  onSave: (e: FormEvent<HTMLFormElement>) => void;
}

export function StoreProfileTab({
  canEdit,
  formData,
  setFormData,
  isSaving,
  onSave,
}: StoreProfileTabProps) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <Card noBorder className="bg-card shadow-xl glassmorphism">
        <CardHeader>
          <div className="flex items-center gap-2">
            <StoreIcon className="size-5 text-accent" />
            <CardTitle>Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="region" className="text-muted-foreground flex items-center gap-2">
                <MapPin className="size-3.5" /> Region
              </Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                placeholder="e.g. North, West, APAC"
                className="bg-background/50 border-border focus:border-accent font-medium h-11"
                disabled={!canEdit}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-muted-foreground flex items-center gap-2">
                <StoreIcon className="size-3.5" /> Status
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))
                }
                className="h-11 rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!canEdit}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-muted-foreground flex items-center gap-2">
              <StoreIcon className="size-3.5" /> Store Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter store name"
              className="bg-background/50 border-border focus:border-accent font-medium h-11"
              required
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address" className="text-muted-foreground flex items-center gap-2">
              <MapPin className="size-3.5" /> Physical Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Full store address"
              className="bg-background/50 border-border focus:border-accent font-medium h-11"
              required
              disabled={!canEdit}
            />
          </div>
        </CardContent>
      </Card>

      <Card noBorder className="bg-card shadow-xl glassmorphism">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-accent" />
            <CardTitle>Regional</CardTitle>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
              placeholder="e.g. USD, EUR"
              className="bg-background/50 border-border focus:border-accent font-medium h-11"
              required
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dimensions" className="text-muted-foreground flex items-center gap-2">
              <Maximize className="size-3.5" /> Default Dimension Unit
            </Label>
            <select
              id="dimensions"
              value={formData.default_dimensions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  default_dimensions: e.target.value as StoreDimensionUnit,
                }))
              }
              className="h-11 rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!canEdit}
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex items-center justify-end gap-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[150px] gap-2 h-11 rounded-xl shadow-lg shadow-accent/20"
          >
            {isSaving ? (
              <div className="size-4 border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin rounded-full" />
            ) : (
              <Save className="size-4" />
            )}
            Save Configuration
          </Button>
        </div>
      )}
    </form>
  );
}

