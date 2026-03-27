import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";
import { ChevronRight } from "lucide-react";

interface StoreOnboardingBasicStepProps {
  name: string;
  address: string;
  region: string;
  currency: string;
  canContinue: boolean;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onNext: () => void;
}

export function StoreOnboardingBasicStep({
  name,
  address,
  region,
  currency,
  canContinue,
  onNameChange,
  onAddressChange,
  onRegionChange,
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
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="min-w-[140px]"
            disabled={!canContinue}
            onClick={onNext}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store-currency">Currency</Label>
            <Select
              id="store-currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              aria-label="Select store currency"
            >
              {PREDEFINED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-region">Region</Label>
            <Input
              id="store-region"
              placeholder="e.g. North, West, APAC"
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

