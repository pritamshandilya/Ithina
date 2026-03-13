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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if (stores && stores.length === 1) {
      const store = stores[0];
      setSelectedStore(store);
      setIsRedirecting(true);
      const target = AuthSessionService.getDashboardRoute(user?.role || "maker");
      navigate({ to: target, replace: true });
    }
  }, [stores, setSelectedStore, navigate, user?.role]);

  const handleSelect = (store: any) => {
    setSelectedStore(store);
    const target = AuthSessionService.getDashboardRoute(user?.role || "maker");
    navigate({ to: target, replace: true });
  };

  const handleNotifyAdmin = () => {
    setHasNotified(true);
  };

  if (isLoading || isRedirecting || (stores && stores.length === 1)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#070b14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-accent" />
          <p className="text-sm font-medium text-slate-400 font-bold uppercase tracking-widest">Initialising your workspace...</p>
        </div>
      </div>
    );
  }

  if (stores && stores.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-6 relative overflow-hidden">
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
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                <Building2 className="size-3" />
                {user?.organization?.name || "Corporate"} Network
            </div>
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <Loader2 className="size-8 text-amber-500 animate-spin-slow" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Awaiting Assignment</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Deployment status: Pending</p>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Hi {user?.firstName}, your account is active and verified. However, you haven't been assigned to a retail store yet. 
              One of your organization admins will grant you access to a specific branch shortly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 backdrop-blur-sm">
              {!hasNotified ? (
                  <>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                          Need access urgently? Use the secure channel below to notify your administrator.
                      </p>
                      <Button 
                          onClick={handleNotifyAdmin}
                          className="w-full bg-accent hover:bg-accent/80 text-white font-black uppercase tracking-[0.2em] italic h-12 shadow-[0_0_20px_rgba(var(--accent),0.2)]"
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
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Notification Sent to Admin</p>
                  </motion.div>
              )}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500/50 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Encrypted Session</span>
            </div>
            <button 
              onClick={() => AuthSessionService.logout()}
              className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-white/20 pb-0.5"
            >
              Log Out & Exit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-6 relative overflow-hidden">
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
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <Building2 className="size-3" />
            {user?.organization?.name || "Corporate"} Network
          </div>
          
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tight">Select Store</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Welcome back, {user?.firstName}.<br/>Please select a branch to continue.
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
                    <h3 className="text-base font-black text-white leading-tight truncate">
                      {store.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] truncate mt-0.5">
                      {store.address || "Main Branch"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {store.pendingAuditCount && store.pendingAuditCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/20 text-[10px] font-black text-accent tracking-tighter">
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
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
          >
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
