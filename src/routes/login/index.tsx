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
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      <div className="relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-size-[40px_40px] opacity-[0.04] bg-[linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)]" />
        <div className="absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative z-10 max-w-lg px-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl shadow-accent/45"
          >
            <img alt="Ithina Logo" className="h-full w-full object-contain" src={logo} />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4 text-4xl font-bold leading-tight text-white"
          >
            Planogram
            <br />
            Assistant (YOLO)
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 text-lg text-muted-foreground"
          >
            AI-powered retail shelf analysis & optimization platform
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center gap-8 text-center"
          >
            <div>
              <div className="text-2xl font-bold text-accent">AI</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Shelf Analysis</div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <div className="text-2xl font-bold text-accent">3D</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Visualization</div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <div className="text-2xl font-bold text-accent">100%</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Compliance</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-muted-foreground/60">
          Powered by Gemini AI
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black/40 p-3 backdrop-blur-sm">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
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
                    className="h-11 rounded-lg border-input bg-secondary/60 pl-10 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
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
                    className="h-11 rounded-lg border-input bg-secondary/60 pl-10 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
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

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-linear-to-r from-accent to-accent/85 font-medium text-accent-foreground transition-all hover:from-accent/90 hover:to-accent active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Sign In"
                )}
              </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
