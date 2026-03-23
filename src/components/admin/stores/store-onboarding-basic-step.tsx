import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoreOnboardingBasicStepProps {
  name: string;
  address: string;
  region: string;
  status: "Active" | "Inactive";
  currency: string;
  canContinue: boolean;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onStatusChange: (value: "Active" | "Inactive") => void;
  onCurrencyChange: (value: string) => void;
  onNext: () => void;
}

export function StoreOnboardingBasicStep({
  name,
  address,
  region,
  status,
  currency,
  canContinue,
  onNameChange,
  onAddressChange,
  onRegionChange,
  onStatusChange,
  onCurrencyChange,
  onNext,
}: StoreOnboardingBasicStepProps) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
      <CardHeader>
        <CardTitle>Basic store details</CardTitle>
        <CardDescription>
          Name and locate your store. You can refine settings later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="store-name">Store name</Label>
          <Input
            id="store-name"
            placeholder="e.g. Downtown Flagship"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store-address">Address</Label>
          <Input
            id="store-address"
            placeholder="Street, City, Region"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store-currency">Currency</Label>
          <Input
            id="store-currency"
            placeholder="e.g. USD, EUR"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store-region">Region</Label>
            <Input
              id="store-region"
              placeholder="e.g. North, West, APAC"
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-status">Status</Label>
            <select
              id="store-status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as "Active" | "Inactive")}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button className="min-w-[140px]" disabled={!canContinue} onClick={onNext}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

