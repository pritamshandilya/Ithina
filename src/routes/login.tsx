import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { PromoBrandingPanel } from "@/components/auth/promo-branding-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ithinaLogo from "@/assets/ithina_logo.png";
import {
  getDashboardUrlForRole,
  getPostAuthEntryPath,
  PromoAuthService,
} from "@/lib/auth/promo-auth";
import { StoreContext } from "@/lib/store-context";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (!PromoAuthService.isAuthenticated()) return;
    const user = PromoAuthService.getCurrentUser();
    if (!user) return;
    if (user.role === "admin") {
      throw redirect({ to: getDashboardUrlForRole("admin") });
    }
    const storeId = StoreContext.getStoreId();
    throw redirect({ to: storeId ? getDashboardUrlForRole(user.role) : "/select-store" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await PromoAuthService.login(formData.email, formData.password);
      navigate({ to: getPostAuthEntryPath(user.role) });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      <PromoBrandingPanel />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black/40 p-3 backdrop-blur-sm">
              <img
                src={ithinaLogo}
                alt="Ithina Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground"
              >
                User Account
              </label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 border-input bg-secondary/60 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-11 border-input bg-secondary/60 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30"
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

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="default"
              className="h-11 w-full rounded-lg active:scale-[0.98]"
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

