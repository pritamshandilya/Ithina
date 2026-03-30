import { Globe, MapPin, Maximize, Save, Store as StoreIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { STORE_DIMENSION_UNITS, type StoreDimensionUnit } from "@/constants/dimensions";
import { useStoreProfile, useUpdateStoreProfile } from "@/hooks/use-store-settings";
import { cn } from "@/lib/utils";

type Props = {
  canEdit?: boolean;
};

export function StoreProfileTab({ canEdit = true }: Props) {
  const { data: profile, isLoading } = useStoreProfile();
  const updateMutation = useUpdateStoreProfile();
  const [draft, setDraft] = useState<{
    name: string;
    address: string;
    region: string;
    currency: string;
    defaultDimensions: (typeof STORE_DIMENSION_UNITS)[number];
  } | null>(null);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl bg-ithina-border/40" />
        <Skeleton className="h-36 w-full rounded-2xl bg-ithina-border/40" />
      </div>
    );
  }

  const form = draft ?? {
    name: profile.name,
    address: profile.address,
    region: profile.region,
    currency: profile.currency,
    defaultDimensions: profile.defaultDimensions,
  };
  const isDirty =
    form.name !== profile.name ||
    form.address !== profile.address ||
    form.region !== profile.region ||
    form.currency !== profile.currency ||
    form.defaultDimensions !== profile.defaultDimensions;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setBanner(null);
    updateMutation.mutate(form, {
      onSuccess: () => {
        setDraft(null);
        setBanner({
          type: "ok",
          text: "Store configuration was updated.",
        });
      },
      onError: () => {
        setBanner({
          type: "err",
          text: "Could not save settings. Try again.",
        });
      },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {banner && (
        <div
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            banner.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200",
          )}
        >
          {banner.text}
        </div>
      )}

      <section className="rounded-2xl border border-ithina-border bg-ithina-panel p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <StoreIcon className="size-5 text-ithina-purple" aria-hidden />
          <h3 className="text-sm font-bold text-white">Basic Information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label
              htmlFor="store-name"
              className="flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <StoreIcon className="size-3.5" aria-hidden />
              Store Name
            </label>
            <Input
              id="store-name"
              value={form.name}
              onChange={(e) => setDraft({ ...form, name: e.target.value })}
              placeholder="Enter store name"
              required
              disabled={!canEdit}
              className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="store-address"
              className="flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <MapPin className="size-3.5" aria-hidden />
              Physical Address
            </label>
            <Input
              id="store-address"
              value={form.address}
              onChange={(e) => setDraft({ ...form, address: e.target.value })}
              placeholder="Full store address"
              required
              disabled={!canEdit}
              className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="store-region"
              className="flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <MapPin className="size-3.5" aria-hidden />
              Region
            </label>
            <Input
              id="store-region"
              value={form.region}
              onChange={(e) => setDraft({ ...form, region: e.target.value })}
              placeholder="e.g. North, Nairobi"
              required
              disabled={!canEdit}
              className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ithina-border bg-ithina-panel p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="size-5 text-ithina-purple" aria-hidden />
          <h3 className="text-sm font-bold text-white">Regional</h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              htmlFor="store-currency"
              className="flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <Globe className="size-3.5" aria-hidden />
              Currency
            </label>
            <Input
              id="store-currency"
              value={form.currency}
              onChange={(e) => setDraft({ ...form, currency: e.target.value })}
              placeholder="e.g. USD, EUR"
              required
              disabled={!canEdit}
              className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="store-dimensions"
              className="flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <Maximize className="size-3.5" aria-hidden />
              Default Dimension Unit
            </label>
            <select
              id="store-dimensions"
              value={form.defaultDimensions}
              onChange={(e) =>
                setDraft({
                  ...form,
                  defaultDimensions: e.target.value as StoreDimensionUnit,
                })
              }
              disabled={!canEdit}
              className="h-11 w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:border-ithina-purple focus-visible:ring-2 focus-visible:ring-ithina-purple/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {STORE_DIMENSION_UNITS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {canEdit && (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending || !isDirty}
            className="h-11 min-w-[170px] gap-2 rounded-xl bg-ithina-purple font-bold text-white shadow-[0_0_16px_rgba(168,85,247,0.25)] hover:bg-ithina-purple-hover"
          >
            {updateMutation.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            Save Configuration
          </Button>
        </div>
      )}
    </form>
  );
}
