import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, LogIn, Mail } from "lucide-react";
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
import { StoreModal } from "@/components/ui/store-modal";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { email, password } = formData;

    if (email === "maker@displaydata.com" && password === "password123") {
      setShowStoreModal(true);
    } else if (email === "checker@displaydata.com" && password === "password123") {
      navigate({ to: "/checker-dashboard" });
    } else {
      setErrors({ general: "Invalid credentials. Please try again." });
    }
    setIsLoading(false);
  };

  const handleStoreSelect = () => {
    navigate({ to: "/maker-dashboard" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <StoreModal 
        isOpen={showStoreModal} 
        onClose={() => setShowStoreModal(false)}
        onSelect={handleStoreSelect} 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showStoreModal ? 0 : 1, 
          y: showStoreModal ? -20 : 0,
          scale: showStoreModal ? 0.95 : 1,
          pointerEvents: showStoreModal ? "none" : "auto"
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full max-w-md z-10"
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
                        "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(14, 165, 233, 0.2) 40%, transparent 70%)",
                    }}
                  />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 h-12 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    disabled={showStoreModal}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 h-12 bg-white/[0.05] border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    disabled={showStoreModal}
                  />
                </div>
              </div>
              
              {errors.general && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  {errors.general}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                disabled={isLoading || showStoreModal}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-white/5 pt-6 pb-8">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors ml-1"
                onClick={() => navigate({ to: "/signup" })}
              >
                Create an account
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
