import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Loader2, Store as StoreIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { PromoBrandingPanel } from "@/components/auth/promo-branding-panel";
import ithinaLogo from "@/assets/ithina_logo.png";
import { getDashboardUrlForRole, PromoAuthService } from "@/lib/auth/promo-auth";
import { StoreContext } from "@/lib/store-context";
import { cn } from "@/lib/utils";
import { useStoresList } from "@/hooks/use-stores";
import type { Store } from "@/services/stores";

export const Route = createFileRoute("/select-store")({
  beforeLoad: () => {
    if (!PromoAuthService.isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
    const user = PromoAuthService.getCurrentUser();
    if (user?.role === "admin") {
      throw redirect({ to: "/admin/dashboard" });
    }
    if (user?.role !== "maker" && user?.role !== "checker") {
      throw redirect({ to: getDashboardUrlForRole(user?.role ?? "maker") });
    }
  },
  component: SelectStorePage,
});

function SelectStorePage() {
  const navigate = useNavigate();
  const user = PromoAuthService.getCurrentUser()!;
  const { data: stores = [], isLoading, isError } = useStoresList();

  const isAutoRedirecting = Boolean(!isLoading && stores.length === 1);

  useEffect(() => {
    if (!stores || stores.length !== 1) return;
    const store = stores[0];
    StoreContext.setStoreId(store.id);
    navigate({ to: getDashboardUrlForRole(user.role), replace: true });
  }, [stores, navigate, user.role]);

  const handleSelect = (store: Store) => {
    StoreContext.setStoreId(store.id);
    navigate({ to: getDashboardUrlForRole(user.role), replace: true });
  };

  const panelState = isLoading || isAutoRedirecting ? "loading" : stores.length === 0 ? "empty" : "stores";
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
            className="flex flex-col items-center gap-4 px-8 py-10 text-center"
          >
            <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Loading your stores…
            </p>
          </motion.div>
        ) : panelState === "empty" ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-8 px-6 py-8 text-center sm:px-8"
          >
            <div className="space-y-4">
              <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-md border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-purple-300">
                <Building2 className="size-3" aria-hidden />
                {user.organization?.name ?? "Organization"}
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                No store access yet
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Hi {user.firstName}, your account is active but you don&apos;t have any stores assigned. Ask an
                organization admin to assign you to a store.
              </p>
              {isError ? (
                <p className="text-sm text-rose-400">Could not load stores. Please try again later.</p>
              ) : null}
            </div>
            <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">
                Signed in as {user.email}
              </span>
              <button
                type="button"
                onClick={() => void PromoAuthService.logout().then(() => navigate({ to: "/login" }))}
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Log out
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stores"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mx-auto w-full max-w-lg space-y-8 px-4 py-6 sm:px-6"
          >
            <div className="space-y-4 text-center">
              <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-md border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-purple-300">
                <Building2 className="size-3" aria-hidden />
                {user.organization?.name ?? "Organization"}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Select store</h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Welcome back, {user.firstName}.
                <br />
                Choose a store to open your workspace.
              </p>
            </div>

            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              <AnimatePresence>
                {stores.map((store, index) => (
                  <motion.button
                    key={store.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.04 }}
                    onClick={() => handleSelect(store)}
                    className="group flex w-full items-center justify-between rounded-xl border border-border bg-card/80 p-4 text-left transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/80 transition-all group-hover:border-primary/30 group-hover:bg-primary/10">
                        <StoreIcon className="size-5 text-muted-foreground group-hover:text-primary" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">{store.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {store.address?.trim() ? store.address : "Retail location"}
                        </p>
                      </div>
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 opacity-0 transition-all group-hover:opacity-100">
                      <ArrowRight className="size-4 text-primary" aria-hidden />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-end border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => void PromoAuthService.logout().then(() => navigate({ to: "/login" }))}
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Log out
              </button>
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
      <PromoBrandingPanel />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full items-center justify-center bg-background p-8 lg:w-1/2"
      >
        <motion.div
          layout
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn("mx-auto w-full space-y-8", panelWidth)}
        >
          <div className="flex justify-center lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black/40 p-3 backdrop-blur-sm">
              <img alt="Ithina" className="h-full w-full object-contain" src={ithinaLogo} />
            </div>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
