import type { PropsWithChildren } from "react";
import { useMemo, useRef, useState } from "react";

import type { AuthProviderContext, UserInfo } from "./context";
import { AuthContext } from "./context";
import { useRedirecting } from "./hooks/useRedirecting";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { useUserInfo } from "./hooks/useUserInfo";
import { Auth, type AuthConfig } from "@/lib/auth";

export function AuthProvider(props: PropsWithChildren<AuthConfig>) {
  const config: Omit<AuthConfig, "onTokenExpiration"> = useMemo(
    () => ({
      serverUrl: props.serverUrl,
      loginPath: props.loginPath,
      registerPath: props.registerPath,
      logoutPath: props.logoutPath,
      tokenRefreshPath: props.tokenRefreshPath,
      userInfoPath: props.userInfoPath,
      accountManagementPath: props.accountManagementPath,
      accessTokenExpiryCookieName: props.accessTokenExpiryCookieName,
      shouldAutoRefresh: props.shouldAutoRefresh,
      shouldAutoFetchUserInfo: props.shouldAutoFetchUserInfo,
      shouldTimeoutSession: props.shouldTimeoutSession,
      shouldInvalidateSession: props.shouldInvalidateSession,
    }),
    [
      props.serverUrl,
      props.loginPath,
      props.registerPath,
      props.logoutPath,
      props.tokenRefreshPath,
      props.userInfoPath,
      props.accountManagementPath,
      props.accessTokenExpiryCookieName,
      props.shouldAutoRefresh,
      props.shouldAutoFetchUserInfo,
      props.shouldTimeoutSession,
      props.shouldInvalidateSession,
    ],
  );

  const authRef = useRef<Auth>(null);

  const auth: Auth = useMemo(() => {
    if (authRef.current) {
      authRef.current.dispose();
    }

    const newAuth = new Auth({
      ...config,
      onTokenExpiration: () => setIsLoggedIn(false),
    });

    authRef.current = newAuth;

    return newAuth;
  }, [config]);

  const [isLoggedIn, setIsLoggedIn] = useState(auth.isLoggedIn);

  const { userInfo, isFetchingUserInfo, error, fetchUserInfo } =
    useUserInfo<UserInfo>(auth, config.shouldAutoFetchUserInfo ?? false);

  const { manageAccount, startLogin, startRegister, startLogout } =
    useRedirecting(auth);

  const { refreshToken, initAutoRefresh } = useTokenRefresh(
    auth,
    config.shouldAutoRefresh ?? false,
  );

  const contextValue: AuthProviderContext = useMemo(
    () => ({
      isLoggedIn,
      userInfo,
      isFetchingUserInfo,
      error,
      fetchUserInfo,
      startLogin,
      startRegister,
      startLogout,
      manageAccount,
      refreshToken,
      initAutoRefresh,
    }),
    [
      isLoggedIn,
      userInfo,
      isFetchingUserInfo,
      error,
      fetchUserInfo,
      startLogin,
      startRegister,
      startLogout,
      manageAccount,
      refreshToken,
      initAutoRefresh,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
