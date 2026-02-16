import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Lock, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.avif";
import { signupSchema } from "@/lib/validation/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSignupError(null);

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSigningUp(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate({ to: "/login" });
    setIsSigningUp(false);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#9810fa]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]"></div>

        <div className="relative z-10 px-12 max-w-lg text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-purple-900/50 overflow-hidden"
          >
            <img alt="CBAI Logo" className="w-full h-full object-contain" src={logo} />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4 leading-tight"
          >
            Planogram
            <br />
            Assistant
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-slate-400 text-lg mb-8"
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
              <div className="text-2xl font-bold text-[#c77dff]">AI</div>
              <div className="text-[11px] text-slate-500 mt-1">Shelf Analysis</div>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div>
              <div className="text-2xl font-bold text-[#c77dff]">3D</div>
              <div className="text-[11px] text-slate-500 mt-1">Visualization</div>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div>
              <div className="text-2xl font-bold text-[#c77dff]">100%</div>
              <div className="text-[11px] text-slate-500 mt-1">Compliance</div>
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
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black/40 p-3 backdrop-blur-sm">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-white">Create an account</h2>
            <p className="text-sm text-gray-400">Join us to start managing your planograms effectively</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-xs font-medium text-gray-400">
                  First Name
                </label>
                <div className="group relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-xs font-medium text-gray-400">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
                {errors.lastName && <p className="text-xs text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-gray-400">
                Email Address
              </label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium text-gray-400">
                Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-gray-400">
                Confirm Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-11 rounded-lg border-gray-700 bg-[#1a2332]/60 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            {signupError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {signupError}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 font-medium text-white transition-all hover:from-purple-700 hover:to-violet-700 active:scale-[0.98]"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-purple-400 transition-colors hover:text-purple-300"
                onClick={() => navigate({ to: "/login" })}
              >
                Sign in
              </button>
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="mx-auto flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back to login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
