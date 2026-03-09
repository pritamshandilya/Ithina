import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Store, TrendingUp, Users } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/providers/store";
import { useOrgStores, useOrgUsers } from "@/queries/checker";
import type { Store as StoreType } from "@/types/checker";

export const Route = createFileRoute("/admin/dashboard/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stores = [] } = useOrgStores();
  const { data: users = [] } = useOrgUsers();
  const { setSelectedStore } = useStore();
  const navigate = useNavigate();

  const handleStoreClick = (store: StoreType) => {
    setSelectedStore(store);
    navigate({ to: "/admin/$storeId/dashboard", params: { storeId: store.name } });
  };

  const stats: Array<{
    label: string;
    value: string | number;
    icon: typeof Store;
    color: string;
    bg: string;
    to?: "/admin/stores" | "/admin/users";
  }> = [
    {
      label: "Total Stores",
      value: stores.length,
      icon: Store,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      to: "/admin/stores",
    },
    {
      label: "Users",
      value: users.length,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
      to: "/admin/users",
    },
    {
      label: "Compliance Rate",
      value: "94.2%",
      icon: TrendingUp,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Store Management",
      value: "Open",
      icon: Store,
      color: "text-muted-foreground",
      bg: "bg-muted-foreground/10",
      to: "/admin/stores",
    },
  ];

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Organization Overview"
          description="Monitor stores, users, and organization-wide activity."
          icon={TrendingUp}
          iconColor="text-blue-500"
        >
          <Button
            variant="outline"
            className="bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => navigate({ to: "/admin/stores" })}
          >
            <Store className="mr-2 size-4" />
            Manage Stores
          </Button>
        </PageHeader>
      }
    >
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => stat.to && navigate({ to: stat.to })}
                className={stat.to ? "cursor-pointer" : ""}
              >
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm hover:bg-white/5 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-xl p-3 ${stat.bg}`}>
                        <stat.icon className={`size-6 ${stat.color}`} />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="size-3" />
                        +2.5%
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {stat.value}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Stores</h2>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => navigate({ to: "/admin/stores" })}
              >
                Manage All Stores
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store, index: number) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-white/5 hover:border-purple-500/50"
                    onClick={() => handleStoreClick(store)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-white/5 p-2 group-hover:bg-purple-500/10 transition-colors">
                            <Store className="size-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                          </div>
                          <div>
                            <CardTitle className="text-base text-white">
                              {store.name}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              {store.address || "Retail Store"}
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Compliance
                          </p>
                          <p className="text-sm font-bold text-emerald-500">92%</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Active Audits
                          </p>
                          <p className="text-sm font-bold text-white">4</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
