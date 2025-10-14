import { useCallback, useEffect, useRef, useState } from "react";

import type { Auth } from "@/lib/auth";

export function useUserInfo<T>(auth: Auth, shouldAutoFetchUserInfo: boolean) {
  const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false);
  const [userInfo, setUserInfo] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserInfo = useCallback(async () => {
    setIsFetchingUserInfo(true);
    setError(null);

    try {
      const userInfo = await auth.fetchUserInfo<T>();
      setUserInfo(userInfo);
      return userInfo;
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsFetchingUserInfo(false);
    }
  }, [auth]);

  const didAttemptAutoFetch = useRef(false);

  const handleAutoFetch = useCallback(() => {
    if (!shouldAutoFetchUserInfo || didAttemptAutoFetch.current) {
      return;
    }

    // ensures this effect does not run multiple times if we fail to fetch the user
    didAttemptAutoFetch.current = true;

    if (auth.isLoggedIn) {
      fetchUserInfo();
    }
  }, [auth, fetchUserInfo, shouldAutoFetchUserInfo]);

  useEffect(() => {
    handleAutoFetch();
  }, [handleAutoFetch]);

  return {
    fetchUserInfo,
    isFetchingUserInfo,
    userInfo,
    error,
  };
}
