import { createFileRoute, useNavigate, useRouter, redirect } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.avif";
import { AuthSessionService } from "@/lib/auth/session";
import { ApiError } from "@/queries/shared";

export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    if (AuthSessionService.isAuthenticated()) {
      const user = AuthSessionService.getCurrentUser();
      if (user) {
        throw redirect({ to: AuthSessionService.getDashboardRoute(user.role), replace: true });
      }
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const user = await AuthSessionService.login(formData.email, formData.password);
      router.invalidate();
      if (user.role === "admin") {
        navigate({ to: "/admin/organization-settings", replace: true });
      } else {
        navigate({ to: "/select-store", replace: true });
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setErrors({ general: error.message || "Invalid credentials. Please try again." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 p-3 backdrop-blur-sm">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="ithina-auth-panel">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-white">Welcome back</h2>
              <p className="text-sm leading-6 text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  User Account
                </label>
                <div className="group relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-white"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {errors.general}
                </motion.div>
              )}

              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
