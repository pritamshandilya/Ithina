import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/providers/store";
import { AuthSessionService } from "@/lib/auth/session";
import { useStores } from "@/queries/checker";
import { useEffect, useState } from "react";
import { Building2, Store as StoreIcon, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  if (isLoading || isAutoRedirecting) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#070b14] font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-accent" />
          <p className="text-sm font-medium text-slate-400">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  if (stores && stores.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-6 font-sans">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#9810fa]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md space-y-10 text-center"
        >
          <div className="space-y-4">
            <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-accent uppercase">
              <Building2 className="size-3" />
              {user?.organization?.name || "Corporate"} Network
            </div>
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <Loader2 className="size-8 text-amber-500 animate-spin-slow" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold leading-none text-white">Awaiting Assignment</h2>
              <p className="text-sm text-slate-400">Deployment status: Pending</p>
            </div>
            <p className="leading-relaxed text-slate-400">
              Hi {user?.firstName}, your account is active and verified. However, you haven&apos;t been assigned to a retail store yet.
              One of your organization admins will grant you access to a specific branch shortly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 backdrop-blur-sm">
            {!hasNotified ? (
              <>
                <p className="text-xs leading-relaxed text-slate-400">
                  Need access urgently? Use the secure channel below to notify your administrator.
                </p>
                <Button
                  onClick={handleNotifyAdmin}
                  className="h-12 w-full bg-accent font-medium text-white shadow-[0_0_20px_rgba(var(--accent),0.2)] hover:bg-accent/80"
                >
                  <Building2 className="mr-2 size-4" />
                  Request Store Assignment
                </Button>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 py-2 text-emerald-400"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <ArrowRight className="size-5" />
                </div>
                <p className="text-sm font-medium">Notification sent to admin</p>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500/50 animate-pulse" />
              <span className="text-xs font-medium text-slate-500">Encrypted session</span>
            </div>
            <button
              onClick={() => AuthSessionService.logout()}
              className="border-b border-transparent pb-0.5 text-xs font-medium text-slate-500 transition-colors hover:border-white/20 hover:text-white"
            >
              Log Out & Exit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-6 font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#9810fa]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg space-y-8"
      >
        <div className="space-y-4 text-center">
          <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-accent uppercase">
            <Building2 className="size-3" />
            {user?.organization?.name || "Corporate"} Network
          </div>

          <h2 className="text-4xl font-semibold text-white">Select Store</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Welcome back, {user?.firstName}.
            <br />
            Please select a branch to continue.
          </p>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {stores?.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => handleSelect(store)}
                className={cn(
                  "group relative flex items-center justify-between p-4 rounded-xl cursor-pointer border border-[#1a2130] bg-[#0d1421]/60 backdrop-blur-xl transition-all duration-300 hover:border-accent/50 hover:bg-accent/5",
                  selectedStore?.id === store.id && "border-accent bg-accent/10"
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 border border-white/5 group-hover:bg-accent/20 group-hover:border-accent/30 transition-all duration-300 shrink-0">
                    <StoreIcon className="size-5 text-slate-400 group-hover:text-accent" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="truncate text-base font-semibold leading-tight text-white">
                      {store.name}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {store.address || "Main Branch"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {store.pendingAuditCount && store.pendingAuditCount > 0 && (
                    <span className="rounded-full border border-accent/20 bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      {store.pendingAuditCount} AUDITS
                    </span>
                  )}
                  <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight className="size-4 text-accent" />
                  </div>
                </div>

                {selectedStore?.id === store.id && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-full" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="pt-8 border-t border-white/5 flex items-center justify-end">
          <button
            onClick={() => AuthSessionService.logout()}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-white"
          >
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
