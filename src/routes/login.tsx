import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ithinaLogo from "@/assets/ithina_logo.png";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

export const Route = createFileRoute("/login")({
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
      await SimulatedAuthService.login(formData.email, formData.password);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-[#9810fa]/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/15 blur-[100px]" />

        <div className="relative z-10 max-w-lg px-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl shadow-purple-900/50"
          >
            <img
              alt="Ithina Logo"
              className="h-full w-full object-contain"
              src={ithinaLogo}
            />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4 text-4xl font-bold leading-tight text-white"
          >
            Promotions
            <br />
            Assistant
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 text-lg text-slate-400"
          >
            AI-powered promotions and campaign orchestration for modern retail.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center gap-8 text-center"
          >
            <div>
              <div className="text-2xl font-bold text-[#c77dff]">AI</div>
              <div className="mt-1 text-[11px] text-slate-500">
                Campaign Insights
              </div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <div className="text-2xl font-bold text-[#c77dff]">ROOS</div>
              <div className="mt-1 text-[11px] text-slate-500">
                Store Signals
              </div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <div className="text-2xl font-bold text-[#c77dff]">100%</div>
              <div className="mt-1 text-[11px] text-slate-500">
                Guardrails
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-slate-600">
          Powered by Gemini AI
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#1a2332] p-8 lg:w-1/2"
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

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-gray-400">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-gray-400"
              >
                User Account
              </label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-gray-400"
              >
                Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-400"
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
              className="h-11 w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 font-medium text-white transition-all hover:from-purple-700 hover:to-violet-700 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-xs text-gray-500">
              Demo accounts:
              <br />
              maker@displaydata.com / checker@displaydata.com — password123
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

