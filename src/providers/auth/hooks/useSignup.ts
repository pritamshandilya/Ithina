import { useState } from "react";

import type { Auth } from "@/lib/auth";
import type { SignupFormData } from "@/lib/validation/auth";

export function useSignup(auth: Auth) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (_data: Omit<SignupFormData, "confirmPassword">) => {
    try {
      setIsLoading(true);
      setError(null);
      auth.startRegister();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { signup, isLoading, error, clearError };
}
