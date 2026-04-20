import { createFileRoute, useNavigate, useRouter, redirect } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
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
