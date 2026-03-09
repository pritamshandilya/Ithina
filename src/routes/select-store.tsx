import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/providers/store";
import { AuthSessionService } from "@/lib/auth/session";
import { useStores } from "@/queries/checker";
import { useEffect, useState } from "react";
import { Building2, Store as StoreIcon, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/select-store")({
  beforeLoad: ({ location }) => {
    const user = AuthSessionService.getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
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

  const [hasNotified, setHasNotified] = useState(false);

  const handleNotifyAdmin = () => {
    setHasNotified(true);
  };

  if (isLoading || isRedirecting || (stores && stores.length === 1)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-accent" />
          <p className="text-sm font-medium text-slate-400 font-bold uppercase tracking-widest">Initialising your workspace...</p>
        </div>
      </div>
    );
  }

  if (stores && stores.length === 0) {
    return (
      <div className="flex min-h-screen w-full overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#9810fa]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]"></div>

          <div className="relative z-10 px-12 max-w-lg text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Building2 className="size-3" />
                Connectivity Hub
              </div>
              
              <h1 className="text-5xl font-black text-white mb-4 leading-tight italic uppercase tracking-tighter">
                {user?.organization?.name || "Corporate"}
                <br />
                <span className="text-accent">Welcome</span>
              </h1>

              <p className="text-slate-400 text-lg mb-12 font-medium">
                You have successfully entered the {user?.organization?.name} infrastructure. 
                Our team is currently finalizing your regional deployment.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Waiting Message */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex w-full items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-8 lg:w-1/2"
        >
          <div className="w-full max-w-md space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex justify-center lg:justify-start">
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
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#9810fa]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]"></div>

        <div className="relative z-10 px-12 max-w-lg text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Building2 className="size-3" />
              Organization Context
            </div>
            
            <h1 className="text-5xl font-black text-white mb-4 leading-tight italic uppercase tracking-tighter">
              {user?.organization?.name || "Corporate"}
              <br />
              <span className="text-accent">Network</span>
            </h1>

            <p className="text-slate-400 text-lg mb-12 font-medium">
              You are currently logged into the {user?.organization?.name} central node. 
              Please specify the physical retail location you wish to manage.
            </p>

            <div className="grid grid-cols-3 gap-6 text-center pt-8 border-t border-white/5">
              <div>
                <div className="text-2xl font-black text-white">{stores?.length || 0}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Managed Stores</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">Active</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white italic">{user?.role}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Control Level</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-slate-600 font-bold uppercase tracking-widest">
          Secure Multi-Tenant Environment
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-6 sm:p-12 lg:w-1/2"
      >
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Select Store</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Assigning session to a specific retail branch
            </p>
          </div>

          <div className="space-y-3">
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
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white leading-tight truncate">
                        {store.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">
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

          {stores?.length === 0 && (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#1a2130] bg-[#0d1421]/30">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No retail locations found</p>
              <Button 
                  variant="link" 
                  className="mt-2 text-accent font-black uppercase tracking-[0.2em] text-[10px]"
                  onClick={() => AuthSessionService.logout()}
              >
                  Contact Administrator
              </Button>
            </div>
          )}

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Server Online</span>
            </div>
            <button 
              onClick={() => AuthSessionService.logout()}
              className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
