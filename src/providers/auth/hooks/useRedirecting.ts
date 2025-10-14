import { useCallback } from "react";

import type { Auth } from "@/lib/auth";

export function useRedirecting(auth: Auth) {
  const manageAccount = useCallback(() => auth.manageAccount(), [auth]);

  const startLogin = useCallback(
    (redirect?: string) => auth.startLogin(redirect),
    [auth],
  );

  const startRegister = useCallback(
    (redirect?: string) => auth.startRegister(redirect),
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
