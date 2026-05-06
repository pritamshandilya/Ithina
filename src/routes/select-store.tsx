import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Loader2,
  Store as StoreIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import logo from "@/assets/logo.avif";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Button } from "@/components/ui/button";
import { AuthSessionService } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import { useStores } from "@/queries/checker";
import type { BeforeLoadArgs } from "@/routes/__root";
import type { Store } from "@/types/checker";

export const Route = createFileRoute("/select-store")({
  beforeLoad: ({ location }: BeforeLoadArgs) => {
    const user = AuthSessionService.getCurrentUser();
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location?.href ?? "" },
      });
    }
  },
  component: SelectStorePage,
});

function SelectStorePage() {
  const { setSelectedStore, selectedStore } = useStore();
  const { data: stores, isLoading } = useStores();
  const navigate = useNavigate();
  const user = AuthSessionService.getCurrentUser();
  const [hasNotified, setHasNotified] = useState(false);
  const isAutoRedirecting = Boolean(stores && stores.length === 1);

  useEffect(() => {
    if (stores && stores.length === 1) {
      const store = stores[0];
      setSelectedStore(store);
      const target = AuthSessionService.getDashboardRoute(
        user?.role || "maker",
      );
      navigate({ to: target, replace: true });
    }
  }, [stores, setSelectedStore, navigate, user?.role]);

  const handleSelect = (store: Store) => {
    setSelectedStore(store);
    const target = AuthSessionService.getDashboardRoute(user?.role || "maker");
    navigate({ to: target, replace: true });
  };

  const handleNotifyAdmin = () => {
    setHasNotified(true);
  };

  const panelState =
    isLoading || isAutoRedirecting
      ? "loading"
      : stores && stores.length === 0
        ? "empty"
        : "stores";
  const panelWidth = panelState === "stores" ? "max-w-xl" : "max-w-md";

  return (
    <SelectStoreShell panelWidth={panelWidth}>
      <AnimatePresence mode="wait" initial={false}>
        {panelState === "loading" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="ithina-auth-panel flex flex-col items-center gap-4 px-8 py-10 text-center">
              <Loader2 className="text-accent size-10 animate-spin" />
              <p className="text-muted-foreground font-mono text-[11px] tracking-[0.18em] uppercase">
                Initializing your workspace...
              </p>
            </div>
          </motion.div>
        ) : panelState === "empty" ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="ithina-auth-panel space-y-10 text-center">
              <div className="space-y-4">
                <div className="border-accent/20 bg-accent/10 text-accent mb-2 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
                  <Building2 className="size-3" />
                  {user?.organization?.name || "Corporate"} Network
                </div>
                <div className="flex justify-center">
                  <div className="border-action-warning/20 bg-action-warning/10 flex size-16 items-center justify-center rounded-2xl border shadow-[0_24px_60px_rgba(3,8,20,0.22)]">
                    <Loader2 className="text-action-warning size-8 animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl leading-none font-extrabold tracking-[-0.04em] text-white">
                    Awaiting Assignment
                  </h2>
                  <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                    Deployment status: Pending
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Hi {user?.firstName}, your account is active and verified.
                  However, you haven&apos;t been assigned to a retail store yet.
                  One of your organization admins will grant you access to a
                  specific branch shortly.
                </p>
              </div>

              <div className="bg-card/85 space-y-4 rounded-2xl border border-white/6 p-6 shadow-[0_24px_60px_rgba(3,8,20,0.32)] backdrop-blur-xl">
                {!hasNotified ? (
                  <>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Need access urgently? Use the secure channel below to
                      notify your administrator.
                    </p>
                    <Button onClick={handleNotifyAdmin} className="h-11 w-full">
                      <Building2 className="mr-2 size-4" />
                      Request Store Assignment
                    </Button>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-chart-2 flex flex-col items-center gap-3 py-2"
                  >
                    <div className="border-chart-2/20 bg-chart-2/10 flex size-10 items-center justify-center rounded-full border">
                      <ArrowRight className="size-5" />
                    </div>
                    <p className="text-sm font-medium">
                      Notification sent to admin
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
                <div className="flex items-center gap-2">
                  <div className="bg-chart-2/60 size-2 animate-pulse rounded-full" />
                  <span className="text-muted-foreground font-mono text-[10px] tracking-[0.14em] uppercase">
                    Encrypted session
                  </span>
                </div>
                <button
                  onClick={() => AuthSessionService.logout()}
                  className="text-muted-foreground border-b border-transparent pb-0.5 text-xs font-medium transition-colors hover:border-white/20 hover:text-white"
                >
                  Log Out & Exit
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stores"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mx-auto w-full max-w-lg space-y-8">
              <div className="space-y-4 text-center">
                <div className="border-accent/20 bg-accent/10 text-accent mb-2 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
                  <Building2 className="size-3" />
                  {user?.organization?.name || "Corporate"} Network
                </div>

                <h2 className="text-4xl font-extrabold tracking-[-0.05em] text-white">
                  Select Store
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Welcome back, {user?.firstName}.
                  <br />
                  Please select a branch to continue.
                </p>
              </div>

              <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-2">
                <AnimatePresence>
                  {stores?.map((store, index) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => handleSelect(store)}
                      className={cn(
                        "group border-border bg-card/80 hover:border-accent/30 hover:bg-accent/5 relative flex items-center justify-between rounded-xl border p-4 transition-all duration-300",
                        selectedStore?.id === store.id &&
                          "border-accent/40 bg-accent/10",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="bg-secondary group-hover:border-accent/20 group-hover:bg-accent/10 flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/6 transition-all duration-300">
                          <StoreIcon className="text-muted-foreground group-hover:text-accent size-5" />
                        </div>
                        <div className="min-w-0 text-left">
                          <h3 className="truncate text-base leading-tight font-semibold text-white">
                            {store.name}
                          </h3>
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {store.address || "Main Branch"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {store.pendingAuditCount &&
                          store.pendingAuditCount > 0 && (
                            <span className="border-accent/20 bg-accent/10 text-accent rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                              {store.pendingAuditCount} AUDITS
                            </span>
                          )}
                        <div className="bg-secondary/80 flex size-8 items-center justify-center rounded-lg border border-white/6 opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <ArrowRight className="text-accent size-4" />
                        </div>
                      </div>

                      {selectedStore?.id === store.id && (
                        <div className="bg-accent absolute top-1/2 -left-1 h-8 w-1 -translate-y-1/2 rounded-full" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-end border-t border-white/5 pt-8">
                <button
                  onClick={() => AuthSessionService.logout()}
                  className="text-muted-foreground text-xs font-medium transition-colors hover:text-white"
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SelectStoreShell>
  );
}

function SelectStoreShell({
  children,
  panelWidth,
}: {
  children: ReactNode;
  panelWidth: string;
}) {
  return (
    <div className="bg-background flex min-h-screen w-full overflow-hidden">
      <AuthBrandPanel
        titleLines={["Planogram", "Assistant (YOLO)"]}
        subtitle="AI-powered retail shelf analysis & optimization platform"
        stats={[
          { value: "AI", label: "Shelf Analysis" },
          { value: "3D", label: "Visualization" },
          { value: "100%", label: "Compliance" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full items-center justify-center p-8 lg:w-1/2"
      >
        <motion.div
          layout
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn("mx-auto w-full space-y-8", panelWidth)}
        >
          <div className="flex justify-center lg:hidden">
            <div className="border-accent/15 bg-accent/10 flex h-16 w-16 items-center justify-center rounded-xl border p-3 backdrop-blur-sm">
              <img
                src={logo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
