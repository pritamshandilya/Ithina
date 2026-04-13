import { ArrowUpRight, Bell, CircleCheck, Clock, ShieldCheck, Store, Users } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOrganizationOverviewStats } from "@/hooks/use-organization-overview";
import { useStoresList } from "@/hooks/use-stores";
import { StoreContext } from "@/lib/store-context";
import { cn } from "@/lib/utils";

type StatConfig = {
  label: string;
  value: string;
  statusText: string;
  statusClass: string;
  icon: typeof Store;
  iconWrapClass: string;
  iconClass: string;
  to?: "/admin/stores" | "/admin/users";
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: orgStatsData } = useOrganizationOverviewStats();
  const { data: stores = [] } = useStoresList();

  const stats = useMemo<StatConfig[]>(() => {
    const totalStores = orgStatsData?.totalStores ?? 0;
    const activeStores = orgStatsData?.activeStores ?? 0;
    const totalUsers = orgStatsData?.totalUsers ?? 0;
    const pendingApprovals = orgStatsData?.pendingApprovals ?? 0;
    const reviewedAccepted = orgStatsData?.reviewedAccepted ?? 0;
    const reviewedRejected = orgStatsData?.reviewedRejected ?? 0;
    const reviewedTotal = reviewedAccepted + reviewedRejected;

    const usersStatusText = orgStatsData?.trendUsersText ?? "—";
    const usersStatusClass =
      totalUsers > 0 && (orgStatsData?.activeUsers ?? 0) === totalUsers
        ? "text-ithina-purple"
        : "text-slate-400";

    const storesStatusText = orgStatsData?.trendStoresText ?? "—";
    const storesStatusClass =
      totalStores > 0 && activeStores === totalStores ? "text-emerald-400" : "text-amber-500";

    const pendingStatusText =
      pendingApprovals > 0 ? "Needs Action" : totalStores === 0 ? "—" : "All Clear";
    const pendingStatusClass = pendingApprovals > 0 ? "text-amber-500" : "text-emerald-400";

    const arLabel = `${reviewedAccepted}A/${reviewedRejected}R`;

    return [
      {
        label: "Total Users",
        value: String(totalUsers),
        statusText: usersStatusText,
        statusClass: usersStatusClass,
        icon: Users,
        iconWrapClass: "border-violet-500/25 bg-violet-500/10",
        iconClass: "text-violet-400",
        to: "/admin/users",
      },
      {
        label: "Active Stores",
        value: String(activeStores),
        statusText: storesStatusText,
        statusClass: storesStatusClass,
        icon: Store,
        iconWrapClass: "border-emerald-500/25 bg-emerald-500/10",
        iconClass: "text-emerald-400",
        to: "/admin/stores",
      },
      {
        label: "Pending Approvals",
        value: String(pendingApprovals),
        statusText: pendingStatusText,
        statusClass: pendingStatusClass,
        icon: Clock,
        iconWrapClass: "border-amber-500/25 bg-amber-500/10",
        iconClass: "text-amber-400",
      },
      {
        label: "Reviewed (A/R)",
        value: String(reviewedTotal),
        statusText: arLabel,
        statusClass: "text-ithina-rose",
        icon: ShieldCheck,
        iconWrapClass: "border-ithina-rose/25 bg-ithina-rose/10",
        iconClass: "text-ithina-rose",
      },
    ];
  }, [orgStatsData]);

  const handleStoreCardClick = (storeId: string) => {
    StoreContext.setStoreId(storeId);
    navigate({ to: "/admin/store-dashboard" });
  };

  const openApprovalQueue = () => {
    if (stores.length === 1) {
      StoreContext.setStoreId(stores[0].id);
      navigate({ to: "/admin/approvals" });
      return;
    }
    navigate({ to: "/admin/stores" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="shrink-0 border-b border-border/80 bg-sidebar/70 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-2 sm:gap-3">
            <SidebarTrigger className="mt-1 hidden shrink-0 text-foreground md:inline-flex" />
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                Organization Overview
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Monitor stores, users, and organization-wide activity.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <Button
              type="button"
              variant="outline"
              className="shrink-0 border-border/80"
              onClick={() => navigate({ to: "/admin/stores" })}
            >
              <Store className="mr-2 size-4" aria-hidden />
              Manage Stores
            </Button>
            <div className="flex h-9 items-center border-l border-border/60 pl-3">
              <button
                type="button"
                className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full border border-background bg-destructive text-[9px] font-bold text-destructive-foreground">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="ithina-page flex min-h-0 flex-1 flex-col">
        <div className="ithina-page-inner flex min-h-0 flex-1 flex-col gap-8 pb-8 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => stat.to && navigate({ to: stat.to })}
                  className={cn(stat.to && "cursor-pointer")}
                >
                  <div
                    className={cn(
                      "card-interactive rounded-xl border border-border/90 bg-card p-5 sm:p-6",
                      stat.to && "transition-colors hover:border-ithina-purple/25",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {stat.label}
                        </p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-3xl font-extrabold tracking-[-0.04em] text-white">
                            {stat.value}
                          </span>
                          <span className={cn("text-sm font-semibold tabular-nums", stat.statusClass)}>
                            {stat.statusText}
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-full border",
                          stat.iconWrapClass,
                        )}
                        aria-hidden
                      >
                        <Icon className={cn("size-5", stat.iconClass)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="ithina-overline mb-1">Store Directory</p>
                <h2 className="text-xl font-semibold text-white">Stores</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/stores" })}>
                Manage All Stores
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.12 + index * 0.05 }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleStoreCardClick(store.id);
                      }
                    }}
                    className="group card-interactive cursor-pointer rounded-xl border border-border/90 bg-card"
                    onClick={() => handleStoreCardClick(store.id)}
                  >
                    <div className="border-b border-border/40 px-5 pb-2 pt-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-white/6 bg-secondary p-2.5 transition-colors group-hover:border-accent/20 group-hover:bg-accent/10">
                            <Store className="size-5 text-muted-foreground transition-colors group-hover:text-accent" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white">{store.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {store.address?.trim() ? store.address : "Retail Store"}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-2">
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Compliance
                          </p>
                          <p className="mt-2 text-sm font-bold text-chart-2">—</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Active Audits
                          </p>
                          <p className="mt-2 text-sm font-bold text-white">—</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {stores.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stores yet. Create one from Stores.</p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Admins see pending maker submissions and who approved or rejected them (checker or admin).
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-2 border-border/80"
                onClick={openApprovalQueue}
              >
                <CircleCheck className="size-4" aria-hidden />
                Open Approval Queue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
