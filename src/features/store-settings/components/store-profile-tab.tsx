import { useNavigate } from "@tanstack/react-router";
import { Info, MapPin, Maximize, Pencil, Power, Save, Store as StoreIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { STORE_DIMENSION_UNITS, type StoreDimensionUnit } from "@/constants/dimensions";
import { useUpdateAdminStoreActive } from "@/hooks/use-admin-stores";
import { useActiveStoreId, useStoreProfile, useUpdateStoreProfile } from "@/hooks/use-store-settings";
import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";
import { StoreContext } from "@/lib/store-context";
import { cn } from "@/lib/utils";

type Props = {
  canEdit?: boolean;
};

export function StoreProfileTab({ canEdit = true }: Props) {
  const navigate = useNavigate();
  const activeStoreId = useActiveStoreId();
  const { data: profile, isLoading } = useStoreProfile();
  const updateMutation = useUpdateStoreProfile();
  const toggleStoreActiveMutation = useUpdateAdminStoreActive();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    region: "",
    currency: "USD",
    defaultDimensions: "mm" as StoreDimensionUnit,
  });
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        address: profile.address,
        region: profile.region,
        currency: profile.currency,
        defaultDimensions: profile.defaultDimensions,
      });
    }
  }, [profile]);

  useEffect(() => {
    setIsEditing(false);
  }, [profile?.id]);

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[320px] w-full rounded-2xl bg-ithina-border/40" />
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !isEditing) return;
    setBanner(null);
    updateMutation.mutate(form, {
      onSuccess: () => {
        setBanner({ type: "ok", text: "Store configuration was updated." });
        setIsEditing(false);
      },
      onError: () => {
        setBanner({ type: "err", text: "Could not save settings. Try again." });
      },
    });
  };

  const startEdit = () => {
    setBanner(null);
    setForm({
      name: profile.name,
      address: profile.address,
      region: profile.region,
      currency: profile.currency,
      defaultDimensions: profile.defaultDimensions,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({
      name: profile.name,
      address: profile.address,
      region: profile.region,
      currency: profile.currency,
      defaultDimensions: profile.defaultDimensions,
    });
    setIsEditing(false);
    setBanner(null);
  };

  const deactivateStore = () => {
    if (!activeStoreId || !profile?.isActive) return;
    if (
      !window.confirm(
        `Deactivate "${profile.name}"? Staff will lose access until the store is reactivated.`,
      )
    ) {
      return;
    }
    setBanner(null);
    toggleStoreActiveMutation.mutate(
      { storeId: activeStoreId, is_active: false },
      {
        onSuccess: () => {
          StoreContext.clearStoreId();
          setIsEditing(false);
          void navigate({ to: "/admin/dashboard" });
        },
        onError: () => {
          setBanner({ type: "err", text: "Could not deactivate the store. Try again." });
        },
      },
    );
  };

  const activateStore = () => {
    if (!activeStoreId || profile?.isActive) return;
    if (!window.confirm(`Activate "${profile.name}"?`)) {
      return;
    }
    setBanner(null);
    toggleStoreActiveMutation.mutate(
      { storeId: activeStoreId, is_active: true },
      {
        onSuccess: () => {
          setBanner({ type: "ok", text: "Store is active again." });
          setIsEditing(false);
        },
        onError: () => {
          setBanner({ type: "err", text: "Could not activate the store. Try again." });
        },
      },
    );
  };

  const disabled = !canEdit || !isEditing;
  const footerBusy = updateMutation.isPending || toggleStoreActiveMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {banner ? (
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
      ) : null}

      <section className="rounded-2xl border border-ithina-border bg-ithina-panel/80 shadow-lg">
        <div className="flex flex-col gap-3 border-b border-ithina-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <StoreIcon className="size-5 text-ithina-purple" aria-hidden />
            <h3 className="text-sm font-bold text-white">Store Profile</h3>
          </div>
          {canEdit && !isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startEdit}
              className="gap-1.5 border-ithina-border bg-transparent text-slate-200 hover:bg-ithina-purple/10 hover:text-white"
            >
              <Pencil className="size-4" aria-hidden />
              Edit
            </Button>
          ) : null}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="store-name"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Store name
              </label>
              <Input
                id="store-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={disabled}
                required
                className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="store-currency"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Currency
              </label>
              <select
                id="store-currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                disabled={disabled}
                className="h-11 w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:border-ithina-purple focus-visible:ring-2 focus-visible:ring-ithina-purple/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {PREDEFINED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="store-address"
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              <MapPin className="size-3.5" aria-hidden />
              Address
            </label>
            <Input
              id="store-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={disabled}
              required
              className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="store-region"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Region
              </label>
              <Input
                id="store-region"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                disabled={disabled}
                required
                className="h-11 rounded-lg border-ithina-border bg-ithina-bg text-white placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-ithina-purple/30"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="store-dimensions"
                className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                <Maximize className="size-3.5" aria-hidden />
                Default dimension unit
              </label>
              <select
                id="store-dimensions"
                value={form.defaultDimensions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultDimensions: e.target.value as StoreDimensionUnit,
                  })
                }
                disabled={disabled}
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
        </div>

        {canEdit && isEditing ? (
          <div className="flex flex-col gap-3 border-t border-ithina-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <div className="order-2 sm:order-1">
              {profile.isActive ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={footerBusy}
                  onClick={deactivateStore}
                  className="border-transparent bg-ithina-rose font-semibold text-white hover:bg-ithina-rose/90"
                >
                  Deactivate store
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={footerBusy}
                  onClick={activateStore}
                  className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                >
                  <Power className="size-4" aria-hidden />
                  Activate store
                </Button>
              )}
            </div>
            <div className="order-1 flex flex-wrap justify-end gap-2 sm:order-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                disabled={footerBusy}
                className="gap-1.5 border-ithina-border"
              >
                <X className="size-4" aria-hidden />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={footerBusy}
                className="gap-1.5 bg-ithina-purple font-semibold text-white hover:bg-ithina-purple-hover"
              >
                {updateMutation.isPending ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="size-4" aria-hidden />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {!canEdit ? (
        <p className="text-center text-xs text-slate-500">
          <Info className="mr-1 inline size-3.5 align-text-bottom opacity-70" aria-hidden />
          You can view store details here. Contact an admin to make changes.
        </p>
      ) : null}
    </form>
  );
}
