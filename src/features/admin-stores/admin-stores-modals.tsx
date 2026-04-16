import { Check, Loader2, Store, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { STORE_DIMENSION_UNITS, type StoreDimensionUnit } from "@/constants/dimensions";
import type { StoreWithStaffCount } from "@/hooks/use-admin-stores";
import { PREDEFINED_CURRENCIES } from "@/lib/constants/currencies";

/** Client preference until promo API persists default fixture units per store. */
const DEFAULT_DIM_STORAGE_KEY = "dd-promo:store-default-dimension";

function readStoredDefaultDimension(storeId: string): StoreDimensionUnit {
  try {
    const raw = localStorage.getItem(`${DEFAULT_DIM_STORAGE_KEY}:${storeId}`);
    if (raw && (STORE_DIMENSION_UNITS as readonly string[]).includes(raw)) {
      return raw as StoreDimensionUnit;
    }
  } catch {
    /* ignore */
  }
  return "inch";
}

function writeStoredDefaultDimension(storeId: string, unit: StoreDimensionUnit) {
  try {
    localStorage.setItem(`${DEFAULT_DIM_STORAGE_KEY}:${storeId}`, unit);
  } catch {
    /* ignore */
  }
}

const editControlClass =
  "h-11 w-full min-w-0 rounded-lg border border-ithina-border bg-ithina-bg px-3 text-sm font-medium text-white shadow-sm outline-none transition-colors placeholder:text-slate-500 focus-visible:border-ithina-purple focus-visible:ring-2 focus-visible:ring-ithina-purple/30";

const editSelectClass = `${editControlClass} cursor-pointer`;

const labelClass = "text-[11px] font-semibold uppercase tracking-wide text-slate-500";

function RequiredMark() {
  return (
    <span className="text-ithina-purple" aria-hidden>
      {" "}
      *
    </span>
  );
}

interface AdminEditStoreModalProps {
  store: StoreWithStaffCount | null;
  onClose: () => void;
  isPending: boolean;
  error: Error | null;
  onSave: (payload: {
    name: string;
    address: string;
    region: string;
    currency: string;
    is_active: boolean;
  }) => void;
}

export function AdminEditStoreModal({
  store,
  onClose,
  isPending,
  error,
  onSave,
}: AdminEditStoreModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [currency, setCurrency] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [defaultDimensionUnit, setDefaultDimensionUnit] = useState<StoreDimensionUnit>("inch");

  useEffect(() => {
    if (!store) return;
    setName(store.name);
    setAddress(store.address);
    setRegion(store.region);
    setCurrency(store.currency);
    setIsActive(store.is_active);
    setDefaultDimensionUnit(readStoredDefaultDimension(store.id));
  }, [store]);

  const currencyOptions = useMemo(() => {
    if (!store) return [...PREDEFINED_CURRENCIES];
    const list = [...PREDEFINED_CURRENCIES];
    const cur = store.currency.toUpperCase();
    if (cur && !list.includes(cur as (typeof PREDEFINED_CURRENCIES)[number])) {
      return [cur, ...list];
    }
    return list;
  }, [store]);

  if (!store) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-[6px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-store-edit-title"
      >
        <header className="flex items-center justify-between border-b border-ithina-border bg-ithina-panel/25 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ithina-purple/25 bg-ithina-purple/10">
              <Store className="size-4 text-ithina-purple" aria-hidden />
            </div>
            <h3 id="admin-store-edit-title" className="text-lg font-semibold tracking-tight text-white">
              Edit Store
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>
        <form
          className="space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmedName = name.trim();
            const trimmedAddress = address.trim();
            const trimmedRegion = region.trim();
            const trimmedCurrency = currency.trim().toUpperCase();
            if (!trimmedName || !trimmedAddress || !trimmedRegion || !trimmedCurrency) {
              return;
            }
            writeStoredDefaultDimension(store.id, defaultDimensionUnit);
            onSave({
              name: trimmedName,
              address: trimmedAddress,
              region: trimmedRegion,
              currency: trimmedCurrency,
              is_active: isActive,
            });
          }}
        >
          {error ? (
            <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error.message}
            </p>
          ) : null}

          <div className="grid gap-2">
            <label htmlFor="admin-edit-store-name" className={labelClass}>
              Store name
              <RequiredMark />
            </label>
            <input
              id="admin-edit-store-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={editControlClass}
              placeholder="e.g. Downtown Flagship"
              required
              autoComplete="organization"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="admin-edit-store-address" className={labelClass}>
              Address
            </label>
            <input
              id="admin-edit-store-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={editControlClass}
              placeholder="e.g. 100 Main St"
              required
              autoComplete="street-address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="admin-edit-store-region" className={labelClass}>
                Region
              </label>
              <input
                id="admin-edit-store-region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={editControlClass}
                placeholder="e.g. Nairobi"
                required
                autoComplete="address-level1"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="admin-edit-store-status" className={labelClass}>
                Status
                <RequiredMark />
              </label>
              <select
                id="admin-edit-store-status"
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className={editSelectClass}
                required
                aria-label="Store status"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="admin-edit-store-currency" className={labelClass}>
                Currency
                <RequiredMark />
              </label>
              <select
                id="admin-edit-store-currency"
                value={currency.toUpperCase()}
                onChange={(e) => setCurrency(e.target.value)}
                className={editSelectClass}
                required
                aria-label="Store currency"
              >
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="admin-edit-store-dim" className={labelClass}>
                Default dimension unit
                <RequiredMark />
              </label>
              <select
                id="admin-edit-store-dim"
                value={defaultDimensionUnit}
                onChange={(e) => setDefaultDimensionUnit(e.target.value as StoreDimensionUnit)}
                className={editSelectClass}
                required
                aria-label="Default dimension unit"
              >
                {STORE_DIMENSION_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-ithina-border px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ithina-purple px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { AdminStaffStoreModal } from "./admin-store-staff-modal";
