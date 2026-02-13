import { useState } from "react";

import type { Auth } from "@/lib/auth";
import type { LoginFormData } from "@/lib/validation/auth";

export function useLogin(auth: Auth) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (_data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      auth.startLogin();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { login, isLoading, error, clearError };
}
