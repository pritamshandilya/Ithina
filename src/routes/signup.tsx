import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, User, UserPlus, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSigningUp(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Simulate successful signup
    navigate({ to: "/login" });
    setIsSigningUp(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl text-white shadow-2xl">
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="relative">
                  <img
                    src="/logo.avif"
                    alt="Logo"
                    className="h-12 w-auto relative z-10 transition-all duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 z-0 opacity-60 blur-xl animate-pulse"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(192, 132, 252, 0.2) 40%, transparent 70%)",
                    }}
                  />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Create an account
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Join us to start managing your planograms effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-300 ml-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400 ml-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-300 ml-1">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                  {errors.lastName && <p className="text-xs text-red-400 ml-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword}</p>}
              </div>

              {signupError && (
                <div className="rounded-xl bg-red-400/10 p-3 text-sm text-red-400 border border-red-400/20">
                  {signupError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98] mt-2"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-white/5 pt-6 pb-8">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors ml-1"
                onClick={() => navigate({ to: "/login" })}
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </Card>
        
        <button 
          onClick={() => navigate({ to: "/login" })}
          className="mt-6 flex items-center gap-2 text-gray-500 hover:text-white transition-colors mx-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Back to login</span>
        </button>
      </motion.div>
    </div>
  );
}
