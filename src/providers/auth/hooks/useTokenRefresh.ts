import { useCallback, useEffect } from "react";

import type { Auth } from "@/lib/auth";

export function useTokenRefresh(auth: Auth, shouldAutoRefresh: boolean) {
  const refreshToken = useCallback(
    async () => await auth.refreshToken(),
    [auth],
  );

  const initAutoRefresh = useCallback(() => {
    auth.initAutoRefresh();
  }, [auth]);

  useEffect(() => {
    if (shouldAutoRefresh) {
      initAutoRefresh();
    }
  }, [initAutoRefresh, shouldAutoRefresh]);

  return { refreshToken, initAutoRefresh };
}
