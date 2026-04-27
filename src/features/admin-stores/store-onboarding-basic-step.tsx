import { ChevronRight } from "lucide-react";

import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";

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
    <div className="rounded-xl border border-ithina-border bg-ithina-panel/90 shadow-xl">
      <div className="flex flex-col gap-4 border-b border-ithina-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-bold text-white">Basic store details</h2>
          <p className="text-sm text-slate-500">
            Name and locate your store. You can refine settings later.
          </p>
        </div>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="btn btn-ghost shrink-0 gap-1 self-start sm:self-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
      <div className="space-y-4 px-6 py-6">
        <div className="form-group">
          <label htmlFor="store-name" className="form-label">
            Store name
          </label>
          <input
            id="store-name"
            className="form-input"
            placeholder="e.g. Downtown Flagship"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoComplete="organization"
          />
        </div>

        <div className="form-group">
          <label htmlFor="store-address" className="form-label">
            Address
          </label>
          <input
            id="store-address"
            className="form-input"
            placeholder="Street, City, Region"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="store-currency" className="form-label">
              Currency
            </label>
            <select
              id="store-currency"
              className="form-input cursor-pointer"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              aria-label="Select store currency"
            >
              {PREDEFINED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="store-region" className="form-label">
              Region
            </label>
            <input
              id="store-region"
              className="form-input"
              placeholder="e.g. North, West, APAC"
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
