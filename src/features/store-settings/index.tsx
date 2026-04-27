import { Store as StoreIcon, Users } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useActiveStoreId, useStoreProfile } from "@/hooks/use-store-settings";
import { cn } from "@/lib/utils";

import { StoreProfileTab } from "./components/store-profile-tab";
import { StoreStaffTab } from "./components/store-staff-tab";

type TabId = "profile" | "team";

const TABS: { id: TabId; label: string; icon: typeof StoreIcon }[] = [
  { id: "profile", label: "Store Profile", icon: StoreIcon },
  { id: "team", label: "Staff", icon: Users },
];

/** Store configuration — POG-style tabs: profile + staff (active store via X-Store-Id). */
export default function StoreSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const storeId = useActiveStoreId();
  const { data: profile, isLoading, isError, error } = useStoreProfile();

  const noStore = !storeId;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ithina-bg">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6 pb-10">
          {noStore ? (
            <div className="rounded-2xl border border-ithina-border bg-ithina-panel/60 px-6 py-10 text-center">
              <p className="text-sm font-medium text-white">No store selected</p>
              <p className="mt-2 text-xs text-slate-500">
                Choose a store from the sidebar switcher to manage its profile and staff.
              </p>
            </div>
          ) : null}

          {isError && !noStore ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {(error as Error)?.message ?? "Could not load store settings."}
            </div>
          ) : null}

          {!noStore && isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-11 w-72 max-w-full rounded-xl bg-ithina-border/40" />
              <Skeleton className="h-80 w-full rounded-2xl bg-ithina-border/40" />
            </div>
          ) : null}

          {!noStore && !isLoading && profile ? (
            <>
              <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-ithina-border bg-ithina-bg/50 p-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                      activeTab === id
                        ? "border border-ithina-purple/35 bg-ithina-purple text-white shadow-md shadow-ithina-purple/20"
                        : "border border-transparent text-slate-500 hover:bg-ithina-panel hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "profile" && <StoreProfileTab />}
              {activeTab === "team" && <StoreStaffTab />}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
