import { useState } from "react";

import type { Auth } from "@/lib/auth";
import type { LoginFormData } from "@/lib/validation/auth";

export function useLogin(auth: Auth) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await auth.login(data.email, data.password, data.rememberMe);
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
