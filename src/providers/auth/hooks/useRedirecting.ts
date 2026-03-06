import { useCallback } from "react";

import type { Auth } from "@/lib/auth";

export function useRedirecting(auth: Auth) {
  const manageAccount = useCallback(() => auth.manageAccount(), [auth]);

  const startLogin = useCallback(
    (redirectPath?: string) => auth.startLogin(redirectPath),
    [auth],
  );

  const startRegister = useCallback(
    (redirectPath?: string) => auth.startRegister(redirectPath),
    [auth],
  );

  const startLogout = useCallback(() => auth.startLogout(), [auth]);

  return {
    manageAccount,
    startLogin,
    startRegister,
    startLogout,
  };
}
