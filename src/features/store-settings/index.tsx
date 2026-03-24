import { Settings, Store as StoreIcon, Users } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useStoreProfile } from "@/hooks/use-store-settings";
import { cn } from "@/lib/utils";

import { StoreProfileTab } from "./components/store-profile-tab";
import { StoreStaffTab } from "./components/store-staff-tab";

type TabId = "profile" | "team";

const TABS: { id: TabId; label: string; icon: typeof StoreIcon }[] = [
  { id: "profile", label: "Store Profile", icon: StoreIcon },
  { id: "team", label: "Staff", icon: Users },
];

/** Store configuration — layout aligned with POG `StoreConfigurationPage` (profile + staff). */
export default function StoreSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { data: profile, isLoading } = useStoreProfile();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6 pb-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-ithina-purple/25 bg-ithina-purple/10">
              <Settings className="size-4 text-ithina-purple" aria-hidden />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Store Settings</h1>
              <p className="text-xs text-slate-500">
                Profile, regional defaults, and staff assignments for the active store.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full max-w-md rounded-xl bg-ithina-border/40" />
              <Skeleton className="h-10 w-72 rounded-xl bg-ithina-border/40" />
            </div>
          ) : profile ? (
            <div className="rounded-2xl border border-ithina-border bg-ithina-panel/50 px-4 py-3 sm:px-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Active store</p>
              <p className="text-sm font-semibold text-white">
                {profile.name}{" "}
                <span className="font-mono text-slate-500">· #{profile.id}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{profile.address}</p>
            </div>
          ) : null}

          <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-ithina-border bg-ithina-bg/40 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  activeTab === id
                    ? "border border-ithina-purple/30 bg-ithina-purple/15 text-white shadow-sm"
                    : "text-slate-500 hover:bg-ithina-panel hover:text-white",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && <StoreProfileTab />}
          {activeTab === "team" && <StoreStaffTab />}
        </div>
      </div>
    </div>
  );
}
