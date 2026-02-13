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

    await new Promise((resolve) => setTimeout(resolve, 800));

    const { email, password } = formData;
    if (email === "maker@displaydata.com" && password === "password123") {
      setShowStoreModal(true);
    } else if (email === "checker@displaydata.com" && password === "password123") {
      navigate({ to: "/checker" });
    } else {
      setErrors({ general: "Invalid credentials. Please try again." });
    }
    setIsLoading(false);
  };

  const handleStoreSelect = () => {
    navigate({ to: "/maker" });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-primary p-4">
      <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-chart-2/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/10 blur-[120px]" />

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
          pointerEvents: showStoreModal ? "none" : "auto",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="z-10 w-full max-w-md"
      >
        <Card className="border-border bg-card text-card-foreground shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 flex justify-center">
              <img src="/logo.avif" alt="Logo" className="h-12 w-auto" />
            </div>
            <CardTitle className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="ml-1 text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <div className="group relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 rounded-xl border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                    disabled={showStoreModal}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="ml-1 text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 rounded-xl border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                    disabled={showStoreModal}
                  />
                </div>
              </div>

              {errors.general && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {errors.general}
                </motion.p>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-accent font-semibold text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98]"
                disabled={isLoading || showStoreModal}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-border/50 pb-8 pt-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="ml-1 font-medium text-accent transition-colors hover:text-accent/80"
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
