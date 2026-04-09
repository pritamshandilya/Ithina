import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/providers/store";
import { AuthSessionService } from "@/lib/auth/session";
import { useStores } from "@/queries/checker";
import { useEffect, useState, type ReactNode } from "react";
import { Building2, Store as StoreIcon, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.avif";
import type { BeforeLoadArgs } from "@/routes/__root";
import type { Store } from "@/types/checker";

export const Route = createFileRoute("/select-store")({
  beforeLoad: ({ location }: BeforeLoadArgs) => {
    const user = AuthSessionService.getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location?.href ?? "" } });
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
      const target = AuthSessionService.getDashboardRoute(user?.role || "maker");
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

  const panelState = isLoading || isAutoRedirecting ? "loading" : stores && stores.length === 0 ? "empty" : "stores";
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
              <Loader2 className="size-10 animate-spin text-accent" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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
                <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-md border border-accent/20 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  <Building2 className="size-3" />
                  {user?.organization?.name || "Corporate"} Network
                </div>
                <div className="flex justify-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl border border-action-warning/20 bg-action-warning/10 shadow-[0_24px_60px_rgba(3,8,20,0.22)]">
                    <Loader2 className="size-8 animate-spin text-action-warning" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold leading-none tracking-[-0.04em] text-white">Awaiting Assignment</h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Deployment status: Pending</p>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  Hi {user?.firstName}, your account is active and verified. However, you haven&apos;t been assigned to a retail store yet.
                  One of your organization admins will grant you access to a specific branch shortly.
                </p>
              </div>

              <div className="rounded-2xl border border-white/6 bg-card/85 p-6 space-y-4 backdrop-blur-xl shadow-[0_24px_60px_rgba(3,8,20,0.32)]">
                {!hasNotified ? (
                  <>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Need access urgently? Use the secure channel below to notify your administrator.
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
                    className="flex flex-col items-center gap-3 py-2 text-chart-2"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full border border-chart-2/20 bg-chart-2/10">
                      <ArrowRight className="size-5" />
                    </div>
                    <p className="text-sm font-medium">Notification sent to admin</p>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-chart-2/60 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Encrypted session</span>
                </div>
                <button
                  onClick={() => AuthSessionService.logout()}
                  className="border-b border-transparent pb-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
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
                <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-md border border-accent/20 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  <Building2 className="size-3" />
                  {user?.organization?.name || "Corporate"} Network
                </div>

                <h2 className="text-4xl font-extrabold tracking-[-0.05em] text-white">Select Store</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Welcome back, {user?.firstName}.
                  <br />
                  Please select a branch to continue.
                </p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                <AnimatePresence>
                  {stores?.map((store, index) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => handleSelect(store)}
                      className={cn(
                        "group relative flex items-center justify-between rounded-xl border border-border bg-card/80 p-4 transition-all duration-300 hover:border-accent/30 hover:bg-accent/5",
                        selectedStore?.id === store.id && "border-accent/40 bg-accent/10"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/6 bg-secondary transition-all duration-300 group-hover:border-accent/20 group-hover:bg-accent/10">
                          <StoreIcon className="size-5 text-muted-foreground group-hover:text-accent" />
                        </div>
                        <div className="min-w-0 text-left">
                          <h3 className="truncate text-base font-semibold leading-tight text-white">
                            {store.name}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {store.address || "Main Branch"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {store.pendingAuditCount && store.pendingAuditCount > 0 && (
                          <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {store.pendingAuditCount} AUDITS
                          </span>
                        )}
                        <div className="flex size-8 items-center justify-center rounded-lg border border-white/6 bg-secondary/80 opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <ArrowRight className="size-4 text-accent" />
                        </div>
                      </div>

                      {selectedStore?.id === store.id && (
                        <div className="absolute -left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-accent" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-end border-t border-white/5 pt-8">
                <button
                  onClick={() => AuthSessionService.logout()}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-white"
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

function SelectStoreShell({ children, panelWidth }: { children: ReactNode; panelWidth: string }) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative hidden items-center justify-center overflow-hidden border-r border-border bg-sidebar lg:flex lg:w-1/2">
        <div className="relative z-10 max-w-lg px-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-accent/15 bg-card shadow-[0_24px_60px_rgba(3,8,20,0.42)]"
          >
            <img alt="CBAI Logo" className="h-full w-full object-contain p-3" src={logo} />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4 text-5xl font-extrabold leading-tight tracking-[-0.06em] text-white"
          >
            Planogram
            <br />
            Assistant
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 text-lg leading-8 text-muted-foreground"
          >
            AI-powered retail shelf analysis & optimization platform
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center gap-8 text-center"
          >
            <div className="ithina-panel min-w-28 p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-extrabold tracking-[-0.04em] text-accent">AI</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Shelf Analysis</div>
            </div>
            <div className="ithina-panel min-w-28 p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-extrabold tracking-[-0.04em] text-accent">3D</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Visualization</div>
            </div>
            <div className="ithina-panel min-w-28 p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-extrabold tracking-[-0.04em] text-white">100%</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Compliance</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-[11px] text-muted-foreground/60">
          Powered by Gemini AI
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full items-center justify-center p-8 lg:w-1/2"
      >
        <motion.div layout transition={{ duration: 0.3, ease: "easeOut" }} className={cn("mx-auto w-full space-y-8", panelWidth)}>
          <div className="flex justify-center lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 p-3 backdrop-blur-sm">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          </div>

          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
