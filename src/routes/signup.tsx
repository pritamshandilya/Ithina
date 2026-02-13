import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Lock, Mail, User, UserPlus } from "lucide-react";
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-primary p-4">
      <div className="absolute right-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-chart-2/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-accent/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-lg"
      >
        <Card className="border-border bg-card text-card-foreground shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 flex justify-center">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </div>
            <CardTitle className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Create an account
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Join us to start managing your planograms effectively
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="ml-1 text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <div className="group relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-11 rounded-xl border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  {errors.firstName && <p className="ml-1 text-xs text-destructive">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="ml-1 text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11 rounded-xl border-input bg-background/40 text-foreground placeholder:text-muted-foreground"
                  />
                  {errors.lastName && <p className="ml-1 text-xs text-destructive">{errors.lastName}</p>}
                </div>
              </div>

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
                    className="h-11 rounded-xl border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {errors.email && <p className="ml-1 text-xs text-destructive">{errors.email}</p>}
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
                    className="h-11 rounded-xl border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {errors.password && <p className="ml-1 text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="ml-1 text-sm font-medium text-muted-foreground">
                  Confirm Password
                </label>
                <div className="group relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-11 rounded-xl border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="ml-1 text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {signupError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {signupError}
                </div>
              )}

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-accent font-semibold text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98]"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-border/50 pb-8 pt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="ml-1 font-medium text-accent transition-colors hover:text-accent/80"
                onClick={() => navigate({ to: "/login" })}
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </Card>

        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="mx-auto mt-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Back to login</span>
        </button>
      </motion.div>
    </div>
  );
}
