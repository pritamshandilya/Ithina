import { useMemo, useState } from "react";
import { AlertCircle, Loader2, MapPin, Plus, Store, Trash2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCreateAdminStore, useAdminStores, useUpdateAdminStoreActive, type StoreWithStaffCount } from "@/hooks/use-admin-stores";
import { cn } from "@/lib/utils";

interface NewStoreForm {
  name: string;
  address: string;
  region: string;
  currency: string;
}

const EMPTY_FORM: NewStoreForm = {
  name: "",
  address: "",
  region: "",
  currency: "KES",
};

export default function AdminStoresPage() {
  const {
    data: stores = [],
    isLoading,
    isError,
    error,
  } = useAdminStores();

  const createStoreMutation = useCreateAdminStore();
  const updateStoreActiveMutation = useUpdateAdminStoreActive();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewStoreForm>(EMPTY_FORM);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.name.trim() &&
          form.address.trim() &&
          form.region.trim() &&
          form.currency.trim(),
      ),
    [form.address, form.currency, form.name, form.region],
  );

  async function handleCreate() {
    if (!canSubmit) return;
    await createStoreMutation.mutateAsync({
      name: form.name.trim(),
      address: form.address.trim(),
      region: form.region.trim(),
      currency: form.currency.trim(),
      is_active: true,
    });
    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  function handleToggleActive(store: StoreWithStaffCount) {
    if (updateStoreActiveMutation.isPending) return;
    updateStoreActiveMutation.mutate({
      storeId: store.id,
      is_active: !store.is_active,
    });
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6 pb-10">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl border border-ithina-emerald/25 bg-ithina-emerald/10">
                  <Store className="size-4 text-ithina-emerald" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">Stores</h1>
                  <p className="text-xs text-slate-500">
                    Manage stores across your organization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover"
              >
                <Plus className="size-4" />
                Add Store
              </button>
            </div>

            {/* Store list */}
            <div className="space-y-3">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="rounded-2xl border px-6 py-5">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-4 w-48 rounded-md" />
                        <Skeleton className="h-3 w-64 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && isError && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-6 py-4 text-rose-300">
                  <AlertCircle className="size-5 shrink-0" />
                  <span className="text-sm">
                    {(error as Error)?.message ?? "Failed to load stores"}
                  </span>
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  {stores.map((store) => (
                    <div
                      key={store.id}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border px-6 py-5 transition-all",
                        store.is_active
                          ? "border-ithina-border bg-ithina-panel"
                          : "border-ithina-border/50 bg-ithina-panel/50 opacity-60",
                      )}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ithina-emerald/20 bg-ithina-emerald/10">
                        <Store className="size-4 text-ithina-emerald" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{store.name}</p>
                          <span
                            className={cn(
                              "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest",
                              store.is_active
                                ? "text-ithina-emerald bg-ithina-emerald/10 border-ithina-emerald/20"
                                : "text-slate-500 bg-white/5 border-white/10",
                            )}
                          >
                            {store.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="size-3 shrink-0" />
                          {store.address}
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-600">
                          {store.region} · {store.currency} · {store.staffCount} staff
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(store)}
                          disabled={updateStoreActiveMutation.isPending}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                            store.is_active
                              ? "border-ithina-rose/20 bg-ithina-rose/5 text-ithina-rose hover:bg-ithina-rose/15"
                              : "border-ithina-emerald/20 bg-ithina-emerald/5 text-ithina-emerald hover:bg-ithina-emerald/15",
                          )}
                        >
                          {store.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-[6px]"
          onClick={() => setShowModal(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[20px] border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="flex items-center justify-between border-b border-ithina-border px-7 py-5">
              <h3 className="text-base font-bold text-white">Add New Store</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <Trash2 className="size-5" />
              </button>
            </header>

            <div className="space-y-5 px-7 py-6">
              {[
                { key: "name" as const, label: "Store Name", placeholder: "e.g. CBD Flagship" },
                { key: "address" as const, label: "Address", placeholder: "Full address" },
                { key: "region" as const, label: "Region", placeholder: "e.g. Nairobi" },
                { key: "currency" as const, label: "Currency", placeholder: "e.g. KES" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <footer className="flex justify-end gap-3 border-t border-ithina-border px-7 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!canSubmit || createStoreMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createStoreMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="size-4" />
                )}
                Add Store
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
